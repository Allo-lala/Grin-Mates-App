import { NextRequest, NextResponse } from 'next/server';
import { db, transactionQueries, balanceQueries, kycQueries } from '@/lib/database';

// Initiate withdrawal
export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      method, // 'crypto' | 'mobile_money' | 'airtime'
      amount, 
      tokenSymbol,
      networkName,
      toAddress, // For crypto withdrawals
      phoneNumber, // For mobile money/airtime
      provider // 'mtn' | 'airtel' for mobile money
    } = await request.json();

    if (!userId || !method || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check KYC status for mobile money withdrawals
    if (method !== 'crypto') {
      const kycStatus = await kycQueries.getKycStatus(userId);
      if (!kycStatus || kycStatus.status !== 'approved') {
        return NextResponse.json(
          { error: 'KYC verification required for mobile money withdrawals' },
          { status: 403 }
        );
      }
    }

    // Get token and network
    const tokenResult = await db.query(`
      SELECT t.id as token_id, n.id as network_id
      FROM tokens t
      JOIN networks n ON t.network_id = n.id
      WHERE t.symbol = $1 AND n.name = $2
    `, [tokenSymbol || 'USDC', networkName || 'Celo']);

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Token or network not found' },
        { status: 400 }
      );
    }

    const { token_id, network_id } = tokenResult.rows[0];

    // Check user balance
    const balanceResult = await db.query(
      'SELECT balance FROM balances WHERE user_id = $1 AND token_id = $2',
      [userId, token_id]
    );

    const currentBalance = parseFloat(balanceResult.rows[0]?.balance || '0');
    const withdrawAmount = parseFloat(amount);

    if (currentBalance < withdrawAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Get user's wallet address
    const addressResult = await db.query(
      'SELECT address FROM user_wallet_addresses WHERE user_id = $1 AND network_id = $2',
      [userId, network_id]
    );

    const fromAddress = addressResult.rows[0]?.address;

    // Create transaction record
    const transactionType = method === 'crypto' ? 'withdraw' : 
                           method === 'airtime' ? 'airtime_purchase' : 
                           'mobile_money_withdraw';

    const transaction = await transactionQueries.createTransaction({
      userId,
      type: transactionType,
      amount: amount.toString(),
      tokenId: token_id,
      networkId: network_id,
      fromAddress,
      toAddress: toAddress || phoneNumber,
      metadata: { method, provider }
    });

    // For mobile money, create mobile money transaction record
    if (method !== 'crypto') {
      await db.query(`
        INSERT INTO mobile_money_transactions (
          transaction_id, provider, phone_number, status
        )
        VALUES ($1, $2, $3, 'pending')
      `, [transaction.id, provider, phoneNumber]);
    }

    // Lock the balance (will be deducted when confirmed)
    await db.query(`
      UPDATE balances 
      SET locked_balance = locked_balance + $1
      WHERE user_id = $2 AND token_id = $3
    `, [amount, userId, token_id]);

    return NextResponse.json({
      success: true,
      message: 'Withdrawal initiated successfully',
      transaction: {
        id: transaction.id,
        amount,
        method,
        status: 'pending',
        createdAt: transaction.created_at
      }
    });

  } catch (error) {
    console.error('Initiate withdrawal error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate withdrawal' },
      { status: 500 }
    );
  }
}

// Confirm withdrawal (admin/system endpoint)
export async function PUT(request: NextRequest) {
  try {
    const { transactionId, status, transactionHash, failureReason } = await request.json();

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: 'Transaction ID and status are required' },
        { status: 400 }
      );
    }

    // Get transaction details
    const txResult = await db.query(
      'SELECT * FROM transactions WHERE id = $1',
      [transactionId]
    );

    if (txResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const transaction = txResult.rows[0];

    if (status === 'confirmed') {
      // Deduct from balance and unlock
      await db.query(`
        UPDATE balances 
        SET balance = balance - $1,
            locked_balance = locked_balance - $1
        WHERE user_id = $2 AND token_id = $3
      `, [transaction.amount, transaction.user_id, transaction.token_id]);

      // Update transaction
      await transactionQueries.updateTransactionStatus(
        transactionId,
        'confirmed',
        transactionHash
      );

      // Update mobile money transaction if applicable
      if (transaction.type.includes('mobile_money') || transaction.type === 'airtime_purchase') {
        await db.query(`
          UPDATE mobile_money_transactions 
          SET status = 'completed', completed_at = CURRENT_TIMESTAMP
          WHERE transaction_id = $1
        `, [transactionId]);
      }

    } else if (status === 'failed') {
      // Unlock the balance
      await db.query(`
        UPDATE balances 
        SET locked_balance = locked_balance - $1
        WHERE user_id = $2 AND token_id = $3
      `, [transaction.amount, transaction.user_id, transaction.token_id]);

      // Update transaction
      await transactionQueries.updateTransactionStatus(transactionId, 'failed');

      // Update mobile money transaction if applicable
      if (transaction.type.includes('mobile_money') || transaction.type === 'airtime_purchase') {
        await db.query(`
          UPDATE mobile_money_transactions 
          SET status = 'failed', failure_reason = $1
          WHERE transaction_id = $2
        `, [failureReason, transactionId]);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Withdrawal ${status} successfully`,
      transactionId
    });

  } catch (error) {
    console.error('Confirm withdrawal error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm withdrawal' },
      { status: 500 }
    );
  }
}
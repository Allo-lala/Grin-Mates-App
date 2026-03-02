import { NextRequest, NextResponse } from 'next/server';
import { db, transactionQueries, balanceQueries } from '@/lib/database';

// Generate deposit address
export async function POST(request: NextRequest) {
  try {
    const { userId, tokenSymbol, networkName } = await request.json();

    if (!userId || !tokenSymbol || !networkName) {
      return NextResponse.json(
        { error: 'User ID, token symbol, and network name are required' },
        { status: 400 }
      );
    }

    // Get or create user wallet address for this network
    const networkResult = await db.query(
      'SELECT id FROM networks WHERE name = $1',
      [networkName]
    );

    if (networkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Network not supported' },
        { status: 400 }
      );
    }

    const networkId = networkResult.rows[0].id;

    // Check if user already has an address for this network
    let addressResult = await db.query(
      'SELECT address FROM user_wallet_addresses WHERE user_id = $1 AND network_id = $2',
      [userId, networkId]
    );

    let depositAddress;

    if (addressResult.rows.length > 0) {
      depositAddress = addressResult.rows[0].address;
    } else {
      // Generate new address (in production, this would call blockchain API)
      depositAddress = generateDepositAddress(networkName);

      // Save address
      await db.query(`
        INSERT INTO user_wallet_addresses (user_id, network_id, address)
        VALUES ($1, $2, $3)
      `, [userId, networkId, depositAddress]);
    }

    return NextResponse.json({
      success: true,
      depositAddress,
      network: networkName,
      token: tokenSymbol,
      message: 'Deposit address generated successfully'
    });

  } catch (error) {
    console.error('Generate deposit address error:', error);
    return NextResponse.json(
      { error: 'Failed to generate deposit address' },
      { status: 500 }
    );
  }
}

// Helper function to generate deposit address (simulated)
function generateDepositAddress(network: string): string {
  const formats: Record<string, () => string> = {
    'Celo': () => `0x${Math.random().toString(16).substring(2, 42)}`,
    'Base': () => `0x${Math.random().toString(16).substring(2, 42)}`,
    'Solana': () => Math.random().toString(36).substring(2, 46),
    'Stellar': () => `G${Math.random().toString(36).substring(2, 57).toUpperCase()}`
  };

  return formats[network]?.() || `0x${Math.random().toString(16).substring(2, 42)}`;
}

// Confirm deposit (webhook endpoint)
export async function PUT(request: NextRequest) {
  try {
    const { 
      userId, 
      tokenSymbol, 
      networkName, 
      amount, 
      transactionHash,
      fromAddress 
    } = await request.json();

    if (!userId || !tokenSymbol || !networkName || !amount || !transactionHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get token and network IDs
    const tokenResult = await db.query(`
      SELECT t.id as token_id, n.id as network_id
      FROM tokens t
      JOIN networks n ON t.network_id = n.id
      WHERE t.symbol = $1 AND n.name = $2
    `, [tokenSymbol, networkName]);

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Token or network not found' },
        { status: 400 }
      );
    }

    const { token_id, network_id } = tokenResult.rows[0];

    // Get user's deposit address
    const addressResult = await db.query(
      'SELECT address FROM user_wallet_addresses WHERE user_id = $1 AND network_id = $2',
      [userId, network_id]
    );

    const toAddress = addressResult.rows[0]?.address;

    // Create transaction record
    const transaction = await transactionQueries.createTransaction({
      userId,
      type: 'deposit',
      amount,
      tokenId: token_id,
      networkId: network_id,
      fromAddress,
      toAddress,
      transactionHash,
      metadata: { confirmed: true }
    });

    // Update transaction status to confirmed
    await transactionQueries.updateTransactionStatus(
      transaction.id,
      'confirmed',
      transactionHash
    );

    // Update user balance
    await balanceQueries.updateBalance(userId, token_id, amount, 'add');

    return NextResponse.json({
      success: true,
      message: 'Deposit confirmed successfully',
      transaction: {
        id: transaction.id,
        amount,
        token: tokenSymbol,
        network: networkName,
        transactionHash,
        status: 'confirmed'
      }
    });

  } catch (error) {
    console.error('Confirm deposit error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm deposit' },
      { status: 500 }
    );
  }
}
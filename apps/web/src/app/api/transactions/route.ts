import { NextRequest, NextResponse } from 'next/server';
import { transactionQueries } from '@/lib/database';

// Get user transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // Filter by type

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let transactions = await transactionQueries.getUserTransactions(userId, limit, offset);

    // Filter by type if specified
    if (type) {
      transactions = transactions.filter((tx: any) => tx.type === type);
    }

    return NextResponse.json({
      success: true,
      transactions: transactions.map((tx: any) => ({
        id: tx.id,
        transactionHash: tx.transaction_hash,
        type: tx.type,
        amount: tx.amount,
        token: tx.token_symbol,
        network: tx.network_name,
        status: tx.status,
        fromAddress: tx.from_address,
        toAddress: tx.to_address,
        createdAt: tx.created_at,
        confirmedAt: tx.confirmed_at
      })),
      pagination: {
        limit,
        offset,
        hasMore: transactions.length === limit
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to get transactions' },
      { status: 500 }
    );
  }
}
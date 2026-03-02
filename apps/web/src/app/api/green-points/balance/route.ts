import { NextRequest, NextResponse } from 'next/server';
import { greenPointsQueries, db } from '@/lib/database';

// Get green points balance and history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get balance
    const balance = await greenPointsQueries.getBalance(userId);

    // Get recent transactions
    const transactionsResult = await db.query(`
      SELECT * FROM green_points_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [userId]);

    // Get user rank
    const rankResult = await db.query(`
      SELECT rank FROM green_points_leaderboard
      WHERE user_id = $1
    `, [userId]);

    return NextResponse.json({
      success: true,
      balance: balance ? {
        total: balance.total_points,
        available: balance.available_points,
        locked: balance.locked_points,
        lifetimeEarned: balance.lifetime_earned,
        lifetimeSpent: balance.lifetime_spent
      } : {
        total: 0,
        available: 0,
        locked: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0
      },
      rank: rankResult.rows[0]?.rank || null,
      recentTransactions: transactionsResult.rows.map((tx: any) => ({
        id: tx.id,
        points: tx.points,
        type: tx.transaction_type,
        sourceType: tx.source_type,
        description: tx.description,
        createdAt: tx.created_at
      }))
    });

  } catch (error) {
    console.error('Get green points balance error:', error);
    return NextResponse.json(
      { error: 'Failed to get green points balance' },
      { status: 500 }
    );
  }
}
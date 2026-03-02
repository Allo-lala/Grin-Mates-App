import { NextRequest, NextResponse } from 'next/server';
import { greenPointsQueries } from '@/lib/database';

// Get green points leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const leaderboard = await greenPointsQueries.getLeaderboard(limit);

    return NextResponse.json({
      success: true,
      leaderboard: leaderboard.map((entry: any) => ({
        rank: entry.rank,
        userId: entry.user_id,
        displayName: entry.display_name,
        email: entry.email,
        totalPoints: entry.total_points,
        lifetimeEarned: entry.lifetime_earned
      }))
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}
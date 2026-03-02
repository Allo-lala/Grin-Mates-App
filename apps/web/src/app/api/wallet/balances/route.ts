import { NextRequest, NextResponse } from 'next/server';
import { balanceQueries, db } from '@/lib/database';

// Get user balances
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

    const balances = await balanceQueries.getUserBalances(userId);

    // Calculate total balance in USD
    let totalBalanceUsd = 0;
    const balancesWithPrices = await Promise.all(
      balances.map(async (balance: any) => {
        // Get latest price
        const priceResult = await db.query(`
          SELECT price_usd 
          FROM token_prices 
          WHERE token_id = $1 
          ORDER BY last_updated DESC 
          LIMIT 1
        `, [balance.token_id]);

        const priceUsd = priceResult.rows[0]?.price_usd || 1;
        const balanceUsd = parseFloat(balance.balance) * parseFloat(priceUsd);
        totalBalanceUsd += balanceUsd;

        return {
          tokenId: balance.token_id,
          symbol: balance.symbol,
          tokenName: balance.token_name,
          network: balance.network_name,
          balance: balance.balance,
          lockedBalance: balance.locked_balance,
          priceUsd: priceUsd,
          balanceUsd: balanceUsd.toFixed(2),
          updatedAt: balance.updated_at
        };
      })
    );

    return NextResponse.json({
      success: true,
      totalBalanceUsd: totalBalanceUsd.toFixed(2),
      balances: balancesWithPrices
    });

  } catch (error) {
    console.error('Get balances error:', error);
    return NextResponse.json(
      { error: 'Failed to get balances' },
      { status: 500 }
    );
  }
}
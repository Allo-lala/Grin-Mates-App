import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// Get current token prices
export async function GET() {
  try {
    const result = await db.query(`
      SELECT 
        tp.id,
        t.symbol,
        t.name as token_name,
        n.name as network_name,
        tp.price_usd,
        tp.volume_24h,
        tp.market_cap,
        tp.price_change_24h,
        tp.price_source,
        tp.last_updated
      FROM token_prices tp
      JOIN tokens t ON tp.token_id = t.id
      JOIN networks n ON t.network_id = n.id
      ORDER BY tp.last_updated DESC
    `);

    return NextResponse.json({
      success: true,
      prices: result.rows
    });
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token prices' },
      { status: 500 }
    );
  }
}

// Update token prices
export async function POST(request: NextRequest) {
  try {
    const { prices } = await request.json();

    if (!Array.isArray(prices)) {
      return NextResponse.json(
        { error: 'Prices must be an array' },
        { status: 400 }
      );
    }

    const results = [];

    for (const price of prices) {
      const { tokenSymbol, networkName, priceUsd, volume24h, marketCap, priceChange24h, source = 'manual' } = price;

      // Get token ID
      const tokenResult = await db.query(`
        SELECT t.id 
        FROM tokens t 
        JOIN networks n ON t.network_id = n.id 
        WHERE t.symbol = $1 AND n.name = $2
      `, [tokenSymbol, networkName]);

      if (tokenResult.rows.length === 0) {
        continue; // Skip if token not found
      }

      const tokenId = tokenResult.rows[0].id;

      // Insert or update price
      const priceResult = await db.query(`
        INSERT INTO token_prices (token_id, price_usd, volume_24h, market_cap, price_change_24h, price_source)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [tokenId, priceUsd, volume24h, marketCap, priceChange24h, source]);

      results.push(priceResult.rows[0]);
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${results.length} token prices`,
      updated: results
    });

  } catch (error) {
    console.error('Error updating token prices:', error);
    return NextResponse.json(
      { error: 'Failed to update token prices' },
      { status: 500 }
    );
  }
}
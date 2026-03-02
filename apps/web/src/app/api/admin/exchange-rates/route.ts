import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// Get current exchange rates
export async function GET() {
  try {
    const result = await db.query(`
      SELECT * FROM exchange_rates 
      ORDER BY last_updated DESC
    `);

    return NextResponse.json({
      success: true,
      rates: result.rows
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    );
  }
}

// Update exchange rates
export async function POST(request: NextRequest) {
  try {
    const { rates } = await request.json();

    if (!Array.isArray(rates)) {
      return NextResponse.json(
        { error: 'Rates must be an array' },
        { status: 400 }
      );
    }

    const results = [];

    for (const rate of rates) {
      const { fromCurrency, toCurrency, rate: exchangeRate, source = 'manual' } = rate;

      // Insert or update exchange rate
      const result = await db.query(`
        INSERT INTO exchange_rates (from_currency, to_currency, rate, source)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (from_currency, to_currency)
        DO UPDATE SET 
          rate = $3,
          source = $4,
          last_updated = CURRENT_TIMESTAMP
        RETURNING *
      `, [fromCurrency, toCurrency, exchangeRate, source]);

      results.push(result.rows[0]);
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${results.length} exchange rates`,
      updated: results
    });

  } catch (error) {
    console.error('Error updating exchange rates:', error);
    return NextResponse.json(
      { error: 'Failed to update exchange rates' },
      { status: 500 }
    );
  }
}
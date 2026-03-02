import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

interface SampleData {
  networksTokens?: any[];
  prices?: any[];
  exchangeRates?: any[];
  error?: string;
}

export async function GET() {
  try {
    // Test database connection and basic queries
    const tests: TestResult[] = [];

    // Test 1: Database connection
    try {
      await db.query('SELECT NOW()');
      tests.push({ name: 'Database Connection', status: 'PASS', message: 'Connected successfully' });
    } catch (error) {
      tests.push({ name: 'Database Connection', status: 'FAIL', message: (error as Error).message });
    }

    // Test 2: Networks and Tokens
    try {
      const networksResult = await db.query('SELECT COUNT(*) FROM networks WHERE is_active = true');
      const tokensResult = await db.query('SELECT COUNT(*) FROM tokens WHERE is_active = true');
      tests.push({ 
        name: 'Networks & Tokens', 
        status: 'PASS', 
        message: `${networksResult.rows[0].count} networks, ${tokensResult.rows[0].count} tokens` 
      });
    } catch (error) {
      tests.push({ name: 'Networks & Tokens', status: 'FAIL', message: (error as Error).message });
    }

    // Test 3: Token Prices
    try {
      const pricesResult = await db.query('SELECT COUNT(*) FROM token_prices');
      tests.push({ 
        name: 'Token Prices', 
        status: 'PASS', 
        message: `${pricesResult.rows[0].count} price records` 
      });
    } catch (error) {
      tests.push({ name: 'Token Prices', status: 'FAIL', message: (error as Error).message });
    }

    // Test 4: Exchange Rates
    try {
      const ratesResult = await db.query('SELECT COUNT(*) FROM exchange_rates');
      tests.push({ 
        name: 'Exchange Rates', 
        status: 'PASS', 
        message: `${ratesResult.rows[0].count} exchange rates` 
      });
    } catch (error) {
      tests.push({ name: 'Exchange Rates', status: 'FAIL', message: (error as Error).message });
    }

    // Test 5: Service Categories
    try {
      const servicesResult = await db.query('SELECT COUNT(*) FROM service_categories WHERE is_active = true');
      tests.push({ 
        name: 'Service Categories', 
        status: 'PASS', 
        message: `${servicesResult.rows[0].count} service categories` 
      });
    } catch (error) {
      tests.push({ name: 'Service Categories', status: 'FAIL', message: (error as Error).message });
    }

    // Test 6: System Settings
    try {
      const settingsResult = await db.query('SELECT COUNT(*) FROM system_settings');
      tests.push({ 
        name: 'System Settings', 
        status: 'PASS', 
        message: `${settingsResult.rows[0].count} settings configured` 
      });
    } catch (error) {
      tests.push({ name: 'System Settings', status: 'FAIL', message: (error as Error).message });
    }

    // Get sample data
    const sampleData: SampleData = {};

    try {
      // Sample networks and tokens
      const networksTokens = await db.query(`
        SELECT n.name as network, t.symbol, t.name as token_name
        FROM networks n
        JOIN tokens t ON n.id = t.network_id
        WHERE n.is_active = true AND t.is_active = true
        ORDER BY n.name, t.symbol
      `);
      sampleData.networksTokens = networksTokens.rows;

      // Sample prices
      const prices = await db.query(`
        SELECT t.symbol, n.name as network, tp.price_usd, tp.last_updated
        FROM token_prices tp
        JOIN tokens t ON tp.token_id = t.id
        JOIN networks n ON t.network_id = n.id
        ORDER BY tp.last_updated DESC
        LIMIT 10
      `);
      sampleData.prices = prices.rows;

      // Sample exchange rates
      const rates = await db.query(`
        SELECT from_currency, to_currency, rate, last_updated
        FROM exchange_rates
        ORDER BY last_updated DESC
        LIMIT 10
      `);
      sampleData.exchangeRates = rates.rows;

    } catch (error) {
      sampleData.error = (error as Error).message;
    }

    const allPassed = tests.every(test => test.status === 'PASS');

    return NextResponse.json({
      success: allPassed,
      message: allPassed ? 'All database tests passed!' : 'Some tests failed',
      tests,
      sampleData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database test failed', 
        message: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
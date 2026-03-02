#!/usr/bin/env node

/**
 * Initialize Token Prices and Exchange Rates
 * 
 * This script sets up initial token prices and exchange rates
 * for the Grin Mates application.
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'grinmates_db',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  ssl: process.env.DATABASE_HOST?.includes('neon.tech') || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
};

// Default token prices (in USD)
const defaultPrices = [
  // USDT prices
  { symbol: 'USDT', network: 'Celo', price: 1.00, volume: 1000000, marketCap: 95000000000, change: 0.01 },
  { symbol: 'USDT', network: 'Solana', price: 1.00, volume: 2000000, marketCap: 95000000000, change: 0.01 },
  
  // USDC prices
  { symbol: 'USDC', network: 'Celo', price: 1.00, volume: 800000, marketCap: 32000000000, change: -0.02 },
  { symbol: 'USDC', network: 'Base', price: 1.00, volume: 1500000, marketCap: 32000000000, change: -0.02 },
  { symbol: 'USDC', network: 'Stellar', price: 1.00, volume: 500000, marketCap: 32000000000, change: -0.02 },
  { symbol: 'USDC', network: 'Solana', price: 1.00, volume: 1200000, marketCap: 32000000000, change: -0.02 },
  
  // cUSD price
  { symbol: 'cUSD', network: 'Celo', price: 1.00, volume: 300000, marketCap: 50000000, change: 0.00 },
];

// Default exchange rates
const defaultRates = [
  // USD to local currencies
  { from: 'USD', to: 'UGX', rate: 3700.00, source: 'manual' },
  { from: 'UGX', to: 'USD', rate: 0.00027, source: 'manual' },
  { from: 'USD', to: 'KES', rate: 129.50, source: 'manual' },
  { from: 'KES', to: 'USD', rate: 0.0077, source: 'manual' },
  { from: 'USD', to: 'TZS', rate: 2380.00, source: 'manual' },
  { from: 'TZS', to: 'USD', rate: 0.00042, source: 'manual' },
];

async function initializePrices() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🚀 Initializing Token Prices and Exchange Rates');
    console.log('================================================');
    
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Initialize token prices
    console.log('💰 Setting up token prices...');
    let pricesAdded = 0;
    
    for (const priceData of defaultPrices) {
      try {
        // Get token ID
        const tokenResult = await client.query(`
          SELECT t.id, t.symbol, n.name as network_name
          FROM tokens t 
          JOIN networks n ON t.network_id = n.id 
          WHERE t.symbol = $1 AND n.name = $2
        `, [priceData.symbol, priceData.network]);
        
        if (tokenResult.rows.length === 0) {
          console.log(`⚠️  Token ${priceData.symbol} on ${priceData.network} not found, skipping...`);
          continue;
        }
        
        const token = tokenResult.rows[0];
        
        // Insert price
        await client.query(`
          INSERT INTO token_prices (token_id, price_usd, volume_24h, market_cap, price_change_24h, price_source)
          VALUES ($1, $2, $3, $4, $5, 'initial_setup')
        `, [
          token.id,
          priceData.price,
          priceData.volume,
          priceData.marketCap,
          priceData.change
        ]);
        
        console.log(`   ✓ ${priceData.symbol} (${priceData.network}): $${priceData.price}`);
        pricesAdded++;
        
      } catch (error) {
        console.log(`   ❌ Failed to add price for ${priceData.symbol} (${priceData.network}):`, error.message);
      }
    }
    
    console.log(`💰 Added ${pricesAdded} token prices`);
    
    // Initialize exchange rates
    console.log('💱 Setting up exchange rates...');
    let ratesAdded = 0;
    
    for (const rateData of defaultRates) {
      try {
        await client.query(`
          INSERT INTO exchange_rates (from_currency, to_currency, rate, source)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (from_currency, to_currency)
          DO UPDATE SET 
            rate = $3,
            source = $4,
            last_updated = CURRENT_TIMESTAMP
        `, [rateData.from, rateData.to, rateData.rate, rateData.source]);
        
        console.log(`   ✓ ${rateData.from} → ${rateData.to}: ${rateData.rate}`);
        ratesAdded++;
        
      } catch (error) {
        console.log(`   ❌ Failed to add rate ${rateData.from}→${rateData.to}:`, error.message);
      }
    }
    
    console.log(`💱 Added ${ratesAdded} exchange rates`);
    
    // Verify setup
    console.log('🔍 Verifying setup...');
    
    const pricesCount = await client.query('SELECT COUNT(*) FROM token_prices');
    const ratesCount = await client.query('SELECT COUNT(*) FROM exchange_rates');
    
    console.log(`📊 Total token prices: ${pricesCount.rows[0].count}`);
    console.log(`📊 Total exchange rates: ${ratesCount.rows[0].count}`);
    
    client.release();
    console.log('🎉 Price initialization completed successfully!');
    
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Visit /admin/setup to create your first admin user');
    console.log('2. Use the admin APIs to update prices regularly');
    console.log('3. Test the application endpoints');
    
  } catch (error) {
    console.error('❌ Price initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization
if (require.main === module) {
  initializePrices();
}

module.exports = { initializePrices };
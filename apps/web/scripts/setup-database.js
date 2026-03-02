#!/usr/bin/env node

/**
 * Database Setup Script for Grin Mates Fintech DApp
 * 
 * This script sets up the PostgreSQL database with all required tables,
 * indexes, and initial data.
 * 
 * Usage:
 *   node scripts/setup-database.js
 * 
 * Environment Variables Required:
 *   - DATABASE_HOST
 *   - DATABASE_PORT
 *   - DATABASE_NAME
 *   - DATABASE_USER
 *   - DATABASE_PASSWORD
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

async function setupDatabase() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔗 Connecting to PostgreSQL database...');
    console.log(`📍 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`🗄️  Database: ${dbConfig.database}`);
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Read and execute schema
    console.log('📋 Reading database schema...');
    const schemaPath = path.join(__dirname, '../src/components/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🏗️  Creating database schema...');
    try {
      await client.query(schema);
      console.log('✅ Database schema created successfully!');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Some database objects already exist, continuing...');
      } else {
        throw error;
      }
    }
    
    // Check if we need to run migrations
    console.log('🔄 Checking for migrations...');
    const migrationsDir = path.join(__dirname, '../src/components/database/migrations');
    
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      for (const migrationFile of migrationFiles) {
        console.log(`📝 Running migration: ${migrationFile}`);
        const migrationPath = path.join(migrationsDir, migrationFile);
        const migration = fs.readFileSync(migrationPath, 'utf8');
        
        try {
          await client.query(migration);
          console.log(`✅ Migration ${migrationFile} completed`);
        } catch (error) {
          console.log(`⚠️  Migration ${migrationFile} skipped (may already be applied)`);
        }
      }
    }
    
    // Verify setup
    console.log('🔍 Verifying database setup...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Check schema version
    try {
      const versionResult = await client.query(
        "SELECT value FROM system_settings WHERE key = 'schema_version'"
      );
      console.log(`📌 Schema version: ${versionResult.rows[0]?.value || 'unknown'}`);
    } catch (error) {
      console.log('📌 Schema version: not set');
    }
    
    client.release();
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('💡 Make sure PostgreSQL is running and credentials are correct');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Create database if it doesn't exist
async function createDatabaseIfNotExists() {
  const adminConfig = {
    ...dbConfig,
    database: 'postgres' // Connect to default postgres database
  };
  
  const adminPool = new Pool(adminConfig);
  
  try {
    const client = await adminPool.connect();
    
    // Check if database exists
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbConfig.database]
    );
    
    if (result.rows.length === 0) {
      console.log(`🏗️  Creating database: ${dbConfig.database}`);
      await client.query(`CREATE DATABASE "${dbConfig.database}"`);
      console.log('✅ Database created successfully!');
    } else {
      console.log(`✅ Database ${dbConfig.database} already exists`);
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
    throw error;
  } finally {
    await adminPool.end();
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Grin Mates Database Setup');
  console.log('=====================================');
  
  try {
    await createDatabaseIfNotExists();
    await setupDatabase();
    
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Update your .env.local with the correct database credentials');
    console.log('2. Create an admin user through the application');
    console.log('3. Configure token prices and exchange rates');
    console.log('4. Test the application endpoints');
    console.log('');
    console.log('📚 Database Documentation:');
    console.log('- Schema: src/components/database/schema.sql');
    console.log('- Migrations: src/components/database/migrations/');
    console.log('- Database Utils: src/lib/database.ts');
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = { setupDatabase, createDatabaseIfNotExists };
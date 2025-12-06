/**
 * Database Migration Script
 * 
 * This script handles database migrations for the Grin Mates application.
 * It can be run manually or integrated into deployment pipelines.
 * 
 * Usage:
 *   node migrate.ts up    - Apply pending migrations
 *   node migrate.ts down  - Rollback last migration
 *   node migrate.ts list  - List all migrations and their status
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Database connection configuration
// In production, these should come from environment variables
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'grin_mates',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
};

interface Migration {
  id: string;
  name: string;
  path: string;
  rollbackPath: string;
}

// List of migrations in order
const MIGRATIONS: Migration[] = [
  {
    id: '001',
    name: 'create_verification_sessions',
    path: join(__dirname, 'migrations', '001_create_verification_sessions.sql'),
    rollbackPath: join(__dirname, 'migrations', '001_create_verification_sessions_rollback.sql'),
  },
];

/**
 * Create migrations tracking table if it doesn't exist
 */
async function createMigrationsTable(client: any): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  await client.query(query);
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations(client: any): Promise<Set<string>> {
  const result = await client.query('SELECT id FROM schema_migrations ORDER BY id');
  return new Set(result.rows.map((row: any) => row.id));
}

/**
 * Apply a migration
 */
async function applyMigration(client: any, migration: Migration): Promise<void> {
  console.log(`Applying migration ${migration.id}: ${migration.name}...`);
  
  const sql = readFileSync(migration.path, 'utf-8');
  
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query(
      'INSERT INTO schema_migrations (id, name) VALUES ($1, $2)',
      [migration.id, migration.name]
    );
    await client.query('COMMIT');
    console.log(`✓ Migration ${migration.id} applied successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ Migration ${migration.id} failed:`, error);
    throw error;
  }
}

/**
 * Rollback a migration
 */
async function rollbackMigration(client: any, migration: Migration): Promise<void> {
  console.log(`Rolling back migration ${migration.id}: ${migration.name}...`);
  
  const sql = readFileSync(migration.rollbackPath, 'utf-8');
  
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('DELETE FROM schema_migrations WHERE id = $1', [migration.id]);
    await client.query('COMMIT');
    console.log(`✓ Migration ${migration.id} rolled back successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ Rollback of migration ${migration.id} failed:`, error);
    throw error;
  }
}

/**
 * Run pending migrations
 */
async function migrateUp(client: any): Promise<void> {
  await createMigrationsTable(client);
  const applied = await getAppliedMigrations(client);
  
  const pending = MIGRATIONS.filter(m => !applied.has(m.id));
  
  if (pending.length === 0) {
    console.log('No pending migrations');
    return;
  }
  
  console.log(`Found ${pending.length} pending migration(s)`);
  
  for (const migration of pending) {
    await applyMigration(client, migration);
  }
  
  console.log('\n✓ All migrations applied successfully');
}

/**
 * Rollback last migration
 */
async function migrateDown(client: any): Promise<void> {
  await createMigrationsTable(client);
  const applied = await getAppliedMigrations(client);
  
  if (applied.size === 0) {
    console.log('No migrations to rollback');
    return;
  }
  
  // Find the last applied migration
  const lastMigration = MIGRATIONS
    .filter(m => applied.has(m.id))
    .pop();
  
  if (!lastMigration) {
    console.log('No migrations to rollback');
    return;
  }
  
  await rollbackMigration(client, lastMigration);
  console.log('\n✓ Migration rolled back successfully');
}

/**
 * List all migrations and their status
 */
async function listMigrations(client: any): Promise<void> {
  await createMigrationsTable(client);
  const applied = await getAppliedMigrations(client);
  
  console.log('\nMigrations:');
  console.log('===========\n');
  
  for (const migration of MIGRATIONS) {
    const status = applied.has(migration.id) ? '✓ Applied' : '○ Pending';
    console.log(`${status} - ${migration.id}: ${migration.name}`);
  }
  
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  const command = process.argv[2];
  
  if (!['up', 'down', 'list'].includes(command)) {
    console.error('Usage: node migrate.ts [up|down|list]');
    process.exit(1);
  }
  
  // Note: In a real implementation, you would use a proper PostgreSQL client
  // For now, this is a template that shows the structure
  console.log('Migration script template created.');
  console.log('To use this script, you need to:');
  console.log('1. Install a PostgreSQL client library (e.g., pg)');
  console.log('2. Configure database connection in environment variables');
  console.log('3. Run the script with: node migrate.ts [up|down|list]');
  console.log('\nFor manual migration, run the SQL files directly:');
  console.log('  psql -U postgres -d grin_mates -f migrations/001_create_verification_sessions.sql');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { migrateUp, migrateDown, listMigrations };

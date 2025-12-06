# Database Migrations

This directory contains database schema definitions and migrations for the Grin Mates application.

## Files

- `schema.sql` - Complete database schema (for reference and initial setup)
- `migrations/` - Directory containing versioned migration files
- `migrate.ts` - Migration script for applying/rolling back migrations

## Migration Files

### 001_create_verification_sessions.sql

Creates the `verification_sessions` table for Self Protocol KYC integration.

**Features:**
- Tracks verification sessions with status (pending, verified, failed, expired)
- Links to users table via wallet_address foreign key
- Stores Self Protocol session_id and Celo transaction_hash
- Includes metadata field for additional verification data
- Automatic updated_at timestamp trigger
- Comprehensive indexes for efficient queries

**Fields:**
- `id` - UUID primary key
- `wallet_address` - User's Ethereum wallet address (FK to users.wallet_address)
- `status` - Verification status (pending, verified, failed, expired)
- `session_id` - Unique Self Protocol session identifier
- `transaction_hash` - Celo blockchain transaction hash
- `created_at` - Session creation timestamp
- `updated_at` - Last update timestamp (auto-updated)
- `completed_at` - Verification completion timestamp
- `expires_at` - Session expiration timestamp
- `failure_reason` - Reason for verification failure
- `metadata` - JSONB field for additional data

**Indexes:**
- `idx_verification_wallet_address` - Fast lookups by wallet address
- `idx_verification_session_id` - Fast lookups by session ID
- `idx_verification_status` - Fast filtering by status
- `idx_verification_created_at` - Fast sorting by creation date

## Running Migrations

### Option 1: Manual SQL Execution (Recommended for initial setup)

```bash
# Apply migration
psql -U postgres -d grin_mates -f src/components/database/migrations/001_create_verification_sessions.sql

# Rollback migration (if needed)
psql -U postgres -d grin_mates -f src/components/database/migrations/001_create_verification_sessions_rollback.sql
```

### Option 2: Using Migration Script (Future enhancement)

The `migrate.ts` script provides a programmatic way to manage migrations. To use it:

1. Install PostgreSQL client:
```bash
npm install pg
```

2. Set environment variables:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=grin_mates
export DB_USER=postgres
export DB_PASSWORD=your_password
```

3. Run migrations:
```bash
# Apply pending migrations
npx tsx src/components/database/migrate.ts up

# Rollback last migration
npx tsx src/components/database/migrate.ts down

# List migration status
npx tsx src/components/database/migrate.ts list
```

## Creating New Migrations

When creating new migrations:

1. Create a new migration file with sequential numbering:
   - `migrations/00X_migration_name.sql`
   - `migrations/00X_migration_name_rollback.sql`

2. Add the migration to the `MIGRATIONS` array in `migrate.ts`

3. Test the migration:
   - Apply it to a test database
   - Verify the changes
   - Test the rollback
   - Re-apply to ensure idempotency

4. Document the migration in this README

## Migration Best Practices

- **Always create rollback scripts** - Every migration should have a corresponding rollback
- **Test migrations** - Test on a development database before production
- **Use transactions** - Wrap migrations in BEGIN/COMMIT blocks
- **Make migrations idempotent** - Use IF NOT EXISTS, IF EXISTS clauses
- **Add comments** - Document what each migration does and why
- **Version control** - Commit migrations to git before applying to production
- **Backup first** - Always backup production database before running migrations

## Verification Sessions Table Usage

### Creating a new verification session

```sql
INSERT INTO verification_sessions (
  wallet_address,
  status,
  session_id,
  expires_at
) VALUES (
  '0x1234567890abcdef1234567890abcdef12345678',
  'pending',
  'self_session_abc123',
  NOW() + INTERVAL '15 minutes'
);
```

### Updating verification status

```sql
UPDATE verification_sessions
SET 
  status = 'verified',
  completed_at = NOW(),
  transaction_hash = '0xabcdef...'
WHERE session_id = 'self_session_abc123';
```

### Querying verification status

```sql
-- Get latest verification for a wallet
SELECT *
FROM verification_sessions
WHERE wallet_address = '0x1234567890abcdef1234567890abcdef12345678'
ORDER BY created_at DESC
LIMIT 1;

-- Get all verified users
SELECT DISTINCT wallet_address
FROM verification_sessions
WHERE status = 'verified'
  AND (expires_at IS NULL OR expires_at > NOW());
```

### Cleaning up expired sessions

```sql
-- Mark expired sessions
UPDATE verification_sessions
SET status = 'expired'
WHERE status = 'pending'
  AND expires_at < NOW();
```

## Database Schema Diagram

```
users
├── id (PK)
├── wallet_address (UNIQUE)
└── ...

verification_sessions
├── id (PK)
├── wallet_address (FK → users.wallet_address)
├── status
├── session_id (UNIQUE)
├── transaction_hash
├── created_at
├── updated_at
├── completed_at
├── expires_at
├── failure_reason
└── metadata (JSONB)
```

## Troubleshooting

### Foreign key constraint fails

If you get a foreign key error, ensure the users table exists and has the wallet_address column:

```sql
-- Check if users table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'users';

-- Check wallet_address column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'wallet_address';
```

### Migration already applied

If a migration was partially applied, check the schema_migrations table:

```sql
SELECT * FROM schema_migrations;
```

You may need to manually clean up and re-run the migration.

### Index creation fails

If index creation fails, check if indexes already exist:

```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'verification_sessions';
```

Drop conflicting indexes before re-running the migration.

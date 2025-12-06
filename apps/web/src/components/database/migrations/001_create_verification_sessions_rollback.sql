-- Rollback Migration: Drop verification_sessions table
-- Date: 2025-12-05
-- Description: Removes verification_sessions table and related objects

-- Drop trigger
DROP TRIGGER IF EXISTS trigger_update_verification_sessions_updated_at ON verification_sessions;

-- Drop function
DROP FUNCTION IF EXISTS update_verification_sessions_updated_at();

-- Drop indexes (will be automatically dropped with table, but explicit for clarity)
DROP INDEX IF EXISTS idx_verification_created_at;
DROP INDEX IF EXISTS idx_verification_status;
DROP INDEX IF EXISTS idx_verification_session_id;
DROP INDEX IF EXISTS idx_verification_wallet_address;

-- Drop table
DROP TABLE IF EXISTS verification_sessions;

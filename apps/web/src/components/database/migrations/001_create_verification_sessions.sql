-- Migration: Create verification_sessions table for Self Protocol KYC integration
-- Date: 2025-12-05
-- Description: Adds verification_sessions table to track Self Protocol verification sessions

-- Create verification_sessions table
CREATE TABLE IF NOT EXISTS verification_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'verified', 'failed', 'expired')),
  session_id VARCHAR(255) NOT NULL UNIQUE,
  transaction_hash VARCHAR(66),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,
  failure_reason TEXT,
  metadata JSONB,
  CONSTRAINT fk_wallet FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_verification_wallet_address ON verification_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_verification_session_id ON verification_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_sessions(status);
CREATE INDEX IF NOT EXISTS idx_verification_created_at ON verification_sessions(created_at DESC);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_verification_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_verification_sessions_updated_at
  BEFORE UPDATE ON verification_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_sessions_updated_at();

-- Add comment to table
COMMENT ON TABLE verification_sessions IS 'Stores Self Protocol verification sessions for KYC compliance';
COMMENT ON COLUMN verification_sessions.wallet_address IS 'User Ethereum wallet address (references users.wallet_address)';
COMMENT ON COLUMN verification_sessions.status IS 'Current verification status: pending, verified, failed, or expired';
COMMENT ON COLUMN verification_sessions.session_id IS 'Unique Self Protocol session identifier';
COMMENT ON COLUMN verification_sessions.transaction_hash IS 'Celo blockchain transaction hash for onchain verification';
COMMENT ON COLUMN verification_sessions.expires_at IS 'Session expiration timestamp (typically 15 minutes from creation)';
COMMENT ON COLUMN verification_sessions.failure_reason IS 'Reason for verification failure (e.g., age requirement, excluded country)';
COMMENT ON COLUMN verification_sessions.metadata IS 'Additional verification metadata (user agent, IP, disclosures, etc.)';

-- =====================================================
-- GRIN MATES FINTECH DAPP DATABASE SCHEMA
-- PostgreSQL Database for Crypto Wallet & Services
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE USER MANAGEMENT
-- =====================================================

-- Users table - Core user profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  wallet_address VARCHAR(255) UNIQUE,
  wallet_type VARCHAR(50) DEFAULT 'privy',
  display_name VARCHAR(255),
  profile_image_url VARCHAR(500),
  phone_number VARCHAR(20),
  country_code VARCHAR(5),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- KYC Submissions table - Identity verification
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('government_id', 'passport', 'drivers_license')),
  document_number VARCHAR(100),
  document_url VARCHAR(500),
  selfie_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('none', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  self_protocol_session_id VARCHAR(255),
  self_protocol_transaction_hash VARCHAR(66),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- =====================================================
-- CRYPTO WALLET & ASSETS
-- =====================================================

-- Supported Networks
CREATE TABLE IF NOT EXISTS networks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  chain_id INTEGER UNIQUE,
  rpc_url VARCHAR(500),
  explorer_url VARCHAR(500),
  native_currency_symbol VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supported Tokens
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  contract_address VARCHAR(255),
  network_id UUID NOT NULL REFERENCES networks(id),
  decimals INTEGER DEFAULT 18,
  icon_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, network_id)
);

-- User Wallet Addresses (for different networks)
CREATE TABLE IF NOT EXISTS user_wallet_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  network_id UUID NOT NULL REFERENCES networks(id),
  address VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, network_id)
);

-- User Balances
CREATE TABLE IF NOT EXISTS balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id UUID NOT NULL REFERENCES tokens(id),
  balance DECIMAL(30, 18) NOT NULL DEFAULT 0,
  locked_balance DECIMAL(30, 18) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, token_id)
);

-- =====================================================
-- TRANSACTIONS & BLOCKCHAIN
-- =====================================================

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_hash VARCHAR(255) UNIQUE,
  block_number BIGINT,
  transaction_index INTEGER,
  type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'withdraw', 'send', 'receive', 'swap', 'service_payment', 'mobile_money_deposit', 'mobile_money_withdraw', 'airtime_purchase')),
  amount DECIMAL(30, 18) NOT NULL,
  fee DECIMAL(30, 18) DEFAULT 0,
  token_id UUID NOT NULL REFERENCES tokens(id),
  network_id UUID NOT NULL REFERENCES networks(id),
  from_address VARCHAR(255),
  to_address VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled', 'reversed')),
  confirmation_count INTEGER DEFAULT 0,
  gas_used BIGINT,
  gas_price DECIMAL(30, 18),
  nonce INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  failed_at TIMESTAMP
);

-- Mobile Money Transactions
CREATE TABLE IF NOT EXISTS mobile_money_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('mtn', 'airtel')),
  phone_number VARCHAR(20) NOT NULL,
  reference_number VARCHAR(100),
  provider_transaction_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Admin Transaction Controls (for reversals, swaps, etc.)
CREATE TABLE IF NOT EXISTS admin_transaction_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES users(id),
  original_transaction_id UUID NOT NULL REFERENCES transactions(id),
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('reverse', 'swap', 'freeze', 'unfreeze', 'adjust_balance')),
  new_transaction_id UUID REFERENCES transactions(id),
  reason TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SERVICES & GREEN INITIATIVES
-- =====================================================

-- Service Categories
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES service_categories(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  base_price DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  green_points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gas Refill Stations
CREATE TABLE IF NOT EXISTS gas_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone_number VARCHAR(20),
  operating_hours JSONB,
  fuel_types JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Solar Connection Requests
CREATE TABLE IF NOT EXISTS solar_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_address TEXT NOT NULL,
  property_type VARCHAR(50),
  estimated_consumption DECIMAL(10, 2),
  installation_preference VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  estimated_cost DECIMAL(10, 2),
  installer_assigned VARCHAR(255),
  installation_date DATE,
  completion_date DATE,
  green_points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Animal Rescue Reports
CREATE TABLE IF NOT EXISTS animal_rescues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  animal_type VARCHAR(100),
  location_description TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  urgency_level VARCHAR(20) DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  image_urls JSONB,
  status VARCHAR(50) DEFAULT 'reported' CHECK (status IN ('reported', 'assigned', 'in_progress', 'rescued', 'closed')),
  rescuer_assigned VARCHAR(255),
  rescue_date TIMESTAMP,
  green_points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Smart Recycling Activities
CREATE TABLE IF NOT EXISTS recycling_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  material_type VARCHAR(50) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  location VARCHAR(255),
  recycling_center_id UUID,
  verification_method VARCHAR(50),
  verification_data JSONB,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  green_points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP
);

-- Wildlife Reporting
CREATE TABLE IF NOT EXISTS wildlife_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  species_name VARCHAR(255),
  location_description TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  sighting_date TIMESTAMP NOT NULL,
  behavior_observed TEXT,
  habitat_condition VARCHAR(50),
  threat_level VARCHAR(20) DEFAULT 'none' CHECK (threat_level IN ('none', 'low', 'medium', 'high', 'critical')),
  image_urls JSONB,
  audio_urls JSONB,
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'published', 'rejected')),
  verified_by UUID REFERENCES users(id),
  green_points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP
);

-- =====================================================
-- GREEN POINTS SYSTEM
-- =====================================================

-- Green Points Transactions
CREATE TABLE IF NOT EXISTS green_points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'penalty', 'transfer')),
  source_type VARCHAR(50) NOT NULL,
  source_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Green Points Balances
CREATE TABLE IF NOT EXISTS green_points_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  available_points INTEGER NOT NULL DEFAULT 0,
  locked_points INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- =====================================================
-- EVENTS MANAGEMENT
-- =====================================================

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  max_participants INTEGER,
  registration_deadline TIMESTAMP,
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  green_points_reward INTEGER DEFAULT 0,
  image_url VARCHAR(500),
  organizer_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Participants
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attendance_status VARCHAR(50) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'no_show', 'cancelled')),
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  green_points_earned INTEGER DEFAULT 0,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment TEXT,
  UNIQUE(event_id, user_id)
);

-- =====================================================
-- ADMIN & SYSTEM
-- =====================================================

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'support')),
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- KYC indexes
CREATE INDEX idx_kyc_user_id ON kyc_submissions(user_id);
CREATE INDEX idx_kyc_status ON kyc_submissions(status);
CREATE INDEX idx_kyc_submitted_at ON kyc_submissions(submitted_at DESC);

-- Balances indexes
CREATE INDEX idx_balances_user_id ON balances(user_id);
CREATE INDEX idx_balances_token_id ON balances(token_id);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_token_network ON transactions(token_id, network_id);

-- Services indexes
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_active ON services(is_active);

-- Events indexes
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_organizer ON events(organizer_id);

-- Green Points indexes
CREATE INDEX idx_green_points_user_id ON green_points_transactions(user_id);
CREATE INDEX idx_green_points_type ON green_points_transactions(transaction_type);
CREATE INDEX idx_green_points_created_at ON green_points_transactions(created_at DESC);

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert supported networks
INSERT INTO networks (name, chain_id, native_currency_symbol, rpc_url, explorer_url) VALUES
('Celo', 42220, 'CELO', 'https://forno.celo.org', 'https://celoscan.io'),
('Base', 8453, 'ETH', 'https://mainnet.base.org', 'https://basescan.org'),
('Solana', NULL, 'SOL', 'https://api.mainnet-beta.solana.com', 'https://solscan.io'),
('Stellar', NULL, 'XLM', 'https://horizon.stellar.org', 'https://stellarchain.io')
ON CONFLICT (name) DO NOTHING;

-- Insert supported tokens
INSERT INTO tokens (symbol, name, network_id, decimals) VALUES
('USDT', 'Tether USD', (SELECT id FROM networks WHERE name = 'Celo'), 6),
('USDT', 'Tether USD', (SELECT id FROM networks WHERE name = 'Solana'), 6),
('USDC', 'USD Coin', (SELECT id FROM networks WHERE name = 'Celo'), 6),
('USDC', 'USD Coin', (SELECT id FROM networks WHERE name = 'Base'), 6),
('USDC', 'USD Coin', (SELECT id FROM networks WHERE name = 'Stellar'), 7),
('USDC', 'USD Coin', (SELECT id FROM networks WHERE name = 'Solana'), 6),
('cUSD', 'Celo Dollar', (SELECT id FROM networks WHERE name = 'Celo'), 18)
ON CONFLICT (symbol, network_id) DO NOTHING;

-- Insert service categories
INSERT INTO service_categories (name, description) VALUES
('Gas Refill', 'Fuel and gas station services'),
('Solar Connection', 'Solar panel installation and connection services'),
('Animal Rescue', 'Animal rescue and wildlife protection services'),
('Smart Recycling', 'Recycling and waste management services'),
('Wildlife Reporting', 'Wildlife observation and conservation reporting')
ON CONFLICT (name) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
('green_points_per_dollar', '10', 'Green points earned per dollar spent on services'),
('min_withdrawal_amount', '1.00', 'Minimum withdrawal amount in USD'),
('max_withdrawal_amount', '10000.00', 'Maximum withdrawal amount in USD'),
('transaction_fee_percentage', '0.01', 'Transaction fee percentage (1%)'),
('kyc_expiry_days', '365', 'KYC verification expiry in days')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_balances_updated_at BEFORE UPDATE ON balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solar_connections_updated_at BEFORE UPDATE ON solar_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_animal_rescues_updated_at BEFORE UPDATE ON animal_rescues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_green_points_balances_updated_at BEFORE UPDATE ON green_points_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- User portfolio view (total balance across all tokens)
CREATE OR REPLACE VIEW user_portfolio AS
SELECT 
    u.id as user_id,
    u.email,
    u.display_name,
    COALESCE(SUM(b.balance * COALESCE(sp.usd_price, 1)), 0) as total_balance_usd,
    COUNT(DISTINCT t.id) as token_count,
    u.created_at
FROM users u
LEFT JOIN balances b ON u.id = b.user_id
LEFT JOIN tokens t ON b.token_id = t.id
LEFT JOIN (
    -- Simulated price data - replace with actual price feed
    SELECT 'USDT' as symbol, 1.00 as usd_price
    UNION SELECT 'USDC', 1.00
    UNION SELECT 'cUSD', 1.00
) sp ON t.symbol = sp.symbol
GROUP BY u.id, u.email, u.display_name, u.created_at;

-- Recent transactions view
CREATE OR REPLACE VIEW recent_transactions AS
SELECT 
    t.id,
    t.transaction_hash,
    t.type,
    t.amount,
    tok.symbol as token_symbol,
    n.name as network_name,
    t.status,
    t.created_at,
    u.email as user_email,
    u.display_name as user_name
FROM transactions t
JOIN users u ON t.user_id = u.id
JOIN tokens tok ON t.token_id = tok.id
JOIN networks n ON t.network_id = n.id
ORDER BY t.created_at DESC;

-- Green points leaderboard view
CREATE OR REPLACE VIEW green_points_leaderboard AS
SELECT 
    u.id as user_id,
    u.display_name,
    u.email,
    gpb.total_points,
    gpb.lifetime_earned,
    RANK() OVER (ORDER BY gpb.total_points DESC) as rank
FROM users u
JOIN green_points_balances gpb ON u.id = gpb.user_id
WHERE u.is_active = true
ORDER BY gpb.total_points DESC;
-- Migration: 002_add_price_tracking
-- Description: Add price tracking for tokens and exchange rates
-- Created: 2026-01-02

-- Token Prices table for real-time price tracking
CREATE TABLE IF NOT EXISTS token_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  price_usd DECIMAL(20, 8) NOT NULL,
  price_source VARCHAR(50) NOT NULL,
  volume_24h DECIMAL(20, 8),
  market_cap DECIMAL(20, 2),
  price_change_24h DECIMAL(10, 4),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exchange Rates for mobile money conversions
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency VARCHAR(10) NOT NULL,
  to_currency VARCHAR(10) NOT NULL,
  rate DECIMAL(20, 8) NOT NULL,
  source VARCHAR(50) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(from_currency, to_currency)
);

-- Indexes
CREATE INDEX idx_token_prices_token_id ON token_prices(token_id);
CREATE INDEX idx_token_prices_updated ON token_prices(last_updated DESC);
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);

-- Insert initial exchange rates (example data)
INSERT INTO exchange_rates (from_currency, to_currency, rate, source) VALUES
('USD', 'UGX', 3700.00, 'manual'),
('UGX', 'USD', 0.00027, 'manual')
ON CONFLICT (from_currency, to_currency) DO NOTHING;

-- Update schema version
UPDATE system_settings SET value = '2', updated_at = CURRENT_TIMESTAMP WHERE key = 'schema_version';
-- Migration: 001_initial_schema
-- Description: Create initial database schema for Grin Mates Fintech DApp
-- Created: 2024-01-01

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Execute the main schema
\i schema.sql

-- Insert initial admin user (update with actual admin details)
-- INSERT INTO users (email, display_name, is_active, email_verified) 
-- VALUES ('admin@grinmates.com', 'System Admin', true, true);

-- INSERT INTO admin_users (user_id, role, permissions, is_active)
-- VALUES (
--   (SELECT id FROM users WHERE email = 'admin@grinmates.com'),
--   'super_admin',
--   '{"all": true}',
--   true
-- );

-- Migration completed
INSERT INTO system_settings (key, value, description) VALUES
('schema_version', '1', 'Current database schema version')
ON CONFLICT (key) DO UPDATE SET value = '1', updated_at = CURRENT_TIMESTAMP;
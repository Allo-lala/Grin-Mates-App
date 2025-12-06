/**
 * Environment-Specific Configuration Tests
 * 
 * Tests for automatic environment detection and endpoint type configuration
 * Requirements: 3.5, 3.6, 7.2, 7.3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getEndpointTypeFromEnvironment, getSelfConfig, validateSelfConfig } from '@/lib/self-config';

describe('Environment-Specific Configuration', () => {
  // Store original environment variables
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment to clean state
    delete process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE;
    delete process.env.NODE_ENV;
    delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    delete process.env.VERCEL_ENV;
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
  });

  describe('Requirement 3.5, 3.6: Automatic Environment Detection', () => {
    it('should use celo (mainnet) for production environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';

      const endpointType = getEndpointTypeFromEnvironment();
      
      expect(endpointType).toBe('celo');
    });

    it('should use celo (mainnet) when VERCEL_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      process.env.VERCEL_ENV = 'production';

      const endpointType = getEndpointTypeFromEnvironment();
      
      expect(endpointType).toBe('celo');
    });

    it('should use staging_celo (testnet) for development environment', () => {
      process.env.NODE_ENV = 'development';

      const endpointType = getEndpointTypeFromEnvironment();
      
      expect(endpointType).toBe('staging_celo');
    });

    it('should use staging_celo (testnet) for preview deployments', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview';

      const endpointType = getEndpointTypeFromEnvironment();
      
      expect(endpointType).toBe('staging_celo');
    });

    it('should use staging_celo (testnet) when no environment is set', () => {
      const endpointType = getEndpointTypeFromEnvironment();
      
      expect(endpointType).toBe('staging_celo');
    });

    it('should use staging_celo (testnet) for production NODE_ENV without VERCEL_ENV', () => {
      process.env.NODE_ENV = 'production';
      // No VERCEL_ENV set

      const endpointType = getEndpointTypeFromEnvironment();
      
      expect(endpointType).toBe('staging_celo');
    });
  });

  describe('Requirement 7.2, 7.3: Manual Override Support', () => {
    it('should respect explicit NEXT_PUBLIC_SELF_ENDPOINT_TYPE override to celo', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE = 'celo';

      const endpointType = getEndpointTypeFromEnvironment();
      
      expect(endpointType).toBe('celo');
    });

    it('should respect explicit NEXT_PUBLIC_SELF_ENDPOINT_TYPE override to staging_celo', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';
      process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE = 'staging_celo';

      const endpointType = getEndpointTypeFromEnvironment();
      
      expect(endpointType).toBe('staging_celo');
    });

    it('should respect explicit NEXT_PUBLIC_SELF_ENDPOINT_TYPE override to https', () => {
      process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE = 'https';

      const endpointType = getEndpointTypeFromEnvironment();
      
      expect(endpointType).toBe('https');
    });

    it('should respect explicit NEXT_PUBLIC_SELF_ENDPOINT_TYPE override to staging_https', () => {
      process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE = 'staging_https';

      const endpointType = getEndpointTypeFromEnvironment();
      
      expect(endpointType).toBe('staging_https');
    });
  });

  describe('Integration: getSelfConfig with Environment Detection', () => {
    beforeEach(() => {
      // Set required environment variables
      process.env.NEXT_PUBLIC_SELF_APP_NAME = 'Test App';
      process.env.NEXT_PUBLIC_SELF_SCOPE_SEED = 'test-seed';
      process.env.NEXT_PUBLIC_SELF_ENDPOINT = 'https://test.endpoint';
      process.env.NEXT_PUBLIC_SELF_LOGO_URL = 'https://test.logo';
    });

    it('should include detected endpoint type in config for production', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';

      const config = getSelfConfig();
      
      expect(config.endpointType).toBe('celo');
      expect(config.appName).toBe('Test App');
    });

    it('should include detected endpoint type in config for development', () => {
      process.env.NODE_ENV = 'development';

      const config = getSelfConfig();
      
      expect(config.endpointType).toBe('staging_celo');
      expect(config.appName).toBe('Test App');
    });

    it('should include manual override in config', () => {
      process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE = 'https';

      const config = getSelfConfig();
      
      expect(config.endpointType).toBe('https');
    });
  });

  describe('Configuration Validation with Endpoint Type', () => {
    beforeEach(() => {
      // Set required environment variables
      process.env.NEXT_PUBLIC_SELF_APP_NAME = 'Test App';
      process.env.NEXT_PUBLIC_SELF_SCOPE_SEED = 'test-seed';
      process.env.NEXT_PUBLIC_SELF_ENDPOINT = 'https://test.endpoint';
      process.env.NEXT_PUBLIC_SELF_LOGO_URL = 'https://test.logo';
    });

    it('should validate successfully with valid endpoint type', () => {
      process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE = 'celo';

      const isValid = validateSelfConfig();
      
      expect(isValid).toBe(true);
    });

    it('should validate successfully without endpoint type (auto-detect)', () => {
      delete process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE;

      const isValid = validateSelfConfig();
      
      expect(isValid).toBe(true);
    });

    it('should fail validation with invalid endpoint type', () => {
      process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE = 'invalid_endpoint';

      const isValid = validateSelfConfig();
      
      expect(isValid).toBe(false);
    });

    it('should accept all valid endpoint types', () => {
      const validTypes = ['celo', 'staging_celo', 'https', 'staging_https'];

      for (const type of validTypes) {
        process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE = type;
        const isValid = validateSelfConfig();
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      // Set required environment variables
      process.env.NEXT_PUBLIC_SELF_APP_NAME = 'Test App';
      process.env.NEXT_PUBLIC_SELF_SCOPE_SEED = 'test-seed';
      process.env.NEXT_PUBLIC_SELF_ENDPOINT = 'https://test.endpoint';
      process.env.NEXT_PUBLIC_SELF_LOGO_URL = 'https://test.logo';
    });

    it('should handle empty string NEXT_PUBLIC_SELF_ENDPOINT_TYPE as auto-detect', () => {
      process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE = '';
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';

      const endpointType = getEndpointTypeFromEnvironment();
      
      // Empty string is falsy, so should fall through to auto-detect
      expect(endpointType).toBe('celo');
    });

    it('should prioritize NEXT_PUBLIC_VERCEL_ENV over VERCEL_ENV', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';
      process.env.VERCEL_ENV = 'preview';

      const endpointType = getEndpointTypeFromEnvironment();
      
      expect(endpointType).toBe('celo');
    });

    it('should fall back to VERCEL_ENV if NEXT_PUBLIC_VERCEL_ENV is not set', () => {
      process.env.NODE_ENV = 'production';
      process.env.VERCEL_ENV = 'production';
      delete process.env.NEXT_PUBLIC_VERCEL_ENV;

      const endpointType = getEndpointTypeFromEnvironment();
      
      expect(endpointType).toBe('celo');
    });

    it('should handle case sensitivity in endpoint type', () => {
      process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE = 'CELO';

      const endpointType = getEndpointTypeFromEnvironment();
      
      // Should return as-is (case sensitive)
      expect(endpointType).toBe('CELO');
    });
  });
});

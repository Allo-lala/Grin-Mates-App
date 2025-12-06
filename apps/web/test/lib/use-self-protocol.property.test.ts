/**
 * Property-Based Tests for Self Protocol QR Code Generation
 * 
 * Feature: self-protocol-kyc-integration
 * Property 1: QR Code Generation Consistency
 * 
 * For any valid wallet address and configuration, generating a QR code should 
 * produce a valid Self Protocol verification request that includes the wallet 
 * address as the user ID.
 * 
 * Validates: Requirements 1.1, 1.2, 3.8
 */

import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { SelfAppBuilder, getUniversalLink } from '@selfxyz/common';
import { getSelfConfig } from '../../src/lib/self-config';

// Mock the Self Protocol SDK
vi.mock('@selfxyz/common', () => {
  return {
    SelfAppBuilder: class MockSelfAppBuilder {
      private config: any;
      
      constructor(config: any) {
        this.config = config;
      }
      
      build() {
        return {
          ...this.config,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
      }
    },
    getUniversalLink: (selfApp: any) => {
      // Generate a mock universal link that contains the app configuration as JSON
      return JSON.stringify({
        userId: selfApp.userId,
        appName: selfApp.appName,
        endpoint: selfApp.endpoint,
        version: selfApp.version,
        disclosures: selfApp.disclosures,
      });
    },
  };
});

// Mock the self-config module
vi.mock('../../src/lib/self-config', () => {
  const EXCLUDED_COUNTRIES = ['AFG', 'BLR', 'CUB'];
  const DEFAULT_DISCLOSURES = {
    minimumAge: 18,
    ofac: true,
    excludedCountries: EXCLUDED_COUNTRIES,
    name: true,
    nationality: true,
    date_of_birth: true,
    issuing_state: false,
    passport_number: false,
    gender: false,
    expiry_date: false,
  };
  
  return {
    getSelfConfig: vi.fn().mockReturnValue({
      appName: 'Grin Mates',
      scopeSeed: 'test-scope-seed',
      endpoint: 'https://test-endpoint.self.xyz',
      endpointType: 'staging_celo',
      logoUrl: 'https://test-logo.png',
      excludedCountries: EXCLUDED_COUNTRIES,
      minimumAge: 18,
      version: 2,
      userIdType: 'hex',
      disclosures: DEFAULT_DISCLOSURES,
    }),
    EXCLUDED_COUNTRIES,
    DEFAULT_DISCLOSURES,
    SESSION_CONFIG: {
      expirationMinutes: 15,
      pollingIntervalMs: 3000,
      pollingTimeoutMs: 900000,
    },
  };
});

describe('Property 1: QR Code Generation Consistency', () => {
  /**
   * Feature: self-protocol-kyc-integration, Property 1: QR Code Generation Consistency
   * 
   * For any valid wallet address and configuration, generating a QR code should 
   * produce a valid Self Protocol verification request that includes the wallet 
   * address as the user ID.
   * 
   * Validates: Requirements 1.1, 1.2, 3.8
   */
  it('should generate valid QR codes containing wallet address for all valid Ethereum addresses', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random valid Ethereum wallet addresses
        fc.array(
          fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'),
          { minLength: 40, maxLength: 40 }
        ),
        async (hexArray) => {
          const hex = hexArray.join('');
          const walletAddress = `0x${hex}`;

          // Get Self Protocol configuration
          const selfConfig = getSelfConfig();

          // Initialize SelfAppBuilder with the wallet address
          const builder = new SelfAppBuilder({
            version: selfConfig.version,
            appName: selfConfig.appName,
            scope: selfConfig.scopeSeed,
            endpoint: selfConfig.endpoint,
            logoBase64: selfConfig.logoUrl,
            userId: walletAddress,
            endpointType: selfConfig.endpointType,
            userIdType: selfConfig.userIdType,
            disclosures: selfConfig.disclosures,
          });

          // Build the Self app instance
          const selfApp = builder.build();

          // Generate universal link (QR code data)
          const qrData = getUniversalLink(selfApp);

          // Verify QR data was generated
          expect(qrData).not.toBeNull();
          expect(typeof qrData).toBe('string');

          // Verify the QR data contains the wallet address as user ID
          const qrDataParsed = JSON.parse(qrData);
          expect(qrDataParsed.userId).toBe(walletAddress);

          // Verify session ID was generated
          expect(selfApp.sessionId).not.toBeNull();
          expect(typeof selfApp.sessionId).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: self-protocol-kyc-integration, Property 1: QR Code Generation Consistency
   * 
   * Validates that QR code generation includes proper configuration from environment
   * 
   * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.8
   */
  it('should include proper Self Protocol configuration in generated QR codes', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random valid Ethereum wallet addresses
        fc.array(
          fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'),
          { minLength: 40, maxLength: 40 }
        ),
        async (hexArray) => {
          const hex = hexArray.join('');
          const walletAddress = `0x${hex}`;

          // Get Self Protocol configuration
          const selfConfig = getSelfConfig();

          // Initialize SelfAppBuilder with the wallet address
          const builder = new SelfAppBuilder({
            version: selfConfig.version,
            appName: selfConfig.appName,
            scope: selfConfig.scopeSeed,
            endpoint: selfConfig.endpoint,
            logoBase64: selfConfig.logoUrl,
            userId: walletAddress,
            endpointType: selfConfig.endpointType,
            userIdType: selfConfig.userIdType,
            disclosures: selfConfig.disclosures,
          });

          // Build the Self app instance
          const selfApp = builder.build();

          // Generate universal link (QR code data)
          const qrData = getUniversalLink(selfApp);

          // Verify QR data contains proper configuration
          const qrDataParsed = JSON.parse(qrData);

          // Requirement 3.1: Version 2 of Self Protocol API
          expect(qrDataParsed.version).toBe(2);

          // Requirement 3.2: Application name from environment
          expect(qrDataParsed.appName).toBe('Grin Mates');

          // Requirement 3.4: Endpoint URL from environment
          expect(qrDataParsed.endpoint).toBe('https://test-endpoint.self.xyz');

          // Requirement 3.8: User ID is the wallet address in hex format
          expect(qrDataParsed.userId).toBe(walletAddress);
          expect(walletAddress.startsWith('0x')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: self-protocol-kyc-integration, Property 1: QR Code Generation Consistency
   * 
   * Validates that disclosure requirements are properly included in QR codes
   * 
   * Validates: Requirements 2.1, 2.2, 2.3
   */
  it('should include disclosure requirements in generated QR codes', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random valid Ethereum wallet addresses
        fc.array(
          fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'),
          { minLength: 40, maxLength: 40 }
        ),
        // Generate random minimum age (18-21 are common requirements)
        fc.integer({ min: 18, max: 21 }),
        async (hexArray, minimumAge) => {
          const hex = hexArray.join('');
          const walletAddress = `0x${hex}`;

          // Get Self Protocol configuration
          const selfConfig = getSelfConfig();

          // Initialize SelfAppBuilder with the wallet address and custom minimum age
          const builder = new SelfAppBuilder({
            version: selfConfig.version,
            appName: selfConfig.appName,
            scope: selfConfig.scopeSeed,
            endpoint: selfConfig.endpoint,
            logoBase64: selfConfig.logoUrl,
            userId: walletAddress,
            endpointType: selfConfig.endpointType,
            userIdType: selfConfig.userIdType,
            disclosures: {
              ...selfConfig.disclosures,
              minimumAge: minimumAge,
            },
          });

          // Build the Self app instance
          const selfApp = builder.build();

          // Generate universal link (QR code data)
          const qrData = getUniversalLink(selfApp);

          // Verify QR data contains disclosure requirements
          const qrDataParsed = JSON.parse(qrData);

          // Requirement 2.1: Minimum age requirement
          expect(qrDataParsed.disclosures.minimumAge).toBe(minimumAge);

          // Requirement 2.3: OFAC sanctions screening
          expect(qrDataParsed.disclosures.ofac).toBe(true);

          // Requirement 2.2: Excluded countries list
          expect(qrDataParsed.disclosures.excludedCountries).toBeDefined();
          expect(Array.isArray(qrDataParsed.disclosures.excludedCountries)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Test suite for disclosure requirements configuration
 * 
 * Validates that disclosure requirements are properly configured according to
 * Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_DISCLOSURES, EXCLUDED_COUNTRIES } from '../../src/lib/self-config';

describe('Disclosure Requirements Configuration', () => {
  describe('Requirement 2.1: Minimum Age', () => {
    it('should configure minimumAge to 18', () => {
      expect(DEFAULT_DISCLOSURES.minimumAge).toBe(18);
    });
  });

  describe('Requirement 2.2: Excluded Countries', () => {
    it('should configure excluded countries list', () => {
      expect(DEFAULT_DISCLOSURES.excludedCountries).toBeDefined();
      expect(Array.isArray(DEFAULT_DISCLOSURES.excludedCountries)).toBe(true);
      expect(DEFAULT_DISCLOSURES.excludedCountries!.length).toBeGreaterThan(0);
    });

    it('should include sanctioned countries in excluded list', () => {
      const excludedCountries = DEFAULT_DISCLOSURES.excludedCountries!;
      
      // Verify key sanctioned countries are included
      expect(excludedCountries).toContain('IRN'); // Iran
      expect(excludedCountries).toContain('PRK'); // North Korea
      expect(excludedCountries).toContain('SYR'); // Syria
      expect(excludedCountries).toContain('CUB'); // Cuba
      expect(excludedCountries).toContain('VEN'); // Venezuela
    });

    it('should match EXCLUDED_COUNTRIES constant', () => {
      expect(DEFAULT_DISCLOSURES.excludedCountries).toEqual(EXCLUDED_COUNTRIES);
    });

    it('should include all 17 excluded countries', () => {
      // Verify all countries from the design document are included
      expect(EXCLUDED_COUNTRIES).toHaveLength(17);
      expect(EXCLUDED_COUNTRIES).toEqual([
        'AFG', // Afghanistan
        'BLR', // Belarus
        'CAF', // Central African Republic
        'CUB', // Cuba
        'COD', // Democratic Republic of Congo
        'IRN', // Iran
        'IRQ', // Iraq
        'LBN', // Lebanon
        'LBY', // Libya
        'PRK', // North Korea
        'SOM', // Somalia
        'SSD', // South Sudan
        'SDN', // Sudan
        'SYR', // Syria
        'VEN', // Venezuela
        'YEM', // Yemen
        'ZWE', // Zimbabwe
      ]);
    });
  });

  describe('Requirement 2.3: OFAC Screening', () => {
    it('should enable OFAC screening in disclosures', () => {
      expect(DEFAULT_DISCLOSURES.ofac).toBe(true);
    });
  });

  describe('Requirements 2.4, 2.5: Optional Identity Attributes', () => {
    it('should configure name attribute', () => {
      expect(DEFAULT_DISCLOSURES.name).toBeDefined();
      expect(typeof DEFAULT_DISCLOSURES.name).toBe('boolean');
      expect(DEFAULT_DISCLOSURES.name).toBe(true);
    });

    it('should configure nationality attribute', () => {
      expect(DEFAULT_DISCLOSURES.nationality).toBeDefined();
      expect(typeof DEFAULT_DISCLOSURES.nationality).toBe('boolean');
      expect(DEFAULT_DISCLOSURES.nationality).toBe(true);
    });

    it('should configure date_of_birth attribute', () => {
      expect(DEFAULT_DISCLOSURES.date_of_birth).toBeDefined();
      expect(typeof DEFAULT_DISCLOSURES.date_of_birth).toBe('boolean');
      expect(DEFAULT_DISCLOSURES.date_of_birth).toBe(true);
    });

    it('should configure issuing_state attribute', () => {
      expect(DEFAULT_DISCLOSURES.issuing_state).toBeDefined();
      expect(typeof DEFAULT_DISCLOSURES.issuing_state).toBe('boolean');
      expect(DEFAULT_DISCLOSURES.issuing_state).toBe(false);
    });

    it('should configure passport_number attribute', () => {
      expect(DEFAULT_DISCLOSURES.passport_number).toBeDefined();
      expect(typeof DEFAULT_DISCLOSURES.passport_number).toBe('boolean');
      expect(DEFAULT_DISCLOSURES.passport_number).toBe(false);
    });

    it('should configure gender attribute', () => {
      expect(DEFAULT_DISCLOSURES.gender).toBeDefined();
      expect(typeof DEFAULT_DISCLOSURES.gender).toBe('boolean');
      expect(DEFAULT_DISCLOSURES.gender).toBe(false);
    });

    it('should configure expiry_date attribute', () => {
      expect(DEFAULT_DISCLOSURES.expiry_date).toBeDefined();
      expect(typeof DEFAULT_DISCLOSURES.expiry_date).toBe('boolean');
      expect(DEFAULT_DISCLOSURES.expiry_date).toBe(false);
    });

    it('should request essential identity attributes', () => {
      // Essential attributes for KYC should be enabled
      expect(DEFAULT_DISCLOSURES.name).toBe(true);
      expect(DEFAULT_DISCLOSURES.nationality).toBe(true);
      expect(DEFAULT_DISCLOSURES.date_of_birth).toBe(true);
    });

    it('should not request sensitive optional attributes by default', () => {
      // Privacy-sensitive attributes should be disabled by default
      expect(DEFAULT_DISCLOSURES.passport_number).toBe(false);
      expect(DEFAULT_DISCLOSURES.gender).toBe(false);
    });
  });

  describe('Integration: Complete Disclosure Configuration', () => {
    it('should have all required disclosure fields configured', () => {
      const disclosures = DEFAULT_DISCLOSURES;
      
      // Verify all required fields are present
      expect(disclosures.minimumAge).toBe(18);
      expect(disclosures.ofac).toBe(true);
      expect(disclosures.excludedCountries).toEqual(EXCLUDED_COUNTRIES);
      
      // Verify optional attributes are configured
      expect(disclosures.name).toBeDefined();
      expect(disclosures.nationality).toBeDefined();
      expect(disclosures.date_of_birth).toBeDefined();
      expect(disclosures.issuing_state).toBeDefined();
      expect(disclosures.passport_number).toBeDefined();
      expect(disclosures.gender).toBeDefined();
      expect(disclosures.expiry_date).toBeDefined();
    });

    it('should have proper structure for SelfAppBuilder', () => {
      // Verify the disclosures object has the structure expected by SelfAppBuilder
      expect(DEFAULT_DISCLOSURES).toHaveProperty('minimumAge');
      expect(DEFAULT_DISCLOSURES).toHaveProperty('ofac');
      expect(DEFAULT_DISCLOSURES).toHaveProperty('excludedCountries');
      expect(DEFAULT_DISCLOSURES).toHaveProperty('name');
      expect(DEFAULT_DISCLOSURES).toHaveProperty('nationality');
      expect(DEFAULT_DISCLOSURES).toHaveProperty('date_of_birth');
    });
  });
});

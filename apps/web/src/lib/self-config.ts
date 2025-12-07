import { countries } from '@selfxyz/qrcode';

export type EndpointType = 'celo' | 'staging_celo' | 'https' | 'staging_https';

/**
 * Disclosure requirements for identity verification
 * Defines which identity attributes and verification criteria are requested from users
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export interface DisclosureRequirements {
  minimumAge?: number;                 // Minimum age requirement (Requirement 2.1)
  ofac?: boolean;                      // OFAC sanctions screening (Requirement 2.3)
  excludedCountries?: string[];        // Excluded country codes (Requirement 2.2)
  name?: boolean;                      // Request name disclosure (Requirement 2.4, 2.5)
  issuing_state?: boolean;             // Request issuing state (Requirement 2.4, 2.5)
  nationality?: boolean;               // Request nationality (Requirement 2.4, 2.5)
  date_of_birth?: boolean;             // Request date of birth (Requirement 2.4, 2.5)
  passport_number?: boolean;           // Request passport number (Requirement 2.4, 2.5)
  gender?: boolean;                    // Request gender (Requirement 2.4, 2.5)
  expiry_date?: boolean;               // Request document expiry (Requirement 2.4, 2.5)
}

export interface SelfConfig {
  appName: string;
  scopeSeed: string;
  endpoint: string;
  endpointType: EndpointType;
  logoUrl: string;
  excludedCountries: string[];
  minimumAge: number;
  version: number;
  userIdType: 'hex' | 'uuid';
  disclosures: DisclosureRequirements;
  contractAddress?: string; // Contract address for on-chain verification
}

/**
 * List of excluded countries based on regulatory requirements
 * Using Self Protocol's countries constants
 * IMPORTANT: This MUST match the contract deployment in DeployProofOfHuman.s.sol
 */
export const EXCLUDED_COUNTRIES: string[] = [
  countries.CUBA,           // CU
  countries.IRAN,           // IR
  countries.NORTH_KOREA,    // KP
  countries.SYRIAN_ARAB_REPUBLIC, // SY
  countries.RUSSIA,         // RU
  countries.BELARUS,        // BY
];

/**
 * Session timeout configuration
 */
export const SESSION_CONFIG = {
  expirationMinutes: 15,        // QR code expires after 15 minutes
  pollingIntervalMs: 3000,      // Poll every 3 seconds
  pollingTimeoutMs: 900000,     // Stop polling after 15 minutes (15 * 60 * 1000)
};

/**
 * Required environment variables for Self Protocol
 * Note: NEXT_PUBLIC_SELF_ENDPOINT_TYPE is optional - will be auto-detected if not provided
 */
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SELF_APP_NAME',
  'NEXT_PUBLIC_SELF_SCOPE_SEED',
  'NEXT_PUBLIC_SELF_ENDPOINT',
  'NEXT_PUBLIC_SELF_LOGO_URL',
] as const;

/**
 * Determines the appropriate endpoint type based on the current environment
 * 
 * Requirements: 3.5, 3.6, 7.2, 7.3
 * 
 * @returns EndpointType - 'staging_celo' for development/staging, 'celo' for production
 */
export function getEndpointTypeFromEnvironment(): EndpointType {
  // If explicitly set, use that value
  const explicitType = process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE;
  if (explicitType) {
    return explicitType as EndpointType;
  }
  
  // Auto-detect based on environment
  const nodeEnv = process.env.NODE_ENV;
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV;
  
  // Production environment detection
  // Use mainnet (celo) for production deployments
  if (nodeEnv === 'production' && vercelEnv === 'production') {
    return 'celo';
  }
  
  // Use testnet (staging_celo) for all other environments:
  // - development (local)
  // - preview (Vercel preview deployments)
  // - staging
  return 'staging_celo';
}

/**
 * Validates that all required Self Protocol environment variables are present
 * 
 * @returns true if all required environment variables are present, false otherwise
 */
export function validateSelfConfig(): boolean {
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
      return false;
    }
  }
  
  // Validate endpoint type if explicitly provided
  const endpointType = process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE;
  const validEndpointTypes: EndpointType[] = ['celo', 'staging_celo', 'https', 'staging_https'];
  
  if (endpointType && !validEndpointTypes.includes(endpointType as EndpointType)) {
    console.error(
      `Invalid NEXT_PUBLIC_SELF_ENDPOINT_TYPE: ${endpointType}. ` +
      `Must be one of: ${validEndpointTypes.join(', ')}`
    );
    return false;
  }
  
  return true;
}

/**
 * Default disclosure requirements for identity verification
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export const DEFAULT_DISCLOSURES: DisclosureRequirements = {
  minimumAge: 18,                      // Requirement 2.1: Users must be at least 18 years old
  ofac: false,                         // Requirement 2.3: OFAC sanctions screening disabled (matches contract)
  excludedCountries: EXCLUDED_COUNTRIES, // Requirement 2.2: Exclude sanctioned/restricted countries
  // Optional identity attributes (Requirements 2.4, 2.5)
  name: false,                          // Request user's full name
  nationality: false,                   // Request user's nationality
  date_of_birth: true,                 // Request user's date of birth
  issuing_state: false,                // Optional: issuing state
  passport_number: false,              // Optional: passport number (privacy consideration)
  gender: false,                       // Optional: gender
  expiry_date: false,                  // Optional: document expiry date
};

/**
 * Loads and returns the Self Protocol configuration from environment variables
 * 
 * Requirements: 3.5, 3.6, 7.2, 7.3
 * 
 * The endpoint type is automatically determined based on the environment:
 * - Production (NODE_ENV=production && VERCEL_ENV=production): uses 'celo' (mainnet)
 * - All other environments (development, preview, staging): uses 'staging_celo' (testnet)
 * - Can be overridden by setting NEXT_PUBLIC_SELF_ENDPOINT_TYPE explicitly
 * 
 * @throws Error if required environment variables are missing or invalid
 * @returns SelfConfig object with all configuration values
 */
export function getSelfConfig(): SelfConfig {
  if (!validateSelfConfig()) {
    throw new Error(
      'Self Protocol configuration is incomplete. ' +
      'Please ensure all required environment variables are set.'
    );
  }
  
  const endpointType = getEndpointTypeFromEnvironment();
  
  // Log the detected configuration for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Self Protocol] Configuration loaded:', {
      endpointType,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV,
      explicitType: process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE,
    });
  }
  
  // Get contract address from environment or use deployed address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 
    (endpointType === 'staging_celo' ? '0xdCb5C103D8bFd00b3c7b5a131C58a3EA14e1668b' : undefined);
  
  return {
    appName: process.env.NEXT_PUBLIC_SELF_APP_NAME!,
    scopeSeed: process.env.NEXT_PUBLIC_SELF_SCOPE_SEED!,
    endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT!,
    endpointType,
    logoUrl: process.env.NEXT_PUBLIC_SELF_LOGO_URL!,
    excludedCountries: EXCLUDED_COUNTRIES,
    minimumAge: 18,
    version: 2,
    userIdType: 'hex',
    disclosures: DEFAULT_DISCLOSURES,
    contractAddress,
  };
}

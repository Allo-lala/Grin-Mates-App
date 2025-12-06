'use client';

import { useState, useEffect, useCallback } from 'react';
import { SelfAppBuilder, getUniversalLink, type SelfApp } from '@selfxyz/qrcode';
import { getSelfConfig, type SelfConfig, type DisclosureRequirements } from '../self-config';
import { logger } from '../logger';

/**
 * Configuration for useSelfProtocol hook
 */
export interface UseSelfProtocolConfig {
  walletAddress: string;
  excludedCountries?: string[];
  minimumAge?: number;
}

/**
 * Return type for useSelfProtocol hook
 */
export interface UseSelfProtocolReturn {
  app: SelfApp | null;
  qrData: string | null;
  sessionId: string | null;
  sessionStartTime: number | null;
  isLoading: boolean;
  error: Error | null;
  regenerateQR: () => void;
}

/**
 * Custom hook to manage Self Protocol SDK initialization and QR code generation
 * 
 * This hook:
 * - Initializes SelfAppBuilder with configuration from environment variables
 * - Generates verification session and QR code data
 * - Handles QR code regeneration logic
 * - Implements error handling for SDK initialization failures
 * 
 * Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 6.1
 * 
 * @param config - Configuration object containing wallet address and optional disclosure requirements
 * @returns Object containing app instance, QR data, loading state, error state, and regenerate function
 */
export function useSelfProtocol(config: UseSelfProtocolConfig): UseSelfProtocolReturn {
  const { walletAddress, excludedCountries, minimumAge } = config;
  
  const [app, setApp] = useState<SelfApp | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [regenerateCounter, setRegenerateCounter] = useState<number>(0);

  /**
   * Initialize Self Protocol SDK and generate QR code
   */
  const initializeSelfProtocol = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load Self Protocol configuration from environment variables
      // Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
      const selfConfig: SelfConfig = getSelfConfig();
      
      // Validate wallet address format
      if (!walletAddress || !walletAddress.startsWith('0x')) {
        throw new Error('Invalid wallet address format. Must start with 0x');
      }
      
      // Build disclosure requirements
      // Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
      const disclosures: DisclosureRequirements = {
        ...selfConfig.disclosures,
        // Allow override of minimumAge and excludedCountries if provided
        minimumAge: minimumAge ?? selfConfig.disclosures.minimumAge,
        excludedCountries: excludedCountries ?? selfConfig.disclosures.excludedCountries,
      };
      
      // Initialize SelfAppBuilder with configuration matching workshop example
      // Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
      const builderConfig: any = {
        version: 2,
        appName: selfConfig.appName,
        scope: selfConfig.scopeSeed,
        endpoint: selfConfig.endpoint,
        logoBase64: selfConfig.logoUrl,
        userId: walletAddress,
        endpointType: 'staging_celo', // Force staging_celo like workshop
        userIdType: 'hex',
        userDefinedData: `Verification for ${walletAddress}`,
        disclosures: {
          minimumAge: 18,
          ofac: true,
          excludedCountries: excludedCountries,
          name: true,
          nationality: true,
          date_of_birth: true,
        },
      };
      
      // Debug log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Self Protocol] Builder config:', builderConfig);
        console.log('[Self Protocol] Contract address available:', selfConfig.contractAddress);
      }
      
      const builder = new SelfAppBuilder(builderConfig);
      
      // Build the Self app instance
      const selfApp = builder.build();
      
      // Generate universal link for QR code
      // Requirements: 1.1, 1.2
      const universalLink = getUniversalLink(selfApp);
      
      // Extract session ID from the app instance
      const generatedSessionId = selfApp.sessionId;
      
      // Record session start time for expiration tracking
      const startTime = Date.now();
      
      setApp(selfApp);
      setQrData(universalLink);
      setSessionId(generatedSessionId);
      setSessionStartTime(startTime);
      setIsLoading(false);
      
      // Log successful QR code generation
      // Requirement 6.4: Log QR code generation events
      logger.qrGenerated(walletAddress, generatedSessionId);
    } catch (err) {
      // Requirement 6.1: Error handling for SDK initialization failures
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Self Protocol';
      const sdkError = new Error(errorMessage);
      
      // Log QR code generation failure
      // Requirement 6.4: Log QR code generation events
      logger.qrGenerationFailed(walletAddress, sdkError);
      
      setError(sdkError);
      setApp(null);
      setQrData(null);
      setSessionId(null);
      setSessionStartTime(null);
      setIsLoading(false);
    }
  }, [walletAddress, excludedCountries, minimumAge, regenerateCounter]);

  /**
   * Regenerate QR code
   * Requirements: 6.1, 6.2
   */
  const regenerateQR = useCallback(() => {
    setRegenerateCounter(prev => prev + 1);
  }, []);

  // Initialize on mount and when dependencies change
  useEffect(() => {
    if (walletAddress) {
      initializeSelfProtocol();
    }
  }, [initializeSelfProtocol, walletAddress]);

  return {
    app,
    qrData,
    sessionId,
    sessionStartTime,
    isLoading,
    error,
    regenerateQR,
  };
}

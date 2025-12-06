'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SESSION_CONFIG } from '../self-config';
import { logger } from '../logger';

/**
 * Verification status types
 */
export type VerificationStatus = 'pending' | 'verified' | 'failed' | 'expired';

/**
 * Configuration for useVerificationStatus hook
 */
export interface UseVerificationStatusConfig {
  walletAddress: string;
  sessionId: string;
  enabled: boolean;
  pollingInterval?: number;
  timeout?: number;
  sessionStartTime?: number; // Timestamp when session was created
  onSessionExpired?: () => void; // Callback when session expires
}

/**
 * Verification status response from API
 */
export interface VerificationStatusData {
  status: VerificationStatus;
  timestamp?: string;
  transactionHash?: string;
  failureReason?: string;
}

/**
 * Return type for useVerificationStatus hook
 */
export interface UseVerificationStatusReturn {
  status: VerificationStatusData | null;
  isPolling: boolean;
  error: Error | null;
}

/**
 * Terminal states that should stop polling
 */
const TERMINAL_STATES: VerificationStatus[] = ['verified', 'failed', 'expired'];

/**
 * Exponential backoff configuration
 */
const BACKOFF_CONFIG = {
  initialDelay: 1000,      // 1 second
  maxDelay: 10000,         // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Custom hook to poll verification status from backend API
 * 
 * This hook:
 * - Polls backend API for verification status at configured intervals
 * - Implements exponential backoff for failed requests
 * - Detects terminal states (verified, failed, expired) and stops polling
 * - Cleans up polling on component unmount
 * - Handles timeout to stop polling after configured duration
 * 
 * Requirements: 4.1, 4.2, 4.5, 4.6, 6.3
 * 
 * @param config - Configuration object containing wallet address, session ID, and polling settings
 * @returns Object containing current status, polling state, and error state
 */
export function useVerificationStatus(
  config: UseVerificationStatusConfig
): UseVerificationStatusReturn {
  const {
    walletAddress,
    sessionId,
    enabled,
    pollingInterval = SESSION_CONFIG.pollingIntervalMs,
    timeout = SESSION_CONFIG.pollingTimeoutMs,
    sessionStartTime,
    onSessionExpired,
  } = config;

  const [status, setStatus] = useState<VerificationStatusData | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs to track polling state
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const failureCountRef = useRef<number>(0);
  const currentDelayRef = useRef<number>(pollingInterval);
  const expirationCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasExpiredRef = useRef<boolean>(false);

  /**
   * Check if the current status is a terminal state
   * Requirements: 4.1, 4.2, 4.5
   */
  const isTerminalState = useCallback((statusValue: VerificationStatus): boolean => {
    return TERMINAL_STATES.includes(statusValue);
  }, []);

  /**
   * Check if session has expired based on session start time
   * Requirements: 6.2, 9.4
   */
  const checkSessionExpiration = useCallback((): boolean => {
    if (!sessionStartTime) {
      return false;
    }

    const now = Date.now();
    const sessionAgeMs = now - sessionStartTime;
    const expirationMs = SESSION_CONFIG.expirationMinutes * 60 * 1000;

    return sessionAgeMs >= expirationMs;
  }, [sessionStartTime]);

  /**
   * Calculate exponential backoff delay
   * Requirements: 6.3
   */
  const calculateBackoffDelay = useCallback((failureCount: number): number => {
    const delay = Math.min(
      BACKOFF_CONFIG.initialDelay * Math.pow(BACKOFF_CONFIG.backoffMultiplier, failureCount),
      BACKOFF_CONFIG.maxDelay
    );
    return delay;
  }, []);

  /**
   * Fetch verification status from backend API
   * Requirements: 4.1, 6.2, 9.4
   */
  const fetchStatus = useCallback(async (): Promise<void> => {
    // Check if session has expired before fetching
    // Requirements: 6.2, 9.4
    if (checkSessionExpiration() && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      
      // Log session expiration
      // Requirement 6.4: Log verification failure events with reasons
      logger.sessionExpired(walletAddress, sessionId);
      
      // Mark session as expired
      const expiredStatus: VerificationStatusData = {
        status: 'expired',
        timestamp: new Date().toISOString(),
        failureReason: 'Verification session expired',
      };
      
      setStatus(expiredStatus);
      stopPolling();
      
      // Call expiration callback to trigger QR regeneration
      if (onSessionExpired) {
        onSessionExpired();
      }
      
      // Update database to mark session as expired
      try {
        await fetch('/api/kyc/expire-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress,
            sessionId,
          }),
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        logger.error('Failed to mark session as expired in database', error, {
          walletAddress,
          sessionId,
        });
      }
      
      return;
    }

    try {
      const response = await fetch(
        `/api/kyc/status?walletAddress=${encodeURIComponent(walletAddress)}&sessionId=${encodeURIComponent(sessionId)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Map API response to VerificationStatusData
      const statusData: VerificationStatusData = {
        status: data.status as VerificationStatus,
        timestamp: data.timestamp,
        transactionHash: data.transactionHash,
        failureReason: data.failureReason,
      };

      setStatus(statusData);
      setError(null);
      
      // Log status polling
      logger.statusPolling(walletAddress, sessionId, statusData.status);
      
      // Reset failure count on successful request
      failureCountRef.current = 0;
      currentDelayRef.current = pollingInterval;

      // Stop polling if terminal state reached
      // Requirements: 4.1, 4.2, 4.5
      if (isTerminalState(statusData.status)) {
        stopPolling();
      }
    } catch (err) {
      // Requirement 6.3: Implement exponential backoff for failed requests
      failureCountRef.current += 1;
      const backoffDelay = calculateBackoffDelay(failureCountRef.current);
      currentDelayRef.current = backoffDelay;

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch verification status';
      const fetchError = new Error(errorMessage);
      
      // Log status fetch error
      // Requirement 6.4: Add error tracking for Self Protocol API failures
      logger.error('Verification status fetch error', fetchError, {
        walletAddress,
        sessionId,
        failureCount: failureCountRef.current,
        backoffDelay,
      });
      
      setError(fetchError);
      
      // Don't stop polling on error, let it retry with backoff
    }
  }, [walletAddress, sessionId, pollingInterval, isTerminalState, calculateBackoffDelay, checkSessionExpiration, onSessionExpired]);

  /**
   * Stop polling and clean up timers
   * Requirements: 4.6, 6.2
   */
  const stopPolling = useCallback((): void => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (expirationCheckIntervalRef.current) {
      clearInterval(expirationCheckIntervalRef.current);
      expirationCheckIntervalRef.current = null;
    }
    
    setIsPolling(false);
  }, []);

  /**
   * Start polling for verification status
   * Requirements: 4.1, 4.2, 4.5, 4.6, 6.2, 9.4
   */
  const startPolling = useCallback((): void => {
    // Don't start if already polling or not enabled
    if (pollingIntervalRef.current || !enabled) {
      return;
    }

    setIsPolling(true);
    startTimeRef.current = Date.now();
    hasExpiredRef.current = false;

    // Fetch immediately on start
    fetchStatus();

    // Set up polling interval
    // Requirements: 4.1, 4.2
    pollingIntervalRef.current = setInterval(() => {
      fetchStatus();
    }, currentDelayRef.current);

    // Set up periodic expiration check (every 10 seconds)
    // Requirements: 6.2, 9.4
    if (sessionStartTime) {
      expirationCheckIntervalRef.current = setInterval(() => {
        if (checkSessionExpiration() && !hasExpiredRef.current) {
          fetchStatus(); // This will handle the expiration
        }
      }, 10000); // Check every 10 seconds
    }

    // Set up timeout to stop polling
    // Requirements: 4.5, 4.6
    timeoutRef.current = setTimeout(() => {
      logger.warn('Verification status polling timeout reached', {
        walletAddress,
        sessionId,
        timeout,
      });
      stopPolling();
      
      // Set status to expired if timeout reached without terminal state
      if (status && !isTerminalState(status.status)) {
        setStatus({
          ...status,
          status: 'expired',
        });
      }
    }, timeout);
  }, [enabled, fetchStatus, stopPolling, timeout, status, isTerminalState, sessionStartTime, checkSessionExpiration]);

  /**
   * Effect to manage polling lifecycle
   * Requirements: 4.1, 4.2, 4.5, 4.6
   */
  useEffect(() => {
    if (enabled && walletAddress && sessionId) {
      startPolling();
    } else {
      stopPolling();
    }

    // Cleanup on unmount
    // Requirement 4.6: Clean up polling on component unmount
    return () => {
      stopPolling();
    };
  }, [enabled, walletAddress, sessionId, startPolling, stopPolling]);

  /**
   * Effect to update polling interval when backoff changes
   * Requirements: 6.3
   */
  useEffect(() => {
    if (pollingIntervalRef.current && currentDelayRef.current !== pollingInterval) {
      // Clear existing interval and restart with new delay
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = setInterval(() => {
        fetchStatus();
      }, currentDelayRef.current);
    }
  }, [currentDelayRef.current, pollingInterval, fetchStatus]);

  return {
    status,
    isPolling,
    error,
  };
}

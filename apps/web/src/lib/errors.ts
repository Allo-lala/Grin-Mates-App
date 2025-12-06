/**
 * Error handling utilities for Self Protocol KYC integration
 * Implements error codes, user-facing messages, and retry logic with exponential backoff
 */

/**
 * Error codes for Self Protocol integration
 */
export enum ErrorCode {
  CONFIG_MISSING = 'CONFIG_MISSING',
  CONFIG_INVALID = 'CONFIG_INVALID',
  QR_GENERATION_FAILED = 'QR_GENERATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  AGE_REQUIREMENT_NOT_MET = 'AGE_REQUIREMENT_NOT_MET',
  COUNTRY_EXCLUDED = 'COUNTRY_EXCLUDED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  BLOCKCHAIN_QUERY_FAILED = 'BLOCKCHAIN_QUERY_FAILED',
}

/**
 * Custom error class for Self Protocol operations
 */
export class SelfProtocolError extends Error {
  public readonly code: ErrorCode;
  public readonly recoverable: boolean;

  constructor(message: string, code: ErrorCode, recoverable: boolean = false) {
    super(message);
    this.name = 'SelfProtocolError';
    this.code = code;
    this.recoverable = recoverable;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SelfProtocolError);
    }
  }
}

/**
 * User-facing error messages for each error code
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.CONFIG_MISSING]: 
    'Configuration error. Please contact support.',
  [ErrorCode.CONFIG_INVALID]: 
    'Invalid configuration. Please contact support.',
  [ErrorCode.QR_GENERATION_FAILED]: 
    'Failed to generate QR code. Please try again.',
  [ErrorCode.NETWORK_ERROR]: 
    'Network connection lost. Retrying...',
  [ErrorCode.SESSION_EXPIRED]: 
    'Verification session expired. Generating new QR code...',
  [ErrorCode.VERIFICATION_FAILED]: 
    'Verification failed. Please try again or contact support.',
  [ErrorCode.AGE_REQUIREMENT_NOT_MET]: 
    'You must be at least 18 years old to use this service.',
  [ErrorCode.COUNTRY_EXCLUDED]: 
    'Service is not available in your country.',
  [ErrorCode.DATABASE_ERROR]: 
    'System error. Please try again later.',
  [ErrorCode.BLOCKCHAIN_QUERY_FAILED]: 
    'Unable to verify status. Retrying...',
};

/**
 * Error recovery strategies for each error code
 */
export type ErrorRecoveryAction = 
  | 'display_config_error'
  | 'retry_with_backoff'
  | 'regenerate_qr'
  | 'display_failure_reason'
  | 'display_rejection'
  | 'retry_once_then_fail';

export const ERROR_RECOVERY_STRATEGIES: Record<ErrorCode, ErrorRecoveryAction> = {
  [ErrorCode.CONFIG_MISSING]: 'display_config_error',
  [ErrorCode.CONFIG_INVALID]: 'display_config_error',
  [ErrorCode.QR_GENERATION_FAILED]: 'retry_with_backoff',
  [ErrorCode.NETWORK_ERROR]: 'retry_with_backoff',
  [ErrorCode.SESSION_EXPIRED]: 'regenerate_qr',
  [ErrorCode.VERIFICATION_FAILED]: 'display_failure_reason',
  [ErrorCode.AGE_REQUIREMENT_NOT_MET]: 'display_rejection',
  [ErrorCode.COUNTRY_EXCLUDED]: 'display_rejection',
  [ErrorCode.DATABASE_ERROR]: 'retry_once_then_fail',
  [ErrorCode.BLOCKCHAIN_QUERY_FAILED]: 'retry_with_backoff',
};

/**
 * Configuration for retry logic with exponential backoff
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,      // 1 second
  maxDelay: 10000,         // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Retry an async operation with exponential backoff
 * 
 * @param operation - The async operation to retry
 * @param config - Retry configuration (optional, uses defaults if not provided)
 * @returns Promise that resolves with the operation result or rejects after max attempts
 * 
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   async () => await fetchVerificationStatus(walletAddress),
 *   { maxAttempts: 5, initialDelay: 2000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  let lastError: Error | undefined;
  let delay = finalConfig.initialDelay;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this was the last attempt, throw the error
      if (attempt === finalConfig.maxAttempts) {
        throw lastError;
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next attempt, capped at maxDelay
      delay = Math.min(delay * finalConfig.backoffMultiplier, finalConfig.maxDelay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry failed with unknown error');
}

/**
 * Get user-facing error message for an error code
 * 
 * @param code - The error code
 * @returns User-friendly error message
 */
export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code];
}

/**
 * Get recovery strategy for an error code
 * 
 * @param code - The error code
 * @returns The recovery action to take
 */
export function getRecoveryStrategy(code: ErrorCode): ErrorRecoveryAction {
  return ERROR_RECOVERY_STRATEGIES[code];
}

/**
 * Check if an error is recoverable
 * 
 * @param error - The error to check
 * @returns True if the error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof SelfProtocolError) {
    return error.recoverable;
  }
  return false;
}

/**
 * Create a SelfProtocolError from an unknown error
 * 
 * @param error - The error to convert
 * @param defaultCode - Default error code if error type cannot be determined
 * @returns SelfProtocolError instance
 */
export function toSelfProtocolError(
  error: unknown,
  defaultCode: ErrorCode = ErrorCode.VERIFICATION_FAILED
): SelfProtocolError {
  if (error instanceof SelfProtocolError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();
  
  // Try to infer error code from message
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return new SelfProtocolError(message, ErrorCode.NETWORK_ERROR, true);
  }
  
  if (message.includes('config') || message.includes('environment')) {
    return new SelfProtocolError(message, ErrorCode.CONFIG_INVALID, false);
  }
  
  if (message.includes('expired') || message.includes('timeout')) {
    return new SelfProtocolError(message, ErrorCode.SESSION_EXPIRED, true);
  }

  return new SelfProtocolError(message, defaultCode, false);
}

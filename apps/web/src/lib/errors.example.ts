/**
 * Example usage of error handling utilities
 * This file demonstrates how to use the Self Protocol error handling system
 */

import {
  ErrorCode,
  SelfProtocolError,
  retryWithBackoff,
  getErrorMessage,
  getRecoveryStrategy,
  isRecoverableError,
  toSelfProtocolError,
} from './errors';

// Example 1: Creating a custom error
function generateQRCode(walletAddress: string): string {
  if (!walletAddress) {
    throw new SelfProtocolError(
      'Wallet address is required',
      ErrorCode.CONFIG_INVALID,
      false
    );
  }
  
  // QR generation logic...
  return 'qr-code-data';
}

// Example 2: Using retry with backoff for network operations
async function fetchVerificationStatus(sessionId: string): Promise<any> {
  return retryWithBackoff(
    async () => {
      const response = await fetch(`/api/kyc/status?sessionId=${sessionId}`);
      if (!response.ok) {
        throw new Error('Network request failed');
      }
      return response.json();
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 5000,
      backoffMultiplier: 2,
    }
  );
}

// Example 3: Error handling with recovery strategies
async function handleVerificationError(error: unknown): Promise<void> {
  const selfError = toSelfProtocolError(error);
  const message = getErrorMessage(selfError.code);
  const strategy = getRecoveryStrategy(selfError.code);
  
  console.error(`Error: ${message}`);
  console.log(`Recovery strategy: ${strategy}`);
  
  switch (strategy) {
    case 'retry_with_backoff':
      if (isRecoverableError(selfError)) {
        console.log('Retrying operation...');
        // Retry logic here
      }
      break;
      
    case 'regenerate_qr':
      console.log('Regenerating QR code...');
      // QR regeneration logic here
      break;
      
    case 'display_config_error':
      console.error('Configuration error - contact support');
      break;
      
    case 'display_rejection':
      console.error('Verification rejected');
      break;
      
    default:
      console.error('Unknown error occurred');
  }
}

// Example 4: Wrapping operations with error handling
async function safeVerificationOperation<T>(
  operation: () => Promise<T>,
  errorCode: ErrorCode = ErrorCode.VERIFICATION_FAILED
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw toSelfProtocolError(error, errorCode);
  }
}

// Example 5: Using in React components
export function useVerificationWithErrorHandling() {
  const handleError = (error: unknown) => {
    const selfError = toSelfProtocolError(error);
    
    // Show user-friendly message
    const message = getErrorMessage(selfError.code);
    console.error(message);
    
    // Determine if we should retry
    if (isRecoverableError(selfError)) {
      // Trigger retry logic
      return true;
    }
    
    return false;
  };
  
  return { handleError };
}

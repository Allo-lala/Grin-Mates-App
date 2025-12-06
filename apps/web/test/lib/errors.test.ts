import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ErrorCode,
  SelfProtocolError,
  ERROR_MESSAGES,
  ERROR_RECOVERY_STRATEGIES,
  DEFAULT_RETRY_CONFIG,
  retryWithBackoff,
  getErrorMessage,
  getRecoveryStrategy,
  isRecoverableError,
  toSelfProtocolError,
  type RetryConfig,
} from '../../src/lib/errors';

describe('SelfProtocolError', () => {
  it('should create error with correct properties', () => {
    const error = new SelfProtocolError(
      'Test error',
      ErrorCode.QR_GENERATION_FAILED,
      true
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SelfProtocolError);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(ErrorCode.QR_GENERATION_FAILED);
    expect(error.recoverable).toBe(true);
    expect(error.name).toBe('SelfProtocolError');
  });

  it('should default recoverable to false', () => {
    const error = new SelfProtocolError(
      'Test error',
      ErrorCode.CONFIG_MISSING
    );

    expect(error.recoverable).toBe(false);
  });

  it('should maintain stack trace', () => {
    const error = new SelfProtocolError(
      'Test error',
      ErrorCode.NETWORK_ERROR
    );

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('SelfProtocolError');
  });
});

describe('ERROR_MESSAGES', () => {
  it('should have messages for all error codes', () => {
    const errorCodes = Object.values(ErrorCode);
    
    errorCodes.forEach(code => {
      expect(ERROR_MESSAGES[code]).toBeDefined();
      expect(typeof ERROR_MESSAGES[code]).toBe('string');
      expect(ERROR_MESSAGES[code].length).toBeGreaterThan(0);
    });
  });

  it('should have user-friendly messages', () => {
    expect(ERROR_MESSAGES[ErrorCode.CONFIG_MISSING]).toContain('Configuration error');
    expect(ERROR_MESSAGES[ErrorCode.NETWORK_ERROR]).toContain('Network');
    expect(ERROR_MESSAGES[ErrorCode.AGE_REQUIREMENT_NOT_MET]).toContain('18 years old');
  });
});

describe('ERROR_RECOVERY_STRATEGIES', () => {
  it('should have recovery strategies for all error codes', () => {
    const errorCodes = Object.values(ErrorCode);
    
    errorCodes.forEach(code => {
      expect(ERROR_RECOVERY_STRATEGIES[code]).toBeDefined();
      expect(typeof ERROR_RECOVERY_STRATEGIES[code]).toBe('string');
    });
  });

  it('should map config errors to display_config_error', () => {
    expect(ERROR_RECOVERY_STRATEGIES[ErrorCode.CONFIG_MISSING]).toBe('display_config_error');
    expect(ERROR_RECOVERY_STRATEGIES[ErrorCode.CONFIG_INVALID]).toBe('display_config_error');
  });

  it('should map network errors to retry_with_backoff', () => {
    expect(ERROR_RECOVERY_STRATEGIES[ErrorCode.NETWORK_ERROR]).toBe('retry_with_backoff');
    expect(ERROR_RECOVERY_STRATEGIES[ErrorCode.QR_GENERATION_FAILED]).toBe('retry_with_backoff');
  });

  it('should map session expiration to regenerate_qr', () => {
    expect(ERROR_RECOVERY_STRATEGIES[ErrorCode.SESSION_EXPIRED]).toBe('regenerate_qr');
  });
});

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should succeed on first attempt if operation succeeds', async () => {
    const operation = vi.fn().mockResolvedValue('success');

    const promise = retryWithBackoff(operation);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Attempt 1 failed'))
      .mockResolvedValueOnce('success');

    const promise = retryWithBackoff(operation);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should throw error after max attempts', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Always fails'));

    const promise = retryWithBackoff(operation, { maxAttempts: 3 });
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('Always fails');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff delays', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Attempt 1'))
      .mockRejectedValueOnce(new Error('Attempt 2'))
      .mockResolvedValueOnce('success');

    const config: RetryConfig = {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
    };

    const promise = retryWithBackoff(operation, config);
    
    // Fast-forward through all timers
    await vi.runAllTimersAsync();
    
    await promise;

    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should cap delay at maxDelay', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Attempt 1'))
      .mockRejectedValueOnce(new Error('Attempt 2'))
      .mockResolvedValueOnce('success');

    const config: RetryConfig = {
      maxAttempts: 3,
      initialDelay: 5000,
      maxDelay: 6000,
      backoffMultiplier: 3,
    };

    const promise = retryWithBackoff(operation, config);
    await vi.runAllTimersAsync();
    await promise;

    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should use default config when not provided', async () => {
    const operation = vi.fn().mockResolvedValue('success');

    const promise = retryWithBackoff(operation);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
  });

  it('should handle non-Error rejections', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce('string error')
      .mockResolvedValueOnce('success');

    const promise = retryWithBackoff(operation);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
  });
});

describe('getErrorMessage', () => {
  it('should return correct message for error code', () => {
    const message = getErrorMessage(ErrorCode.NETWORK_ERROR);
    expect(message).toBe(ERROR_MESSAGES[ErrorCode.NETWORK_ERROR]);
  });

  it('should return messages for all error codes', () => {
    Object.values(ErrorCode).forEach(code => {
      const message = getErrorMessage(code);
      expect(message).toBeDefined();
      expect(typeof message).toBe('string');
    });
  });
});

describe('getRecoveryStrategy', () => {
  it('should return correct strategy for error code', () => {
    const strategy = getRecoveryStrategy(ErrorCode.NETWORK_ERROR);
    expect(strategy).toBe('retry_with_backoff');
  });

  it('should return strategies for all error codes', () => {
    Object.values(ErrorCode).forEach(code => {
      const strategy = getRecoveryStrategy(code);
      expect(strategy).toBeDefined();
      expect(typeof strategy).toBe('string');
    });
  });
});

describe('isRecoverableError', () => {
  it('should return true for recoverable SelfProtocolError', () => {
    const error = new SelfProtocolError(
      'Test',
      ErrorCode.NETWORK_ERROR,
      true
    );
    expect(isRecoverableError(error)).toBe(true);
  });

  it('should return false for non-recoverable SelfProtocolError', () => {
    const error = new SelfProtocolError(
      'Test',
      ErrorCode.CONFIG_MISSING,
      false
    );
    expect(isRecoverableError(error)).toBe(false);
  });

  it('should return false for non-SelfProtocolError', () => {
    const error = new Error('Regular error');
    expect(isRecoverableError(error)).toBe(false);
  });

  it('should return false for non-error values', () => {
    expect(isRecoverableError('string')).toBe(false);
    expect(isRecoverableError(null)).toBe(false);
    expect(isRecoverableError(undefined)).toBe(false);
    expect(isRecoverableError(123)).toBe(false);
  });
});

describe('toSelfProtocolError', () => {
  it('should return same error if already SelfProtocolError', () => {
    const original = new SelfProtocolError(
      'Test',
      ErrorCode.NETWORK_ERROR,
      true
    );
    const converted = toSelfProtocolError(original);

    expect(converted).toBe(original);
  });

  it('should infer NETWORK_ERROR from message', () => {
    const error = new Error('Network connection failed');
    const converted = toSelfProtocolError(error);

    expect(converted).toBeInstanceOf(SelfProtocolError);
    expect(converted.code).toBe(ErrorCode.NETWORK_ERROR);
    expect(converted.recoverable).toBe(true);
  });

  it('should infer CONFIG_INVALID from message', () => {
    const error = new Error('Invalid configuration provided');
    const converted = toSelfProtocolError(error);

    expect(converted).toBeInstanceOf(SelfProtocolError);
    expect(converted.code).toBe(ErrorCode.CONFIG_INVALID);
    expect(converted.recoverable).toBe(false);
  });

  it('should infer SESSION_EXPIRED from message', () => {
    const error = new Error('Session has expired');
    const converted = toSelfProtocolError(error);

    expect(converted).toBeInstanceOf(SelfProtocolError);
    expect(converted.code).toBe(ErrorCode.SESSION_EXPIRED);
    expect(converted.recoverable).toBe(true);
  });

  it('should use default code for unknown errors', () => {
    const error = new Error('Unknown error');
    const converted = toSelfProtocolError(error);

    expect(converted).toBeInstanceOf(SelfProtocolError);
    expect(converted.code).toBe(ErrorCode.VERIFICATION_FAILED);
    expect(converted.recoverable).toBe(false);
  });

  it('should use custom default code', () => {
    const error = new Error('Unknown error');
    const converted = toSelfProtocolError(error, ErrorCode.DATABASE_ERROR);

    expect(converted).toBeInstanceOf(SelfProtocolError);
    expect(converted.code).toBe(ErrorCode.DATABASE_ERROR);
  });

  it('should handle non-Error values', () => {
    const converted = toSelfProtocolError('string error');

    expect(converted).toBeInstanceOf(SelfProtocolError);
    expect(converted.message).toBe('string error');
  });
});

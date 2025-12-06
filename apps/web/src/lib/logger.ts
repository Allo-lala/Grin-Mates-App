/**
 * Structured Logging Utility
 * 
 * Provides structured logging for Self Protocol KYC integration with:
 * - Consistent log format across the application
 * - Log levels (info, warn, error)
 * - Contextual metadata for debugging
 * - Environment-aware logging (verbose in dev, minimal in prod)
 * 
 * Requirements: 6.4 - Error tracking and monitoring
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * Logger class for structured logging
 */
class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Format log entry as structured JSON
   */
  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        code: (error as any).code,
      };
    }

    return entry;
  }

  /**
   * Output log entry to console
   */
  private output(entry: LogEntry): void {
    const logString = this.isDevelopment
      ? JSON.stringify(entry, null, 2)
      : JSON.stringify(entry);

    switch (entry.level) {
      case 'error':
        console.error(logString);
        break;
      case 'warn':
        console.warn(logString);
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(logString);
        }
        break;
      default:
        console.log(logString);
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    const entry = this.formatLogEntry('info', message, context);
    this.output(entry);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.formatLogEntry('warn', message, context);
    this.output(entry);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.formatLogEntry('error', message, context, error);
    this.output(entry);
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const entry = this.formatLogEntry('debug', message, context);
      this.output(entry);
    }
  }

  /**
   * Log QR code generation event
   * Requirement 6.4: Log QR code generation events
   */
  qrGenerated(walletAddress: string, sessionId: string): void {
    this.info('QR code generated', {
      event: 'qr_generated',
      walletAddress,
      sessionId,
    });
  }

  /**
   * Log QR code generation failure
   * Requirement 6.4: Log QR code generation events
   */
  qrGenerationFailed(walletAddress: string, error: Error): void {
    this.error('QR code generation failed', error, {
      event: 'qr_generation_failed',
      walletAddress,
    });
  }

  /**
   * Log verification attempt
   * Requirement 6.4: Log verification attempts
   */
  verificationAttempt(walletAddress: string, sessionId: string): void {
    this.info('Verification attempt started', {
      event: 'verification_attempt',
      walletAddress,
      sessionId,
    });
  }

  /**
   * Log verification completion
   * Requirement 6.4: Log verification completion events
   */
  verificationCompleted(
    walletAddress: string,
    sessionId: string,
    transactionHash?: string
  ): void {
    this.info('Verification completed successfully', {
      event: 'verification_completed',
      walletAddress,
      sessionId,
      transactionHash,
    });
  }

  /**
   * Log verification failure
   * Requirement 6.4: Log verification failure events with reasons
   */
  verificationFailed(
    walletAddress: string,
    sessionId: string,
    reason: string,
    error?: Error
  ): void {
    this.error('Verification failed', error, {
      event: 'verification_failed',
      walletAddress,
      sessionId,
      failureReason: reason,
    });
  }

  /**
   * Log Self Protocol API failure
   * Requirement 6.4: Add error tracking for Self Protocol API failures
   */
  selfProtocolApiError(
    operation: string,
    error: Error,
    context?: LogContext
  ): void {
    this.error('Self Protocol API error', error, {
      event: 'self_protocol_api_error',
      operation,
      ...context,
    });
  }

  /**
   * Log session expiration
   * Requirement 6.4: Log verification failure events with reasons
   */
  sessionExpired(walletAddress: string, sessionId: string): void {
    this.warn('Verification session expired', {
      event: 'session_expired',
      walletAddress,
      sessionId,
    });
  }

  /**
   * Log status polling event
   */
  statusPolling(walletAddress: string, sessionId: string, status: string): void {
    this.debug('Status polling', {
      event: 'status_polling',
      walletAddress,
      sessionId,
      status,
    });
  }

  /**
   * Log blockchain verification
   */
  blockchainVerification(
    transactionHash: string,
    walletAddress: string,
    verified: boolean
  ): void {
    this.info('Blockchain verification', {
      event: 'blockchain_verification',
      transactionHash,
      walletAddress,
      verified,
    });
  }

  /**
   * Log database operation
   */
  databaseOperation(
    operation: string,
    success: boolean,
    context?: LogContext
  ): void {
    if (success) {
      this.debug(`Database operation: ${operation}`, {
        event: 'database_operation',
        operation,
        success,
        ...context,
      });
    } else {
      this.error(`Database operation failed: ${operation}`, undefined, {
        event: 'database_operation',
        operation,
        success,
        ...context,
      });
    }
  }

  /**
   * Log rate limit event
   */
  rateLimitExceeded(clientId: string, endpoint: string): void {
    this.warn('Rate limit exceeded', {
      event: 'rate_limit_exceeded',
      clientId,
      endpoint,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

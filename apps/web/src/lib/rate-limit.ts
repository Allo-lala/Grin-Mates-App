/**
 * Rate Limiting Middleware
 * 
 * Implements a simple in-memory rate limiter using a sliding window algorithm.
 * Tracks requests by IP address and enforces configurable rate limits.
 * 
 * Security considerations from design document
 */

interface RateLimitConfig {
  /**
   * Maximum number of requests allowed within the window
   */
  maxRequests: number;
  
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  
  /**
   * Optional message to return when rate limit is exceeded
   */
  message?: string;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

/**
 * In-memory store for rate limit tracking
 * Key: IP address, Value: Request record
 */
const rateLimitStore = new Map<string, RequestRecord>();

/**
 * Clean up expired entries periodically to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Creates a rate limiter with the specified configuration
 * 
 * @param config - Rate limit configuration
 * @returns Rate limit check function
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    maxRequests,
    windowMs,
    message = 'Too many requests, please try again later.',
  } = config;

  /**
   * Checks if a request should be rate limited
   * 
   * @param identifier - Unique identifier for the client (typically IP address)
   * @returns Object indicating if request is allowed and remaining requests
   */
  return function checkRateLimit(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    message?: string;
  } {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    // No existing record or window has expired - allow request
    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs;
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime,
      });

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime,
      };
    }

    // Window is still active - check if limit exceeded
    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        message,
      };
    }

    // Increment count and allow request
    record.count += 1;
    rateLimitStore.set(identifier, record);

    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime,
    };
  };
}

/**
 * Extracts client identifier from request
 * Uses IP address from various headers (considering proxies)
 * 
 * @param request - Next.js request object
 * @returns Client identifier (IP address or fallback)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from common proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier if IP cannot be determined
  // In production, this should be improved based on deployment environment
  return 'unknown';
}

/**
 * Default rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  /**
   * Rate limit for verification endpoint
   * 10 requests per minute per IP
   */
  VERIFY: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many verification requests. Please try again in a minute.',
  },
  
  /**
   * Rate limit for status endpoint
   * 20 requests per minute per IP (higher since it's read-only)
   */
  STATUS: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many status requests. Please try again in a minute.',
  },
} as const;

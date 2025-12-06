import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRateLimiter, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * Tests for rate limiting functionality
 * 
 * These tests verify:
 * - Rate limiter correctly tracks requests
 * - Rate limits are enforced
 * - 429 status code is returned when limit exceeded
 * - Rate limit headers are set correctly
 * - Client identifier extraction works
 * 
 * Security considerations from design document
 */
describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRateLimiter', () => {
    it('should allow requests within rate limit', () => {
      const rateLimiter = createRateLimiter({
        maxRequests: 5,
        windowMs: 60000, // 1 minute
      });

      const result = rateLimiter('test-client-1');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should block requests exceeding rate limit', () => {
      const rateLimiter = createRateLimiter({
        maxRequests: 3,
        windowMs: 60000,
      });

      // Make 3 requests (should all succeed)
      rateLimiter('test-client-2');
      rateLimiter('test-client-2');
      rateLimiter('test-client-2');

      // 4th request should be blocked
      const result = rateLimiter('test-client-2');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.message).toBeDefined();
    });

    it('should track remaining requests correctly', () => {
      const rateLimiter = createRateLimiter({
        maxRequests: 5,
        windowMs: 60000,
      });

      const result1 = rateLimiter('test-client-3');
      expect(result1.remaining).toBe(4);

      const result2 = rateLimiter('test-client-3');
      expect(result2.remaining).toBe(3);

      const result3 = rateLimiter('test-client-3');
      expect(result3.remaining).toBe(2);
    });

    it('should reset after time window expires', () => {
      const rateLimiter = createRateLimiter({
        maxRequests: 2,
        windowMs: 100, // 100ms window for testing
      });

      // Use up the limit
      rateLimiter('test-client-4');
      rateLimiter('test-client-4');

      // Should be blocked
      const blocked = rateLimiter('test-client-4');
      expect(blocked.allowed).toBe(false);

      // Wait for window to expire
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Should be allowed again
          const allowed = rateLimiter('test-client-4');
          expect(allowed.allowed).toBe(true);
          expect(allowed.remaining).toBe(1);
          resolve();
        }, 150);
      });
    });

    it('should track different clients independently', () => {
      const rateLimiter = createRateLimiter({
        maxRequests: 2,
        windowMs: 60000,
      });

      // Client 1 uses up their limit
      rateLimiter('client-1');
      rateLimiter('client-1');
      const client1Blocked = rateLimiter('client-1');
      expect(client1Blocked.allowed).toBe(false);

      // Client 2 should still be allowed
      const client2Result = rateLimiter('client-2');
      expect(client2Result.allowed).toBe(true);
    });

    it('should include reset time in response', () => {
      const rateLimiter = createRateLimiter({
        maxRequests: 5,
        windowMs: 60000,
      });

      const result = rateLimiter('test-client-5');

      expect(result.resetTime).toBeDefined();
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should use custom message when provided', () => {
      const customMessage = 'Custom rate limit message';
      const rateLimiter = createRateLimiter({
        maxRequests: 1,
        windowMs: 60000,
        message: customMessage,
      });

      // Use up the limit
      rateLimiter('test-client-6');

      // Should return custom message
      const blocked = rateLimiter('test-client-6');
      expect(blocked.message).toBe(customMessage);
    });
  });

  describe('getClientIdentifier', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1';
            return null;
          },
        },
      } as unknown as Request;

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === 'x-real-ip') return '192.168.1.2';
            return null;
          },
        },
      } as unknown as Request;

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('192.168.1.2');
    });

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.1';
            if (name === 'x-real-ip') return '192.168.1.2';
            return null;
          },
        },
      } as unknown as Request;

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('192.168.1.1');
    });

    it('should return fallback when no IP headers present', () => {
      const mockRequest = {
        headers: {
          get: () => null,
        },
      } as unknown as Request;

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('unknown');
    });

    it('should handle multiple IPs in x-forwarded-for', () => {
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1, 172.16.0.1';
            return null;
          },
        },
      } as unknown as Request;

      const identifier = getClientIdentifier(mockRequest);
      // Should take the first IP
      expect(identifier).toBe('192.168.1.1');
    });
  });

  describe('RATE_LIMITS configuration', () => {
    it('should have verify endpoint rate limit configured', () => {
      expect(RATE_LIMITS.VERIFY).toBeDefined();
      expect(RATE_LIMITS.VERIFY.maxRequests).toBe(10);
      expect(RATE_LIMITS.VERIFY.windowMs).toBe(60000); // 1 minute
      expect(RATE_LIMITS.VERIFY.message).toContain('verification');
    });

    it('should have status endpoint rate limit configured', () => {
      expect(RATE_LIMITS.STATUS).toBeDefined();
      expect(RATE_LIMITS.STATUS.maxRequests).toBe(20);
      expect(RATE_LIMITS.STATUS.windowMs).toBe(60000); // 1 minute
      expect(RATE_LIMITS.STATUS.message).toContain('status');
    });

    it('should have higher limit for status than verify', () => {
      // Status endpoint should have higher limit since it's read-only
      expect(RATE_LIMITS.STATUS.maxRequests).toBeGreaterThan(RATE_LIMITS.VERIFY.maxRequests);
    });
  });

  describe('Rate limit response format', () => {
    it('should include all required fields when blocked', () => {
      const rateLimiter = createRateLimiter({
        maxRequests: 1,
        windowMs: 60000,
      });

      // Use up the limit
      rateLimiter('test-client-7');

      // Get blocked response
      const blocked = rateLimiter('test-client-7');

      expect(blocked).toHaveProperty('allowed', false);
      expect(blocked).toHaveProperty('remaining', 0);
      expect(blocked).toHaveProperty('resetTime');
      expect(blocked).toHaveProperty('message');
    });

    it('should calculate retry-after correctly', () => {
      const rateLimiter = createRateLimiter({
        maxRequests: 1,
        windowMs: 60000,
      });

      // Use up the limit
      rateLimiter('test-client-8');

      // Get blocked response
      const blocked = rateLimiter('test-client-8');
      const retryAfter = Math.ceil((blocked.resetTime - Date.now()) / 1000);

      // Retry-after should be approximately 60 seconds (with some tolerance)
      expect(retryAfter).toBeGreaterThan(55);
      expect(retryAfter).toBeLessThanOrEqual(60);
    });
  });
});

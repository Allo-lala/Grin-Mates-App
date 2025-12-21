/**
 * Session management tests
 * Requirements: 6.5 - Session state clearing on logout
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { clearSessionState, hasValidSession, getSessionData } from '@/lib/session';

describe('Session Management', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('clearSessionState', () => {
    it('should clear all session-related localStorage items', () => {
      // Setup: Add session data
      localStorage.setItem('privy_session', JSON.stringify({ userId: '123' }));
      localStorage.setItem('other_data', 'test');

      // Execute
      clearSessionState();

      // Verify session items are cleared
      expect(localStorage.getItem('privy_session')).toBeNull();
      
      // Verify other items are not affected
      expect(localStorage.getItem('other_data')).toBe('test');
    });

    it('should not throw error if localStorage is empty', () => {
      expect(() => clearSessionState()).not.toThrow();
    });
  });

  describe('hasValidSession', () => {
    it('should return true when privy_session exists', () => {
      localStorage.setItem('privy_session', JSON.stringify({ userId: '123' }));
      expect(hasValidSession()).toBe(true);
    });

    it('should return false when privy_session does not exist', () => {
      expect(hasValidSession()).toBe(false);
    });
  });

  describe('getSessionData', () => {
    it('should return session data when it exists', () => {
      const sessionData = {
        userId: '123',
        walletAddress: '0xabc',
        email: 'test@example.com',
        hasEmbeddedWallet: false,
        lastActive: '2024-01-01T00:00:00Z',
      };
      localStorage.setItem('privy_session', JSON.stringify(sessionData));

      const result = getSessionData();
      expect(result).toEqual(sessionData);
    });

    it('should return null when session data does not exist', () => {
      expect(getSessionData()).toBeNull();
    });

    it('should return null when session data is invalid JSON', () => {
      localStorage.setItem('privy_session', 'invalid json');
      expect(getSessionData()).toBeNull();
    });
  });

  describe('Session persistence across page reloads', () => {
    it('should maintain session data after simulated reload', () => {
      // Setup: Create session data
      const sessionData = {
        userId: '123',
        walletAddress: '0xabc',
        email: null,
        hasEmbeddedWallet: false,
        lastActive: new Date().toISOString(),
      };
      localStorage.setItem('privy_session', JSON.stringify(sessionData));

      // Simulate page reload by getting data again
      const retrievedData = getSessionData();
      
      // Verify data persists
      expect(retrievedData).toEqual(sessionData);
      expect(hasValidSession()).toBe(true);
    });

    it('should not have session after logout', () => {
      // Setup: Create session
      localStorage.setItem('privy_session', JSON.stringify({ userId: '123' }));
      expect(hasValidSession()).toBe(true);

      // Execute logout
      clearSessionState();

      // Verify session is cleared
      expect(hasValidSession()).toBe(false);
      expect(getSessionData()).toBeNull();
    });
  });
});

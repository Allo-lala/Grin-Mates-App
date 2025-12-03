import { describe, it, expect } from 'vitest';
import { 
  setBreakpoint, 
  isMobileViewport, 
  isDesktopViewport,
  BREAKPOINTS 
} from './utils/responsive';
import {
  createMockPrivyUser,
  createMockEmailUser,
  createMockAuthenticatedPrivy,
  createMockUnauthenticatedPrivy
} from './utils/privy';

describe('Test Infrastructure Setup', () => {
  describe('Responsive Testing Utilities', () => {
    it('should set mobile viewport correctly', () => {
      setBreakpoint('mobile');
      expect(window.innerWidth).toBe(BREAKPOINTS.mobile);
      expect(isMobileViewport()).toBe(true);
      expect(isDesktopViewport()).toBe(false);
    });

    it('should set desktop viewport correctly', () => {
      setBreakpoint('desktop');
      expect(window.innerWidth).toBe(BREAKPOINTS.desktop);
      expect(isMobileViewport()).toBe(false);
      expect(isDesktopViewport()).toBe(true);
    });
  });

  describe('Privy Mocking Utilities', () => {
    it('should create mock Privy user with wallet', () => {
      const user = createMockPrivyUser();
      expect(user.id).toBeDefined();
      expect(user.wallet).toBeDefined();
      expect(user.wallet?.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should create mock email user', () => {
      const user = createMockEmailUser('test@example.com');
      expect(user.email?.address).toBe('test@example.com');
      expect(user.wallet).toBeUndefined();
    });

    it('should create authenticated Privy state', () => {
      const state = createMockAuthenticatedPrivy();
      expect(state.ready).toBe(true);
      expect(state.authenticated).toBe(true);
      expect(state.user).toBeDefined();
    });

    it('should create unauthenticated Privy state', () => {
      const state = createMockUnauthenticatedPrivy();
      expect(state.ready).toBe(true);
      expect(state.authenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('Fast-check Property Testing', () => {
    it('should have fast-check available', async () => {
      const fc = await import('fast-check');
      expect(fc).toBeDefined();
      expect(fc.assert).toBeDefined();
    });
  });
});

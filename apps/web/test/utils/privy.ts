/**
 * Test utilities for mocking Privy authentication
 */

import { vi } from 'vitest';

export interface MockPrivyUser {
  id: string;
  wallet?: {
    address: string;
    chainId: string;
  };
  email?: {
    address: string;
  };
  createdAt: Date;
}

export interface MockPrivyState {
  ready: boolean;
  authenticated: boolean;
  user: MockPrivyUser | null;
  login: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  linkEmail: ReturnType<typeof vi.fn>;
  linkWallet: ReturnType<typeof vi.fn>;
  unlinkEmail: ReturnType<typeof vi.fn>;
  unlinkWallet: ReturnType<typeof vi.fn>;
  exportWallet: ReturnType<typeof vi.fn>;
  createWallet: ReturnType<typeof vi.fn>;
}

/**
 * Create a mock Privy user
 */
export function createMockPrivyUser(overrides?: Partial<MockPrivyUser>): MockPrivyUser {
  return {
    id: 'test-user-id',
    wallet: {
      address: '0x1234567890123456789012345678901234567890',
      chainId: '42220', // Celo mainnet
    },
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock Privy user with email authentication
 */
export function createMockEmailUser(email: string = 'test@example.com'): MockPrivyUser {
  return {
    id: 'test-email-user-id',
    email: {
      address: email,
    },
    createdAt: new Date(),
  };
}

/**
 * Create a mock Privy user with embedded wallet
 */
export function createMockEmbeddedWalletUser(email: string = 'test@example.com'): MockPrivyUser {
  return {
    id: 'test-embedded-wallet-user-id',
    email: {
      address: email,
    },
    wallet: {
      address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      chainId: '42220',
    },
    createdAt: new Date(),
  };
}

/**
 * Create a mock authenticated Privy state
 */
export function createMockAuthenticatedPrivy(user?: MockPrivyUser): MockPrivyState {
  return {
    ready: true,
    authenticated: true,
    user: user || createMockPrivyUser(),
    login: vi.fn(),
    logout: vi.fn(),
    linkEmail: vi.fn(),
    linkWallet: vi.fn(),
    unlinkEmail: vi.fn(),
    unlinkWallet: vi.fn(),
    exportWallet: vi.fn(),
    createWallet: vi.fn(),
  };
}

/**
 * Create a mock unauthenticated Privy state
 */
export function createMockUnauthenticatedPrivy(): MockPrivyState {
  return {
    ready: true,
    authenticated: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    linkEmail: vi.fn(),
    linkWallet: vi.fn(),
    unlinkEmail: vi.fn(),
    unlinkWallet: vi.fn(),
    exportWallet: vi.fn(),
    createWallet: vi.fn(),
  };
}

/**
 * Create a mock loading Privy state
 */
export function createMockLoadingPrivy(): MockPrivyState {
  return {
    ready: false,
    authenticated: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    linkEmail: vi.fn(),
    linkWallet: vi.fn(),
    unlinkEmail: vi.fn(),
    unlinkWallet: vi.fn(),
    exportWallet: vi.fn(),
    createWallet: vi.fn(),
  };
}

/**
 * Mock the Privy React Auth module
 */
export function mockPrivyReactAuth(state: MockPrivyState = createMockUnauthenticatedPrivy()): void {
  vi.mock('@privy-io/react-auth', () => ({
    PrivyProvider: ({ children }: { children: React.ReactNode }) => children,
    usePrivy: () => state,
    useWallets: () => ({
      wallets: state.user?.wallet ? [state.user.wallet] : [],
      ready: state.ready,
    }),
    useLogin: () => ({
      login: state.login,
    }),
    useLogout: () => ({
      logout: state.logout,
    }),
  }));
}

/**
 * Simulate successful login
 */
export async function simulateLogin(
  mockState: MockPrivyState,
  user: MockPrivyUser = createMockPrivyUser()
): Promise<void> {
  mockState.authenticated = true;
  mockState.user = user;
  mockState.login.mockResolvedValue(user);
}

/**
 * Simulate successful logout
 */
export async function simulateLogout(mockState: MockPrivyState): Promise<void> {
  mockState.authenticated = false;
  mockState.user = null;
  mockState.logout.mockResolvedValue(undefined);
}

/**
 * Simulate embedded wallet creation
 */
export async function simulateEmbeddedWalletCreation(
  mockState: MockPrivyState,
  walletAddress: string = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
): Promise<void> {
  if (mockState.user) {
    mockState.user.wallet = {
      address: walletAddress,
      chainId: '42220',
    };
  }
  mockState.createWallet.mockResolvedValue({
    address: walletAddress,
    chainId: '42220',
  });
}

/**
 * Clear all Privy mocks
 */
export function clearPrivyMocks(): void {
  vi.clearAllMocks();
}

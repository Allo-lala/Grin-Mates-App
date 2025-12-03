import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrivyAuthButton from '@/components/privy-auth-button';
import AuthGuard from '@/components/auth-guard';
import {
  createMockAuthenticatedPrivy,
  createMockUnauthenticatedPrivy,
  createMockLoadingPrivy,
  createMockPrivyUser,
} from '../utils/privy';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Privy
let mockPrivyState = createMockUnauthenticatedPrivy();

vi.mock('@privy-io/react-auth', () => ({
  usePrivy: () => mockPrivyState,
}));

describe('PrivyAuthButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrivyState = createMockUnauthenticatedPrivy();
  });

  it('should render connect wallet button', () => {
    render(<PrivyAuthButton />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('should show loading state when connecting', async () => {
    const user = userEvent.setup();
    mockPrivyState.login.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<PrivyAuthButton />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });
  });

  it('should call onSuccess callback after successful login', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    mockPrivyState.login.mockResolvedValue(undefined);
    
    render(<PrivyAuthButton onSuccess={onSuccess} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should show error message on login failure', async () => {
    const user = userEvent.setup();
    const error = new Error('Connection failed');
    mockPrivyState.login.mockRejectedValue(error);
    
    render(<PrivyAuthButton />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Connection Failed')).toBeInTheDocument();
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });
  });

  it('should call onError callback on login failure', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    const error = new Error('Connection failed');
    mockPrivyState.login.mockRejectedValue(error);
    
    render(<PrivyAuthButton onError={onError} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should be disabled when Privy is not ready', () => {
    mockPrivyState.ready = false;
    
    render(<PrivyAuthButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockPrivyState = createMockUnauthenticatedPrivy();
    localStorage.clear();
  });

  it('should show loading state when Privy is not ready', () => {
    mockPrivyState = createMockLoadingPrivy();
    
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect unauthenticated users', async () => {
    mockPrivyState = createMockUnauthenticatedPrivy();
    
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/wallet-connect');
    });
  });

  it('should render children for authenticated users', async () => {
    mockPrivyState = createMockAuthenticatedPrivy();
    
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should redirect to KYC when requireKYC is true and KYC not completed', async () => {
    mockPrivyState = createMockAuthenticatedPrivy();
    localStorage.setItem('kyc_completed', 'false');
    
    render(
      <AuthGuard requireKYC={true}>
        <div>Protected Content</div>
      </AuthGuard>
    );
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/kyc');
    });
  });

  it('should render children when requireKYC is true and KYC is completed', async () => {
    mockPrivyState = createMockAuthenticatedPrivy();
    localStorage.setItem('kyc_completed', 'true');
    
    render(
      <AuthGuard requireKYC={true}>
        <div>Protected Content</div>
      </AuthGuard>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should use custom redirectTo path', async () => {
    mockPrivyState = createMockUnauthenticatedPrivy();
    
    render(
      <AuthGuard redirectTo="/custom-login">
        <div>Protected Content</div>
      </AuthGuard>
    );
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-login');
    });
  });
});

'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  requireKYC?: boolean; // Kept for backward compatibility but not used
}

/**
 * AuthGuard component that protects routes requiring authentication.
 * KYC verification has been removed from the flow.
 */
export default function AuthGuard({
  children,
  redirectTo = '/wallet-connect',
  requireKYC = false, // Kept for backward compatibility but ignored
}: AuthGuardProps) {
  const { authenticated, ready, user } = usePrivy();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for Privy to be ready
      if (!ready) {
        return;
      }

      // Check if user is authenticated
      if (!authenticated || !user) {
        router.push(redirectTo);
        return;
      }

      // Authentication successful, allow access
      setIsChecking(false);
    };

    checkAuth();
  }, [authenticated, ready, user, router, redirectTo]);

  // Show loading state while checking authentication
  if (!ready || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#1db584]" />
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children until authentication is verified
  if (!authenticated || !user) {
    return null;
  }

  return <>{children}</>;
}

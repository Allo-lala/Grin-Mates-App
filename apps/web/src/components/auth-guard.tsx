'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  requireKYC?: boolean;
}

/**
 * AuthGuard component that protects routes requiring authentication and KYC verification.
 * 
 * Requirements:
 * - 9.2: Check verification status from database when verified user connects wallet
 * - 9.3: Skip KYC screen for verified users and allow direct access
 * - 9.4: Validate that verification has not expired
 * - 9.5: Require re-verification after expiration period
 */
export default function AuthGuard({
  children,
  redirectTo = '/wallet-connect',
  requireKYC = false,
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

      // Check KYC completion if required
      if (requireKYC) {
        try {
          // Get wallet address from user
          const walletAddress = user.wallet?.address;
          
          if (!walletAddress) {
            console.error('No wallet address found for user');
            router.push('/kyc');
            return;
          }

          // Query verification status from backend API (Requirement 9.2)
          const response = await fetch(
            `/api/kyc/status?walletAddress=${walletAddress}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            console.error('Failed to fetch verification status');
            router.push('/kyc');
            return;
          }

          const data = await response.json();

          // Handle different verification statuses
          if (data.status === 'verified') {
            // Check if verification has expired (Requirement 9.4)
            if (data.timestamp) {
              const verificationDate = new Date(data.timestamp);
              const now = new Date();
              const daysSinceVerification = 
                (now.getTime() - verificationDate.getTime()) / (1000 * 60 * 60 * 24);
              
              // Check if verification is older than 365 days (1 year expiration)
              // Requirement 9.5: Require re-verification after expiration period
              if (daysSinceVerification > 365) {
                console.log('Verification expired, redirecting to KYC');
                router.push('/kyc');
                return;
              }
            }

            // Skip KYC screen for verified users (Requirement 9.3)
            console.log('User is verified, allowing access');
            setIsChecking(false);
            return;
          } else if (data.status === 'expired') {
            // Session expired, redirect to KYC for new verification (Requirement 9.4)
            console.log('Verification session expired, redirecting to KYC');
            router.push('/kyc');
            return;
          } else if (data.status === 'pending') {
            // Verification in progress, redirect to KYC to show status
            console.log('Verification pending, redirecting to KYC');
            router.push('/kyc');
            return;
          } else if (data.status === 'failed') {
            // Verification failed, redirect to KYC to retry
            console.log('Verification failed, redirecting to KYC');
            router.push('/kyc');
            return;
          } else if (data.status === 'not_found') {
            // No verification record found, redirect to KYC (Requirement 9.2)
            console.log('No verification found, redirecting to KYC');
            router.push('/kyc');
            return;
          } else {
            // Unknown status, redirect to KYC for safety
            console.log('Unknown verification status, redirecting to KYC');
            router.push('/kyc');
            return;
          }
        } catch (error) {
          console.error('Error checking KYC status:', error);
          // On error, redirect to KYC page to be safe
          router.push('/kyc');
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [authenticated, ready, user, router, redirectTo, requireKYC]);

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

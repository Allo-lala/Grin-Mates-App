'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Wallet, Loader2, Mail, Shield } from 'lucide-react';
import { MobileAppContainer } from '@/components/layout/mobile-app-container';
import PrivyAuthButton from '@/components/privy-auth-button';

export default function WalletConnectionScreen() {
  const { authenticated, user, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (authenticated && user) {
      // Redirect directly to dashboard after authentication
      router.push('/dashboard');
    }
  }, [authenticated, user, router]);

  const handleSuccess = () => {
    // Navigation is handled by the useEffect above
    console.log('Authentication successful');
  };

  const handleError = (error: Error) => {
    console.error('Privy authentication error:', error);
  };

  if (!ready) {
    return (
      <MobileAppContainer>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1db584]" />
        </div>
      </MobileAppContainer>
    );
  }

  return (
    <MobileAppContainer>
      <div className="min-h-screen bg-gradient-to-br from-[#1db584]/10 to-[#15a576]/10 px-4 py-8">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1db584]">
              <Wallet className="h-10 w-10 text-white" />
            </div>
            <h1 className="mb-3 text-3xl font-bold text-gray-900">
              Connect Your Wallet
            </h1>
            <p className="text-base text-gray-600">
              Choose your preferred crypto wallet to get started
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-xl">
            <PrivyAuthButton
              onSuccess={handleSuccess}
              onError={handleError}
              variant="primary"
            />

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <Shield className="h-5 w-5 flex-shrink-0 text-[#1db584]" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">Secure Authentication</p>
                  <p className="text-gray-600">Connect with MetaMask, Coinbase, or other wallets</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-[#1db584]" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">Email Login Available</p>
                  <p className="text-gray-600">No wallet? We'll create one for you</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg p-3">
              <p className="text-center text-sm text-gray-600">
                Engage • Empower • Earn
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </MobileAppContainer>
  );
}

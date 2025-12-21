'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MobileAppContainer } from '@/components/layout/mobile-app-container';
import { LazyImage } from '@/components/ui/lazy-image';
import logoImg from '@/assets/images/logo.png';

/**
 * Welcome/Landing Screen - First screen users see
 * Similar to ETHDenver's welcome screen
 * Requirements: 1.2, 1.3, 4.3
 */
export default function WelcomeScreen() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (authenticated) {
      // Redirect directly to dashboard after authentication
      router.push('/dashboard');
    }
  }, [authenticated, router]);

  const handleConnectWallet = () => {
    login();
  };

  return (
    <MobileAppContainer>
      <div className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-br from-[#1db584] via-[#15a576] to-[#0f8a5f] px-6 py-12">
        {/* Main Content - Centered */}
        <div className="flex flex-1 items-center">
          <div className="w-full space-y-8 text-center">
            {/* Logo/Branding */}
            <div className="space-y-4">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full backdrop-blur-sm">
                <LazyImage
                  src={logoImg.src}
                  alt="Logo"
                  width={64}
                  height={64}
                  priority
                  className="object-contain"
                />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-5xl font-extrabold text-white">
                  GRIN MATES
                </h1>
                {/* <h2 className="text-4xl font-bold text-white">
                Welcome to 
                </h2> */}
              </div>
            </div>

            {/* Tagline */}
            <p className="text-lg text-white/90">
              {/* Together for a Greener Tomorrow
              <br /> */}
              <span className="font-semibold">Engage • Empower • Earn</span>
            </p>

            {/* Main CTA Button */}
            <div className="pt-4">
              <button
                onClick={handleConnectWallet}
                disabled={!ready}
                className="w-full rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[#1db584] shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ready ? "Let's go!" : 'Loading...'}
              </button>
            </div>
          </div>
        </div>

        {/* Built on Celo - Bottom */}
        <div className="w-full pb-4">
          <p className="text-center text-sm text-white/70">
            Built on Celo
          </p>
        </div>
      </div>
    </MobileAppContainer>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import WelcomeScreen from '@/components/screens/welcome-screen';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();

  useEffect(() => {
    // Wait for Privy to be ready
    if (!ready) {
      return;
    }

    // If user is authenticated, redirect directly to dashboard
    if (authenticated) {
      router.push('/dashboard');
    }
  }, [authenticated, ready, router]);

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#1db584] to-[#15a576]">
        <div className="space-y-4 text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // If authenticated, don't show welcome screen (redirect will happen)
  if (authenticated) {
    return null;
  }

  // Show welcome screen for unauthenticated users
  return <WelcomeScreen />;
}

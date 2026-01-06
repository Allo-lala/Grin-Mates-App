'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { User, Copy, Check, LogOut, Loader2 } from 'lucide-react';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { clearSessionState } from '@/lib/session';
import GreenPointsCard from '@/components/green-points-card';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, ready, authenticated, logout } = usePrivy();
  const [copied, setCopied] = useState(false);
  const [hideGreenPoints, setHideGreenPoints] = useState(false);
  
  // Mock Green Points balance
  const greenPoints = 1250;

  const handleCopyAddress = () => {
    const address = user?.wallet?.address || user?.email?.address;
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all session state - Requirements: 6.5
      clearSessionState();
      
      // Logout from Privy
      await logout();
      
      // Redirect to onboarding - Requirements: 6.5
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#1db584]" />
      </div>
    );
  }

  if (!authenticated || !user) {
    router.push('/');
    return null;
  }

  const walletAddress = user.wallet?.address || user.email?.address || 'Not connected';
  const walletType = user.wallet?.walletClientType || 'email';
  const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();

  const getWalletName = (type: string) => {
    if (type === 'privy') return 'Embedded Wallet';
    if (type === 'email') return 'Email Login';
    const names: Record<string, string> = {
      metamask: 'MetaMask',
      rabby: 'Rabby Wallet',
      rainbow: 'Rainbow',
      coinbase_wallet: 'Coinbase Wallet',
      wallet_connect: 'WalletConnect',
    };
    return names[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <MobileLayout showBottomNav={true}>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 py-8">
          <ResponsiveContainer maxWidth="md" padding="md">
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          </ResponsiveContainer>
        </div>

        {/* Main content */}
        <ResponsiveContainer maxWidth="md" padding="md" className="space-y-6 py-8">
          {/* Green Points Card */}
          <GreenPointsCard
            points={greenPoints}
            hideBalance={hideGreenPoints}
            onToggleBalance={() => setHideGreenPoints(!hideGreenPoints)}
          />

          {/* Profile card */}
          <div className="rounded-xl border border-muted bg-background p-6 md:p-8 space-y-6">
            {/* Avatar placeholder */}
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Wallet info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Connected Wallet</p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {getWalletName(walletType)}
                </p>
              </div>

              {/* Wallet address */}
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {user.wallet ? 'Wallet Address' : 'Email'}
                </p>
                <div className="mt-2 flex items-center justify-between rounded-lg border border-muted bg-muted/50 px-4 py-3">
                  <p className="font-mono text-sm text-foreground break-all">
                    {walletAddress}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="ml-2 flex-shrink-0 rounded-lg p-2 hover:bg-muted transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Connection time */}
              <div>
                <p className="text-sm text-muted-foreground font-medium">Connected Since</p>
                <p className="text-foreground mt-1">
                  {createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-3 font-medium text-red-600 hover:bg-red-100 transition-all min-h-[44px]"
            >
              <LogOut className="h-5 w-5" />
              Disconnect Wallet
            </button>
          </div>

          {/* Account status */}
          <div className="rounded-xl border border-muted bg-background p-6 space-y-3">
            <h2 className="font-semibold text-foreground">Account Status</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">KYC Verification</p>
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Account Security</p>
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  Standard
                </span>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </div>
    </MobileLayout>
  );
}

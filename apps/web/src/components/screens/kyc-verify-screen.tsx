'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Shield, CheckCircle, AlertTriangle, ArrowLeft, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  countries,
} from '@selfxyz/qrcode';
import { ethers } from 'ethers';

export default function KYCVerifyScreen() {
  const router = useRouter();
  const { user } = usePrivy();
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verifying' | 'completed' | 'failed'>('pending');
  const [userId, setUserId] = useState<string>(ethers.ZeroAddress);

  // Excluded countries (if any)
  const excludedCountries = useMemo(() => [], []);

  useEffect(() => {
    const walletAddress = user?.wallet?.address;
    
    if (!walletAddress) {
      toast.error('Wallet Not Found', 'Please connect your wallet to continue.');
      router.push('/profile');
      return;
    }

    setUserId(walletAddress);
    initializeSelfApp(walletAddress);
  }, [user]);

  const initializeSelfApp = (walletAddress: string) => {
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Grin Mates',
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE_SEED || 'grin-mates',
        endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || '',
        logoBase64: process.env.NEXT_PUBLIC_SELF_LOGO_URL || 'https://i.postimg.cc/mrmVf9hm/self.png',
        userId: walletAddress,
        endpointType: (process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE as any) || 'staging_celo',
        userIdType: 'hex', // ethereum address
        userDefinedData: JSON.stringify({
          walletAddress,
          timestamp: Date.now(),
          app: 'Grin Mates KYC',
        }),
        disclosures: {
          // What you want to verify from users identity
          minimumAge: 18,
          excludedCountries: excludedCountries,
          // What you want users to reveal (optional)
          // name: true,
          // issuing_state: true,
          // nationality: true,
          // date_of_birth: true,
        },
      }).build();

      setSelfApp(app);
      
      // Generate universal link manually
      const link = `https://self.id/verify?app=${encodeURIComponent(app.appName)}&data=${encodeURIComponent(JSON.stringify(app))}`;
      setUniversalLink(link);
    } catch (error) {
      console.error('Failed to initialize Self app:', error);
      toast.error('Initialization Failed', 'Failed to initialize Self Protocol.');
    }
  };

  const handleSuccessfulVerification = async () => {
    setVerificationStatus('verifying');
    
    try {
      // Submit verification to backend
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: userId,
          selfDID: `did:self:${userId}`,
          verificationData: {
            verified: true,
            timestamp: Date.now(),
          },
          status: 'approved',
        }),
      });

      if (response.ok) {
        setVerificationStatus('completed');
        toast.success('Verification Complete!', 'Your identity has been verified successfully.');
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      } else {
        throw new Error('Backend submission failed');
      }
    } catch (error) {
      console.error('Failed to submit verification:', error);
      setVerificationStatus('failed');
      toast.error('Submission Failed', 'Verification succeeded but failed to save. Please contact support.');
    }
  };

  const handleVerificationError = () => {
    setVerificationStatus('failed');
    toast.error('Verification Failed', 'Failed to verify identity. Please try again.');
  };

  const copyToClipboard = () => {
    if (!universalLink) return;
    
    navigator.clipboard.writeText(universalLink).then(() => {
      setLinkCopied(true);
      toast.success('Link Copied!', 'Universal link copied to clipboard.');
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy text:', err);
      toast.error('Copy Failed', 'Failed to copy link.');
    });
  };

  const openSelfApp = () => {
    if (!universalLink) return;
    window.open(universalLink, '_blank');
    toast.success('Opening App', 'Opening Self Protocol app...');
  };

  const handleBack = () => {
    router.push('/profile');
  };

  const handleRetry = () => {
    setVerificationStatus('pending');
    const walletAddress = user?.wallet?.address;
    if (walletAddress) {
      initializeSelfApp(walletAddress);
    }
  };

  const getStatusDisplay = () => {
    switch (verificationStatus) {
      case 'pending':
        return {
          title: 'Scan QR Code',
          description: 'Use your Self Protocol app to scan the QR code below',
          color: 'blue',
        };
      case 'verifying':
        return {
          title: 'Verifying...',
          description: 'Your documents are being verified on-chain',
          color: 'amber',
        };
      case 'completed':
        return {
          title: 'Verification Complete!',
          description: 'Your identity has been successfully verified',
          color: 'green',
        };
      case 'failed':
        return {
          title: 'Verification Failed',
          description: 'Please try again or contact support',
          color: 'red',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <MobileLayout showBottomNav={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1db584] to-[#15a576] pb-8 pt-6">
          <ResponsiveContainer maxWidth="md" padding="md">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 text-white hover:text-white/80 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-white">
                Identity Verification
              </h1>
              <p className="text-white/90 text-sm">
                Powered by Self Protocol
              </p>
            </div>
          </ResponsiveContainer>
        </div>

        <ResponsiveContainer maxWidth="md" padding="md" className="-mt-6 relative z-10">
          {/* Main Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            {/* Status Display */}
            <div className="text-center mb-6">
              {verificationStatus === 'verifying' && (
                <Loader2 className="h-12 w-12 text-amber-600 animate-spin mx-auto mb-4" />
              )}
              {verificationStatus === 'completed' && (
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              )}
              {verificationStatus === 'failed' && (
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              )}
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {statusDisplay.title}
              </h2>
              <p className="text-sm text-gray-600">
                {statusDisplay.description}
              </p>
            </div>

            {/* QR Code Display */}
            {verificationStatus === 'pending' && (
              <>
                <div className="flex justify-center mb-6">
                  {selfApp ? (
                    <SelfQRcodeWrapper
                      selfApp={selfApp}
                      onSuccess={handleSuccessfulVerification}
                      onError={handleVerificationError}
                    />
                  ) : (
                    <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
                      <p className="text-gray-500 text-sm">Loading QR Code...</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mb-6">
                  <Button
                    onClick={copyToClipboard}
                    disabled={!universalLink}
                    variant="secondary"
                    size="lg"
                    fullWidth
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {linkCopied ? 'Copied!' : 'Copy Universal Link'}
                  </Button>

                  <Button
                    onClick={openSelfApp}
                    disabled={!universalLink}
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="bg-[#1db584] hover:bg-[#15a576] focus:ring-[#1db584]/50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Self Protocol App
                  </Button>
                </div>

                {/* User Address Display */}
                <div className="flex flex-col items-center gap-2 mb-6">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">
                    User Address
                  </span>
                  <div className="bg-gray-100 rounded-md px-3 py-2 w-full text-center break-all text-xs font-mono text-gray-800 border border-gray-200">
                    {userId || <span className="text-gray-400">Not connected</span>}
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2 text-sm">How to Verify:</h3>
                  <ol className="text-xs text-blue-700 space-y-2 list-decimal list-inside">
                    <li>Scan the QR code above with your Self Protocol mobile app</li>
                    <li>Or click "Open Self Protocol App" to launch the app directly</li>
                    <li>Follow the in-app instructions to verify your identity</li>
                    <li>Submit your government-issued Passport</li>
                    <li>Wait for on-chain verification to complete</li>
                  </ol>
                </div>

                {/* Download Link */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  Don't have the Self Protocol app?{' '}
                  <a
                    href="https://self.id/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1db584] hover:underline"
                  >
                    Download here
                  </a>
                </p>
              </>
            )}

            {verificationStatus === 'verifying' && (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Verifying on-chain...</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Your documents are being verified on the Celo blockchain
                </p>
              </div>
            )}

            {verificationStatus === 'completed' && (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Verification successful!</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Redirecting to your profile...
                </p>
              </div>
            )}

            {verificationStatus === 'failed' && (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Verification failed</span>
                  </div>
                </div>
                <Button
                  onClick={handleRetry}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="bg-red-500 hover:bg-red-600 focus:ring-red-500/50"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1 text-sm">Secure & Private</h3>
                <p className="text-xs text-gray-600">
                  Your identity data is encrypted and stored on-chain. Only you control access to your information through your Self Protocol DID.
                </p>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </div>
    </MobileLayout>
  );
}

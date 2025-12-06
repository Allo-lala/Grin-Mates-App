'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  countries,
} from '@selfxyz/qrcode';
import { getUniversalLink } from '@selfxyz/common';
import AuthGuard from '@/components/auth-guard';

export default function KYCPage() {
  const router = useRouter();
  const { user } = usePrivy();
  
  const [linkCopied, setLinkCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState('');
  
  // Get wallet address from Privy user
  const walletAddress = user?.wallet?.address || '';

  // Use useMemo to cache the array to avoid creating a new array on each render
  const excludedCountries = useMemo(() => [
    countries.AFGHANISTAN,
    countries.BELARUS,
    countries.CENTRAL_AFRICAN_REPUBLIC,
    countries.CUBA,
    countries.DR_CONGO, // Democratic Republic of Congo
    countries.IRAN,
    countries.IRAQ,
    countries.LEBANON,
    countries.LIBYA,
    countries.NORTH_KOREA,
    countries.SOMALIA,
    countries.SOUTH_SUDAN,
    countries.SUDAN,
    countries.SYRIAN_ARAB_REPUBLIC, // Syria
    countries.VENEZUELA,
    countries.YEMEN,
    countries.ZIMBABWE,
  ], []);

  // Use useEffect to ensure code only executes on the client side
  useEffect(() => {
    if (!walletAddress) return;

    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME,
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE_SEED,
        endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
        logoBase64: process.env.NEXT_PUBLIC_SELF_LOGO_URL || 'https://i.postimg.cc/mrmVf9hm/self.png',
        userId: walletAddress,
        endpointType: 'staging_celo',
        userIdType: 'hex',
        disclosures: {
          minimumAge: 18,
          ofac: true,
          excludedCountries: excludedCountries,
          name: true,
          nationality: true,
          date_of_birth: true,
        },
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error('Failed to initialize Self app:', error);
    }
  }, [excludedCountries, walletAddress]);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        displayToast('Universal link copied to clipboard!');
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        displayToast('Failed to copy link');
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;
    window.open(universalLink, '_blank');
    displayToast('Opening Self App...');
  };

  const handleSuccessfulVerification = () => {
    displayToast('Verification successful! Redirecting...');
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <AuthGuard requireKYC={false}>
      <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
            {process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Grin Mates'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Scan QR code with Self Protocol App to verify your identity
          </p>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
          <div className="flex justify-center mb-4 sm:mb-6">
            {selfApp ? (
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={handleSuccessfulVerification}
                onError={() => {
                  displayToast('Error: Failed to verify identity');
                }}
              />
            ) : (
              <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center">
                <p className="text-gray-500 text-sm">Loading QR Code...</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mb-4 sm:mb-6">
            <button
              type="button"
              onClick={copyToClipboard}
              disabled={!universalLink}
              className="flex-1 bg-gray-800 hover:bg-gray-700 transition-colors text-white p-2 rounded-md text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {linkCopied ? 'Copied!' : 'Copy Universal Link'}
            </button>
            <button
              type="button"
              onClick={openSelfApp}
              disabled={!universalLink}
              className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white p-2 rounded-md text-sm sm:text-base mt-2 sm:mt-0 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Open Self App
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 mt-2">
            <span className="text-gray-500 text-xs uppercase tracking-wide">
              User Address
            </span>
            <div className="bg-gray-100 rounded-md px-3 py-2 w-full text-center break-all text-sm font-mono text-gray-800 border border-gray-200">
              {walletAddress ? (
                walletAddress
              ) : (
                <span className="text-gray-400">Not connected</span>
              )}
            </div>
          </div>

          {/* Toast notification */}
          {showToast && (
            <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm">
              {toastMessage}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

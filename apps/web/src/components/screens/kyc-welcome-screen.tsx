'use client';

import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { ResponsiveContainer } from '@/components/layout/responsive-container';

/**
 * KYC Welcome Screen - Inspired by ETHDenver
 * Shows before KYC flow to explain the process
 */
export default function KYCWelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/kyc/verify');
  };

  return (
    <MobileLayout showBottomNav={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1db584] to-[#15a576] pb-8 pt-6">
          <ResponsiveContainer maxWidth="md" padding="md">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-white">
                Let's Get Started
              </h1>
              <p className="text-white/90">
                Complete your identity verification to unlock all Grin Mates features
              </p>
            </div>
          </ResponsiveContainer>
        </div>

        <ResponsiveContainer maxWidth="md" padding="md" className="-mt-6 relative z-10">
          {/* Main Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            {/* Self Protocol Badge */}
            <div className="mb-6 flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Powered by Self Protocol
              </span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Secure & Decentralized
              </span>
            </div>

            {/* What to Expect */}
            <div className="mb-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                
              </h2>
              
              <div className="space-y-4">

              </div>
            </div>

            {/* Why KYC */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-[#1db584] mt-0.5" />
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900 text-sm">
                    Why do we need this?
                  </h3>
                  <p className="text-xs text-gray-600">
                    Identity verification helps us maintain a secure and trusted community. 
                    Your information is encrypted and stored securely in compliance with 
                    data protection regulations.
                  </p>
                </div>
              </div>
            </div>

            {/* Time Estimate */}
            <div className="mb-6 text-center">
              <p className="text-xs text-gray-600">
                ⏱️ Takes approximately <span className="font-semibold text-gray-900">1-3 minutes</span> to complete
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleGetStarted}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1db584] to-[#15a576] px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98] min-h-[44px]"
            >
              Let's Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Footer Note */}
            <p className="mt-4 text-center text-xs text-gray-500">
              Your data is protected and will only be used for Proof of Human purposes
            </p>
          </div>

          {/* Bottom Text */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Need help? Contact our support team
          </p>
        </ResponsiveContainer>
      </div>
    </MobileLayout>
  );
}

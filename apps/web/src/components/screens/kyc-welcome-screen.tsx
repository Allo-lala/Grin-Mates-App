'use client';

import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { ResponsiveContainer } from '@/components/layout/responsive-container';

/**
 * KYC Welcome Screen - Inspired by ETHDenver
 * Shows before KYC flow to explain the process
 * Requirements: 2.1, 4.1, 4.2
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
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
            {/* What to Expect */}
            <div className="mb-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                What to Expect
              </h2>
              
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1db584]/10">
                    <FileText className="h-4 w-4 text-[#1db584]" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900 text-sm">
                      Personal Information
                    </h3>
                    <p className="text-xs text-gray-600">
                      Provide your basic details including name, email, and date of birth
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1db584]/10">
                    <FileText className="h-4 w-4 text-[#1db584]" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900 text-sm">
                      Document Verification
                    </h3>
                    <p className="text-xs text-gray-600">
                      Upload your government-issued ID, passport, or driver's license
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1db584]/10">
                    <FileText className="h-4 w-4 text-[#1db584]" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900 text-sm">
                      Photo Verification
                    </h3>
                    <p className="text-xs text-gray-600">
                      Take a selfie holding your document for identity confirmation
                    </p>
                  </div>
                </div>
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
                ⏱️ Takes approximately <span className="font-semibold text-gray-900">3-5 minutes</span> to complete
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
              Your data is protected and will only be used for verification purposes
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

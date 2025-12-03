'use client';

import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, FileText, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-[#1db584]/10 to-[#15a576]/10">
      <ResponsiveContainer maxWidth="lg" padding="lg">
        <div className="flex min-h-screen flex-col items-center justify-center py-8 md:py-12">
          {/* Header */}
          <div className="mb-8 text-center md:mb-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#1db584] to-[#15a576] shadow-lg md:h-24 md:w-24">
              <Shield className="h-10 w-10 text-white md:h-12 md:w-12" />
            </div>
            <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
              Let's Get Started
            </h1>
            <p className="text-base text-gray-600 md:text-lg lg:text-xl">
              Complete your identity verification to unlock all Grin Mates features
            </p>
          </div>

          {/* Main Card */}
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl md:p-8 lg:p-10">
            {/* What to Expect */}
            <div className="mb-8">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 md:text-2xl">
                What to Expect
              </h2>
              
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#1db584]/10">
                    <FileText className="h-5 w-5 text-[#1db584]" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">
                      Personal Information
                    </h3>
                    <p className="text-sm text-gray-600">
                      Provide your basic details including name, email, and date of birth
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#1db584]/10">
                    <FileText className="h-5 w-5 text-[#1db584]" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">
                      Address Verification
                    </h3>
                    <p className="text-sm text-gray-600">
                      Enter your current residential address for verification
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#1db584]/10">
                    <FileText className="h-5 w-5 text-[#1db584]" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">
                      Document Upload
                    </h3>
                    <p className="text-sm text-gray-600">
                      Upload a government-issued ID (passport, driver's license, or national ID)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why KYC */}
            <div className="mb-8 rounded-lg bg-gray-50 p-4 md:p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#1db584] mt-0.5" />
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Why do we need this?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Identity verification helps us maintain a secure and trusted community. 
                    Your information is encrypted and stored securely in compliance with 
                    data protection regulations.
                  </p>
                </div>
              </div>
            </div>

            {/* Time Estimate */}
            <div className="mb-8 text-center">
              <p className="text-sm text-gray-600">
                ⏱️ Takes approximately <span className="font-semibold text-gray-900">3-5 minutes</span> to complete
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleGetStarted}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1db584] to-[#15a576] px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98] md:text-lg"
            >
              Let's Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Footer Note */}
            <p className="mt-6 text-center text-xs text-gray-500 md:text-sm">
              Your data is protected and will only be used for verification purposes
            </p>
          </div>

          {/* Bottom Text */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Need help? Contact our support team
          </p>
        </div>
      </ResponsiveContainer>
    </div>
  );
}

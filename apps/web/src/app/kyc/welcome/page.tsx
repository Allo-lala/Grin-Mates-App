'use client';

import KYCWelcomeScreen from '@/components/screens/kyc-welcome-screen';
import AuthGuard from '@/components/auth-guard';

export default function KYCWelcomePage() {
  return (
    <AuthGuard requireKYC={false}>
      <KYCWelcomeScreen />
    </AuthGuard>
  );
}
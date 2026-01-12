'use client';

import KYCVerifyScreen from '@/components/screens/kyc-verify-screen';
import AuthGuard from '@/components/auth-guard';

export default function KYCVerifyPage() {
  return (
    <AuthGuard requireKYC={false}>
      <KYCVerifyScreen />
    </AuthGuard>
  );
}
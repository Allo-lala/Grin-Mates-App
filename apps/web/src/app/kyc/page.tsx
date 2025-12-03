'use client';

import KYCScreen from '@/components/screens/kyc-screen';
import AuthGuard from '@/components/auth-guard';

export default function KYCPage() {
  return (
    <AuthGuard requireKYC={false}>
      <KYCScreen />
    </AuthGuard>
  );
}

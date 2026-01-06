'use client';

import ServicesScreen from '@/components/screens/services-screen';
import AuthGuard from '@/components/auth-guard';

export default function ServicesPage() {
  return (
    <AuthGuard requireKYC={false}>
      <ServicesScreen />
    </AuthGuard>
  );
}
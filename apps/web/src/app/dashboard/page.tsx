'use client';

import DashboardScreen from '@/components/screens/dashboard-screen';
import AuthGuard from '@/components/auth-guard';

export default function DashboardPage() {
  return (
    <AuthGuard requireKYC={false}>
      <DashboardScreen />
    </AuthGuard>
  );
}

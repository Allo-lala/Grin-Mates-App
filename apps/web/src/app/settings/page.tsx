'use client';

import SettingsScreen from '@/components/screens/settings-screen';
import AuthGuard from '@/components/auth-guard';

export default function SettingsPage() {
  return (
    <AuthGuard requireKYC={true}>
      <SettingsScreen />
    </AuthGuard>
  );
}

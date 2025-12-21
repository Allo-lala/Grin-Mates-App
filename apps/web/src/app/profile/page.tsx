'use client';

import ProfileScreen from '@/components/screens/profile-screen';
import AuthGuard from '@/components/auth-guard';

export default function ProfilePage() {
  return (
    <AuthGuard requireKYC={false}>
      <ProfileScreen />
    </AuthGuard>
  );
}

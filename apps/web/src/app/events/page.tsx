'use client';

import { EventsScreen } from '@/components/screens/events-screen';
import AuthGuard from '@/components/auth-guard';

export default function EventsPage() {
  return (
    <AuthGuard requireKYC={false}>
      <EventsScreen />
    </AuthGuard>
  );
}

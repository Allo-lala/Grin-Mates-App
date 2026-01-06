'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WalletConnectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to welcome screen since wallet connection screens were removed
    router.replace('/');
  }, [router]);

  return null;
}

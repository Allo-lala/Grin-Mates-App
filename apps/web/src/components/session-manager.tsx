'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';

/**
 * SessionManager component handles session persistence check on app initialization.
 * It ensures that authenticated users maintain their session across page reloads.
 * 
 * Requirements: 6.5 - Session persistence and clearing on logout
 * 
 * This component should be placed at the root level of the application.
 */
export default function SessionManager() {
  const { ready, authenticated, user } = usePrivy();

  useEffect(() => {
    // Wait for Privy to be ready
    if (!ready) {
      return;
    }

    // Check if user is authenticated and persist session info
    if (authenticated && user) {
      try {
        // Store basic session info for quick access - Requirements: 3.4
        const sessionData = {
          userId: user.id,
          walletAddress: user.wallet?.address || null,
          email: user.email?.address || null,
          hasEmbeddedWallet: user.wallet?.walletClientType === 'privy',
          lastActive: new Date().toISOString(),
        };

        localStorage.setItem('privy_session', JSON.stringify(sessionData));
      } catch (error) {
        console.error('Error persisting session:', error);
      }
    } else {
      // Clear session data if not authenticated - Requirements: 6.5
      try {
        localStorage.removeItem('privy_session');
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
  }, [ready, authenticated, user]);

  // This component doesn't render anything
  return null;
}

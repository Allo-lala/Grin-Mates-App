/**
 * Session management utilities for Grin Mates
 * 
 * Requirements: 6.5 - Session state clearing on logout
 */

/**
 * Clears all session-related data from localStorage
 * This should be called during logout to ensure complete session cleanup
 */
export function clearSessionState(): void {
  try {
    // Clear Privy session data
    localStorage.removeItem('privy_session');
    
    // Clear any other app-specific session data
    // Add more items here as needed
  } catch (error) {
    console.error('Error clearing session state:', error);
    throw error;
  }
}

/**
 * Checks if a valid session exists
 * Returns true if Privy session data is present
 */
export function hasValidSession(): boolean {
  try {
    const sessionData = localStorage.getItem('privy_session');
    return sessionData !== null;
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
}

/**
 * Gets the current session data if it exists
 */
export function getSessionData(): {
  userId: string;
  walletAddress: string | null;
  email: string | null;
  hasEmbeddedWallet: boolean;
  lastActive: string;
} | null {
  try {
    const sessionData = localStorage.getItem('privy_session');
    if (!sessionData) {
      return null;
    }
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Error getting session data:', error);
    return null;
  }
}

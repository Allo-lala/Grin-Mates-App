/**
 * Authentication utilities for Grin Mates
 * 
 * All authentication is handled by Privy (@privy-io/react-auth).
 * Use the usePrivy hook to access authentication state and methods.
 * 
 * Example:
 * ```tsx
 * import { usePrivy } from '@privy-io/react-auth';
 * 
 * function MyComponent() {
 *   const { user, authenticated, login, logout } = usePrivy();
 *   // ...
 * }
 * ```
 */

// This file is intentionally minimal as all authentication is handled by Privy.
// Legacy wallet connection code has been removed in favor of Privy integration.

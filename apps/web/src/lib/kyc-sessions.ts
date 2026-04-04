// Shared in-memory session store for KYC verification
// Note: This resets on server restart. Use a database for production.
export const verificationSessions = new Map<string, {
  status: 'pending' | 'scanning' | 'verifying' | 'completed' | 'failed';
  walletAddress?: string;
  selfDID?: string;
  timestamp: number;
}>();

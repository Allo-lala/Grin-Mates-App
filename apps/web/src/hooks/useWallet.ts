import { useState, useEffect } from 'react';

interface Balance {
  tokenId: string;
  symbol: string;
  tokenName: string;
  network: string;
  balance: string;
  lockedBalance: string;
  priceUsd: string;
  balanceUsd: string;
  updatedAt: string;
}

interface WalletData {
  totalBalanceUsd: string;
  balances: Balance[];
}

export function useWallet(userId: string | undefined) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWallet() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/wallet/balances?userId=${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          setWallet(data);
        } else {
          setError('Failed to fetch wallet balances');
        }
      } catch (err) {
        console.error('Error fetching wallet:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    fetchWallet();
  }, [userId]);

  const refreshWallet = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/wallet/balances?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setWallet(data);
      }
    } catch (err) {
      console.error('Error refreshing wallet:', err);
    }
  };

  return {
    wallet,
    loading,
    error,
    refreshWallet
  };
}

// Hook for generating deposit addresses
export function useDepositAddress(userId: string | undefined, tokenSymbol: string, networkName: string) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAddress = async () => {
    if (!userId || !tokenSymbol || !networkName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tokenSymbol,
          networkName
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAddress(data.depositAddress);
      } else {
        setError('Failed to generate deposit address');
      }
    } catch (err) {
      console.error('Error generating address:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return {
    address,
    loading,
    error,
    generateAddress
  };
}
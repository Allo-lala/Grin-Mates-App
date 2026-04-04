'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { apiClient } from '@/lib/api-client';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  walletAddress?: string;
  profileImage?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  isActive: boolean;
}

interface KycStatus {
  status: 'none' | 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  verifiedAt?: string;
}

interface GreenPoints {
  total: number;
  available: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

interface Portfolio {
  totalBalanceUsd: string;
  tokenCount: number;
}

interface UserContextType {
  user: UserProfile | null;
  kyc: KycStatus | null;
  greenPoints: GreenPoints | null;
  portfolio: Portfolio | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  registerUser: (email: string, walletAddress?: string, displayName?: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: privyUser, authenticated } = usePrivy();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [kyc, setKyc] = useState<KycStatus | null>(null);
  const [greenPoints, setGreenPoints] = useState<GreenPoints | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (email: string) => {
    try {
      const response = await apiClient.getUserProfile(email);
      
      if (response.success && response.data) {
        const data = response.data as any;
        setUser(data.user);
        setKyc(data.kyc);
        setGreenPoints(data.greenPoints);
        setPortfolio(data.portfolio);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (email: string, walletAddress?: string, displayName?: string) => {
    try {
      const response = await apiClient.registerUser(email, walletAddress, displayName);
      
      if (response.success && response.data) {
        const data = response.data as any;
        await fetchUserProfile(email);
      }
    } catch (error) {
      console.error('Failed to register user:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (privyUser?.email?.address) {
      await fetchUserProfile(privyUser.email.address);
    }
  };

  useEffect(() => {
    if (authenticated && privyUser?.email?.address) {
      fetchUserProfile(privyUser.email.address);
    } else {
      setIsLoading(false);
      setUser(null);
      setKyc(null);
      setGreenPoints(null);
      setPortfolio(null);
    }
  }, [authenticated, privyUser?.email?.address]);

  return (
    <UserContext.Provider
      value={{
        user,
        kyc,
        greenPoints,
        portfolio,
        isLoading,
        refreshUser,
        registerUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
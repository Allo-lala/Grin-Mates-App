import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  walletAddress?: string;
  profileImage?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  isActive: boolean;
  kyc: {
    status: 'none' | 'pending' | 'approved' | 'rejected';
    submittedAt?: string;
    verifiedAt?: string;
  } | null;
  greenPoints: {
    total: number;
    available: number;
    lifetimeEarned: number;
    lifetimeSpent: number;
  } | null;
  portfolio: {
    totalBalanceUsd: string;
    tokenCount: number;
  } | null;
}

export function useUser() {
  const { user: privyUser, authenticated, ready } = usePrivy();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrCreateUser() {
      if (!ready) return;
      
      if (!authenticated || !privyUser) {
        setLoading(false);
        return;
      }

      try {
        const email = privyUser.email?.address;
        const walletAddress = privyUser.wallet?.address;

        if (!email) {
          setError('No email found');
          setLoading(false);
          return;
        }

        // Try to get existing user
        const response = await fetch(`/api/users/profile?email=${encodeURIComponent(email)}`);
        
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
        } else if (response.status === 404) {
          // User doesn't exist, create new user
          const displayName = email.split('@')[0];
          const registerResponse = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              walletAddress,
              displayName
            })
          });

          if (registerResponse.ok) {
            const registerData = await registerResponse.json();
            // Fetch full profile after registration
            const profileResponse = await fetch(`/api/users/profile?email=${encodeURIComponent(email)}`);
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setUserProfile(profileData.user);
            }
          } else {
            setError('Failed to create user');
          }
        } else {
          setError('Failed to fetch user profile');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    fetchOrCreateUser();
  }, [authenticated, privyUser, ready]);

  const refreshProfile = async () => {
    if (!privyUser?.email?.address) return;
    
    try {
      const response = await fetch(`/api/users/profile?email=${encodeURIComponent(privyUser.email.address)}`);
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  return {
    user: userProfile,
    privyUser,
    authenticated,
    loading,
    error,
    refreshProfile
  };
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { TrendingUp, TrendingDown, User, Wallet, Smartphone, RefreshCw } from 'lucide-react';
import VirtualCard from '@/components/virtual-card';
import DonateModal from '@/components/screens/donate-modal';
import DepositReceiveDialog from '@/components/deposit-receive-dialog';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/lib/toast';

interface Balance {
  tokenId: string;
  symbol: string;
  tokenName: string;
  network: string;
  balance: string;
  balanceUsd: string;
  priceUsd: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  token: string;
  network: string;
  status: string;
  fromAddress?: string;
  toAddress?: string;
  createdAt: string;
  confirmedAt?: string;
}

export default function DashboardScreenV2() {
  const router = useRouter();
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [userId, setUserId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');

  // Resolve wallet address from Privy user or embedded wallets
  useEffect(() => {
    const fromUser = user?.wallet?.address;
    const fromEmbedded =
      wallets.find((w) => w.walletClientType === 'privy')?.address ||
      wallets[0]?.address;
    const resolved = fromUser || fromEmbedded || '';
    if (resolved) {
      setWalletAddress(resolved);
    }
  }, [user, wallets]);
  const [totalBalance, setTotalBalance] = useState('0.00');
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hideBalance, setHideBalance] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get wallet address from Privy user - now handled above via useWallets

  // Get display name from user data
  let displayName = 'User';
  
  if (user?.email?.address) {
    displayName = user.email.address.split('@')[0];
  } else if (walletAddress) {
    displayName = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }

  // Fetch user profile and data
  const fetchUserData = async () => {
    const email = user?.email?.address;
    const wallet = walletAddress;
    const identifier = email || wallet;
    if (!identifier) return;

    try {
      // Get user profile
      const profileResponse = email
        ? await apiClient.getUserProfile(email)
        : await apiClient.getUserProfile(wallet!);
      
      if (profileResponse.success && profileResponse.data) {
        const data = profileResponse.data as any;
        setUserId(data.user.id);
        setKycStatus(data.kyc?.status || 'none');
        
        // Fetch balances
        const balancesResponse = await apiClient.getBalances(data.user.id);
        if (balancesResponse.success && balancesResponse.data) {
          const balanceData = balancesResponse.data as any;
          setTotalBalance(balanceData.totalBalanceUsd || '0.00');
          setBalances(balanceData.balances || []);
        }

        // Fetch transactions
        const txResponse = await apiClient.getTransactions(data.user.id, 10);
        if (txResponse.success && txResponse.data) {
          const txData = txResponse.data as any;
          setTransactions(txData.transactions || []);
        }
      } else {
        // User doesn't exist, register them
        await apiClient.registerUser(
          email || wallet!,
          wallet,
          displayName
        );
        // Retry fetching data
        await fetchUserData();
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      toast.error('Error', 'Failed to load user data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData();
  };

  useEffect(() => {
    if (authenticated && (user?.email?.address || walletAddress)) {
      fetchUserData();
    }
  }, [authenticated, user?.email?.address, walletAddress]);

  const handleKycRedirect = () => {
    router.push('/kyc/welcome');
  };

  // Network icon mapping
  const networkIcons: Record<string, string> = {
    'Celo': '/celo-coin.png',
    'Base': '/coinbase.png',
    'Solana': '/solana.jpeg',
    'Stellar': '/stellar.jpeg',
  };

  // Token icon mapping
  const tokenIcons: Record<string, string> = {
    'USDT': '/usdt.png',
    'USDC': '/usdc.png',
    'cUSD': '/cUSD.jpeg',
  };

  if (isLoading) {
    return (
      <MobileLayout showBottomNav={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-[#1db584] mx-auto mb-4" />
            <p className="text-gray-600">Loading your wallet...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-[#1db584] to-[#15a576] pb-8 pt-6">
          <ResponsiveContainer maxWidth="lg" padding="md">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Welcome back</p>
                <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="rounded-full bg-white/20 p-2 hover:bg-white/30 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <RefreshCw className={`h-5 w-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <Link href="/profile" className="rounded-full bg-white/20 p-2 hover:bg-white/30 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </Link>
              </div>
            </div>

            <VirtualCard
              balance={parseFloat(totalBalance)}
              walletAddress={walletAddress}
              hideBalance={hideBalance}
              onToggleBalance={() => setHideBalance(!hideBalance)}
              onSend={() => setIsDepositOpen(true)}
              onReceive={() => setIsWithdrawOpen(true)}
            />
          </ResponsiveContainer>
        </div>

        <ResponsiveContainer maxWidth="lg" padding="md" className="-mt-6 relative z-10">
          {/* Deposit and Withdraw buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#1db584] px-2 py-3 shadow-md hover:shadow-lg transition-shadow min-h-[44px]"
            >
              <Wallet className="h-4 w-4 text-white" />
              <span className="text-xs font-semibold text-white">Deposit</span>
            </button>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#1db584] px-2 py-3 shadow-md hover:shadow-lg transition-shadow min-h-[44px]"
            >
              <Smartphone className="h-4 w-4 text-white" />
              <span className="text-xs font-semibold text-white">Withdraw</span>
            </button>
          </div>
        </ResponsiveContainer>

        <ResponsiveContainer maxWidth="lg" padding="md" className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Your Assets</h2>
          {balances.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No assets yet</p>
              <p className="text-gray-500 text-xs mt-1">Deposit crypto to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {balances.map((balance, index) => (
                <div key={index} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 items-center justify-center">
                      <Image 
                        src={tokenIcons[balance.symbol] || '/usdc.png'} 
                        alt={balance.symbol}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full"
                      />
                      {networkIcons[balance.network] && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white border border-gray-200">
                          <Image 
                            src={networkIcons[balance.network]} 
                            alt={balance.network}
                            width={16}
                            height={16}
                            className="h-4 w-4 rounded-full"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{balance.symbol}</p>
                      <p className="text-sm text-gray-600">{balance.network}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${balance.balanceUsd}</p>
                    <p className="text-xs text-gray-500">{parseFloat(balance.balance).toFixed(2)} {balance.symbol}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ResponsiveContainer>

        <ResponsiveContainer maxWidth="lg" padding="md" className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-600 text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      tx.type === 'deposit' || tx.type === 'receive' ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'receive' ? (
                        <TrendingDown className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">
                        {tx.type} {tx.token}
                      </p>
                      <p className="text-sm text-gray-600">{tx.network}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.type === 'deposit' || tx.type === 'receive' ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'receive' ? '+' : '-'}${tx.amount}
                    </p>
                    <p className={`text-xs ${
                      tx.status === 'confirmed' ? 'text-green-600' : 
                      tx.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ResponsiveContainer>

        <DonateModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
        
        {userId && (
          <>
            <DepositReceiveDialog
              isOpen={isDepositOpen}
              type="deposit"
              walletAddress={walletAddress}
              kycStatus={kycStatus}
              onKycRedirect={handleKycRedirect}
              onClose={() => {
                setIsDepositOpen(false);
                handleRefresh();
              }}
            />

            <DepositReceiveDialog
              isOpen={isWithdrawOpen}
              type="withdraw"
              walletAddress={walletAddress}
              kycStatus={kycStatus}
              onKycRedirect={handleKycRedirect}
              onClose={() => {
                setIsWithdrawOpen(false);
                handleRefresh();
              }}
            />
          </>
        )}
      </div>
    </MobileLayout>
  );
}
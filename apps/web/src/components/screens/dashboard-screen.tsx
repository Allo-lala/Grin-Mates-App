'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, User, ArrowUpRight, ArrowDownLeft, Wallet, Smartphone } from 'lucide-react';
import VirtualCard from '@/components/virtual-card';
import DonateModal from '@/components/screens/donate-modal';
import DepositReceiveDialog from '@/components/deposit-receive-dialog';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { useUser } from '@/hooks/useUser';
import { useWallet } from '@/hooks/useWallet';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardScreen() {
  const router = useRouter();
  const { user: userProfile, loading: userLoading } = useUser();
  const { wallet, loading: walletLoading, refreshWallet } = useWallet(userProfile?.id);
  const [hideBalance, setHideBalance] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Get display name and wallet address
  const displayName = userProfile?.displayName || 'User';
  const walletAddress = userProfile?.walletAddress || userProfile?.email || 'Unknown';
  const kycStatus = userProfile?.kyc?.status || 'none';
  const totalBalance = wallet?.totalBalanceUsd || '0.00';

  // Fetch transactions
  useEffect(() => {
    async function fetchTransactions() {
      if (!userProfile?.id) return;

      try {
        const response = await fetch(`/api/transactions?userId=${userProfile.id}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions || []);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    }

    fetchTransactions();
  }, [userProfile?.id]);

  const handleKycRedirect = () => {
    router.push('/kyc/welcome');
  };

  // Show loading state
  if (userLoading || walletLoading) {
    return (
      <MobileLayout showBottomNav={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1db584] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your wallet...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Convert wallet balances to assets format
  const assets = wallet?.balances.map((balance) => ({
    name: balance.symbol,
    chain: balance.network,
    balance: parseFloat(balance.balance),
    change: 0, // TODO: Calculate from price history
    icon: `/${balance.symbol.toLowerCase()}.png`,
    chainIcon: balance.network === 'Base' ? '/coinbase.png' : 
               balance.network === 'Celo' ? '/celo-coin.png' :
               balance.network === 'Solana' ? '/solana.jpeg' :
               balance.network === 'Stellar' ? '/stellar.jpeg' : null,
    color: balance.symbol === 'USDC' ? '#2775CA' : 
           balance.symbol === 'USDT' ? '#26A17B' : 
           '#FBCC5C',
  })) || [];

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
              <Link href="/profile" className="rounded-full bg-white/20 p-2 hover:bg-white/30 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </Link>
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
          {assets.length > 0 ? (
            <div className="space-y-3">
              {assets.map((asset, index) => (
                <div key={index} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 items-center justify-center">
                      <Image 
                        src={asset.icon} 
                        alt={`${asset.name} icon`}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full"
                      />
                      {asset.chainIcon && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white border border-gray-200">
                          <Image 
                            src={asset.chainIcon} 
                            alt={`${asset.chain} chain icon`}
                            width={16}
                            height={16}
                            className="h-4 w-4 rounded-full"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{asset.name}</p>
                      <p className="text-sm text-gray-600">{asset.chain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${asset.balance.toLocaleString()}</p>
                    {asset.change !== 0 && (
                      <div className={`flex items-center gap-1 text-sm ${
                        asset.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {asset.change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{Math.abs(asset.change)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-600">No assets yet. Make a deposit to get started!</p>
            </div>
          )}
        </ResponsiveContainer>

        <ResponsiveContainer maxWidth="lg" padding="md" className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Recent Transactions</h2>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      tx.type.includes('deposit') || tx.type.includes('receive') ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {tx.type.includes('deposit') || tx.type.includes('receive') ? (
                        <ArrowDownLeft className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {tx.type.includes('deposit') || tx.type.includes('receive') ? 'Received' : 'Sent'} {tx.token}
                      </p>
                      <p className="text-sm text-gray-600">
                        {tx.type.includes('deposit') || tx.type.includes('receive') 
                          ? `From ${tx.fromAddress?.slice(0, 6)}...${tx.fromAddress?.slice(-4)}` 
                          : `To ${tx.toAddress?.slice(0, 6)}...${tx.toAddress?.slice(-4)}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.type.includes('deposit') || tx.type.includes('receive') ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {tx.type.includes('deposit') || tx.type.includes('receive') ? '+' : '-'}${parseFloat(tx.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{tx.network}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-600">No transactions yet</p>
            </div>
          )}
        </ResponsiveContainer>

        <DonateModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
        <DepositReceiveDialog
          isOpen={isDepositOpen}
          type="deposit"
          walletAddress={walletAddress}
          kycStatus={kycStatus}
          onKycRedirect={handleKycRedirect}
          onClose={() => {
            setIsDepositOpen(false);
            refreshWallet(); // Refresh wallet after deposit
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
            refreshWallet(); // Refresh wallet after withdrawal
          }}
        />
      </div>
    </MobileLayout>
  );
}
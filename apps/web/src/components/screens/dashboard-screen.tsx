'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Ticket, Heart, TrendingUp, TrendingDown, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import VirtualCard from '@/components/virtual-card';
import DonateModal from '@/components/screens/donate-modal';
import SendReceiveDialog from '@/components/send-receive-dialog';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import Link from 'next/link';

export default function DashboardScreen() {
  const { user } = usePrivy();
  const [balance, setBalance] = useState('2,450.50');
  const [hideBalance, setHideBalance] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  // Get wallet address from Privy user
  const walletAddress = user?.wallet?.address || user?.email?.address || 'Unknown';
  
  // Get display name from user data
  let displayName = 'User';
  
  if (user?.email?.address) {
    displayName = user.email.address.split('@')[0];
  } else if (user?.wallet?.address) {
    displayName = `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`;
  }

  const assets = [
    {
      name: 'USDC',
      chain: 'Base',
      balance: 1250.50,
      change: 2.5,
      icon: '/usdc-base-icon.png',
      color: '#2775CA',
    },
    {
      name: 'USDC',
      chain: 'Avalanche',
      balance: 890.25,
      change: -1.2,
      icon: '/usdc-avalanche-icon.png',
      color: '#E84142',
    },
    {
      name: 'CELO',
      chain: 'Celo',
      balance: 3420.75,
      change: 5.8,
      icon: '/celo-icon.png',
      color: '#FBCC5C',
    },
  ];

  const transactions = [
    {
      id: '1',
      type: 'receive' as const,
      asset: 'USDC',
      chain: 'Base',
      amount: 100,
      from: '0xabcd...ef12',
      timestamp: new Date('2024-01-20T10:30:00'),
    },
    {
      id: '2',
      type: 'send' as const,
      asset: 'CELO',
      chain: 'Celo',
      amount: 50,
      to: '0x9876...5432',
      timestamp: new Date('2024-01-19T15:45:00'),
    },
    {
      id: '3',
      type: 'receive' as const,
      asset: 'USDC',
      chain: 'Avalanche',
      amount: 75.50,
      from: '0x1111...2222',
      timestamp: new Date('2024-01-18T09:20:00'),
    },
  ];

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
              balance={parseFloat(balance.replace(',', ''))}
              walletAddress={walletAddress}
              hideBalance={hideBalance}
              onToggleBalance={() => setHideBalance(!hideBalance)}
              onSend={() => setIsSendOpen(true)}
              onReceive={() => setIsReceiveOpen(true)}
            />
          </ResponsiveContainer>
        </div>

        <ResponsiveContainer maxWidth="lg" padding="md" className="-mt-6 relative z-10">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/events"
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 shadow-md hover:shadow-lg transition-shadow min-h-[44px]"
            >
              <Ticket className="h-5 w-5 text-[#1db584]" />
              <span className="font-semibold text-gray-900">Events</span>
            </Link>
            <button
              onClick={() => setIsDonateOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 shadow-md hover:shadow-lg transition-shadow min-h-[44px]"
            >
              <Heart className="h-5 w-5 text-[#1db584]" />
              <span className="font-semibold text-gray-900">Donate</span>
            </button>
          </div>
        </ResponsiveContainer>

        <ResponsiveContainer maxWidth="lg" padding="md" className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Your Assets</h2>
          <div className="space-y-3">
            {assets.map((asset, index) => (
              <div key={index} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${asset.color}20` }}
                  >
                    <div
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: asset.color }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{asset.name}</p>
                    <p className="text-sm text-gray-500">{asset.chain}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${asset.balance.toLocaleString()}</p>
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
                </div>
              </div>
            ))}
          </div>
        </ResponsiveContainer>

        <ResponsiveContainer maxWidth="lg" padding="md" className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Recent Transactions</h2>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${
                    tx.type === 'receive' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    {tx.type === 'receive' ? (
                      <ArrowDownLeft className={`h-5 w-5 text-green-600`} />
                    ) : (
                      <ArrowUpRight className={`h-5 w-5 text-orange-600`} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {tx.type === 'receive' ? 'Received' : 'Sent'} {tx.asset}
                    </p>
                    <p className="text-sm text-gray-500">
                      {tx.type === 'receive' ? `From ${tx.from}` : `To ${tx.to}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.type === 'receive' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {tx.type === 'receive' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{tx.chain}</p>
                </div>
              </div>
            ))}
          </div>
        </ResponsiveContainer>

        <DonateModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
        <SendReceiveDialog
          isOpen={isSendOpen}
          type="send"
          walletAddress={walletAddress}
          onClose={() => setIsSendOpen(false)}
        />

        <SendReceiveDialog
          isOpen={isReceiveOpen}
          type="receive"
          walletAddress={walletAddress}
          onClose={() => setIsReceiveOpen(false)}
        />
      </div>
    </MobileLayout>
  );
}

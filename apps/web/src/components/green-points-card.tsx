'use client';

import { useState } from 'react';
import { Eye, EyeOff, Leaf, TrendingUp, Gift, Recycle } from 'lucide-react';

interface GreenPointsCardProps {
  points: number;
  hideBalance: boolean;
  onToggleBalance: () => void;
}

export default function GreenPointsCard({
  points,
  hideBalance,
  onToggleBalance,
}: GreenPointsCardProps) {
  const [copied, setCopied] = useState(false);

  const formatPoints = (points: number) => {
    return points.toLocaleString();
  };

  const recentEarnings = [
    { activity: 'Gas Refill Purchase', points: 25, date: '2 hours ago' },
    { activity: 'Plastic Recycling', points: 15, date: '1 day ago' },
    { activity: 'Solar Panel Order', points: 120, date: '3 days ago' },
  ];

  return (
    <div className="space-y-4">
      {/* Green Points Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/20" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute right-8 top-1/2 h-16 w-16 rounded-full bg-white/15" />
        </div>

        <div className="relative">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6" />
              <span className="text-lg font-semibold">Green Points</span>
            </div>
            <button
              onClick={onToggleBalance}
              className="rounded-full p-2 hover:bg-white/20 transition-colors"
            >
              {hideBalance ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Balance */}
          <div className="mb-4">
            <p className="text-sm opacity-80">Available Balance</p>
            <p className="text-3xl font-bold">
              {hideBalance ? '••••••' : formatPoints(points)} GP
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>+{formatPoints(160)} this month</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Gift className="h-4 w-4" />
              <span>Eco Rewards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Earnings */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-semibold text-gray-900">Recent Earnings</h3>
        <div className="space-y-3">
          {recentEarnings.map((earning, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <Recycle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{earning.activity}</p>
                  <p className="text-xs text-gray-500">{earning.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">+{earning.points} GP</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to Earn More */}
      <div className="rounded-xl bg-green-50 p-4">
        <h3 className="mb-2 font-semibold text-green-800">How to Earn More Green Points</h3>
        <ul className="space-y-1 text-sm text-green-700">
          <li>• Purchase eco-friendly services with crypto</li>
          <li>• Recycle at smart recycling stations</li>
          <li>• Report wildlife conservation data</li>
          <li>• Use solar and renewable energy services</li>
        </ul>
      </div>
    </div>
  );
}
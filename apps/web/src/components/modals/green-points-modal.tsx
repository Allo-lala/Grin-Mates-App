'use client';

import { useState } from 'react';
import { X, Eye, EyeOff, Leaf, TrendingUp, Gift, Recycle, Flame, Sun, Star, Trophy, Target } from 'lucide-react';

interface GreenPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
}

export default function GreenPointsModal({ isOpen, onClose, points }: GreenPointsModalProps) {
  const [hideBalance, setHideBalance] = useState(false);

  if (!isOpen) return null;

  const formatPoints = (points: number) => {
    return points.toLocaleString();
  };

  const recentEarnings = [
    { activity: 'Gas Refill Purchase', points: 25, date: '2 hours ago', type: 'gas' },
    { activity: 'Plastic Recycling', points: 15, date: '1 day ago', type: 'recycle' },
    { activity: 'Solar Panel Order', points: 120, date: '3 days ago', type: 'solar' },
    { activity: 'Wildlife Report', points: 50, date: '5 days ago', type: 'wildlife' },
    { activity: 'Tree Planting Donation', points: 75, date: '1 week ago', type: 'tree' },
  ];

  const achievements = [
    { title: 'Eco Warrior', description: 'Earned 1000+ Green Points', icon: Trophy, unlocked: true },
    { title: 'Solar Champion', description: 'Used solar services 5 times', icon: Sun, unlocked: true },
    { title: 'Recycling Hero', description: 'Recycled 50+ items', icon: Recycle, unlocked: false },
    { title: 'Wildlife Guardian', description: 'Reported 10+ wildlife sightings', icon: Target, unlocked: false },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'gas':
        return <Flame className="h-4 w-4 text-orange-500" />;
      case 'recycle':
        return <Recycle className="h-4 w-4 text-green-600" />;
      case 'solar':
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'wildlife':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'tree':
        return <Leaf className="h-4 w-4 text-green-600" />;
      default:
        return <Leaf className="h-4 w-4 text-green-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6" />
              <span className="text-lg font-semibold">Green Points</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="rounded-full p-2 hover:bg-white/20 transition-colors"
              >
                {hideBalance ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
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
              <span>+{formatPoints(285)} this month</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Gift className="h-4 w-4" />
              <span>Eco Rewards</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Recent Earnings */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Recent Earnings
            </h3>
            <div className="space-y-3">
              {recentEarnings.map((earning, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2 bg-white">
                      {getActivityIcon(earning.type)}
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

          {/* Achievements */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Achievements
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border-2 ${
                      achievement.unlocked 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${
                        achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          achievement.unlocked ? 'text-green-800' : 'text-gray-600'
                        }`}>
                          {achievement.title}
                        </p>
                        <p className={`text-xs ${
                          achievement.unlocked ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <div className="text-green-600">
                          <Trophy className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How to Earn More */}
          <div className="rounded-xl bg-green-50 p-4">
            <h3 className="mb-3 font-semibold text-green-800 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              How to Earn More Green Points
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Purchase eco-friendly services with crypto
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Recycle at smart recycling stations
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Report wildlife conservation data
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Use solar and renewable energy services
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Donate to environmental organizations
              </li>
            </ul>
          </div>

          {/* Redeem Points */}
          <div className="rounded-xl bg-blue-50 p-4">
            <h3 className="mb-3 font-semibold text-blue-800 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Redeem Your Points
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Use your Green Points to get discounts on eco-friendly services or donate to environmental causes.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Explore Rewards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
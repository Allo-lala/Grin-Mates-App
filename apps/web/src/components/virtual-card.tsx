'use client';

import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface VirtualCardProps {
  balance: number;
  hideBalance: boolean;
  onToggleBalance: () => void;
  walletAddress: string;
  onSend?: () => void;
  onReceive?: () => void;
}

export default function VirtualCard({
  balance,
  hideBalance,
  onToggleBalance,
  walletAddress,
}: VirtualCardProps) {
  const [copied, setCopied] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setShowCopiedMessage(true);
    setTimeout(() => {
      setCopied(false);
      setShowCopiedMessage(false);
    }, 2000);
  };

  return (
    <div className="relative">
      {/* Copied Message Toast */}
      {showCopiedMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Wallet address copied</span>
        </div>
      )}

      <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200/60 p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
        {/* Enhanced eco-friendly background patterns */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
            {/* More detailed leaf patterns */}
            <g fill="currentColor">
              <path d="M50 50 Q55 45, 60 50 Q65 55, 70 50 Q65 45, 60 40 Q55 45, 50 50" />
              <path d="M120 80 Q125 75, 130 80 Q135 85, 140 80 Q135 75, 130 70 Q125 75, 120 80" />
              <path d="M200 30 Q205 25, 210 30 Q215 35, 220 30 Q215 25, 210 20 Q205 25, 200 30" />
              <path d="M300 100 Q305 95, 310 100 Q315 105, 320 100 Q315 95, 310 90 Q305 95, 300 100" />
              <path d="M80 150 Q85 145, 90 150 Q95 155, 100 150 Q95 145, 90 140 Q85 145, 80 150" />
              <path d="M250 160 Q255 155, 260 160 Q265 165, 270 160 Q265 155, 260 150 Q255 155, 250 160" />
            </g>
            {/* Organic flowing lines */}
            <g stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4">
              <path d="M30 120 Q50 115, 70 120 Q90 125, 110 120 Q130 115, 150 120" />
              <path d="M180 60 Q200 55, 220 60 Q240 65, 260 60 Q280 55, 300 60" />
              <path d="M150 180 Q170 175, 190 180 Q210 185, 230 180 Q250 175, 270 180" />
            </g>
          </svg>
        </div>
        
        {/* Floating accent elements */}
        <div className="absolute top-6 right-6 w-3 h-3 bg-green-400/40 rounded-full animate-pulse" />
        <div className="absolute bottom-8 left-8 w-2 h-2 bg-emerald-400/30 rounded-full" />
        <div className="absolute top-1/3 left-6 w-1.5 h-1.5 bg-teal-400/50 rounded-full" />
        <div className="absolute bottom-1/3 right-8 w-1 h-1 bg-lime-400/40 rounded-full" />

        {/* Content */}
        <div className="relative space-y-6">
          {/* Header with Grin Mates branding */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                Grin Mates
              </h1>
              <p className="text-base text-gray-600 italic font-medium">
                Engage • Empower • Earn
              </p>
            </div>
            <button
              onClick={onToggleBalance}
              className="p-2 rounded-full hover:bg-green-100/50 transition-all duration-200 group/btn"
              title={hideBalance ? 'Show balance' : 'Hide balance'}
            >
              {hideBalance ? (
                <EyeOff className="h-5 w-5 text-gray-600 group-hover/btn:text-green-700 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-gray-600 group-hover/btn:text-green-700 transition-colors" />
              )}
            </button>
          </div>

          {/* Balance Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm text-gray-600 font-medium">Total Balance</p>
            </div>
            <p className="text-5xl font-bold text-gray-800 tracking-tight">
              {hideBalance ? '•••••' : `$${balance.toLocaleString()}`}
            </p>
          </div>

          {/* Wallet Address Section */}
          <div className="flex items-center justify-between pt-4 border-t border-green-200/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Wallet Address
                </p>
              </div>
              <p className="text-sm font-mono text-gray-700 font-medium">
                {walletAddress.length > 16
                  ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`
                  : walletAddress}
              </p>
            </div>
            <button
              onClick={handleCopyAddress}
              className="p-2 rounded-full hover:bg-green-100/50 transition-all duration-200 group/copy"
              title="Copy wallet address"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 text-gray-600 group-hover/copy:text-green-700 transition-colors" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
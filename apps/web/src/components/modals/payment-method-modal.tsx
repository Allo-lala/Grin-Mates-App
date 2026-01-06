'use client';

import { useState } from 'react';
import { X, Coins, Wallet, CreditCard, Leaf } from 'lucide-react';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSelect: (method: 'crypto' | 'points') => void;
  totalPrice: number;
  greenPointsPrice: number;
  userGreenPoints: number;
  serviceName: string;
}

export default function PaymentMethodModal({ 
  isOpen, 
  onClose, 
  onPaymentSelect, 
  totalPrice, 
  greenPointsPrice, 
  userGreenPoints, 
  serviceName 
}: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'points' | null>(null);
  const hasEnoughPoints = userGreenPoints >= greenPointsPrice;

  const handleConfirm = () => {
    if (selectedMethod) {
      onPaymentSelect(selectedMethod);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Choose Payment Method</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Service Info */}
          <div className="rounded-lg bg-gray-50 p-3">
            <h3 className="font-medium text-gray-900 mb-1">{serviceName}</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold text-gray-900">{totalPrice} ETH</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            {/* Crypto Payment */}
            <button
              onClick={() => setSelectedMethod('crypto')}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                selectedMethod === 'crypto'
                  ? 'border-[#1db584] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#1db584] p-2">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pay with Crypto</h3>
                    <p className="text-sm text-gray-600">Use your connected wallet</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1db584]">{totalPrice} ETH</p>
                  <p className="text-xs text-gray-500">≈ ${(totalPrice * 3000).toFixed(0)}</p>
                </div>
              </div>
            </button>

            {/* Green Points Payment */}
            <button
              onClick={() => hasEnoughPoints && setSelectedMethod('points')}
              disabled={!hasEnoughPoints}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                selectedMethod === 'points'
                  ? 'border-green-500 bg-green-50'
                  : hasEnoughPoints
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-200 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${hasEnoughPoints ? 'bg-green-600' : 'bg-gray-400'}`}>
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${hasEnoughPoints ? 'text-gray-900' : 'text-gray-500'}`}>
                      Pay with Green Points
                    </h3>
                    <p className={`text-sm ${hasEnoughPoints ? 'text-gray-600' : 'text-gray-400'}`}>
                      Eco-friendly reward points
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${hasEnoughPoints ? 'text-green-600' : 'text-gray-400'}`}>
                    {greenPointsPrice} GP
                  </p>
                  <p className={`text-xs ${hasEnoughPoints ? 'text-gray-500' : 'text-gray-400'}`}>
                    Balance: {userGreenPoints} GP
                  </p>
                </div>
              </div>
              {!hasEnoughPoints && (
                <div className="mt-2 text-xs text-red-500">
                  Insufficient Green Points. Need {greenPointsPrice - userGreenPoints} more GP.
                </div>
              )}
            </button>
          </div>

          {/* Green Points Info */}
          <div className="rounded-lg bg-green-50 p-3">
            <div className="flex items-start gap-2">
              <Coins className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Earn Green Points</p>
                <p className="text-xs text-green-700 mt-1">
                  {selectedMethod === 'crypto' 
                    ? `You'll earn ${Math.floor(totalPrice * 1000)} Green Points for this purchase!`
                    : 'Use eco-services and recycle to earn more Green Points'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!selectedMethod}
            className="w-full rounded-lg bg-[#1db584] py-3 text-sm font-semibold text-white hover:bg-[#15a576] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            {selectedMethod === 'crypto' 
              ? `Pay ${totalPrice} ETH` 
              : selectedMethod === 'points'
              ? `Pay ${greenPointsPrice} Green Points`
              : 'Select Payment Method'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
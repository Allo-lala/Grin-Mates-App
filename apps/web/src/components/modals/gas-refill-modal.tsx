'use client';

import { useState } from 'react';
import { X, Flame, Wallet, CreditCard } from 'lucide-react';
import PaymentMethodModal from './payment-method-modal';

interface GasRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GasSize {
  id: string;
  size: string;
  weight: string;
  price: number;
  greenPoints: number;
  description: string;
}

export default function GasRefillModal({ isOpen, onClose }: GasRefillModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Mock user Green Points balance
  const userGreenPoints = 1250;

  const gasSizes: GasSize[] = [
    {
      id: 'small',
      size: 'Small',
      weight: '3kg',
      price: 0.015,
      greenPoints: 150,
      description: 'Perfect for small households'
    },
    {
      id: 'medium',
      size: 'Medium',
      weight: '6kg',
      price: 0.025,
      greenPoints: 250,
      description: 'Ideal for medium families'
    },
    {
      id: 'large',
      size: 'Large',
      weight: '12kg',
      price: 0.045,
      greenPoints: 450,
      description: 'Best for large families'
    }
  ];

  const selectedGas = gasSizes.find(gas => gas.id === selectedSize);

  const handlePayment = async () => {
    if (!selectedSize) {
      alert('Please select a gas cylinder size');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentMethod = async (method: 'crypto' | 'points') => {
    setIsProcessing(true);

    try {
      console.log('Processing gas refill payment:', {
        size: selectedGas?.size,
        weight: selectedGas?.weight,
        price: selectedGas?.price,
        greenPoints: selectedGas?.greenPoints,
        paymentMethod: method,
        timestamp: new Date().toISOString()
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (method === 'crypto') {
        const earnedPoints = Math.floor((selectedGas?.price || 0) * 1000);
        alert(`Payment successful! Your ${selectedGas?.weight} gas cylinder will be delivered soon. You earned ${earnedPoints} Green Points!`);
      } else {
        alert(`Payment successful with Green Points! Your ${selectedGas?.weight} gas cylinder will be delivered soon.`);
      }
      
      setSelectedSize('');
      onClose();
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Gas Refill</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Service Info */}
          <div className="rounded-lg bg-white border border-green-200 p-3">
            <div className="flex items-start gap-2">
              <Flame className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Cooking Gas Delivery</p>
                <p className="text-xs text-gray-600 mt-1">
                  Select your cylinder size and pay with crypto or Green Points
                </p>
              </div>
            </div>
          </div>

          {/* Gas Size Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Cylinder Size
            </label>
            <div className="space-y-3">
              {gasSizes.map((gas) => (
                <button
                  key={gas.id}
                  onClick={() => setSelectedSize(gas.id)}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    selectedSize === gas.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{gas.size}</span>
                        <span className="text-sm text-gray-600">({gas.weight})</span>
                      </div>
                      <p className="text-xs text-gray-500">{gas.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{gas.price} ETH</p>
                      <p className="text-xs text-green-600">{gas.greenPoints} GP</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Summary */}
          {selectedGas && (
            <div className="rounded-lg bg-white border border-gray-200 p-3">
              <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {selectedGas.size} Cylinder ({selectedGas.weight})
                </span>
                <span className="font-semibold text-gray-900">
                  {selectedGas.price} ETH
                </span>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing || !selectedSize}
            className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Choose Payment Method'}
          </button>

          {/* Payment Info */}
          <div className="text-xs text-gray-500 text-center">
            <p>Pay with crypto or Green Points</p>
            <p className="mt-1">Delivery within 2-4 hours after payment confirmation</p>
          </div>
        </div>

        {/* Payment Method Modal */}
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSelect={handlePaymentMethod}
          totalPrice={selectedGas?.price || 0}
          greenPointsPrice={selectedGas?.greenPoints || 0}
          userGreenPoints={userGreenPoints}
          serviceName={`${selectedGas?.size} Gas Cylinder (${selectedGas?.weight})`}
        />
      </div>
    </div>
  );
}
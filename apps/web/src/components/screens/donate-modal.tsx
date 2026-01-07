'use client';

import { useState } from 'react';
import { X, Wallet, Coins, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonateModal({ isOpen, onClose }: DonateModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'points' | null>(null);
  const [amount, setAmount] = useState('');
  const [greenPoints, setGreenPoints] = useState(1250);

  if (!isOpen) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDonate = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate donation processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (selectedMethod === 'wallet') {
        console.log(' Donating from wallet:', amount);
        // Show success notification - Requirements: 7.3
        toast.success('Donation Successful!', `You donated ${amount} USDC to support climate action.`);
      } else if (selectedMethod === 'points') {
        console.log(' Donating green points:', amount);
        setGreenPoints(prev => prev - parseInt(amount));
        // Show success notification - Requirements: 7.3
        toast.success('Donation Successful!', `You donated ${amount} green points to support climate action.`);
      }
      
      onClose();
      setAmount('');
      setSelectedMethod(null);
    } catch (error) {
      // Show error notification - Requirements: 7.4
      toast.error('Donation Failed', 'Please try again or contact support if the issue persists.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-gray-900">Make a Donation</h2>

        <div className="mb-6 space-y-3">
          <button
            onClick={() => setSelectedMethod('wallet')}
            className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
              selectedMethod === 'wallet'
                ? 'border-[#1db584] bg-[#1db584]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-3 ${
                selectedMethod === 'wallet' ? 'bg-[#1db584]' : 'bg-gray-100'
              }`}>
                <Wallet className={`h-5 w-5 ${
                  selectedMethod === 'wallet' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Donate with Wallet</p>
                <p className="text-sm text-gray-500">Use USDC or CELO</p>
              </div>
              {selectedMethod === 'wallet' && (
                <div className="h-5 w-5 rounded-full bg-[#1db584] flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => setSelectedMethod('points')}
            className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
              selectedMethod === 'points'
                ? 'border-[#1db584] bg-[#1db584]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-3 ${
                selectedMethod === 'points' ? 'bg-[#1db584]' : 'bg-gray-100'
              }`}>
                <Coins className={`h-5 w-5 ${
                  selectedMethod === 'points' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Donate with Green Points</p>
                <p className="text-sm text-gray-500">Available: {greenPoints} points</p>
              </div>
              {selectedMethod === 'points' && (
                <div className="h-5 w-5 rounded-full bg-[#1db584] flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </div>
          </button>
        </div>

        {selectedMethod && (
          <div className="mb-6">
            <Input
              label={`Amount ${selectedMethod === 'points' ? '(Points)' : '(USDC)'}`}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              error={
                selectedMethod === 'points' && amount && parseInt(amount) > greenPoints
                  ? 'Insufficient green points'
                  : undefined
              }
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            size="lg"
            fullWidth
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDonate}
            disabled={!selectedMethod || !amount || (selectedMethod === 'points' && parseInt(amount) > greenPoints)}
            isLoading={isSubmitting}
            loadingText="Processing..."
            variant="primary"
            size="lg"
            fullWidth
          >
            Donate
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DonateModal;

'use client';

import { useState } from 'react';
import { X, Heart, Wallet, ExternalLink, Copy, Check } from 'lucide-react';

interface Organization {
  name: string;
  description: string;
  ethAddress: string;
  logo: string;
  focus: string;
}

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
}

export default function DonationModal({ isOpen, onClose, organization }: DonationModalProps) {
  const [donationAmount, setDonationAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const presetAmounts = ['0.01', '0.05', '0.1', '0.5', '1.0'];

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(organization.ethAddress);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    setIsDonating(true);

    try {
      // TODO: Implement actual blockchain donation
      // This would involve:
      // 1. Connect to user's wallet
      // 2. Create transaction to organization's ETH address
      // 3. Submit transaction
      // 4. Wait for confirmation
      
      console.log('Donating:', {
        amount: donationAmount,
        to: organization.ethAddress,
        organization: organization.name
      });

      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      alert(`Thank you! Your donation of ${donationAmount} ETH to ${organization.name} has been submitted.`);
      
      setDonationAmount('');
      onClose();
      
    } catch (error) {
      console.error('Donation failed:', error);
      alert('Donation failed. Please try again.');
    } finally {
      setIsDonating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Make a Donation</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Organization Info */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{organization.logo}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{organization.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{organization.description}</p>
                <p className="text-xs text-gray-500">{organization.focus}</p>
              </div>
            </div>
          </div>

          {/* ETH Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Donation Address
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 p-3">
              <Wallet className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="font-mono text-xs text-gray-600 flex-1 truncate">
                {organization.ethAddress}
              </span>
              <button
                onClick={copyAddress}
                className="rounded p-1 hover:bg-gray-100 transition-colors"
              >
                {addressCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Donation Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Donation Amount (ETH)
            </label>
            
            {/* Preset Amounts */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDonationAmount(amount)}
                  className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                    donationAmount === amount
                      ? 'border-[#1db584] bg-[#1db584] text-white'
                      : 'border-gray-300 text-gray-700 hover:border-[#1db584]'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <input
              type="number"
              step="0.001"
              min="0"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              placeholder="Enter custom amount"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1db584] focus:outline-none focus:ring-1 focus:ring-[#1db584]"
            />
          </div>

          {/* Impact Message */}
          {donationAmount && parseFloat(donationAmount) > 0 && (
            <div className="rounded-lg bg-green-50 p-3">
              <div className="flex items-start gap-2">
                <Heart className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Your Impact</p>
                  <p className="text-xs text-green-700 mt-1">
                    Your donation of {donationAmount} ETH will help {organization.name} continue their vital work in {organization.focus.toLowerCase()}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Donate Button */}
          <button
            onClick={handleDonate}
            disabled={isDonating || !donationAmount || parseFloat(donationAmount) <= 0}
            className="w-full rounded-lg bg-[#1db584] py-3 text-sm font-semibold text-white hover:bg-[#15a576] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Heart className="h-4 w-4" />
            {isDonating ? 'Processing Donation...' : `Donate ${donationAmount || '0'} ETH`}
          </button>

          {/* Disclaimer */}
          <div className="text-xs text-gray-500 text-center">
            <p>Donations are processed on the Ethereum blockchain.</p>
            <p className="mt-1">Transaction fees may apply.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Send, Download, AlertTriangle, Wallet, CreditCard, Shield, CheckCircle, Smartphone, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';

// Ethereum icon component
const EthereumIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
  </svg>
);

interface DepositReceiveDialogProps {
  isOpen: boolean;
  type: 'deposit' | 'receive';
  onClose: () => void;
  walletAddress: string;
  isKycCompleted?: boolean;
  kycStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  onKycRedirect?: () => void;
}

export default function DepositReceiveDialog({
  isOpen,
  onClose,
  type,
  walletAddress,
  isKycCompleted = false,
  kycStatus = 'none',
  onKycRedirect,
}: DepositReceiveDialogProps) {
  const [depositMethod, setDepositMethod] = useState<'crypto' | 'mobile-money' | null>(null);
  const [mobileMoneyNetwork, setMobileMoneyNetwork] = useState<'mtn' | 'airtel' | null>(null);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Address Copied!', 'Your wallet address has been copied to clipboard.');
  };

  const handleCryptoDeposit = async () => {
    if (!recipientAddress || !amount) {
      toast.error('Invalid Input', 'Please enter both recipient address and amount.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Transaction Sent!', `Successfully sent ${amount} to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`);
      
      // Reset form
      setAmount('');
      setRecipientAddress('');
      onClose();
    } catch (error) {
      toast.error('Transaction Failed', 'Please try again or check your wallet balance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMobileMoneyDeposit = async () => {
    if (!amount || !phoneNumber || !mobileMoneyNetwork) {
      toast.error('Invalid Input', 'Please fill in all required fields.');
      return;
    }

    if (kycStatus !== 'approved') {
      toast.error('KYC Required', 'Please complete your KYC verification to use mobile money deposits.');
      if (onKycRedirect) {
        onKycRedirect();
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate mobile money deposit
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Deposit Initiated!', `${mobileMoneyNetwork.toUpperCase()} deposit of $${amount} has been initiated. You'll receive a prompt on your phone.`);
      
      // Reset form
      setAmount('');
      setPhoneNumber('');
      setMobileMoneyNetwork(null);
      onClose();
    } catch (error) {
      toast.error('Deposit Failed', 'Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDepositMethod = () => {
    setDepositMethod(null);
    setMobileMoneyNetwork(null);
    setAmount('');
    setPhoneNumber('');
    setRecipientAddress('');
  };

  const handleClose = () => {
    resetDepositMethod();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-[#1db584] to-[#15a576] p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {type === 'deposit' ? (
                <>
                  <Wallet className="h-5 w-5" />
                  <span className="text-lg font-semibold">Deposit Funds</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span className="text-lg font-semibold">Receive Funds</span>
                </>
              )}
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {type === 'deposit' ? (
            <>
              {!depositMethod ? (
                /* Deposit Method Selection */
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center mb-6">
                    Choose how you'd like to deposit funds to your Grin Wallet
                  </p>
                  
                  {/* Crypto Deposit Option */}
                  <button
                    onClick={() => setDepositMethod('crypto')}
                    className="w-full p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-blue-100 flex-shrink-0">
                        <EthereumIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">Deposit Crypto</h3>
                        <p className="text-sm text-gray-600">
                          Send crypto directly to your wallet address
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Mobile Money Option */}
                  <button
                    onClick={() => setDepositMethod('mobile-money')}
                    className="w-full p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-green-100 flex-shrink-0">
                        <Smartphone className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                          Fund Account
                          {kycStatus !== 'approved' && (
                            <Shield className="h-4 w-4 text-amber-500" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Buy crypto with mobile money (MTN/Airtel)
                        </p>
                        {kycStatus === 'pending' && (
                          <span className="text-xs text-blue-600 font-medium">KYC pending</span>
                        )}
                        {kycStatus === 'none' && (
                          <span className="text-xs text-amber-600 font-medium">KYC required</span>
                        )}
                        {kycStatus === 'rejected' && (
                          <span className="text-xs text-red-600 font-medium">KYC failed</span>
                        )}
                      </div>
                      {kycStatus === 'approved' && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                </div>
              ) : depositMethod === 'crypto' ? (
                /* Crypto Deposit Form */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={resetDepositMethod}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  </div>

                  {/* Ethereum Network Info */}
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <EthereumIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900 text-sm">Ethereum Network</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700">
                        We currently only support Ethereum. Please ensure you're sending ETH or ERC-20 tokens only.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <p className="text-xs text-gray-600 mb-2">Your Wallet Address</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                      {walletAddress}
                    </p>
                  </div>

                  <Button
                    onClick={handleCopyAddress}
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/50"
                  >
                    Copy Address
                  </Button>

                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-600 text-center">
                      Copy this address and use it to send crypto from another wallet or exchange
                    </p>
                  </div>
                </div>
              ) : (
                /* Mobile Money Deposit */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={resetDepositMethod}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  </div>

                  {kycStatus !== 'approved' ? (
                    /* KYC Required Message */
                    <div className="text-center space-y-4">
                      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                        <Shield className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                        <h3 className="font-semibold text-amber-900 mb-2 text-sm">
                          {kycStatus === 'pending' ? 'KYC Verification Pending' : 
                           kycStatus === 'rejected' ? 'KYC Verification Failed' : 
                           'KYC Verification Required'}
                        </h3>
                        <p className="text-xs text-amber-700 mb-4">
                          {kycStatus === 'pending' ? 
                            'Your documents are being reviewed. Mobile money deposits will be available once verification is complete.' :
                           kycStatus === 'rejected' ?
                            'Your verification was unsuccessful. Please resubmit your documents to use mobile money deposits.' :
                            'To buy crypto with mobile money, you need to complete your identity verification first.'}
                        </p>
                        <Button
                          onClick={() => {
                            handleClose();
                            if (onKycRedirect) {
                              onKycRedirect();
                            }
                          }}
                          variant="primary"
                          size="lg"
                          fullWidth
                          className="bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/50"
                        >
                          {kycStatus === 'pending' ? 'Check Status' : 
                           kycStatus === 'rejected' ? 'Resubmit Documents' : 
                           'Complete KYC Verification'}
                        </Button>
                      </div>
                    </div>
                  ) : !mobileMoneyNetwork ? (
                    /* Network Selection */
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-900 text-sm">KYC Verified</span>
                        </div>
                        <p className="text-xs text-green-700">
                          Choose your mobile money network to continue
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-900 text-sm">Select Network</h3>
                        
                        {/* MTN Option */}
                        <button
                          onClick={() => setMobileMoneyNetwork('mtn')}
                          className="w-full p-3 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-100 flex-shrink-0">
                              <Smartphone className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm">MTN Mobile Money</h4>
                              <p className="text-xs text-gray-600">
                                Pay with your MTN Mobile Money account
                              </p>
                            </div>
                          </div>
                        </button>

                        {/* Airtel Option */}
                        <button
                          onClick={() => setMobileMoneyNetwork('airtel')}
                          className="w-full p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 flex-shrink-0">
                              <Smartphone className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm">Airtel Money</h4>
                              <p className="text-xs text-gray-600">
                                Pay with your Airtel Money account
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Mobile Money Form */
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-900 text-sm">
                            {mobileMoneyNetwork.toUpperCase()} Selected
                          </span>
                        </div>
                        <p className="text-xs text-green-700">
                          You'll receive a payment prompt on your phone
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">
                          Amount (USD)
                        </label>
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          min="1"
                          max="1000"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder={mobileMoneyNetwork === 'mtn' ? '077XXXXXXX' : '075XXXXXXX'}
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => setMobileMoneyNetwork(null)}
                          variant="secondary"
                          size="lg"
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleMobileMoneyDeposit}
                          isLoading={isSubmitting}
                          loadingText="Processing..."
                          variant="primary"
                          size="lg"
                          className="flex-1 bg-green-500 hover:bg-green-600 focus:ring-green-500/50"
                          disabled={!amount || !phoneNumber}
                        >
                          Pay {mobileMoneyNetwork.toUpperCase()}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Receive Display */}
              <div className="space-y-4">
                {/* Ethereum Network Info */}
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <EthereumIcon className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900 text-sm">Ethereum Network</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      We currently only support Ethereum. Please ensure you're receiving ETH or ERC-20 tokens only.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <p className="text-xs text-gray-600 mb-2">Your Wallet Address</p>
                  <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                    {walletAddress}
                  </p>
                </div>

                <Button
                  onClick={handleCopyAddress}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="bg-green-500 hover:bg-green-600 focus:ring-green-500/50"
                >
                  Copy Address
                </Button>

                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-600 text-center">
                    Share your wallet address with others to receive funds
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

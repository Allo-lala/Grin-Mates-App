'use client';

import { useState } from 'react';
import { X, ArrowLeft, Copy, CheckCircle, Smartphone, CreditCard, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';

interface DepositWithdrawDialogProps {
  isOpen: boolean;
  type: 'deposit' | 'withdraw';
  onClose: () => void;
  walletAddress: string;
  kycStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  onKycRedirect?: () => void;
}

type Token = 'USDT' | 'USDC' | 'cUSD';
type Network = 'Celo' | 'Solana' | 'Base' | 'Stellar';
type WithdrawMethod = 'mtn' | 'airtel' | 'airtime';

const tokenNetworks: Record<Token, Network[]> = {
  USDT: ['Celo', 'Solana'],
  USDC: ['Celo', 'Base', 'Stellar', 'Solana'],
  cUSD: ['Celo'],
};

export default function DepositWithdrawDialog({
  isOpen,
  onClose,
  type,
  walletAddress,
  kycStatus = 'none',
  onKycRedirect,
}: DepositWithdrawDialogProps) {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [depositAddress, setDepositAddress] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<WithdrawMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const generateDepositAddress = (token: Token, network: Network) => {
    // Simulate address generation based on network
    const addresses: Record<Network, string> = {
      Celo: `0x${Math.random().toString(16).substr(2, 40)}`,
      Solana: `${Math.random().toString(36).substr(2, 44)}`,
      Base: `0x${Math.random().toString(16).substr(2, 40)}`,
      Stellar: `G${Math.random().toString(36).substr(2, 55).toUpperCase()}`,
    };
    return addresses[network];
  };

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setSelectedNetwork(null);
    setDepositAddress('');
  };

  const handleNetworkSelect = (network: Network) => {
    setSelectedNetwork(network);
    if (selectedToken) {
      const address = generateDepositAddress(selectedToken, network);
      setDepositAddress(address);
    }
  };

  const handleCopyAddress = () => {
    if (depositAddress) {
      navigator.clipboard.writeText(depositAddress);
      toast.success('Address Copied!', 'Deposit address copied to clipboard.');
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !phoneNumber) {
      toast.error('Invalid Input', 'Please fill in all required fields.');
      return;
    }

    if (kycStatus !== 'approved') {
      toast.error('KYC Required', 'Please complete your KYC verification to withdraw.');
      if (onKycRedirect) {
        onKycRedirect();
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Withdrawal Initiated!', `${withdrawMethod?.toUpperCase()} withdrawal of $${amount} has been initiated.`);
      
      setAmount('');
      setPhoneNumber('');
      onClose();
    } catch (error) {
      toast.error('Withdrawal Failed', 'Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSelection = () => {
    setSelectedToken(null);
    setSelectedNetwork(null);
    setDepositAddress('');
    setWithdrawMethod(null);
    setAmount('');
    setPhoneNumber('');
  };

  const handleClose = () => {
    resetSelection();
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
                  <CreditCard className="h-5 w-5" />
                  <span className="text-lg font-semibold">Deposit Funds</span>
                </>
              ) : (
                <>
                  <Smartphone className="h-5 w-5" />
                  <span className="text-lg font-semibold">Withdraw Funds</span>
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
              {!selectedToken ? (
                /* Token Selection */
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Select the token you want to deposit
                  </p>
                  
                  {/* USDT */}
                  <button
                    onClick={() => handleTokenSelect('USDT')}
                    className="w-full p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 items-center justify-center flex-shrink-0">
                        <Image 
                          src="/usdt.png" 
                          alt="USDT"
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">USDT</h3>
                        <p className="text-xs text-gray-600">
                          Tether USD
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* USDC */}
                  <button
                    onClick={() => handleTokenSelect('USDC')}
                    className="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 items-center justify-center flex-shrink-0">
                        <Image 
                          src="/usdc.png" 
                          alt="USDC"
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">USDC</h3>
                        <p className="text-xs text-gray-600">
                          USD Coin
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* cUSD */}
                  <button
                    onClick={() => handleTokenSelect('cUSD')}
                    className="w-full p-3 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 items-center justify-center flex-shrink-0">
                        <Image 
                          src="/cUSD.jpeg" 
                          alt="cUSD"
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">cUSD</h3>
                        <p className="text-xs text-gray-600">
                          Celo Dollar
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ) : !selectedNetwork ? (
                /* Network Selection */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={resetSelection}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 text-center mb-4">
                    Select network for {selectedToken}
                  </p>

                  {tokenNetworks[selectedToken].map((network) => {
                    const networkIcons: Record<Network, string> = {
                      Celo: '/celo-coin.png',
                      Base: '/coinbase.png',
                      Solana: '/solana.jpeg',
                      Stellar: '/stellar.jpeg',
                    };
                    
                    const tokenIcons: Record<Token, string> = {
                      USDT: '/usdt.png',
                      USDC: '/usdc.png',
                      cUSD: '/cUSD.jpeg',
                    };

                    return (
                      <button
                        key={network}
                        onClick={() => handleNetworkSelect(network)}
                        className="w-full p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-10 w-10 items-center justify-center flex-shrink-0">
                            <Image 
                              src={tokenIcons[selectedToken]} 
                              alt={selectedToken}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full"
                            />
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white border border-gray-200">
                              <Image 
                                src={networkIcons[network]} 
                                alt={network}
                                width={16}
                                height={16}
                                className="h-4 w-4 rounded-full"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900">{selectedToken}</h3>
                            <p className="text-xs text-gray-600">{network}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* QR Code Display */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => {
                        setSelectedNetwork(null);
                        setDepositAddress('');
                      }}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  </div>

                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Deposit {selectedToken} via {selectedNetwork}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Scan QR code or copy address below
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                      <QRCodeSVG
                        value={depositAddress}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>

                  {/* Deposit Address */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-600 mb-2 text-center">Deposit Address</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 break-all text-center mb-3">
                      {depositAddress}
                    </p>
                    <Button
                      onClick={handleCopyAddress}
                      variant="secondary"
                      size="lg"
                      fullWidth
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Address
                    </Button>
                  </div>

                  {/* Warning */}
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-xs text-amber-700">
                      ⚠️ Only send {selectedToken} on {selectedNetwork} network to this address. 
                      Sending other tokens or using wrong network may result in loss of funds.
                    </p>
                  </div>

                  {/* Network Info */}
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <strong>Network:</strong> {selectedNetwork}<br />
                      <strong>Token:</strong> {selectedToken}<br />
                      <strong>Confirmations:</strong> Funds will appear after network confirmation
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Withdraw Options */}
              {!withdrawMethod ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Choose withdrawal method
                  </p>

                  {/* MTN Mobile Money */}
                  <button
                    onClick={() => setWithdrawMethod('mtn')}
                    className="w-full p-3 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 items-center justify-center flex-shrink-0">
                        <Image 
                          src="/mtn-logo.jpeg" 
                          alt="MTN Mobile Money"
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">MTN Mobile Money</h3>
                        <p className="text-xs text-gray-600">
                          Withdraw to MTN account
                        </p>
                      </div>
                      {kycStatus === 'approved' && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Airtel Money */}
                  <button
                    onClick={() => setWithdrawMethod('airtel')}
                    className="w-full p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 items-center justify-center flex-shrink-0">
                        <Image 
                          src="/airtel-logo.jpg" 
                          alt="Airtel Money"
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">Airtel Money</h3>
                        <p className="text-xs text-gray-600">
                          Withdraw to Airtel account
                        </p>
                      </div>
                      {kycStatus === 'approved' && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Buy Airtime */}
                  <button
                    onClick={() => setWithdrawMethod('airtime')}
                    className="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
                        <Phone className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">Buy Airtime</h3>
                        <p className="text-xs text-gray-600">
                          Convert to airtime for any network
                        </p>
                      </div>
                    </div>
                  </button>

                  {kycStatus !== 'approved' && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 mt-4">
                      <p className="text-xs text-amber-700">
                        ⚠️ KYC verification required for withdrawals. 
                        {kycStatus === 'pending' && ' Your verification is pending.'}
                        {kycStatus === 'none' && ' Please complete verification to withdraw.'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Withdrawal Form */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setWithdrawMethod(null)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  </div>

                  {kycStatus !== 'approved' ? (
                    /* KYC Required */
                    <div className="text-center py-8">
                      <div className="p-6 rounded-lg bg-amber-50 border border-amber-200">
                        <h3 className="font-semibold text-amber-900 mb-2 text-sm">
                          KYC Verification Required
                        </h3>
                        <p className="text-xs text-amber-700 mb-4">
                          Complete your identity verification to withdraw funds.
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
                          className="bg-amber-500 hover:bg-amber-600"
                        >
                          Complete KYC
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {withdrawMethod === 'mtn' && 'MTN Mobile Money'}
                          {withdrawMethod === 'airtel' && 'Airtel Money'}
                          {withdrawMethod === 'airtime' && 'Buy Airtime'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Enter amount and phone number
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
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">
                          Phone Number
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder={
                              withdrawMethod === 'mtn' ? '077XXXXXXX' : 
                              withdrawMethod === 'airtel' ? '075XXXXXXX' : 
                              '07XXXXXXXXX'
                            }
                            className="flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              // Contact picker API - will work on supported devices
                              if ('contacts' in navigator && 'ContactsManager' in window) {
                                (navigator as any).contacts.select(['tel'], { multiple: false })
                                  .then((contacts: any[]) => {
                                    if (contacts.length > 0 && contacts[0].tel && contacts[0].tel.length > 0) {
                                      setPhoneNumber(contacts[0].tel[0]);
                                    }
                                  })
                                  .catch((err: any) => {
                                    console.log('Contact selection cancelled or failed', err);
                                  });
                              } else {
                                toast.error('Not Supported', 'Contact picker is not supported on this device.');
                              }
                            }}
                            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center"
                            title="Select from contacts"
                          >
                            <User className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={handleWithdraw}
                        isLoading={isSubmitting}
                        loadingText="Processing..."
                        variant="primary"
                        size="lg"
                        fullWidth
                        disabled={!amount || !phoneNumber}
                        className="bg-[#1db584] hover:bg-[#15a576]"
                      >
                        {withdrawMethod === 'airtime' ? 'Buy Airtime' : 'Withdraw'}
                      </Button>

                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-xs text-blue-700">
                          <strong>Processing Time:</strong> Instant to 3 minutes<br />
                          <strong>Fee:</strong> 1% + network charges<br />
                          <strong>Minimum:</strong> $1.00
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

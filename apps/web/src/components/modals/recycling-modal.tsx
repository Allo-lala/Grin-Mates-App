'use client';

import { useState } from 'react';
import { X, Recycle, QrCode, Camera, Coins, Trash2, Wine, Package } from 'lucide-react';

interface RecyclingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WasteType {
  id: string;
  name: string;
  icon: any;
  reward: number;
  description: string;
  color: string;
}

export default function RecyclingModal({ isOpen, onClose }: RecyclingModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedMachine, setScannedMachine] = useState<string | null>(null);
  const [selectedWasteType, setSelectedWasteType] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const wasteTypes: WasteType[] = [
    {
      id: 'plastic',
      name: 'Plastic Bottles',
      icon: Package,
      reward: 0.001,
      description: 'PET bottles, containers',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'glass',
      name: 'Glass Bottles',
      icon: Wine,
      reward: 0.002,
      description: 'Glass bottles, jars',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'cans',
      name: 'Aluminum Cans',
      icon: Trash2,
      reward: 0.003,
      description: 'Soda cans, food cans',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  const selectedWaste = wasteTypes.find(waste => waste.id === selectedWasteType);
  const totalReward = (selectedWaste?.reward || 0) * quantity;

  const startQRScan = () => {
    setIsScanning(true);
    
    // Simulate QR code scanning
    setTimeout(() => {
      setScannedMachine('RECYCLE-STATION-001');
      setIsScanning(false);
    }, 2000);
  };

  const handleRecycle = async () => {
    if (!scannedMachine || !selectedWasteType || quantity <= 0) {
      alert('Please scan a machine, select waste type, and enter quantity');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Processing recycling:', {
        machine: scannedMachine,
        wasteType: selectedWaste,
        quantity,
        totalReward,
        timestamp: new Date().toISOString()
      });

      // Simulate recycling process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      alert(`Recycling successful! You earned ${totalReward} ETH for recycling ${quantity} ${selectedWaste?.name}.`);
      
      // Reset form
      setScannedMachine(null);
      setSelectedWasteType('');
      setQuantity(1);
      onClose();
      
    } catch (error) {
      console.error('Recycling failed:', error);
      alert('Recycling failed. Please try again.');
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
            <Recycle className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Smart Recycling</h2>
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
              <Recycle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Earn Crypto by Recycling</p>
                <p className="text-xs text-gray-600 mt-1">
                  Scan QR codes on our recycling machines and earn rewards
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Scanner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1: Scan Recycling Machine
            </label>
            {!scannedMachine ? (
              <button
                onClick={startQRScan}
                disabled={isScanning}
                className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 hover:border-green-500 transition-colors"
              >
                <div className="text-center">
                  {isScanning ? (
                    <div className="animate-spin mx-auto mb-2">
                      <QrCode className="h-8 w-8 text-green-600" />
                    </div>
                  ) : (
                    <QrCode className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  )}
                  <p className="text-sm text-gray-600">
                    {isScanning ? 'Scanning QR Code...' : 'Tap to Scan QR Code'}
                  </p>
                </div>
              </button>
            ) : (
              <div className="rounded-lg bg-white border border-green-200 p-3">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Machine Connected</p>
                    <p className="text-xs text-gray-600">{scannedMachine}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Waste Type Selection */}
          {scannedMachine && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Step 2: Select Waste Type
              </label>
              <div className="space-y-2">
                {wasteTypes.map((waste) => {
                  const Icon = waste.icon;
                  return (
                    <button
                      key={waste.id}
                      onClick={() => setSelectedWasteType(waste.id)}
                      className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                        selectedWasteType === waste.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-green-100 p-2">
                            <Icon className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{waste.name}</h3>
                            <p className="text-xs text-gray-500">{waste.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{waste.reward} ETH</p>
                          <p className="text-xs text-gray-500">per item</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          {selectedWasteType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step 3: Enter Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button
                  onClick={() => setQuantity(Math.min(50, quantity + 1))}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Reward Summary */}
          {selectedWaste && quantity > 0 && (
            <div className="rounded-lg bg-white border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Total Reward</span>
                </div>
                <span className="font-bold text-green-600">{totalReward} ETH</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {quantity} × {selectedWaste.name} × {selectedWaste.reward} ETH
              </p>
            </div>
          )}

          {/* Recycle Button */}
          <button
            onClick={handleRecycle}
            disabled={isProcessing || !scannedMachine || !selectedWasteType || quantity <= 0}
            className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Recycle className="h-4 w-4" />
            {isProcessing ? 'Processing...' : `Recycle & Earn ${totalReward} ETH`}
          </button>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center">
            <p>Rewards are automatically sent to your wallet</p>
            <p className="mt-1">Help the environment while earning crypto!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
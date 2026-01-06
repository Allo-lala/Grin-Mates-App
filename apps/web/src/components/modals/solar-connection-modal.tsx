'use client';

import { useState } from 'react';
import { X, Sun, MapPin, Zap, Home, Lightbulb, Fan, Tv } from 'lucide-react';
import PaymentMethodModal from './payment-method-modal';

interface SolarConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SolarPackage {
  id: string;
  name: string;
  capacity: string;
  price: number;
  greenPoints: number;
  description: string;
  features: string[];
}

interface Appliance {
  id: string;
  name: string;
  icon: any;
  power: string;
  price: number;
}

export default function SolarConnectionModal({ isOpen, onClose }: SolarConnectionModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Mock user Green Points balance
  const userGreenPoints = 1250;

  const solarPackages: SolarPackage[] = [
    {
      id: 'basic',
      name: 'Basic Solar',
      capacity: '2kW',
      price: 0.5,
      greenPoints: 500,
      description: 'Perfect for small homes',
      features: ['2kW Solar Panels', 'Basic Inverter', '1 Year Warranty', 'Installation Included']
    },
    {
      id: 'standard',
      name: 'Standard Solar',
      capacity: '5kW',
      price: 1.2,
      greenPoints: 1200,
      description: 'Ideal for medium homes',
      features: ['5kW Solar Panels', 'Smart Inverter', '3 Year Warranty', 'Installation & Monitoring']
    },
    {
      id: 'premium',
      name: 'Premium Solar',
      capacity: '10kW',
      price: 2.0,
      greenPoints: 2000,
      description: 'Best for large homes',
      features: ['10kW Solar Panels', 'Premium Inverter', '5 Year Warranty', 'Full Smart Home Integration']
    }
  ];

  const appliances: Appliance[] = [
    {
      id: 'lights',
      name: 'LED Lights',
      icon: Lightbulb,
      power: '50W',
      price: 0.02
    },
    {
      id: 'fan',
      name: 'Ceiling Fan',
      icon: Fan,
      power: '75W',
      price: 0.05
    },
    {
      id: 'tv',
      name: 'Smart TV',
      icon: Tv,
      power: '150W',
      price: 0.15
    },
    {
      id: 'fridge',
      name: 'Refrigerator',
      icon: Home,
      power: '200W',
      price: 0.25
    }
  ];

  const selectedPackageData = solarPackages.find(pkg => pkg.id === selectedPackage);
  const selectedAppliancesData = appliances.filter(app => selectedAppliances.includes(app.id));
  const totalAppliancePrice = selectedAppliancesData.reduce((sum, app) => sum + app.price, 0);
  const totalPrice = (selectedPackageData?.price || 0) + totalAppliancePrice;
  const totalGreenPoints = (selectedPackageData?.greenPoints || 0) + Math.floor(totalAppliancePrice * 1000);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
            );
            
            if (response.ok) {
              const data = await response.json();
              const address = data.features?.[0]?.properties?.formatted || 
                            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              setLocation(address);
            }
          } catch (error) {
            console.error('Error getting address:', error);
            setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter manually.');
        }
      );
    }
  };

  const toggleAppliance = (applianceId: string) => {
    setSelectedAppliances(prev => 
      prev.includes(applianceId)
        ? prev.filter(id => id !== applianceId)
        : [...prev, applianceId]
    );
  };

  const handleOrder = async () => {
    if (!selectedPackage || !location) {
      alert('Please select a solar package and provide your location');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentMethod = async (method: 'crypto' | 'points') => {
    setIsProcessing(true);

    try {
      console.log('Processing solar order:', {
        package: selectedPackageData,
        appliances: selectedAppliancesData,
        location,
        totalPrice,
        totalGreenPoints,
        paymentMethod: method,
        timestamp: new Date().toISOString()
      });

      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (method === 'crypto') {
        const earnedPoints = Math.floor(totalPrice * 1000);
        alert(`Order confirmed! Your ${selectedPackageData?.name} system will be installed at your location. You earned ${earnedPoints} Green Points!`);
      } else {
        alert(`Order confirmed with Green Points! Your ${selectedPackageData?.name} system will be installed at your location.`);
      }
      
      // Reset form
      setSelectedPackage('');
      setSelectedAppliances([]);
      setLocation('');
      onClose();
      
    } catch (error) {
      console.error('Order failed:', error);
      alert('Order failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Solar Connection</h2>
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
              <Sun className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Solar Installation Service</p>
                <p className="text-xs text-gray-600 mt-1">
                  Choose your solar package and appliances, pay with crypto or Green Points
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Installation Location *
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your address"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
              >
                <MapPin className="h-4 w-4" />
                Use Current Location
              </button>
            </div>
          </div>

          {/* Solar Package Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Solar Package *
            </label>
            <div className="space-y-3">
              {solarPackages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                    selectedPackage === pkg.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                      <p className="text-sm text-gray-600">{pkg.capacity} - {pkg.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{pkg.price} ETH</span>
                      <span className="text-xs text-green-600 block">{pkg.greenPoints} GP</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {pkg.features.join(' • ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Appliances Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Add Appliances (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {appliances.map((appliance) => {
                const Icon = appliance.icon;
                const isSelected = selectedAppliances.includes(appliance.id);
                
                return (
                  <button
                    key={appliance.id}
                    onClick={() => toggleAppliance(appliance.id)}
                    className={`rounded-lg border-2 p-3 text-center transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-1 ${
                      isSelected ? 'text-green-600' : 'text-gray-500'
                    }`} />
                    <p className="text-xs font-medium text-gray-900">{appliance.name}</p>
                    <p className="text-xs text-gray-500">{appliance.power}</p>
                    <p className="text-xs font-semibold text-green-600">+{appliance.price} ETH</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          {selectedPackageData && (
            <div className="rounded-lg bg-white border border-gray-200 p-3">
              <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{selectedPackageData.name}</span>
                  <span className="font-semibold">{selectedPackageData.price} ETH</span>
                </div>
                {selectedAppliancesData.map((app) => (
                  <div key={app.id} className="flex justify-between">
                    <span className="text-gray-600">{app.name}</span>
                    <span className="font-semibold">{app.price} ETH</span>
                  </div>
                ))}
                <div className="border-t pt-1 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-gray-900">{totalPrice} ETH</span>
                </div>
              </div>
            </div>
          )}

          {/* Order Button */}
          <button
            onClick={handleOrder}
            disabled={isProcessing || !selectedPackage || !location}
            className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Choose Payment Method'}
          </button>

          {/* Order Info */}
          <div className="text-xs text-gray-500 text-center">
            <p>Installation will be scheduled within 7-14 days</p>
            <p className="mt-1">Pay with crypto or Green Points</p>
          </div>
        </div>

        {/* Payment Method Modal */}
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSelect={handlePaymentMethod}
          totalPrice={totalPrice}
          greenPointsPrice={totalGreenPoints}
          userGreenPoints={userGreenPoints}
          serviceName={`${selectedPackageData?.name} Solar System`}
        />
      </div>
    </div>
  );
}
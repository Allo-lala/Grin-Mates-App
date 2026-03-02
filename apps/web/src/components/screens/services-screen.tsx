'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { 
  Flame, 
  Sun, 
  Heart, 
  Camera, 
  MapPin, 
  Wallet,
  ArrowRight,
  TreePine,
  Recycle,
  Star
} from 'lucide-react';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import AnimalReportModal from '@/components/modals/animal-report-modal';
import DonationModal from '@/components/modals/donation-modal';
import GasRefillModal from '@/components/modals/gas-refill-modal';
import SolarConnectionModal from '@/components/modals/solar-connection-modal';
import RecyclingModal from '@/components/modals/recycling-modal';
import GreenPointsModal from '@/components/modals/green-points-modal';

export default function ServicesScreen() {
  const { user } = usePrivy();
  const [isAnimalReportOpen, setIsAnimalReportOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isGasRefillOpen, setIsGasRefillOpen] = useState(false);
  const [isSolarConnectionOpen, setIsSolarConnectionOpen] = useState(false);
  const [isRecyclingOpen, setIsRecyclingOpen] = useState(false);
  const [isGreenPointsOpen, setIsGreenPointsOpen] = useState(false);
  
  // Mock Green Points balance
  const greenPoints = 1250;

  const ecoServices = [
    {
      id: 'gas-refill',
      title: 'Gas Refill',
      description: 'Order cooking gas cylinders',
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      action: () => setIsGasRefillOpen(true)
    },
    {
      id: 'solar-connection',
      title: 'Solar Connection',
      description: 'Order solar panels & appliances',
      icon: Sun,
      color: 'from-yellow-500 to-orange-500',
      action: () => setIsSolarConnectionOpen(true)
    },
    {
      id: 'animal-conservation',
      title: 'Animal Rescue',
      description: 'Report endangered animals & locations',
      icon: Camera,
      color: 'from-green-500 to-emerald-600',
      action: () => setIsAnimalReportOpen(true)
    },
    {
      id: 'tree-planting',
      title: 'Tree Planting',
      description: 'Support reforestation projects',
      icon: TreePine,
      color: 'from-green-600 to-green-700',
      action: () => {
        // TODO: Implement tree planting donations
        console.log('Tree planting');
      }
    },
    {
      id: 'recycling',
      title: 'Smart Recycling',
      description: 'Scan QR codes & earn Green Points',
      icon: Recycle,
      color: 'from-green-500 to-teal-600',
      action: () => setIsRecyclingOpen(true)
    },
    {
      id: 'green-points',
      title: 'Green Points',
      description: 'View & manage your eco rewards',
      icon: Star,
      color: 'from-emerald-500 to-green-600',
      action: () => setIsGreenPointsOpen(true)
    }
  ];

  const organizations = [
    {
      name: 'Grin Mates',
      description: 'Environmental conservation organization',
      ethAddress: '0x9A34CA12c1521f1e685f5fAB4F7Ffb9637b39fA6', // Eth address
      logo: '/mobilogo.png',
      focus: 'Climate Action & Biodiversity'
    }
  ];

  return (
    <MobileLayout showBottomNav={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1db584] to-[#15a576] pb-8 pt-6">
          <ResponsiveContainer maxWidth="lg" padding="md">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Eco Services</h1>
              <p className="text-sm text-white/80">Make a positive environmental impact</p>
            </div>
          </ResponsiveContainer>
        </div>

        <ResponsiveContainer maxWidth="lg" padding="md" className="-mt-6 relative z-10">
          {/* Eco-Friendly Services */}
          <div className="mb-8">
            {/* <h2 className="mb-4 text-lg font-bold text-gray-900">Environmental Services</h2> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {ecoServices.map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.id}
                    onClick={service.action}
                    className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all min-h-[100px] sm:min-h-[120px]"
                  >
                    <div className="relative space-y-2 sm:space-y-3 h-full flex flex-col justify-center">
                      <div className="mx-auto w-fit">
                        {service.id === 'gas-refill' && (
                          <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500" />
                        )}
                        {service.id === 'solar-connection' && (
                          <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500" />
                        )}
                        {service.id === 'animal-conservation' && (
                          <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                        )}
                        {service.id === 'tree-planting' && (
                          <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                        )}
                        {service.id === 'recycling' && (
                          <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" />
                        )}
                        {service.id === 'green-points' && (
                          <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">{service.title}</h3>
                        <p className="text-xs text-gray-600 mt-1 leading-tight">{service.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Organizations to Support */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Support Organizations</h2>
            <div className="space-y-3">
              {organizations.map((org, index) => (
                <div key={index} className="rounded-xl bg-white p-3 sm:p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="text-xl sm:text-2xl flex-shrink-0">
                        <img 
                          src={org.logo} 
                          alt={`${org.name} logo`}
                          className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{org.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{org.description}</p>
                        <p className="text-xs text-gray-500 mb-1 sm:mb-2">{org.focus}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Wallet className="h-3 w-3 flex-shrink-0" />
                          <span className="font-mono truncate">{org.ethAddress}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsDonationOpen(true)}
                      className="flex items-center gap-1 rounded-lg bg-[#1db584] px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#15a576] transition-colors flex-shrink-0 min-w-[60px] sm:min-w-[80px] justify-center"
                    >
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline sm:inline">Donate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setIsAnimalReportOpen(true)}
                className="flex items-center justify-between w-full rounded-xl bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-2">
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Report Wildlife</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Share endangered animal sightings</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              </button>

              <button
                onClick={async () => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (position) => {
                        const { latitude, longitude } = position.coords;
                        
                        try {
                          // Use Geoapify API to find nearby eco-friendly services
                          const categories = 'commercial.gas_station,commercial.solar,commercial.recycling';
                          const response = await fetch(
                            `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${longitude},${latitude},5000&bias=proximity:${longitude},${latitude}&limit=10&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
                          );
                          
                          if (response.ok) {
                            const data = await response.json();
                            console.log('Nearby eco services:', data.features);
                            
                            // TODO: Display results in a modal or new screen
                            alert(`Found ${data.features?.length || 0} eco-friendly services nearby!`);
                          } else {
                            console.error('Failed to fetch nearby services');
                            alert('Unable to find nearby services. Please try again.');
                          }
                        } catch (error) {
                          console.error('Error finding nearby services:', error);
                          alert('Error finding nearby services. Please check your connection.');
                        }
                      },
                      (error) => {
                        console.error('Error getting location:', error);
                        alert('Unable to get your location. Please enable location services.');
                      }
                    );
                  } else {
                    alert('location is not supported by this browser.');
                  }
                }}
                className="flex items-center justify-between w-full rounded-xl bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Nearby Services</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Find eco services near you</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              </button>
            </div>
          </div>
        </ResponsiveContainer>

        {/* Modals */}
        <AnimalReportModal 
          isOpen={isAnimalReportOpen} 
          onClose={() => setIsAnimalReportOpen(false)} 
        />
        
        <DonationModal 
          isOpen={isDonationOpen} 
          onClose={() => setIsDonationOpen(false)}
          organization={organizations[0]}
        />

        <GasRefillModal 
          isOpen={isGasRefillOpen} 
          onClose={() => setIsGasRefillOpen(false)} 
        />

        <SolarConnectionModal 
          isOpen={isSolarConnectionOpen} 
          onClose={() => setIsSolarConnectionOpen(false)} 
        />

        <RecyclingModal 
          isOpen={isRecyclingOpen} 
          onClose={() => setIsRecyclingOpen(false)} 
        />

        <GreenPointsModal 
          isOpen={isGreenPointsOpen} 
          onClose={() => setIsGreenPointsOpen(false)}
          points={greenPoints}
        />
      </div>
    </MobileLayout>
  );
}
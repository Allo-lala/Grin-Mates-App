'use client';

import { useState, useRef } from 'react';
import { X, Camera, MapPin, Upload, AlertTriangle } from 'lucide-react';

interface AnimalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnimalReport {
  species: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  image: File | null;
  endangermentLevel: 'critical' | 'endangered' | 'vulnerable' | 'near-threatened';
  reporterNotes: string;
}

export default function AnimalReportModal({ isOpen, onClose }: AnimalReportModalProps) {
  const [report, setReport] = useState<AnimalReport>({
    species: '',
    description: '',
    location: null,
    image: null,
    endangermentLevel: 'vulnerable',
    reporterNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReport(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Use Geoapify API to get address
            const response = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
            );
            
            if (response.ok) {
              const data = await response.json();
              const address = data.features?.[0]?.properties?.formatted || 
                            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              
              setReport(prev => ({
                ...prev,
                location: {
                  latitude,
                  longitude,
                  address
                }
              }));
            } else {
              // Fallback to coordinates if API fails
              setReport(prev => ({
                ...prev,
                location: {
                  latitude,
                  longitude,
                  address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                }
              }));
            }
          } catch (error) {
            console.error('Error getting address:', error);
            // Fallback to coordinates
            setReport(prev => ({
              ...prev,
              location: {
                latitude,
                longitude,
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              }
            }));
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!report.species || !report.description || !report.location || !report.image) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement blockchain submission
      // This would involve:
      // 1. Upload image to IPFS
      // 2. Submit report data to smart contract
      // 3. Include location data from Geoapify API
      
      console.log('Submitting animal report:', {
        ...report,
        imageSize: report.image?.size,
        imageName: report.image?.name
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Animal report submitted successfully! Thank you for helping with conservation efforts.');
      
      // Reset form
      setReport({
        species: '',
        description: '',
        location: null,
        image: null,
        endangermentLevel: 'vulnerable',
        reporterNotes: ''
      });
      setImagePreview(null);
      onClose();
      
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Report Wildlife</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Species */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Species Name *
            </label>
            <input
              type="text"
              value={report.species}
              onChange={(e) => setReport(prev => ({ ...prev, species: e.target.value }))}
              placeholder="e.g., African Elephant, Snow Leopard"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1db584] focus:outline-none focus:ring-1 focus:ring-[#1db584]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={report.description}
              onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the animal's condition, behavior, and circumstances..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1db584] focus:outline-none focus:ring-1 focus:ring-[#1db584]"
              required
            />
          </div>

          {/* Endangerment Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endangerment Level
            </label>
            <select
              value={report.endangermentLevel}
              onChange={(e) => setReport(prev => ({ ...prev, endangermentLevel: e.target.value as any }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1db584] focus:outline-none focus:ring-1 focus:ring-[#1db584]"
            >
              <option value="critical">Critical</option>
              <option value="endangered">Endangered</option>
              <option value="vulnerable">Vulnerable</option>
              <option value="near-threatened">Near Threatened</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo *
            </label>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-full rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-[#1db584] transition-colors"
              >
                <div className="text-center">
                  <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {report.image ? report.image.name : 'Take or upload a photo'}
                  </p>
                </div>
              </button>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setReport(prev => ({ ...prev, image: null }));
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="flex items-center gap-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <MapPin className="h-4 w-4 text-gray-500" />
                {report.location ? 'Update Location' : 'Get Current Location'}
              </button>
              {report.location && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-sm text-gray-600">
                    📍 {report.location.address}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {report.location.latitude.toFixed(6)}, 
                    Lng: {report.location.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={report.reporterNotes}
              onChange={(e) => setReport(prev => ({ ...prev, reporterNotes: e.target.value }))}
              placeholder="Any additional information that might be helpful..."
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1db584] focus:outline-none focus:ring-1 focus:ring-[#1db584]"
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Important</p>
              <p className="text-xs text-yellow-700 mt-1">
                This report will be stored on the blockchain and shared with conservation organizations. 
                Please ensure all information is accurate.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !report.species || !report.description || !report.location || !report.image}
            className="w-full rounded-lg bg-[#1db584] py-3 text-sm font-semibold text-white hover:bg-[#15a576] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
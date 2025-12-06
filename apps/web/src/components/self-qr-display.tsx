/**
 * Self QR Display Component
 * 
 * Displays a QR code for Self Protocol identity verification with:
 * - QR code rendering using QRCode library
 * - Scanning instructions for users
 * - Loading spinner during QR generation
 * - Error messages with retry button
 * - Styling matching Grin Mates design system
 * 
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { SelfApp } from '@selfxyz/qrcode';
import { Smartphone, RefreshCw, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';

export interface SelfQRDisplayProps {
  /** Self Protocol app instance for QR generation */
  app: SelfApp | null;
  /** QR code data string (universal link) */
  qrData: string | null;
  /** Loading state during QR generation */
  isLoading: boolean;
  /** Error object if QR generation fails */
  error: Error | null;
  /** Callback to regenerate QR code */
  onRegenerate: () => void;
  /** Optional callback when verification succeeds */
  onSuccess?: () => void;
  /** Optional callback when verification fails */
  onError?: (data: { error_code?: string; reason?: string }) => void;
  /** Optional size for QR code (default: 300) */
  size?: number;
}

/**
 * SelfQRDisplay Component
 * 
 * Renders the Self Protocol QR code with appropriate states:
 * - Loading: Shows spinner while generating QR
 * - Error: Shows error message with retry button
 * - Success: Shows QR code with scanning instructions
 * 
 * Requirements: 1.1, 1.3, 6.1
 */
export function SelfQRDisplay({
  app,
  qrData,
  isLoading,
  error,
  onRegenerate,
  onSuccess,
  onError,
  size = 300,
}: SelfQRDisplayProps) {
  // Requirement 6.1: Display loading spinner during QR generation
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-xl md:p-12">
        <LoadingSpinner size="lg" />
        <p className="mt-6 text-center text-base text-gray-600 md:text-lg">
          Generating your verification QR code...
        </p>
      </div>
    );
  }

  // Requirement 6.1: Display error messages with retry button
  if (error || !app || !qrData) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-xl md:p-12">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        
        <h3 className="mb-3 text-xl font-semibold text-gray-900 md:text-2xl">
          Unable to Generate QR Code
        </h3>
        
        <p className="mb-6 max-w-md text-center text-sm text-gray-600 md:text-base">
          {error?.message || 'Failed to generate QR code. Please try again.'}
        </p>
        
        <Button
          onClick={onRegenerate}
          variant="primary"
          size="lg"
          className="gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          Try Again
        </Button>
      </div>
    );
  }

  // Requirement 1.1, 1.3: Display QR code with scanning instructions
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code when qrData changes
  useEffect(() => {
    if (qrData && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        qrData,
        {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error: Error | null | undefined) => {
          if (error) {
            console.error('QR Code generation error:', error);
          }
        }
      );
    }
  }, [qrData, size]);

  return (
    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl md:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1db584] to-[#15a576]">
          <Smartphone className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
          Scan to Verify
        </h2>
        <p className="text-sm text-gray-600 md:text-base">
          Please use the Self Protocol app to complete your identity verification
        </p>
      </div>

      {/* QR Code Container */}
      <div className="mb-6 flex justify-center">
        <div className="rounded-xl bg-white p-4 shadow-inner">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 space-y-3">
        <h3 className="text-center text-lg font-semibold text-gray-900">
          How to Scan
        </h3>
        
        <div className="space-y-2 rounded-lg bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#1db584] text-xs font-bold text-white">
              1
            </div>
            <p className="text-sm text-gray-700">
              Open the <span className="font-semibold">Self Protocol app</span> on your mobile device
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#1db584] text-xs font-bold text-white">
              2
            </div>
            <p className="text-sm text-gray-700">
              Tap the <span className="font-semibold">Scan QR</span> button in the app
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#1db584] text-xs font-bold text-white">
              3
            </div>
            <p className="text-sm text-gray-700">
              Point your camera at the QR code above
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#1db584] text-xs font-bold text-white">
              4
            </div>
            <p className="text-sm text-gray-700">
              Follow the in-app instructions to complete verification
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-3">
        <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
          <p className="text-center text-xs text-gray-600 md:text-sm">
            💡 <span className="font-semibold">Don't have the Self Protocol app?</span>
            <br />
            Download it from the App Store or Google Play
          </p>
        </div>
        
        <button
          onClick={onRegenerate}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" />
          Generate New QR Code
        </button>
        
        <p className="text-center text-xs text-gray-500">
          🔒 Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
}

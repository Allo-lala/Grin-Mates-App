/**
 * Self KYC Screen Component
 * 
 * Main orchestrator component for Self Protocol identity verification flow.
 * 
 * This component:
 * - Integrates useSelfProtocol hook for QR generation
 * - Integrates useVerificationStatus hook for status polling
 * - Uses SelfQRDisplay component to show QR code
 * - Displays verification status states (pending, verified, failed)
 * - Handles verification completion with success toast
 * - Handles verification failure with error toast
 * - Implements redirect to dashboard on successful verification
 * - Stores verification completion in localStorage
 * 
 * Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 6.1, 6.2, 6.3, 6.4
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { MobileAppContainer } from '@/components/layout/mobile-app-container';
import { SelfQRDisplay } from '@/components/self-qr-display';
import { useSelfProtocol } from '@/lib/hooks/use-self-protocol';
import { useVerificationStatus } from '@/lib/hooks/use-verification-status';
import { toast } from '@/lib/toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { logger } from '@/lib/logger';

export interface SelfKYCScreenProps {
  /** User's wallet address for verification */
  walletAddress: string;
}

/**
 * SelfKYCScreen Component
 * 
 * Orchestrates the complete Self Protocol verification flow from QR generation
 * to verification completion and redirect.
 * 
 * Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 6.1, 6.2, 6.3, 6.4
 */
export default function SelfKYCScreen({ walletAddress }: SelfKYCScreenProps) {
  const router = useRouter();
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false);
  const [hasShownFailureToast, setHasShownFailureToast] = useState(false);

  // Requirement 1.1, 1.2: Integrate useSelfProtocol hook for QR generation
  const {
    app,
    qrData,
    sessionId,
    sessionStartTime,
    isLoading: isGeneratingQR,
    error: qrError,
    regenerateQR,
  } = useSelfProtocol({
    walletAddress,
  });

  /**
   * Handle session expiration - automatically regenerate QR code
   * Requirements: 6.2, 9.4
   */
  const handleSessionExpired = () => {
    logger.sessionExpired(walletAddress, sessionId || 'unknown');
    
    toast.error(
      'Session Expired',
      'Your verification session has expired. Generating a new QR code...'
    );
    
    // Automatically regenerate QR code
    setTimeout(() => {
      regenerateQR();
    }, 2000);
  };

  // Requirement 4.1, 4.2: Integrate useVerificationStatus hook for status polling
  const {
    status: verificationStatus,
    isPolling,
    error: statusError,
  } = useVerificationStatus({
    walletAddress,
    sessionId: sessionId || '',
    enabled: !!sessionId && !!qrData,
    sessionStartTime: sessionStartTime || undefined,
    onSessionExpired: handleSessionExpired,
  });

  /**
   * Handle verification completion
   * Requirements: 4.2, 4.3, 4.4, 6.1
   */
  useEffect(() => {
    if (!verificationStatus) return;

    // Requirement 4.2: Display successful verification
    if (verificationStatus.status === 'verified' && !hasShownSuccessToast) {
      setHasShownSuccessToast(true);
      
      // Log verification completion
      // Requirement 6.4: Log verification completion events
      logger.verificationCompleted(
        walletAddress,
        sessionId || 'unknown',
        verificationStatus.transactionHash
      );
      
      // Requirement 4.3: Store verification completion in localStorage
      const verificationData = {
        walletAddress,
        status: 'verified',
        timestamp: verificationStatus.timestamp || new Date().toISOString(),
        transactionHash: verificationStatus.transactionHash,
      };
      localStorage.setItem('kyc_verification', JSON.stringify(verificationData));
      localStorage.setItem('kyc_completed', 'true');
      
      // Requirement 4.3: Handle verification completion with success toast
      toast.success(
        'Identity Verified!',
        'Your identity has been successfully verified. Redirecting to dashboard...'
      );
      
      // Requirement 4.4: Redirect to dashboard on successful verification
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }

    // Requirement 4.5: Display verification failure
    if (verificationStatus.status === 'failed' && !hasShownFailureToast) {
      setHasShownFailureToast(true);
      
      // Log verification failure
      // Requirement 6.4: Log verification failure events with reasons
      logger.verificationFailed(
        walletAddress,
        sessionId || 'unknown',
        verificationStatus.failureReason || 'Unknown failure reason'
      );
      
      // Requirement 6.4: Handle verification failure with error toast
      toast.error(
        'Verification Failed',
        verificationStatus.failureReason || 
        'Unable to verify your identity. Please try again or contact support.'
      );
    }

    // Requirement 6.2: Handle session expiration
    if (verificationStatus.status === 'expired' && !hasShownFailureToast) {
      setHasShownFailureToast(true);
      
      toast.error(
        'Session Expired',
        'Your verification session has expired. Please generate a new QR code.'
      );
    }
  }, [verificationStatus, hasShownSuccessToast, hasShownFailureToast, walletAddress, router]);

  /**
   * Handle QR code regeneration
   * Requirements: 6.1, 6.2
   */
  const handleRegenerate = () => {
    setHasShownSuccessToast(false);
    setHasShownFailureToast(false);
    regenerateQR();
  };

  /**
   * Render verification status display
   * Requirements: 4.1, 4.2, 4.5, 4.6
   */
  const renderStatusDisplay = () => {
    if (!verificationStatus) return null;

    const statusConfig = {
      pending: {
        icon: Clock,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-100',
        title: 'Verification in Progress',
        description: 'Please complete the verification in the Self Protocol app.',
      },
      verified: {
        icon: CheckCircle,
        iconColor: 'text-green-600',
        bgColor: 'bg-green-100',
        title: 'Verification Complete!',
        description: 'Your identity has been successfully verified.',
      },
      failed: {
        icon: XCircle,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100',
        title: 'Verification Failed',
        description: verificationStatus.failureReason || 'Unable to verify your identity.',
      },
      expired: {
        icon: AlertTriangle,
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-100',
        title: 'Session Expired',
        description: 'Your verification session has expired. Please generate a new QR code.',
      },
    };

    const config = statusConfig[verificationStatus.status];
    const Icon = config.icon;

    return (
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${config.bgColor}`}>
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              {config.title}
            </h3>
            <p className="text-sm text-gray-600">
              {config.description}
            </p>
            {verificationStatus.timestamp && (
              <p className="mt-2 text-xs text-gray-500">
                {new Date(verificationStatus.timestamp).toLocaleString()}
              </p>
            )}
            {verificationStatus.transactionHash && (
              <p className="mt-1 text-xs text-gray-500">
                Transaction: {verificationStatus.transactionHash.slice(0, 10)}...
                {verificationStatus.transactionHash.slice(-8)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <MobileAppContainer>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
            Verify Your Identity
          </h1>
          <p className="text-base text-gray-600 md:text-lg">
            Complete identity verification with Self Protocol
          </p>
        </div>

        {/* QR Code Display */}
        {/* Requirements: 1.1, 1.3, 6.1 */}
        <div className="flex justify-center">
          <SelfQRDisplay
            app={app}
            qrData={qrData}
            isLoading={isGeneratingQR}
            error={qrError}
            onRegenerate={handleRegenerate}
          />
        </div>

        {/* Verification Status Display */}
        {/* Requirements: 4.1, 4.2, 4.5, 4.6 */}
        {verificationStatus && renderStatusDisplay()}

        {/* Polling Indicator */}
        {/* Requirement 4.6: Display pending state */}
        {isPolling && verificationStatus?.status === 'pending' && (
          <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-white p-4 shadow-md">
            <LoadingSpinner size="sm" />
            <p className="text-sm text-gray-600">
              Waiting for verification...
            </p>
          </div>
        )}

        {/* Status Error Display */}
        {/* Requirement 6.3: Display connection errors */}
        {statusError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Connection Error
                </p>
                <p className="mt-1 text-xs text-red-700">
                  {statusError.message}
                </p>
                <p className="mt-2 text-xs text-red-600">
                  Retrying automatically...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-md">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Need Help?
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • Make sure you have the Self Protocol app installed on your mobile device
            </p>
            <p>
              • Ensure your camera permissions are enabled
            </p>
            <p>
              • Keep this page open while completing verification
            </p>
            <p>
              • Contact support if you encounter any issues
            </p>
          </div>
        </div>
      </div>
    </MobileAppContainer>
  );
}

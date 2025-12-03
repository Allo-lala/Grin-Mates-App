'use client';

import { ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KYCStepContainerProps {
  title: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  isSubmitting?: boolean;
  validationErrors?: string[];
}

export default function KYCStepContainer({
  title,
  description,
  currentStep,
  totalSteps,
  children,
  onNext,
  onBack,
  canGoNext,
  canGoBack,
  isSubmitting = false,
  validationErrors = [],
}: KYCStepContainerProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex-1 flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all ${
                  index <= currentStep
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-1 rounded-full transition-all ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Validation errors - Requirements: 7.5 */}
        {validationErrors.length > 0 && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4" role="alert">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-800 mb-1">Please fix the following errors:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-red-700 text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step content */}
        <div className="mb-8">
          {children}
        </div>

        {/* Navigation buttons - Requirements: 7.1, 7.2 */}
        <div className="flex gap-3">
          <Button
            onClick={onBack}
            disabled={!canGoBack}
            variant="outline"
            size="lg"
            fullWidth
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!canGoNext}
            isLoading={isSubmitting}
            loadingText={isLastStep ? 'Submitting...' : 'Processing...'}
            variant="primary"
            size="lg"
            fullWidth
          >
            {isLastStep ? (
              'Complete KYC'
            ) : (
              <>
                Next <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

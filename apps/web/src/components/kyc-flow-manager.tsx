'use client';

import { useState, useEffect, useCallback } from 'react';

export interface KYCData {
  // Step 1: Personal Information
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
  };
  
  // Step 2: Address Information
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Step 3: Document Upload
  documents: {
    documentType: 'passport' | 'license' | 'id';
    documentFile: File | null;
    documentUrl?: string;
  };
  
  // Metadata
  currentStep: number;
  completedSteps: number[];
  submittedAt?: string;
  status: 'incomplete' | 'pending' | 'approved' | 'rejected';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface KYCStep {
  id: string;
  title: string;
  description?: string;
  validate: (data: Partial<KYCData>) => ValidationResult;
}

interface KYCFlowManagerProps {
  steps: KYCStep[];
  onComplete: (data: KYCData) => Promise<void>;
  persistKey?: string;
  children: (props: {
    currentStep: number;
    totalSteps: number;
    kycData: KYCData;
    updateData: (updates: Partial<KYCData>) => void;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
    canGoNext: boolean;
    canGoBack: boolean;
    isSubmitting: boolean;
    validationErrors: string[];
  }) => React.ReactNode;
}

const initialKYCData: KYCData = {
  personal: {
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
  },
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  documents: {
    documentType: 'passport',
    documentFile: null,
  },
  currentStep: 0,
  completedSteps: [],
  status: 'incomplete',
};

export default function KYCFlowManager({
  steps,
  onComplete,
  persistKey = 'kyc_data',
  children,
}: KYCFlowManagerProps) {
  const [kycData, setKYCData] = useState<KYCData>(initialKYCData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = () => {
      try {
        const stored = localStorage.getItem(persistKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Don't restore if already completed
          if (parsed.status !== 'incomplete') {
            return;
          }
          setKYCData(parsed);
        }
      } catch (error) {
        console.error('Failed to load persisted KYC data:', error);
      }
    };

    loadPersistedData();
  }, [persistKey]);

  // Persist data whenever it changes
  const persistData = useCallback((data: KYCData) => {
    try {
      localStorage.setItem(persistKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist KYC data:', error);
    }
  }, [persistKey]);

  const updateData = useCallback((updates: Partial<KYCData>) => {
    setKYCData(prev => {
      const updated = { ...prev, ...updates };
      persistData(updated);
      return updated;
    });
    setValidationErrors([]);
  }, [persistData]);

  const validateCurrentStep = useCallback((): ValidationResult => {
    const currentStepConfig = steps[kycData.currentStep];
    if (!currentStepConfig) {
      return { isValid: false, errors: ['Invalid step'] };
    }
    return currentStepConfig.validate(kycData);
  }, [steps, kycData]);

  const goToNextStep = useCallback(async () => {
    // Validate current step
    const validation = validateCurrentStep();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);

    // Mark current step as completed
    const currentStepNumber = kycData.currentStep;
    const updatedCompletedSteps = [...kycData.completedSteps];
    if (!updatedCompletedSteps.includes(currentStepNumber)) {
      updatedCompletedSteps.push(currentStepNumber);
    }

    // If this is the last step, submit
    if (kycData.currentStep === steps.length - 1) {
      setIsSubmitting(true);
      try {
        const completedData: KYCData = {
          ...kycData,
          completedSteps: updatedCompletedSteps,
          submittedAt: new Date().toISOString(),
          status: 'pending',
        };
        await onComplete(completedData);
        
        // Clear persisted data after successful submission
        localStorage.removeItem(persistKey);
        localStorage.setItem('kyc_completed', 'true');
      } catch (error) {
        setValidationErrors([error instanceof Error ? error.message : 'Submission failed']);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Move to next step
      const nextStepData: KYCData = {
        ...kycData,
        currentStep: kycData.currentStep + 1,
        completedSteps: updatedCompletedSteps,
      };
      setKYCData(nextStepData);
      persistData(nextStepData);
    }
  }, [kycData, steps, validateCurrentStep, onComplete, persistData, persistKey]);

  const goToPreviousStep = useCallback(() => {
    if (kycData.currentStep > 0) {
      const prevStepData: KYCData = {
        ...kycData,
        currentStep: kycData.currentStep - 1,
      };
      setKYCData(prevStepData);
      persistData(prevStepData);
      setValidationErrors([]);
    }
  }, [kycData, persistData]);

  const canGoNext = !isSubmitting;
  const canGoBack = kycData.currentStep > 0 && !isSubmitting;

  return (
    <>
      {children({
        currentStep: kycData.currentStep,
        totalSteps: steps.length,
        kycData,
        updateData,
        goToNextStep,
        goToPreviousStep,
        canGoNext,
        canGoBack,
        isSubmitting,
        validationErrors,
      })}
    </>
  );
}

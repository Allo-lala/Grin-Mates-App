'use client';

import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { MobileAppContainer } from '@/components/layout/mobile-app-container';
import KYCStep from '@/components/kyc-step';
import KYCFlowManager, { KYCData, KYCStep as KYCStepConfig, ValidationResult } from '@/components/kyc-flow-manager';
import KYCStepContainer from '@/components/kyc-step-container';
import { toast } from '@/lib/toast';

export default function KYCScreenComponent() {
  const router = useRouter();

  // Define step configurations with validation
  const steps: KYCStepConfig[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      validate: (data: Partial<KYCData>): ValidationResult => {
        const errors: string[] = [];
        if (!data.personal?.firstName) errors.push('First name is required');
        if (!data.personal?.lastName) errors.push('Last name is required');
        if (!data.personal?.email) errors.push('Email is required');
        if (!data.personal?.dateOfBirth) errors.push('Date of birth is required');
        return { isValid: errors.length === 0, errors };
      },
    },
    {
      id: 'address',
      title: 'Address Information',
      validate: (data: Partial<KYCData>): ValidationResult => {
        const errors: string[] = [];
        if (!data.address?.street) errors.push('Street address is required');
        if (!data.address?.city) errors.push('City is required');
        if (!data.address?.state) errors.push('State/Province is required');
        if (!data.address?.zipCode) errors.push('ZIP/Postal code is required');
        if (!data.address?.country) errors.push('Country is required');
        return { isValid: errors.length === 0, errors };
      },
    },
    {
      id: 'documents',
      title: 'Upload Document',
      validate: (data: Partial<KYCData>): ValidationResult => {
        const errors: string[] = [];
        if (!data.documents?.documentFile) errors.push('Please upload a document');
        return { isValid: errors.length === 0, errors };
      },
    },
  ];

  const handleComplete = async (data: KYCData) => {
    try {
      // Show loading toast - Requirements: 7.2
      const loadingToast = toast.loading('Submitting your KYC information...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Save KYC completion data
      localStorage.setItem("kycName", `${data.personal.firstName} ${data.personal.lastName}`);
      
      // Show success notification - Requirements: 7.3
      toast.success('KYC Verification Complete!', 'Your identity has been verified successfully.');
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error) {
      // Show error notification - Requirements: 7.4
      toast.error(
        'KYC Submission Failed',
        error instanceof Error ? error.message : 'Please try again or contact support if the issue persists.'
      );
      throw error;
    }
  };

  return (
    <MobileAppContainer>
      <KYCFlowManager steps={steps} onComplete={handleComplete}>
        {({
          currentStep,
          totalSteps,
          kycData,
          updateData,
          goToNextStep,
          goToPreviousStep,
          canGoNext,
          canGoBack,
          isSubmitting,
          validationErrors,
        }) => (
        <KYCStepContainer
          title="Verify Your Identity"
          description="Complete KYC to unlock all Grin Mates features"
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={goToNextStep}
          onBack={goToPreviousStep}
          canGoNext={canGoNext}
          canGoBack={canGoBack}
          isSubmitting={isSubmitting}
          validationErrors={validationErrors}
        >
          {/* Step 1: Personal Information */}
          {currentStep === 0 && (
            <KYCStep
              title="Personal Information"
              fields={[
                {
                  label: 'First Name',
                  type: 'text',
                  value: kycData.personal.firstName,
                  onChange: (value) => updateData({
                    personal: { ...kycData.personal, firstName: value }
                  }),
                },
                {
                  label: 'Last Name',
                  type: 'text',
                  value: kycData.personal.lastName,
                  onChange: (value) => updateData({
                    personal: { ...kycData.personal, lastName: value }
                  }),
                },
                {
                  label: 'Email',
                  type: 'email',
                  value: kycData.personal.email,
                  onChange: (value) => updateData({
                    personal: { ...kycData.personal, email: value }
                  }),
                },
                {
                  label: 'Date of Birth',
                  type: 'date',
                  value: kycData.personal.dateOfBirth,
                  onChange: (value) => updateData({
                    personal: { ...kycData.personal, dateOfBirth: value }
                  }),
                },
              ]}
            />
          )}

          {/* Step 2: Address Information */}
          {currentStep === 1 && (
            <KYCStep
              title="Address Information"
              fields={[
                {
                  label: 'Street Address',
                  type: 'text',
                  value: kycData.address.street,
                  onChange: (value) => updateData({
                    address: { ...kycData.address, street: value }
                  }),
                },
                {
                  label: 'City',
                  type: 'text',
                  value: kycData.address.city,
                  onChange: (value) => updateData({
                    address: { ...kycData.address, city: value }
                  }),
                },
                {
                  label: 'State/Province',
                  type: 'text',
                  value: kycData.address.state,
                  onChange: (value) => updateData({
                    address: { ...kycData.address, state: value }
                  }),
                },
                {
                  label: 'ZIP/Postal Code',
                  type: 'text',
                  value: kycData.address.zipCode,
                  onChange: (value) => updateData({
                    address: { ...kycData.address, zipCode: value }
                  }),
                },
                {
                  label: 'Country',
                  type: 'text',
                  value: kycData.address.country,
                  onChange: (value) => updateData({
                    address: { ...kycData.address, country: value }
                  }),
                },
              ]}
            />
          )}

          {/* Step 3: Document Upload */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Upload Document</h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Document Type
                </label>
                <select
                  value={kycData.documents.documentType}
                  onChange={(e) => updateData({
                    documents: {
                      ...kycData.documents,
                      documentType: e.target.value as 'passport' | 'license' | 'id'
                    }
                  })}
                  className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="passport">Passport</option>
                  <option value="license">Driver's License</option>
                  <option value="id">National ID</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Upload File
                </label>
                <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center hover:border-primary/50 transition-all">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => updateData({
                      documents: {
                        ...kycData.documents,
                        documentFile: e.target.files?.[0] || null
                      }
                    })}
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload" className="cursor-pointer space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-primary" />
                    <p className="font-medium text-foreground">
                      {kycData.documents.documentFile ? kycData.documents.documentFile.name : 'Click to upload'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, or PDF up to 10MB
                    </p>
                  </label>
                </div>
              </div>
            </div>
          )}
        </KYCStepContainer>
        )}
      </KYCFlowManager>
    </MobileAppContainer>
  );
}

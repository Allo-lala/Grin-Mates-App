'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Upload, FileText, Camera, CheckCircle, AlertTriangle, ArrowLeft, Smartphone } from 'lucide-react';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';

export default function KYCVerifyScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    documentType: '',
    documentNumber: '',
    licenseNumber: '',
    passportNumber: '',
    driversLicenseNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<{
    frontDocument: File | null;
    backDocument: File | null;
    selfie: File | null;
  }>({
    frontDocument: null,
    backDocument: null,
    selfie: null,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (type: 'frontDocument' | 'backDocument' | 'selfie', file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/profile');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });
      
      // Add files
      if (uploadedFiles.frontDocument) {
        submitData.append('frontDocument', uploadedFiles.frontDocument);
      }
      if (uploadedFiles.backDocument) {
        submitData.append('backDocument', uploadedFiles.backDocument);
      }
      if (uploadedFiles.selfie) {
        submitData.append('selfie', uploadedFiles.selfie);
      }
      
      // Submit to database (simulate API call)
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        body: submitData,
      });
      
      if (response.ok) {
        toast.success('KYC Submitted!', 'Your verification documents have been submitted for review. You will be notified within 24-48 hours.');
        router.push('/profile');
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('KYC submission error:', error);
      toast.error('Submission Failed', 'Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentTypes = [
    { value: 'passport', label: 'Passport', numberField: 'passportNumber', placeholder: 'Enter passport number' },
    { value: 'national_id', label: 'National ID Card', numberField: 'documentNumber', placeholder: 'Enter ID number' },
    { value: 'drivers_license', label: 'Driver\'s License', numberField: 'driversLicenseNumber', placeholder: 'Enter license number' },
  ];

  const selectedDocType = documentTypes.find(doc => doc.value === formData.documentType);

  return (
    <MobileLayout showBottomNav={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1db584] to-[#15a576] pb-8 pt-6">
          <ResponsiveContainer maxWidth="md" padding="md">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 text-white hover:text-white/80 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-white">
                Identity Verification
              </h1>
              <p className="text-white/90">
                Step {currentStep} of 3 - {currentStep === 1 ? 'Personal Information' : currentStep === 2 ? 'Document Upload' : 'Review & Submit'}
              </p>
            </div>
          </ResponsiveContainer>
        </div>

        <ResponsiveContainer maxWidth="md" padding="md" className="-mt-6 relative z-10">
          {/* Progress Bar */}
          <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    step <= currentStep
                      ? 'bg-[#1db584] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-[#1db584] rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="First Name"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    required
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                  />
                  <Input
                    label="Nationality"
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    placeholder="Enter your nationality"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Document Type
                  </label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => handleInputChange('documentType', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-[#1db584] focus:outline-none focus:ring-1 focus:ring-[#1db584] min-h-[44px]"
                    required
                  >
                    <option value="">Select document type</option>
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic document number field based on selected type */}
                {selectedDocType && (
                  <Input
                    label={`${selectedDocType.label} Number`}
                    type="text"
                    value={formData[selectedDocType.numberField as keyof typeof formData]}
                    onChange={(e) => handleInputChange(selectedDocType.numberField, e.target.value)}
                    placeholder={selectedDocType.placeholder}
                    required
                  />
                )}

                <Button
                  onClick={handleNext}
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.documentType || !formData[selectedDocType?.numberField as keyof typeof formData]}
                  className="bg-[#1db584] hover:bg-[#15a576] focus:ring-[#1db584]/50"
                >
                  Continue
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Document Upload</h2>
                
                <div className="space-y-4">
                  {/* Front Document */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1db584] transition-colors">
                    <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2 text-sm">
                      Front of {selectedDocType?.label}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      Upload a clear photo of the front side
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('frontDocument', file);
                      }}
                      className="hidden"
                      id="front-document"
                    />
                    <label
                      htmlFor="front-document"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#1db584] text-white rounded-lg hover:bg-[#15a576] cursor-pointer transition-colors text-sm"
                    >
                      <Upload className="h-4 w-4" />
                      {uploadedFiles.frontDocument ? 'Change File' : 'Upload File'}
                    </label>
                    {uploadedFiles.frontDocument && (
                      <p className="text-xs text-green-600 mt-2 truncate">
                        ✓ {uploadedFiles.frontDocument.name}
                      </p>
                    )}
                  </div>

                  {/* Back Document (if not passport) */}
                  {formData.documentType !== 'passport' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1db584] transition-colors">
                      <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <h3 className="font-medium text-gray-900 mb-2 text-sm">
                        Back of {selectedDocType?.label}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Upload a clear photo of the back side
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('backDocument', file);
                        }}
                        className="hidden"
                        id="back-document"
                      />
                      <label
                        htmlFor="back-document"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1db584] text-white rounded-lg hover:bg-[#15a576] cursor-pointer transition-colors text-sm"
                      >
                        <Upload className="h-4 w-4" />
                        {uploadedFiles.backDocument ? 'Change File' : 'Upload File'}
                      </label>
                      {uploadedFiles.backDocument && (
                        <p className="text-xs text-green-600 mt-2 truncate">
                          ✓ {uploadedFiles.backDocument.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Selfie */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1db584] transition-colors">
                    <Camera className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2 text-sm">Selfie Photo</h3>
                    <p className="text-xs text-gray-600 mb-3">
                      Take a clear selfie holding your document
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('selfie', file);
                      }}
                      className="hidden"
                      id="selfie"
                    />
                    <label
                      htmlFor="selfie"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#1db584] text-white rounded-lg hover:bg-[#15a576] cursor-pointer transition-colors text-sm"
                    >
                      <Camera className="h-4 w-4" />
                      {uploadedFiles.selfie ? 'Retake Photo' : 'Take Photo'}
                    </label>
                    {uploadedFiles.selfie && (
                      <p className="text-xs text-green-600 mt-2 truncate">
                        ✓ {uploadedFiles.selfie.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleBack}
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    variant="primary"
                    size="lg"
                    className="flex-1 bg-[#1db584] hover:bg-[#15a576] focus:ring-[#1db584]/50"
                    disabled={
                      !uploadedFiles.frontDocument ||
                      !uploadedFiles.selfie ||
                      (formData.documentType !== 'passport' && !uploadedFiles.backDocument)
                    }
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Review & Submit</h2>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date of Birth:</span>
                        <span className="font-medium">{formData.dateOfBirth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nationality:</span>
                        <span className="font-medium">{formData.nationality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Document:</span>
                        <span className="font-medium">{selectedDocType?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Document Number:</span>
                        <span className="font-medium font-mono text-xs">
                          {formData[selectedDocType?.numberField as keyof typeof formData]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Uploaded Documents</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="truncate">Front document: {uploadedFiles.frontDocument?.name}</span>
                      </div>
                      {uploadedFiles.backDocument && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="truncate">Back document: {uploadedFiles.backDocument?.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="truncate">Selfie photo: {uploadedFiles.selfie?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Review Process</h4>
                        <p className="text-sm text-blue-700">
                          Your documents will be reviewed within 24-48 hours. You'll receive a notification once the verification is complete.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleBack}
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    size="lg"
                    className="flex-1 bg-[#1db584] hover:bg-[#15a576] focus:ring-[#1db584]/50"
                    isLoading={isSubmitting}
                    loadingText="Submitting..."
                  >
                    Submit for Review
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ResponsiveContainer>
      </div>
    </MobileLayout>
  );
}
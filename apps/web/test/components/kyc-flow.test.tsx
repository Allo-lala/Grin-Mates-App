import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import KYCFlowManager, { KYCData, KYCStep, ValidationResult } from '@/components/kyc-flow-manager';

describe('KYCFlowManager', () => {
  const mockSteps: KYCStep[] = [
    {
      id: 'step1',
      title: 'Step 1',
      validate: (data: Partial<KYCData>): ValidationResult => {
        const errors: string[] = [];
        if (!data.personal?.firstName) errors.push('First name required');
        return { isValid: errors.length === 0, errors };
      },
    },
    {
      id: 'step2',
      title: 'Step 2',
      validate: (data: Partial<KYCData>): ValidationResult => {
        const errors: string[] = [];
        if (!data.address?.city) errors.push('City required');
        return { isValid: errors.length === 0, errors };
      },
    },
  ];

  const mockOnComplete = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    mockOnComplete.mockClear();
  });

  it('should initialize with step 0', () => {
    render(
      <KYCFlowManager steps={mockSteps} onComplete={mockOnComplete}>
        {({ currentStep }) => <div>Current Step: {currentStep}</div>}
      </KYCFlowManager>
    );

    expect(screen.getByText('Current Step: 0')).toBeInTheDocument();
  });

  it('should persist data to localStorage when updated', async () => {
    render(
      <KYCFlowManager steps={mockSteps} onComplete={mockOnComplete}>
        {({ kycData, updateData }) => (
          <div>
            <button
              onClick={() =>
                updateData({
                  personal: { ...kycData.personal, firstName: 'John' },
                })
              }
            >
              Update Name
            </button>
            <div>Name: {kycData.personal.firstName}</div>
          </div>
        )}
      </KYCFlowManager>
    );

    const button = screen.getByText('Update Name');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Name: John')).toBeInTheDocument();
    });

    const stored = localStorage.getItem('kyc_data');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.personal.firstName).toBe('John');
  });

  it('should prevent progression with invalid data', async () => {
    render(
      <KYCFlowManager steps={mockSteps} onComplete={mockOnComplete}>
        {({ currentStep, goToNextStep, validationErrors }) => (
          <div>
            <div>Step: {currentStep}</div>
            <button onClick={goToNextStep}>Next</button>
            {validationErrors.map((error, i) => (
              <div key={i}>Error: {error}</div>
            ))}
          </div>
        )}
      </KYCFlowManager>
    );

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Error: First name required')).toBeInTheDocument();
    });

    // Should still be on step 0
    expect(screen.getByText('Step: 0')).toBeInTheDocument();
  });

  it('should advance to next step with valid data', async () => {
    render(
      <KYCFlowManager steps={mockSteps} onComplete={mockOnComplete}>
        {({ currentStep, kycData, updateData, goToNextStep }) => (
          <div>
            <div>Step: {currentStep}</div>
            <button
              onClick={() =>
                updateData({
                  personal: { ...kycData.personal, firstName: 'John' },
                })
              }
            >
              Set Name
            </button>
            <button onClick={goToNextStep}>Next</button>
          </div>
        )}
      </KYCFlowManager>
    );

    // Set valid data
    fireEvent.click(screen.getByText('Set Name'));

    await waitFor(() => {
      const stored = localStorage.getItem('kyc_data');
      expect(stored).toBeTruthy();
    });

    // Try to advance
    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('Step: 1')).toBeInTheDocument();
    });
  });

  it('should preserve data when navigating backward', async () => {
    render(
      <KYCFlowManager steps={mockSteps} onComplete={mockOnComplete}>
        {({ currentStep, kycData, updateData, goToNextStep, goToPreviousStep }) => (
          <div>
            <div>Step: {currentStep}</div>
            <div>Name: {kycData.personal.firstName}</div>
            <button
              onClick={() =>
                updateData({
                  personal: { ...kycData.personal, firstName: 'John' },
                })
              }
            >
              Set Name
            </button>
            <button onClick={goToNextStep}>Next</button>
            <button onClick={goToPreviousStep}>Back</button>
          </div>
        )}
      </KYCFlowManager>
    );

    // Set data and advance
    fireEvent.click(screen.getByText('Set Name'));
    await waitFor(() => {
      expect(screen.getByText('Name: John')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByText('Step: 1')).toBeInTheDocument();
    });

    // Go back
    fireEvent.click(screen.getByText('Back'));
    await waitFor(() => {
      expect(screen.getByText('Step: 0')).toBeInTheDocument();
    });

    // Data should still be there
    expect(screen.getByText('Name: John')).toBeInTheDocument();
  });

  it('should restore persisted data on mount', () => {
    const persistedData = {
      personal: { firstName: 'Jane', lastName: 'Doe', email: '', dateOfBirth: '' },
      address: { street: '', city: '', state: '', zipCode: '', country: '' },
      documents: { documentType: 'passport' as const, documentFile: null },
      currentStep: 1,
      completedSteps: [0],
      status: 'incomplete' as const,
    };

    localStorage.setItem('kyc_data', JSON.stringify(persistedData));

    render(
      <KYCFlowManager steps={mockSteps} onComplete={mockOnComplete}>
        {({ currentStep, kycData }) => (
          <div>
            <div>Step: {currentStep}</div>
            <div>Name: {kycData.personal.firstName}</div>
          </div>
        )}
      </KYCFlowManager>
    );

    expect(screen.getByText('Step: 1')).toBeInTheDocument();
    expect(screen.getByText('Name: Jane')).toBeInTheDocument();
  });
});

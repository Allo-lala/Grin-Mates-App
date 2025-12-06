/**
 * Tests for SelfQRDisplay component
 * Requirements: 1.1, 1.3, 6.1
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelfQRDisplay } from '@/components/self-qr-display';
import { SelfApp } from '@selfxyz/common';

// Mock the dynamic import of SelfQRcodeWrapper
vi.mock('next/dynamic', () => ({
  default: (fn: any) => {
    const Component = () => <div data-testid="qr-code-mock">QR Code</div>;
    return Component;
  },
}));

describe('SelfQRDisplay', () => {
  const mockApp = {
    sessionId: 'test-session-id',
  } as SelfApp;

  const mockQrData = 'https://self.app/verify?session=test-session-id';
  const mockOnRegenerate = vi.fn();
  const mockOnSuccess = vi.fn();

  it('should display loading spinner when isLoading is true', () => {
    render(
      <SelfQRDisplay
        app={null}
        qrData={null}
        isLoading={true}
        error={null}
        onRegenerate={mockOnRegenerate}
      />
    );

    expect(screen.getByText(/generating your verification qr code/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display error message when error is present', () => {
    const error = new Error('Failed to generate QR code');
    
    render(
      <SelfQRDisplay
        app={null}
        qrData={null}
        isLoading={false}
        error={error}
        onRegenerate={mockOnRegenerate}
      />
    );

    expect(screen.getByText(/unable to generate qr code/i)).toBeInTheDocument();
    expect(screen.getByText(error.message)).toBeInTheDocument();
  });

  it('should display retry button when error occurs', () => {
    const error = new Error('Network error');
    
    render(
      <SelfQRDisplay
        app={null}
        qrData={null}
        isLoading={false}
        error={error}
        onRegenerate={mockOnRegenerate}
      />
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockOnRegenerate).toHaveBeenCalledTimes(1);
  });

  it('should display error when app is null', () => {
    render(
      <SelfQRDisplay
        app={null}
        qrData={mockQrData}
        isLoading={false}
        error={null}
        onRegenerate={mockOnRegenerate}
      />
    );

    expect(screen.getByText(/unable to generate qr code/i)).toBeInTheDocument();
  });

  it('should display error when qrData is null', () => {
    render(
      <SelfQRDisplay
        app={mockApp}
        qrData={null}
        isLoading={false}
        error={null}
        onRegenerate={mockOnRegenerate}
      />
    );

    expect(screen.getByText(/unable to generate qr code/i)).toBeInTheDocument();
  });

  it('should display QR code and instructions when app and qrData are valid', () => {
    render(
      <SelfQRDisplay
        app={mockApp}
        qrData={mockQrData}
        isLoading={false}
        error={null}
        onRegenerate={mockOnRegenerate}
        onSuccess={mockOnSuccess}
      />
    );

    // Check for header
    expect(screen.getByText(/scan to verify/i)).toBeInTheDocument();
    
    // Check for instructions
    expect(screen.getByText(/how to scan/i)).toBeInTheDocument();
    expect(screen.getByText(/open the self protocol app/i)).toBeInTheDocument();
    
    // Check for QR code mock
    expect(screen.getByTestId('qr-code-mock')).toBeInTheDocument();
  });

  it('should display regenerate button in success state', () => {
    render(
      <SelfQRDisplay
        app={mockApp}
        qrData={mockQrData}
        isLoading={false}
        error={null}
        onRegenerate={mockOnRegenerate}
      />
    );

    const regenerateButton = screen.getByRole('button', { name: /generate new qr code/i });
    expect(regenerateButton).toBeInTheDocument();
    
    fireEvent.click(regenerateButton);
    expect(mockOnRegenerate).toHaveBeenCalledTimes(1);
  });

  it('should display all four instruction steps', () => {
    render(
      <SelfQRDisplay
        app={mockApp}
        qrData={mockQrData}
        isLoading={false}
        error={null}
        onRegenerate={mockOnRegenerate}
      />
    );

    // Check for all instruction steps
    expect(screen.getByText(/open the self protocol app/i)).toBeInTheDocument();
    expect(screen.getByText(/tap the scan qr button/i)).toBeInTheDocument();
    expect(screen.getByText(/point your camera at the qr code/i)).toBeInTheDocument();
    expect(screen.getByText(/follow the in-app instructions/i)).toBeInTheDocument();
  });

  it('should display security message', () => {
    render(
      <SelfQRDisplay
        app={mockApp}
        qrData={mockQrData}
        isLoading={false}
        error={null}
        onRegenerate={mockOnRegenerate}
      />
    );

    expect(screen.getByText(/your data is encrypted and secure/i)).toBeInTheDocument();
  });

  it('should display app download information', () => {
    render(
      <SelfQRDisplay
        app={mockApp}
        qrData={mockQrData}
        isLoading={false}
        error={null}
        onRegenerate={mockOnRegenerate}
      />
    );

    expect(screen.getByText(/don't have the self protocol app/i)).toBeInTheDocument();
    expect(screen.getByText(/download it from the app store or google play/i)).toBeInTheDocument();
  });
});

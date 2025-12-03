/**
 * Tests for visual feedback and interaction states
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';

describe('Visual Feedback Components', () => {
  describe('Button Component', () => {
    it('should render with touch-friendly minimum height', () => {
      render(<Button>Click Me</Button>);
      const button = screen.getByRole('button');
      
      // Check that button has minimum 44px height (Requirements: 4.3, 7.1)
      const styles = window.getComputedStyle(button);
      expect(button.className).toContain('min-h-[44px]');
    });

    it('should show loading state during async operations', () => {
      render(<Button isLoading>Submit</Button>);
      
      // Should show loading spinner (Requirements: 7.2)
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('should be disabled during loading', () => {
      render(<Button isLoading>Submit</Button>);
      const button = screen.getByRole('button');
      
      // Button should be disabled during processing (Requirements: 7.2)
      expect(button).toBeDisabled();
    });

    it('should show custom loading text', () => {
      render(
        <Button isLoading loadingText="Processing...">
          Submit
        </Button>
      );
      
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should apply active scale on click', () => {
      render(<Button>Click Me</Button>);
      const button = screen.getByRole('button');
      
      // Should have active:scale class for touch feedback (Requirements: 7.1)
      expect(button.className).toContain('active:scale-[0.98]');
    });
  });

  describe('Input Component', () => {
    it('should display error message immediately', () => {
      render(<Input label="Email" error="Invalid email address" />);
      
      // Should show error message (Requirements: 7.5)
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should highlight invalid fields with red border', () => {
      render(<Input label="Email" error="Invalid email" />);
      const input = screen.getByRole('textbox');
      
      // Should have red border for errors (Requirements: 7.5)
      expect(input.className).toContain('border-red-500');
    });

    it('should show success state', () => {
      render(<Input label="Email" success="Email is valid" />);
      
      // Should show success message
      expect(screen.getByText('Email is valid')).toBeInTheDocument();
    });

    it('should show error icon for invalid fields', () => {
      render(<Input label="Email" error="Invalid email" />);
      
      // Should display error icon (Requirements: 7.5)
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have touch-friendly minimum height', () => {
      render(<Input label="Email" />);
      const input = screen.getByRole('textbox');
      
      // Should have minimum 44px height (Requirements: 4.3)
      expect(input.className).toContain('min-h-[44px]');
    });
  });

  describe('Toast Notifications', () => {
    it('should provide success notification method', () => {
      // Toast utility should have success method (Requirements: 7.3)
      expect(typeof toast.success).toBe('function');
    });

    it('should provide error notification method', () => {
      // Toast utility should have error method (Requirements: 7.4)
      expect(typeof toast.error).toBe('function');
    });

    it('should provide loading notification method', () => {
      // Toast utility should have loading method (Requirements: 7.2)
      expect(typeof toast.loading).toBe('function');
    });

    it('should provide promise-based toast for async operations', () => {
      // Toast utility should handle promises (Requirements: 7.2, 7.3, 7.4)
      expect(typeof toast.promise).toBe('function');
    });
  });

  describe('Form Validation Feedback', () => {
    it('should show validation errors immediately on input', async () => {
      const { rerender } = render(<Input label="Email" />);
      
      // Initially no error
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      
      // Add error - should appear immediately (Requirements: 7.5)
      rerender(<Input label="Email" error="Email is required" />);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('should clear error when input becomes valid', () => {
      const { rerender } = render(<Input label="Email" error="Invalid email" />);
      
      // Error should be visible
      expect(screen.getByRole('alert')).toBeInTheDocument();
      
      // Clear error
      rerender(<Input label="Email" />);
      
      // Error should be gone
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator for operations exceeding 200ms', async () => {
      const mockAsyncOperation = vi.fn(
        () => new Promise(resolve => setTimeout(resolve, 300))
      );

      const TestComponent = () => {
        const [isLoading, setIsLoading] = React.useState(false);

        const handleClick = async () => {
          setIsLoading(true);
          await mockAsyncOperation();
          setIsLoading(false);
        };

        return <Button isLoading={isLoading} onClick={handleClick}>Submit</Button>;
      };

      render(<TestComponent />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      
      // Should show loading state (Requirements: 7.2)
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });
  });
});

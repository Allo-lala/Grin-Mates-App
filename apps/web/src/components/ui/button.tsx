/**
 * Button component with visual feedback and interaction states
 * Requirements: 7.1, 7.2
 */

'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

/**
 * Button component with touch feedback and loading states
 * - Provides immediate visual feedback within 100ms (Requirements: 7.1)
 * - Shows loading indicator for async operations (Requirements: 7.2)
 * - Disabled state during processing (Requirements: 7.2)
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      disabled,
      children,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variantClasses = {
      primary:
        'bg-[#1db584] text-white hover:bg-[#1db584]/90 hover:shadow-lg focus:ring-[#1db584]/50',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-md focus:ring-gray-300',
      outline:
        'border-2 border-gray-300 bg-transparent text-gray-900 hover:border-[#1db584] hover:bg-[#1db584]/5 focus:ring-[#1db584]/50',
      ghost:
        'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
      danger:
        'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg focus:ring-red-500/50',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-3 text-base min-h-[44px]', // Touch-friendly 44px minimum (Requirements: 4.3)
      lg: 'px-6 py-4 text-lg min-h-[48px]',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          widthClass,
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

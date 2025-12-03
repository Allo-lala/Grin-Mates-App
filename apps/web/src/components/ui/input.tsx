/**
 * Input component with immediate validation feedback
 * Requirements: 7.5
 */

'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
}

/**
 * Input component with immediate validation feedback
 * - Highlights invalid fields with red borders (Requirements: 7.5)
 * - Displays specific error messages (Requirements: 7.5)
 * - Shows success state when validation passes
 * - Touch-friendly sizing (min 44px height)
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      success,
      helperText,
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    const baseClasses =
      'w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-100 focus:outline-none focus:ring-2 min-h-[44px]';

    const stateClasses = hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : hasSuccess
      ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
      : 'border-muted focus:border-primary focus:ring-primary/20';

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(baseClasses, stateClasses, className)}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : hasSuccess
                ? `${inputId}-success`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />
          
          {/* Validation icon */}
          {(hasError || hasSuccess) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {hasError ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
        </div>

        {/* Error message - Requirements: 7.5 */}
        {hasError && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 flex items-start gap-1 text-sm text-red-600"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {/* Success message */}
        {hasSuccess && (
          <p
            id={`${inputId}-success`}
            className="mt-1.5 flex items-start gap-1 text-sm text-green-600"
          >
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{success}</span>
          </p>
        )}

        {/* Helper text */}
        {!hasError && !hasSuccess && helperText && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

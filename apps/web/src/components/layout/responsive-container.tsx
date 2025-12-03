import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
};

const paddingClasses = {
  none: '',
  sm: 'px-3 py-2',
  md: 'px-4 py-3 md:px-6 md:py-4',
  lg: 'px-6 py-4 md:px-8 md:py-6',
};

/**
 * ResponsiveContainer provides consistent padding and max-width across breakpoints
 * Ensures content is readable on all screen sizes with mobile-first approach
 */
export function ResponsiveContainer({
  children,
  maxWidth = 'lg',
  padding = 'md',
  className,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

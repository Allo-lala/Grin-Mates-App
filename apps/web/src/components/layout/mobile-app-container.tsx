import React from 'react';
import { cn } from '@/lib/utils';

interface MobileAppContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * MobileAppContainer - Keeps the app in a mobile-sized view even on large screens
 * Similar to ETHDenver's approach where the app stays mobile-sized on desktop
 * This prevents icons and images from losing quality on larger screens
 * 
 * Requirements: 1.2, 1.3, 4.1
 */
export function MobileAppContainer({ children, className }: MobileAppContainerProps) {
  return (
    <div className="flex min-h-screen justify-center bg-gray-100 py-0 md:py-8">
      <div
        className={cn(
          'relative w-full bg-white shadow-2xl',
          // Mobile: full width, full height
          'min-h-screen',
          // Tablet and up: constrained to mobile width, allow scrolling
          'md:min-h-0 md:max-w-[430px] md:rounded-3xl md:overflow-y-auto md:my-0',
          // Large screens: slightly larger but still mobile-like
          'lg:max-w-[480px]',
          // Allow content to determine height on desktop
          'md:h-auto',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

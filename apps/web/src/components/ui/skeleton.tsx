'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton component for loading placeholders
 * Provides visual feedback while content is loading
 * Requirements: 7.2
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

/**
 * Pre-built skeleton patterns for common use cases
 */
export function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-muted p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function AvatarSkeleton() {
  return <Skeleton className="h-10 w-10 rounded-full" />;
}

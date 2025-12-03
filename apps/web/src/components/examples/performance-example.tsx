'use client';

import { useState } from 'react';
import { LazyImage } from '@/components/ui/lazy-image';
import { LoadingSpinner, LoadingState } from '@/components/ui/loading-spinner';
import { Skeleton, CardSkeleton } from '@/components/ui/skeleton';
import { useAsync } from '@/lib/hooks/use-async';

/**
 * Example component demonstrating performance optimization features
 * This file serves as a reference for using the performance components
 * Requirements: 1.5, 5.2, 7.2
 */

// Simulated async operation
const fetchData = async (delay = 1000) => {
  await new Promise(resolve => setTimeout(resolve, delay));
  return { message: 'Data loaded successfully!' };
};

export function PerformanceExample() {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const { data, isLoading, execute } = useAsync(fetchData);

  return (
    <div className="space-y-8 p-4">
      <section>
        <h2 className="mb-4 text-xl font-bold">LazyImage Example</h2>
        <div className="grid grid-cols-2 gap-4">
          <LazyImage
            src="/assets/images/onboarding.png"
            alt="Onboarding"
            width={300}
            height={200}
            className="rounded-lg"
          />
          <LazyImage
            src="/assets/images/eco.png"
            alt="Eco"
            width={300}
            height={200}
            className="rounded-lg"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Loading States Example</h2>
        <div className="space-y-4">
          <button
            onClick={() => execute(2000)}
            disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Trigger Async Operation'}
          </button>

          <LoadingState isLoading={isLoading}>
            <div className="rounded-lg border p-4">
              {data ? data.message : 'Click the button to load data'}
            </div>
          </LoadingState>

          <div className="flex items-center gap-4">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Skeleton Loading Example</h2>
        <button
          onClick={() => setShowSkeleton(!showSkeleton)}
          className="mb-4 rounded-lg bg-primary px-4 py-2 text-white"
        >
          Toggle Skeleton
        </button>

        {showSkeleton ? (
          <div className="space-y-4">
            <CardSkeleton />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-bold">Card Title</h3>
              <p className="text-sm text-muted-foreground">Card content loaded</p>
            </div>
            <div className="h-20 rounded-lg border p-4">Content loaded</div>
          </div>
        )}
      </section>
    </div>
  );
}

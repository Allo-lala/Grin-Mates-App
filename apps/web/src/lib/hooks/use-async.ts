'use client';

import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

/**
 * Hook for managing async operations with loading states
 * Automatically shows loading state for operations > 200ms
 * Requirements: 7.2
 */
export function useAsync<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, error: null, isLoading: true });

      try {
        const data = await asyncFunction(...args);
        setState({ data, error: null, isLoading: false });
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setState({ data: null, error: err, isLoading: false });
        throw err;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for managing async operations with minimum loading time
 * Ensures loading state is visible for at least 200ms for better UX
 * Requirements: 7.2
 */
export function useAsyncWithMinLoadingTime<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  minLoadingTime = 200
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, error: null, isLoading: true });
      const startTime = Date.now();

      try {
        const data = await asyncFunction(...args);
        
        // Ensure minimum loading time for better UX
        const elapsed = Date.now() - startTime;
        if (elapsed < minLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
        }

        setState({ data, error: null, isLoading: false });
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        
        // Ensure minimum loading time even on error
        const elapsed = Date.now() - startTime;
        if (elapsed < minLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
        }

        setState({ data: null, error: err, isLoading: false });
        throw err;
      }
    },
    [asyncFunction, minLoadingTime]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

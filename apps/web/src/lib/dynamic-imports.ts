import dynamic from 'next/dynamic';
import type { ComponentType, ReactElement } from 'react';

/**
 * Utility functions for code splitting with dynamic imports
 * Provides consistent loading states for dynamically imported components
 * Requirements: 5.2, 5.4
 */

/**
 * Create a dynamically imported component with loading spinner
 */
export function createDynamicComponent<P = Record<string, never>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    ssr?: boolean;
    loading?: () => ReactElement | null;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading,
    ssr: options?.ssr ?? false,
  });
}

/**
 * Create a dynamically imported component with skeleton loading
 */
export function createDynamicComponentWithSkeleton<P = Record<string, never>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent: () => ReactElement,
  options?: {
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: LoadingComponent,
    ssr: options?.ssr ?? false,
  });
}

/**
 * Example: Dynamic import for modals that aren't immediately visible
 */
export function createDynamicModal<P = Record<string, never>>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return dynamic(importFn, {
    ssr: false,
  });
}

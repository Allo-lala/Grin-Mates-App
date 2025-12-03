/**
 * Performance monitoring utilities
 * Helps track and optimize application performance
 * Requirements: 5.1, 5.2
 */

/**
 * Measure navigation transition time
 * Requirements: 5.1 (transitions should complete within 300ms)
 */
export function measureNavigationTime(callback: () => void) {
  const startTime = performance.now();
  
  callback();
  
  requestAnimationFrame(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Navigation completed in ${duration.toFixed(2)}ms`);
      
      if (duration > 300) {
        console.warn(`Navigation exceeded 300ms target: ${duration.toFixed(2)}ms`);
      }
    }
    
    return duration;
  });
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if an operation should show loading state
 * Requirements: 7.2 (show loading for operations > 200ms)
 */
export function shouldShowLoading(startTime: number, threshold = 200): boolean {
  return performance.now() - startTime > threshold;
}

/**
 * Measure component render time (for development)
 */
export function measureRenderTime(componentName: string) {
  if (process.env.NODE_ENV !== 'development') {
    return { start: () => {}, end: () => {} };
  }
  
  let startTime: number;
  
  return {
    start: () => {
      startTime = performance.now();
    },
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`${componentName} rendered in ${duration.toFixed(2)}ms`);
    },
  };
}

/**
 * Preload a route for faster navigation
 */
export function preloadRoute(href: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
}

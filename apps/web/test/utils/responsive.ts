/**
 * Test utilities for responsive design testing
 */
import { vi } from 'vitest';

export const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Set the viewport width for testing responsive behavior
 */
export function setViewportWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
}

/**
 * Set viewport to a specific breakpoint
 */
export function setBreakpoint(breakpoint: Breakpoint): void {
  setViewportWidth(BREAKPOINTS[breakpoint]);
}

/**
 * Check if current viewport matches mobile breakpoint (< 768px)
 */
export function isMobileViewport(): boolean {
  return window.innerWidth < BREAKPOINTS.tablet;
}

/**
 * Check if current viewport matches tablet breakpoint (768px - 1024px)
 */
export function isTabletViewport(): boolean {
  return window.innerWidth >= BREAKPOINTS.tablet && window.innerWidth < BREAKPOINTS.desktop;
}

/**
 * Check if current viewport matches desktop breakpoint (>= 1024px)
 */
export function isDesktopViewport(): boolean {
  return window.innerWidth >= BREAKPOINTS.desktop;
}

/**
 * Test a component at multiple breakpoints
 */
export function testAtBreakpoints(
  breakpoints: Breakpoint[],
  testFn: (breakpoint: Breakpoint) => void
): void {
  breakpoints.forEach((breakpoint) => {
    setBreakpoint(breakpoint);
    testFn(breakpoint);
  });
}

/**
 * Mock matchMedia for responsive testing
 */
export function mockMatchMedia(width: number): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: evaluateMediaQuery(query, width),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/**
 * Simple media query evaluator for testing
 */
function evaluateMediaQuery(query: string, width: number): boolean {
  // Extract min-width or max-width from query
  const minWidthMatch = query.match(/min-width:\s*(\d+)px/);
  const maxWidthMatch = query.match(/max-width:\s*(\d+)px/);
  
  if (minWidthMatch) {
    const minWidth = parseInt(minWidthMatch[1], 10);
    return width >= minWidth;
  }
  
  if (maxWidthMatch) {
    const maxWidth = parseInt(maxWidthMatch[1], 10);
    return width <= maxWidth;
  }
  
  return false;
}

/**
 * Reset viewport to default mobile size
 */
export function resetViewport(): void {
  setBreakpoint('mobile');
  mockMatchMedia(BREAKPOINTS.mobile);
}

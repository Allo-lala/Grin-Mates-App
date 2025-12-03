/**
 * Toast notification utilities using Sonner
 * Requirements: 7.3, 7.4
 */

import { toast as sonnerToast } from 'sonner';

export const toast = {
  /**
   * Show success notification
   * Requirements: 7.3
   */
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 3000,
    });
  },

  /**
   * Show error notification with actionable guidance
   * Requirements: 7.4
   */
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Show info notification
   */
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 3000,
    });
  },

  /**
   * Show loading notification
   * Requirements: 7.2
   */
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (toastId: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  /**
   * Show promise-based toast with automatic state handling
   * Requirements: 7.2, 7.3, 7.4
   */
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};

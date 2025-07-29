/**
 * Toast utility functions
 * Reusable utilities untuk toast management dan ID generation
 */

import { TOAST_CONFIG } from '@/types/toast';
import { clearAllTimeouts, createSafeTimeout } from '@/utils/common';

/**
 * Counter untuk unique ID generation
 */
let toastIdCounter = 0;

/**
 * Generate unique toast ID
 * Menggunakan counter yang safe dan predictable
 */
export const generateToastId = (): string => {
  toastIdCounter = (toastIdCounter + 1) % Number.MAX_SAFE_INTEGER;
  return toastIdCounter.toString();
};

/**
 * Map untuk menyimpan timeout references
 */
export const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Add toast ke remove queue dengan delay
 */
export const addToRemoveQueue = (
  toastId: string,
  dispatch: (action: { type: 'REMOVE_TOAST'; toastId?: string }) => void,
  delay: number = TOAST_CONFIG.REMOVE_DELAY
): void => {
  // Use centralized safe timeout utility
  createSafeTimeout(
    () => {
      dispatch({
        type: 'REMOVE_TOAST',
        toastId: toastId,
      });
    },
    delay,
    toastTimeouts,
    toastId
  );
};

/**
 * Clear all pending toast timeouts
 * Useful for cleanup on unmount or reset
 */
export const clearAllToastTimeouts = (): void => {
  clearAllTimeouts(toastTimeouts);
};

/**
 * Clear timeout untuk specific toast
 */
export const clearToastTimeout = (toastId: string): void => {
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId));
    toastTimeouts.delete(toastId);
  }
};

// Removed duplicate clearAllToastTimeouts function - using centralized utility above

/**
 * Validate toast input
 */
export const validateToastInput = (props: unknown): boolean => {
  if (!props || typeof props !== 'object') {
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.warn('Toast props must be an object');
    });
    return false;
  }

  // Basic validation - bisa diperluas sesuai kebutuhan
  return true;
};

/**
 * Get toast duration berdasarkan type atau custom duration
 */
export const getToastDuration = (variant?: string, customDuration?: number): number => {
  if (customDuration !== undefined) {
    return customDuration;
  }

  // Default durations berdasarkan variant
  switch (variant) {
    case 'destructive':
      return 8000; // Error messages lebih lama
    case 'success':
      return 4000; // Success messages lebih pendek
    case 'warning':
      return 6000; // Warning messages medium
    default:
      return TOAST_CONFIG.DEFAULT_DURATION;
  }
};

/**
 * Format toast message untuk accessibility
 */
export const formatToastForA11y = (
  title?: React.ReactNode,
  description?: React.ReactNode
): string => {
  const titleText = typeof title === 'string' ? title : '';
  const descriptionText = typeof description === 'string' ? description : '';

  return [titleText, descriptionText].filter(Boolean).join('. ');
};

/**
 * Check if toast should auto-dismiss
 */
export const shouldAutoDismiss = (variant?: string): boolean => {
  // Error toasts biasanya tidak auto-dismiss
  return variant !== 'destructive';
};

/**
 * Sanitize toast content untuk security
 */
export const sanitizeToastContent = (content: React.ReactNode): React.ReactNode => {
  // Basic sanitization - bisa diperluas dengan library seperti DOMPurify
  if (typeof content === 'string') {
    return content.trim();
  }

  return content;
};

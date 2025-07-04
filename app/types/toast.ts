/**
 * Type definitions untuk Toast system
 * Centralized types untuk consistency dan reusability
 */

import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

/**
 * Extended toast interface dengan additional properties
 */
export interface ToasterToast extends Omit<ToastProps, 'title'> {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement | null;
}

/**
 * Toast action types untuk reducer
 */
export const TOAST_ACTION_TYPES = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

export type ToastActionType = typeof TOAST_ACTION_TYPES;

/**
 * Toast actions untuk reducer
 */
export type ToastAction =
  | {
      type: ToastActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ToastActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ToastActionType['DISMISS_TOAST'];
      toastId?: ToasterToast['id'];
    }
  | {
      type: ToastActionType['REMOVE_TOAST'];
      toastId?: ToasterToast['id'];
    };

/**
 * Toast state interface
 */
export interface ToastState {
  toasts: ToasterToast[];
}

/**
 * Toast configuration constants
 */
export const TOAST_CONFIG = {
  LIMIT: 1,
  REMOVE_DELAY: 1000000, // 1000 seconds
  DEFAULT_DURATION: 5000, // 5 seconds
} as const;

/**
 * Toast utility types
 */
export type ToastInput = Omit<ToasterToast, 'id'> & {
  action?: ToastActionElement | React.ReactNode | null;
};

export interface ToastReturn {
  id: string;
  dismiss: () => void;
  update: (props: ToasterToast) => void;
}

/**
 * Toast hook options
 */
export interface UseToastOptions {
  /**
   * Maximum number of toasts to show
   */
  limit?: number;

  /**
   * Default duration before auto-dismiss (ms)
   */
  defaultDuration?: number;

  /**
   * Delay before removing dismissed toast (ms)
   */
  removeDelay?: number;
}

/**
 * Toast hook return type
 */
export interface UseToastReturn {
  toasts: ToasterToast[];
  toast: (props: ToastInput) => ToastReturn;
  dismiss: (toastId?: string) => void;
  clear: () => void;
}

/**
 * Toast components export
 * Re-export semua toast-related components dan hooks
 */

// Re-export main hook
export { useToast, toast } from '@/hooks/core';

// Re-export types
export type {
  ToasterToast,
  ToastInput,
  ToastReturn,
  UseToastOptions,
  UseToastReturn,
} from '@/types/toast';

// Re-export utilities
export {
  generateToastId,
  validateToastInput,
  sanitizeToastContent,
  clearAllToastTimeouts,
  addToRemoveQueue,
  clearToastTimeout,
  getToastDuration,
  formatToastForA11y,
  shouldAutoDismiss,
} from '@/utils/toastUtils';

// Re-export reducer dan action creators
export {
  toastReducer,
  toastActionCreators,
  initialToastState,
} from '@/hooks/toast/toastReducer';

/**
 * Toast provider component untuk global toast management
 */
import React, { createContext, useContext, type ReactNode } from 'react';
import { useToast } from '@/hooks/core';
import type { UseToastReturn } from '@/types/toast';
import type { ToastActionElement } from '@/components/ui/toast';

const ToastContext = createContext<UseToastReturn | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toastApi = useToast();

  return <ToastContext.Provider value={toastApi}>{children}</ToastContext.Provider>;
};

/**
 * Hook untuk menggunakan toast context
 */
export const useToastContext = (): UseToastReturn => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

/**
 * Toast notification component
 */
interface ToastNotificationProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: ToastActionElement | null;
  onClose?: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  title,
  description,
  variant = 'default',
  duration,
  action,
  onClose,
}) => {
  const { toast } = useToastContext();

  React.useEffect(() => {
    const toastInstance = toast({
      title,
      description,
      variant,
      duration,
      action,
      onOpenChange: (open) => {
        if (!open) onClose?.();
      },
    });

    return () => {
      toastInstance.dismiss();
    };
  }, [title, description, variant, duration, action, onClose, toast]);

  return null;
};

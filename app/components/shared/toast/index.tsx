/**
 * Toast components export
 * Re-export semua toast-related components dan hooks
 */

// Re-export main hook
export { toast, useToast } from '@/hooks/core';
// Re-export reducer dan action creators
export {
  initialToastState,
  toastActionCreators,
  toastReducer,
} from '@/hooks/toast/toastReducer';
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
  addToRemoveQueue,
  clearAllToastTimeouts,
  clearToastTimeout,
  formatToastForA11y,
  generateToastId,
  getToastDuration,
  sanitizeToastContent,
  shouldAutoDismiss,
  validateToastInput,
} from '@/utils/toastUtils';

/**
 * Toast provider component untuk global toast management
 */
import React, { createContext, type ReactNode, useContext } from 'react';
import type { ToastActionElement } from '@/components/ui/toast';
import { useToast } from '@/hooks/core';
import type { UseToastReturn } from '@/types/toast';

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

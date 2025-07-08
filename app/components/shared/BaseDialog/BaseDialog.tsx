/**
 * @fileoverview Base Dialog Component - Reusable dialog wrapper
 * @author Axel Modra
 */

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface BaseDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to call when dialog should close */
  onClose: () => void;
  /** Dialog title */
  title: string;
  /** Optional dialog description */
  description?: string;
  /** Dialog content */
  children: React.ReactNode;
  /** Additional CSS classes for the dialog content */
  className?: string;
  /** Size variant for the dialog */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether to close on escape key */
  closeOnEscape?: boolean;
  /** Whether to close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Custom footer content */
  footer?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Success state */
  success?: string | null;
}

/**
 * Size variants for dialog content
 */
const sizeVariants = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[95vw] max-h-[95vh]',
} as const;

/**
 * Base Dialog Component
 * Provides consistent dialog behavior and styling across the application
 */
export const BaseDialog: React.FC<BaseDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
  showCloseButton: _showCloseButton = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  footer,
  isLoading = false,
  error,
  success,
}) => {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, onClose]);

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          sizeVariants[size],
          'flex flex-col',
          isLoading && 'pointer-events-none opacity-75',
          className
        )}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
      >
        <DialogHeader>
          <DialogTitle id="dialog-title" className="text-lg font-semibold">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription id="dialog-description" className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Status Messages */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">{children}</div>

        {/* Footer */}
        {footer && <div className="mt-4 flex justify-end space-x-2 border-t pt-4">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Hook for managing dialog state
 */
export const useBaseDialog = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const openDialog = useCallback(() => setIsOpen(true), []);
  const closeDialog = useCallback(() => setIsOpen(false), []);
  const toggleDialog = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    openDialog,
    closeDialog,
    toggleDialog,
  };
};

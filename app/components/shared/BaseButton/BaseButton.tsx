/**
 * @fileoverview Base Button Component - Enhanced reusable button
 * @author Axel Modra
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type React from 'react';
import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Button variants with enhanced styling options
 */
const baseButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-green-600 text-white shadow hover:bg-green-700',
        warning: 'bg-yellow-600 text-white shadow hover:bg-yellow-700',
        info: 'bg-blue-600 text-white shadow hover:bg-blue-700',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        xl: 'h-12 rounded-md px-10 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

export interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof baseButtonVariants> {
  /** Loading state */
  isLoading?: boolean;
  /** Icon to display before text */
  leftIcon?: React.ReactNode;
  /** Icon to display after text */
  rightIcon?: React.ReactNode;
  /** Tooltip text */
  tooltip?: string;
  /** Whether button should take full width */
  fullWidth?: boolean;
  /** Custom loading text */
  loadingText?: string;
  /** Confirmation required before action */
  requireConfirmation?: boolean;
  /** Confirmation message */
  confirmationMessage?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA described by for accessibility */
  'aria-describedby'?: string;
  /** ARIA pressed state for toggle buttons */
  'aria-pressed'?: boolean;
}

/**
 * Enhanced Base Button Component
 * Provides consistent button behavior and styling with additional features
 */
export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      leftIcon,
      rightIcon,
      tooltip,
      loadingText,
      requireConfirmation = false,
      confirmationMessage = 'Are you sure?',
      children,
      onClick,
      disabled,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-pressed': ariaPressed,
      ...props
    },
    ref
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (requireConfirmation) {
        if (window.confirm(confirmationMessage)) {
          onClick?.(event);
        }
      } else {
        onClick?.(event);
      }
    };

    const isDisabled = disabled || isLoading;

    const buttonContent = (
      <>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}

        {children && <span className={cn(isLoading && loadingText && 'sr-only')}>{children}</span>}

        {isLoading && loadingText && <span>{loadingText}</span>}

        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </>
    );

    const button = (
      <Button
        ref={ref}
        className={cn(baseButtonVariants({ variant, size, fullWidth }), className)}
        disabled={isDisabled}
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-pressed={ariaPressed}
        {...props}
      >
        {buttonContent}
      </Button>
    );

    // Add tooltip if provided
    if (tooltip) {
      return (
        <div className="group relative">
          {button}
          <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
            {tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      );
    }

    return button;
  }
);

BaseButton.displayName = 'BaseButton';

/**
 * Button group component for related actions
 */
export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
  spacing = 'sm',
}) => {
  const spacingClasses = {
    none: '',
    sm: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    md: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4',
    lg: orientation === 'horizontal' ? 'space-x-6' : 'space-y-6',
  };

  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
        spacingClasses[spacing],
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * UndoRedoButton Component
 * Komponen button individual untuk undo atau redo action
 * 
 * @author Axel Modra
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UndoRedoButtonProps } from '../types/undoRedo.types';
import { 
  getButtonConfig, 
  getButtonClasses, 
  getIconClasses,
  getAriaLabel,
  getTestId
} from '../utils/undoRedo.utils';

/**
 * Komponen UndoRedoButton
 * Menampilkan satu button untuk undo atau redo dengan styling yang konsisten
 * 
 * @param props - Props untuk komponen
 * @returns JSX Element
 */
export const UndoRedoButton: React.FC<UndoRedoButtonProps> = React.memo(({
  type,
  onClick,
  canPerform,
  className,
  disabled = false,
  showTooltip = true,
  compact = false,
  shortcut
}) => {
  // Mendapatkan konfigurasi button berdasarkan type
  const config = getButtonConfig(type);
  const IconComponent = config.icon;

  // Menentukan apakah button dapat diklik
  const isClickable = canPerform && !disabled;

  // Handler untuk click event
  const handleClick = () => {
    if (isClickable) {
      onClick();
    }
  };

  // CSS classes untuk button
  const buttonClasses = cn(
    getButtonClasses(isClickable, 'desktop', compact),
    className
  );

  // CSS classes untuk icon
  const iconClasses = getIconClasses('desktop', compact);

  // Aria label dengan shortcut info
  const ariaLabel = getAriaLabel(type, !!shortcut);

  // Tooltip text
  const tooltipText = showTooltip 
    ? `${config.tooltip}${shortcut ? ` (${shortcut})` : ''}` 
    : config.tooltip;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={!isClickable}
      className={buttonClasses}
      aria-label={ariaLabel}
      title={tooltipText}
      data-testid={getTestId(type)}
    >
      <IconComponent 
        className={iconClasses}
        aria-hidden="true"
      />
    </Button>
  );
});

// Set display name untuk debugging
UndoRedoButton.displayName = 'UndoRedoButton';

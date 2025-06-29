/**
 * UndoRedo Utilities
 * Utility functions for undo/redo operations
 *
 * @author Axel Modra
 */

import { RotateCcw, RotateCw } from "lucide-react";
import type { 
  UndoRedoAction, 
  ButtonConfig, 
  KeyboardShortcutConfig,
  UndoRedoStyling,
  ButtonSize
} from '../types/undoRedo.types';

/**
 * Default keyboard shortcuts configuration
 */
export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcutConfig = {
  undo: {
    key: 'z',
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    description: 'Ctrl+Z'
  },
  redo: {
    key: 'y',
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    description: 'Ctrl+Y'
  }
};

/**
 * Button configuration for undo and redo
 */
export const BUTTON_CONFIGS: Record<UndoRedoAction, ButtonConfig> = {
  undo: {
    icon: RotateCcw,
    ariaLabel: 'Undo',
    tooltip: 'Undo',
    shortcut: DEFAULT_KEYBOARD_SHORTCUTS.undo.description
  },
  redo: {
    icon: RotateCw,
    ariaLabel: 'Redo', 
    tooltip: 'Redo',
    shortcut: DEFAULT_KEYBOARD_SHORTCUTS.redo.description
  }
};

/**
 * Styling configuration untuk berbagai breakpoints
 * Updated to prevent scroll effects by removing scale transforms
 */
export const STYLING_CONFIGS: Record<string, UndoRedoStyling> = {
  mobile: {
    container: 'flex items-center space-x-1 flex-shrink-0',
    button: 'h-8 w-8 p-0 rounded-md transition-colors duration-200 touch-manipulation transform-none',
    icon: 'h-3 w-3',
    spacing: 'space-x-1',
    animation: 'transition-colors duration-200'
  },
  tablet: {
    container: 'flex items-center space-x-1 flex-shrink-0',
    button: 'h-7 w-7 p-0 rounded-md transition-colors duration-200 touch-manipulation transform-none',
    icon: 'h-3 w-3',
    spacing: 'space-x-1',
    animation: 'transition-colors duration-200'
  },
  desktop: {
    container: 'flex items-center space-x-1 flex-shrink-0',
    button: 'h-8 w-8 p-0 rounded-md transition-colors duration-200 transform-none',
    icon: 'h-4 w-4',
    spacing: 'space-x-1',
    animation: 'transition-colors duration-200'
  }
};

/**
 * Mendapatkan konfigurasi button berdasarkan action type
 * @param action - Type action (undo atau redo)
 * @returns Konfigurasi button
 */
export const getButtonConfig = (action: UndoRedoAction): ButtonConfig => {
  return BUTTON_CONFIGS[action];
};

/**
 * Mendapatkan styling configuration berdasarkan breakpoint
 * @param breakpoint - Breakpoint saat ini
 * @returns Styling configuration
 */
export const getStylingConfig = (breakpoint: string): UndoRedoStyling => {
  return STYLING_CONFIGS[breakpoint] || STYLING_CONFIGS.desktop;
};

/**
 * Mengecek apakah keyboard event match dengan shortcut
 * @param event - Keyboard event
 * @param shortcut - Shortcut configuration
 * @returns True jika match, false jika tidak
 */
export const matchesShortcut = (
  event: KeyboardEvent, 
  shortcut: KeyboardShortcutConfig['undo'] | KeyboardShortcutConfig['redo']
): boolean => {
  return (
    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
    event.ctrlKey === shortcut.ctrlKey &&
    event.shiftKey === shortcut.shiftKey &&
    event.altKey === shortcut.altKey
  );
};

/**
 * Mendapatkan CSS classes untuk button berdasarkan state
 * @param canPerform - Apakah action dapat dilakukan
 * @param breakpoint - Breakpoint saat ini
 * @param compact - Mode compact
 * @returns String CSS classes
 */
export const getButtonClasses = (
  canPerform: boolean,
  breakpoint: string = 'desktop',
  compact: boolean = false
): string => {
  const config = getStylingConfig(breakpoint);
  const baseClasses = [
    config.button,
    // Prevent scroll effects
    'transform-none',
    'will-change-auto',
    'transition-colors',
    'duration-200',
    'ease-in-out'
  ];

  // State-based classes
  if (canPerform) {
    baseClasses.push(
      'hover:bg-accent',
      'hover:text-accent-foreground',
      'active:bg-accent/80',
      'focus-visible:ring-2',
      'focus-visible:ring-ring'
    );
  } else {
    baseClasses.push('opacity-50 cursor-not-allowed');
  }

  // Compact mode adjustments
  if (compact) {
    if (breakpoint === 'mobile') {
      baseClasses.push('h-6 w-6');
    } else if (breakpoint === 'tablet') {
      baseClasses.push('h-6 w-6');
    } else {
      baseClasses.push('h-7 w-7');
    }
  }

  // Prevent layout shift and scroll issues
  baseClasses.push('flex-shrink-0', 'contain-layout');

  return baseClasses.join(' ');
};

/**
 * Mendapatkan CSS classes untuk icon berdasarkan breakpoint
 * @param breakpoint - Breakpoint saat ini
 * @param compact - Mode compact
 * @returns String CSS classes
 */
export const getIconClasses = (
  breakpoint: string = 'desktop',
  compact: boolean = false
): string => {
  const config = getStylingConfig(breakpoint);
  let iconClasses = config.icon;

  // Compact mode adjustments
  if (compact) {
    iconClasses = 'h-2 w-2';
  }

  return iconClasses;
};

/**
 * Mendapatkan aria label dengan shortcut information
 * @param action - Type action
 * @param includeShortcut - Apakah include shortcut dalam label
 * @returns Aria label string
 */
export const getAriaLabel = (
  action: UndoRedoAction,
  includeShortcut: boolean = true
): string => {
  const config = getButtonConfig(action);
  const baseLabel = config.ariaLabel;
  
  if (includeShortcut) {
    return `${baseLabel} (${config.shortcut})`;
  }
  
  return baseLabel;
};

/**
 * Mendapatkan tooltip text dengan shortcut information
 * @param action - Type action
 * @param includeShortcut - Apakah include shortcut dalam tooltip
 * @returns Tooltip text
 */
export const getTooltipText = (
  action: UndoRedoAction,
  includeShortcut: boolean = true
): string => {
  const config = getButtonConfig(action);
  const baseTooltip = config.tooltip;
  
  if (includeShortcut) {
    return `${baseTooltip} (${config.shortcut})`;
  }
  
  return baseTooltip;
};

/**
 * Mendapatkan container classes berdasarkan breakpoint
 * @param breakpoint - Breakpoint saat ini
 * @param className - Additional CSS classes
 * @returns String CSS classes
 */
export const getContainerClasses = (
  breakpoint: string = 'desktop',
  className?: string
): string => {
  const config = getStylingConfig(breakpoint);
  const classes = [config.container];
  
  if (className) {
    classes.push(className);
  }
  
  return classes.join(' ');
};

/**
 * Validasi props untuk UndoRedoButtons
 * @param props - Props yang akan divalidasi
 * @returns True jika valid, false jika tidak
 */
export const validateProps = (props: {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}): boolean => {
  return (
    typeof props.onUndo === 'function' &&
    typeof props.onRedo === 'function' &&
    typeof props.canUndo === 'boolean' &&
    typeof props.canRedo === 'boolean'
  );
};

/**
 * Mendapatkan button size berdasarkan breakpoint
 * @param breakpoint - Breakpoint saat ini
 * @param compact - Mode compact
 * @returns Button size
 */
export const getButtonSize = (
  breakpoint: string = 'desktop',
  compact: boolean = false
): ButtonSize => {
  if (compact) return 'sm';
  
  switch (breakpoint) {
    case 'mobile':
      return 'sm';
    case 'tablet':
      return 'sm';
    case 'desktop':
    default:
      return 'md';
  }
};

/**
 * Mendapatkan test ID untuk button
 * @param action - Type action
 * @returns Test ID string
 */
export const getTestId = (action: UndoRedoAction): string => {
  return `undo-redo-button-${action}`;
};

/**
 * UndoRedoButtons Module - Main Export
 * Entry point untuk semua exports dari UndoRedoButtons module
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

// Export komponen utama
export { UndoRedoButtons } from './components/UndoRedoButtons';
export { UndoRedoButton } from './components/UndoRedoButton';
export { MobileUndoRedo } from './components/MobileUndoRedo';
export { TabletUndoRedo } from './components/TabletUndoRedo';
export { DesktopUndoRedo } from './components/DesktopUndoRedo';

// Export types
export type {
  UndoRedoButtonsProps,
  UndoRedoButtonProps,
  ResponsiveUndoRedoProps,
  MobileUndoRedoProps,
  TabletUndoRedoProps,
  DesktopUndoRedoProps,
  KeyboardShortcutConfig,
  UndoRedoAction,
  ButtonConfig,
  ButtonSize,
  ButtonVariant,
  UndoRedoStyling
} from './types/undoRedo.types';

// Export utilities
export {
  DEFAULT_KEYBOARD_SHORTCUTS,
  BUTTON_CONFIGS,
  STYLING_CONFIGS,
  getButtonConfig,
  getStylingConfig,
  matchesShortcut,
  getButtonClasses,
  getIconClasses,
  getAriaLabel,
  getTooltipText,
  getContainerClasses,
  validateProps,
  getButtonSize,
  getTestId
} from './utils/undoRedo.utils';

// Export hooks
export {
  useKeyboardShortcuts,
  useUndoRedoState,
  useResponsiveUndoRedo
} from './hooks/useKeyboardShortcuts';

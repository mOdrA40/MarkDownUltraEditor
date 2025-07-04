/**
 * @fileoverview Main hooks export file
 * @author Axel Modra
 */

// Re-export types for convenience
export type {
  DialogState,
  EditorSettings,
  EditorState,
  ResponsiveState,
  ThemeState,
  UIState,
  UseDialogManagerReturn,
  UseEditorStateReturn,
  UseResponsiveLayoutReturn,
  UseThemeManagerReturn,
} from '../types';
export type { UseDialogManagerExtendedReturn } from './useDialogManager';
export { useDialogManager } from './useDialogManager';
export type { UseEditorSettingsReturn } from './useEditorSettings';
export { useEditorSettings, useNumericSetting, useSettingToggle } from './useEditorSettings';
export type { UseEditorStateExtendedReturn } from './useEditorState';
// Export all custom hooks
export { useEditorState } from './useEditorState';
export type {
  KeyboardShortcut,
  KeyboardShortcutsContext,
  UseKeyboardShortcutsReturn,
} from './useKeyboardShortcuts';

export { useKeyboardShortcuts, useShortcutHelp } from './useKeyboardShortcuts';
export { useResponsiveLayout } from './useResponsiveLayout';
export { useThemeManager } from './useThemeManager';

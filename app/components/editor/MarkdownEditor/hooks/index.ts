/**
 * @fileoverview Main hooks export file
 * @author Axel Modra
 */

// Export all custom hooks
export { useEditorState } from './useEditorState';
export type { UseEditorStateExtendedReturn } from './useEditorState';

export { useResponsiveLayout } from './useResponsiveLayout';

export { useThemeManager } from './useThemeManager';

export { useDialogManager } from './useDialogManager';
export type { UseDialogManagerExtendedReturn } from './useDialogManager';

export { useEditorSettings, useSettingToggle, useNumericSetting } from './useEditorSettings';
export type { UseEditorSettingsReturn } from './useEditorSettings';

export { useKeyboardShortcuts, useShortcutHelp } from './useKeyboardShortcuts';
export type { 
  KeyboardShortcut, 
  KeyboardShortcutsContext, 
  UseKeyboardShortcutsReturn 
} from './useKeyboardShortcuts';

// Re-export types for convenience
export type {
  EditorState,
  EditorSettings,
  UIState,
  DialogState,
  ResponsiveState,
  ThemeState,
  UseEditorStateReturn,
  UseResponsiveLayoutReturn,
  UseThemeManagerReturn,
  UseDialogManagerReturn
} from '../types';

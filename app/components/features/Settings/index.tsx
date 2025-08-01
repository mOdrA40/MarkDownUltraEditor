// Individual components
export {
  AccountTab,
  AppearanceTab,
  BehaviorTab,
  EditorTab,
  SessionManagement,
  SettingsHeader,
  SettingsTabs,
  StorageTab,
} from './components';
// Constants
export {
  ACTIVITY_INTERVALS,
  DEFAULT_PREFERENCES,
  DEFAULT_TAB,
  STORAGE_KEYS,
  TABS_CONFIG,
} from './constants';

// Hooks
export {
  useAccountActions,
  useSessionManagement,
  useSettingsState,
  useStorageActions,
} from './hooks';
// Main components
// Re-export for backward compatibility
export { SettingsPage, SettingsPage as default } from './SettingsPage';
// Types
export type {
  AccountInfo,
  AccountState,
  AppPreferences,
  SessionData,
  SessionManagementState,
  SessionStats,
  SettingsActions,
  SettingsState,
  SettingsTab,
  StorageInfo,
  StorageState,
  TabConfig,
  UseAccountReturn,
  UseSessionManagementReturn,
  UseSettingsReturn,
  UseStorageReturn,
} from './types';

/**
 * Legacy Settings integration hook (deprecated - use useSettingsState instead)
 * @deprecated Use useSettingsState from './hooks/useSettingsState' instead
 */
import { useEffect, useState } from 'react';
import {
  DEFAULT_WRITING_SETTINGS,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  type WritingSettings,
} from '@/utils/writingSettingsUtils';
import { type Theme, themes } from '../ThemeSelector';

interface UseSettingsReturn {
  theme: Theme;
  writingSettings: WritingSettings;
  autoSave: boolean;
  showLineNumbers: boolean;
  showWordCount: boolean;
  showCharacterCount: boolean;
  updateTheme: (theme: Theme) => void;
  updateWritingSettings: (settings: WritingSettings) => void;
  updateAutoSave: (enabled: boolean) => void;
  updateDisplayPreference: (key: string, value: boolean) => void;
}

/**
 * Hook for managing user settings across the application
 */
export const useAppSettings = (): UseSettingsReturn => {
  const [theme, setTheme] = useState<Theme>(themes[0]);
  const [writingSettings, setWritingSettings] = useState<WritingSettings>(DEFAULT_WRITING_SETTINGS);
  const [autoSave, setAutoSave] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [showWordCount, setShowWordCount] = useState(true);
  const [showCharacterCount, setShowCharacterCount] = useState(true);

  // Load settings on mount
  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('markdownEditor_theme');
    if (savedTheme) {
      const foundTheme = themes.find((t) => t.id === savedTheme);
      if (foundTheme) {
        setTheme(foundTheme);
      }
    }

    // Load writing settings
    const savedWritingSettings = loadSettingsFromStorage();
    setWritingSettings(savedWritingSettings);

    // Load app preferences
    const savedPreferences = localStorage.getItem('markdownEditor_preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setAutoSave(parsed.autoSave ?? true);
        setShowLineNumbers(parsed.showLineNumbers ?? false);
        setShowWordCount(parsed.showWordCount ?? true);
        setShowCharacterCount(parsed.showCharacterCount ?? true);
      } catch (error) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.warn('Failed to parse saved preferences:', error);
        });
      }
    }
  }, []);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('markdownEditor_theme', newTheme.id);
  };

  const updateWritingSettings = (settings: WritingSettings) => {
    setWritingSettings(settings);
    saveSettingsToStorage(settings);
  };

  const updateAutoSave = (enabled: boolean) => {
    setAutoSave(enabled);
    const preferences = JSON.parse(localStorage.getItem('markdownEditor_preferences') || '{}');
    preferences.autoSave = enabled;
    localStorage.setItem('markdownEditor_preferences', JSON.stringify(preferences));
  };

  const updateDisplayPreference = (key: string, value: boolean) => {
    const preferences = JSON.parse(localStorage.getItem('markdownEditor_preferences') || '{}');
    preferences[key] = value;
    localStorage.setItem('markdownEditor_preferences', JSON.stringify(preferences));

    // Update local state
    switch (key) {
      case 'showLineNumbers':
        setShowLineNumbers(value);
        break;
      case 'showWordCount':
        setShowWordCount(value);
        break;
      case 'showCharacterCount':
        setShowCharacterCount(value);
        break;
    }
  };

  return {
    theme,
    writingSettings,
    autoSave,
    showLineNumbers,
    showWordCount,
    showCharacterCount,
    updateTheme,
    updateWritingSettings,
    updateAutoSave,
    updateDisplayPreference,
  };
};

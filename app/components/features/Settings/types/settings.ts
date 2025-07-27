/**
 * @fileoverview Settings types and interfaces
 * @author Axel Modra
 */

import type { Theme } from '@/components/features/ThemeSelector';
import type { WritingSettings } from '@/types/writingSettings';

/**
 * Main application preferences interface
 */
export interface AppPreferences {
  theme: Theme;
  writingSettings: WritingSettings;
  showLineNumbers: boolean;
  showWordCount: boolean;
  showCharacterCount: boolean;
  reducedMotion: boolean;
  soundEffects: boolean;
}

/**
 * Settings state management interface
 */
export interface SettingsState {
  preferences: AppPreferences;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  activeTab: string;
  isEditingName: boolean;
  editFirstName: string;
  editLastName: string;
}

/**
 * Settings actions interface
 */
export interface SettingsActions {
  updatePreference: <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => void;
  savePreferences: () => Promise<void>;
  resetToDefaults: () => void;
  setActiveTab: (tab: string) => void;
  setIsEditingName: (editing: boolean) => void;
  setEditFirstName: (name: string) => void;
  setEditLastName: (name: string) => void;
}

/**
 * Combined settings hook return type
 */
export interface UseSettingsReturn {
  state: SettingsState;
  actions: SettingsActions;
}

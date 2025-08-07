/**
 * @fileoverview Default values and constants for settings
 * @author Axel Modra
 */

import { themes } from '@/components/features/ThemeSelector';
import { DEFAULT_WRITING_SETTINGS } from '@/types/writingSettings';
import type { AppPreferences } from '../types/settings';

/**
 * Default application preferences
 */
export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: themes[0],
  writingSettings: DEFAULT_WRITING_SETTINGS,
  showLineNumbers: false,
  showWordCount: true,
  showCharacterCount: true,
  reducedMotion: false,
  soundEffects: false,
};

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  THEME: 'markdownEditor_theme',
  PREFERENCES: 'markdownEditor_preferences',
  WRITING_SETTINGS: 'markdownEditor_writingSettings',
  CONTENT: 'markdownEditor_content',
  FILE_NAME: 'markdownEditor_fileName',
  HAS_VISITED: 'markdownEditor_hasVisited',
} as const;

/**
 * Activity intervals in milliseconds
 */
export const ACTIVITY_INTERVALS = {
  AUTO_SAVE: 30 * 1000, // 30 seconds
  STORAGE_REFRESH: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * Storage size limits
 */
export const STORAGE_LIMITS = {
  LOCAL_STORAGE_WARNING: 5 * 1024 * 1024, // 5MB
  CLOUD_STORAGE_WARNING: 50 * 1024 * 1024, // 50MB
} as const;

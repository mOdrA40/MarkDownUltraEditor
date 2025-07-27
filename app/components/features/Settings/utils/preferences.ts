/**
 * @fileoverview Preferences utilities
 * @author Axel Modra
 */

import { DEFAULT_PREFERENCES, STORAGE_KEYS } from '../constants';
import type { AppPreferences } from '../types/settings';

/**
 * Preferences utilities
 */
export const preferencesUtils = {
  /**
   * Load preferences from localStorage with fallback to defaults
   */
  loadFromStorage: (): Partial<AppPreferences> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to parse saved preferences:', error);
    }
    return {};
  },

  /**
   * Save preferences to localStorage
   */
  saveToStorage: (preferences: Partial<AppPreferences>): boolean => {
    try {
      const { theme: _theme, writingSettings: _writingSettings, ...appPrefs } = preferences;
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(appPrefs));
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    }
  },

  /**
   * Merge preferences with defaults
   */
  mergeWithDefaults: (preferences: Partial<AppPreferences>): AppPreferences => {
    return {
      ...DEFAULT_PREFERENCES,
      ...preferences,
    };
  },

  /**
   * Validate preferences object
   */
  validate: (preferences: unknown): preferences is AppPreferences => {
    if (!preferences || typeof preferences !== 'object') {
      return false;
    }

    const prefs = preferences as Record<string, unknown>;

    return (
      typeof prefs.showLineNumbers === 'boolean' &&
      typeof prefs.showWordCount === 'boolean' &&
      typeof prefs.showCharacterCount === 'boolean' &&
      typeof prefs.reducedMotion === 'boolean' &&
      typeof prefs.soundEffects === 'boolean'
    );
  },

  /**
   * Export preferences as JSON
   */
  exportAsJson: (preferences: AppPreferences): string => {
    const exportData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      preferences,
    };
    return JSON.stringify(exportData, null, 2);
  },

  /**
   * Import preferences from JSON
   */
  importFromJson: (jsonString: string): AppPreferences | null => {
    try {
      const data = JSON.parse(jsonString);
      if (data.preferences && preferencesUtils.validate(data.preferences)) {
        return preferencesUtils.mergeWithDefaults(data.preferences);
      }
    } catch (error) {
      console.error('Failed to import preferences:', error);
    }
    return null;
  },
};

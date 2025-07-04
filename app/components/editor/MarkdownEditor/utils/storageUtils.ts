/**
 * @fileoverview Local storage utility functions
 * @author Axel Modra
 */

import type { EditorSettings, UIState } from '../types';
import { STORAGE_KEYS, DEFAULT_EDITOR_CONFIG } from './constants';

/**
 * Storage error types
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly operation: string
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safe localStorage getter with error handling
 */
export const getStorageItem = (key: string): string | null => {
  try {
    if (!isStorageAvailable()) return null;
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get item from localStorage: ${key}`, error);
    return null;
  }
};

/**
 * Safe localStorage setter with error handling
 */
export const setStorageItem = (key: string, value: string): boolean => {
  try {
    if (!isStorageAvailable()) return false;
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to set item in localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Safe localStorage remover with error handling
 */
export const removeStorageItem = (key: string): boolean => {
  try {
    if (!isStorageAvailable()) return false;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove item from localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Get JSON data from localStorage
 */
export const getStorageJSON = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = getStorageItem(key);
    if (item === null) return defaultValue || null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to parse JSON from localStorage: ${key}`, error);
    return defaultValue || null;
  }
};

/**
 * Set JSON data to localStorage
 */
export const setStorageJSON = <T>(key: string, value: T): boolean => {
  try {
    const jsonString = JSON.stringify(value);
    return setStorageItem(key, jsonString);
  } catch (error) {
    console.warn(`Failed to stringify JSON for localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Clear all editor-related storage
 */
export const clearEditorStorage = (): boolean => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    let success = true;

    keys.forEach((key) => {
      if (!removeStorageItem(key)) {
        success = false;
      }
    });

    return success;
  } catch (error) {
    console.warn('Failed to clear editor storage', error);
    return false;
  }
};

/**
 * Save editor content
 */
export const saveEditorContent = (content: string): boolean => {
  return setStorageItem(STORAGE_KEYS.CONTENT, content);
};

/**
 * Load editor content
 */
export const loadEditorContent = (): string | null => {
  return getStorageItem(STORAGE_KEYS.CONTENT);
};

/**
 * Save file name
 */
export const saveFileName = (fileName: string): boolean => {
  return setStorageItem(STORAGE_KEYS.FILE_NAME, fileName);
};

/**
 * Load file name
 */
export const loadFileName = (): string | null => {
  return getStorageItem(STORAGE_KEYS.FILE_NAME);
};

/**
 * Save theme ID
 */
export const saveThemeId = (themeId: string): boolean => {
  return setStorageItem(STORAGE_KEYS.THEME, themeId);
};

/**
 * Load theme ID
 */
export const loadThemeId = (): string | null => {
  return getStorageItem(STORAGE_KEYS.THEME);
};

/**
 * Save editor settings
 */
export const saveEditorSettings = (settings: EditorSettings): boolean => {
  return setStorageJSON(STORAGE_KEYS.SETTINGS, settings);
};

/**
 * Load editor settings
 */
export const loadEditorSettings = (): EditorSettings | null => {
  const settings = getStorageJSON<EditorSettings>(STORAGE_KEYS.SETTINGS);
  if (!settings) return null;

  // Merge with defaults to ensure all properties exist
  return {
    ...DEFAULT_EDITOR_CONFIG.defaultSettings,
    ...settings,
  };
};

/**
 * Save UI state
 */
export const saveUIState = (uiState: UIState): boolean => {
  return setStorageJSON(STORAGE_KEYS.UI_STATE, uiState);
};

/**
 * Load UI state
 */
export const loadUIState = (): UIState | null => {
  return getStorageJSON<UIState>(STORAGE_KEYS.UI_STATE);
};

/**
 * Save window state (position, size, etc.)
 */
export const saveWindowState = (windowState: {
  width: number;
  height: number;
  x?: number;
  y?: number;
  maximized?: boolean;
}): boolean => {
  return setStorageJSON(STORAGE_KEYS.WINDOW_STATE, windowState);
};

/**
 * Load window state
 */
export const loadWindowState = (): {
  width: number;
  height: number;
  x?: number;
  y?: number;
  maximized?: boolean;
} | null => {
  return getStorageJSON(STORAGE_KEYS.WINDOW_STATE);
};

/**
 * Get storage usage information
 */
export const getStorageUsage = (): {
  used: number;
  total: number;
  percentage: number;
  available: number;
} => {
  try {
    if (!isStorageAvailable()) {
      return { used: 0, total: 0, percentage: 0, available: 0 };
    }

    let used = 0;
    for (const key in localStorage) {
      if (Object.hasOwn(localStorage, key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Estimate total storage (usually 5-10MB, we'll use 5MB as conservative estimate)
    const total = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = (used / total) * 100;
    const available = total - used;

    return { used, total, percentage, available };
  } catch (error) {
    console.warn('Failed to calculate storage usage', error);
    return { used: 0, total: 0, percentage: 0, available: 0 };
  }
};

/**
 * Check if storage is nearly full
 */
export const isStorageNearlyFull = (threshold = 80): boolean => {
  const usage = getStorageUsage();
  return usage.percentage > threshold;
};

/**
 * Export all editor data
 */
export const exportEditorData = (): {
  content?: string;
  fileName?: string;
  theme?: string;
  settings?: EditorSettings;
  uiState?: UIState;
  timestamp: number;
} => {
  return {
    content: loadEditorContent() || undefined,
    fileName: loadFileName() || undefined,
    theme: loadThemeId() || undefined,
    settings: loadEditorSettings() || undefined,
    uiState: loadUIState() || undefined,
    timestamp: Date.now(),
  };
};

/**
 * Import editor data
 */
export const importEditorData = (data: {
  content?: string;
  fileName?: string;
  theme?: string;
  settings?: EditorSettings;
  uiState?: UIState;
}): boolean => {
  try {
    let success = true;

    if (data.content !== undefined) {
      success = saveEditorContent(data.content) && success;
    }

    if (data.fileName !== undefined) {
      success = saveFileName(data.fileName) && success;
    }

    if (data.theme !== undefined) {
      success = saveThemeId(data.theme) && success;
    }

    if (data.settings !== undefined) {
      success = saveEditorSettings(data.settings) && success;
    }

    if (data.uiState !== undefined) {
      success = saveUIState(data.uiState) && success;
    }

    return success;
  } catch (error) {
    console.warn('Failed to import editor data', error);
    return false;
  }
};

/**
 * Create storage backup
 */
export const createStorageBackup = (): string => {
  const data = exportEditorData();
  return JSON.stringify(data, null, 2);
};

/**
 * Restore from storage backup
 */
export const restoreFromBackup = (backupString: string): boolean => {
  try {
    const data = JSON.parse(backupString);
    return importEditorData(data);
  } catch (error) {
    console.warn('Failed to restore from backup', error);
    return false;
  }
};

/**
 * Migrate storage data between versions
 */
export const migrateStorageData = (fromVersion: string, toVersion: string): boolean => {
  try {
    // Add migration logic here when needed
    console.log(`Migrating storage data from ${fromVersion} to ${toVersion}`);
    return true;
  } catch (error) {
    console.warn('Failed to migrate storage data', error);
    return false;
  }
};

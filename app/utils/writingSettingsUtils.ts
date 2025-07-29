/**
 * Writing settings utility functions
 * Validation, storage, dan helper functions
 */

import {
  DEFAULT_VALIDATION_RULES,
  DEFAULT_WRITING_SETTINGS,
  WRITING_SETTINGS_CONSTANTS,
  type WritingSettings,
  type WritingSettingsValidation,
} from '@/types/writingSettings';
import {
  validateBooleanProperties,
  validateNumericRange,
  validateRequiredProperties,
} from '@/utils/common';
import { safeConsole } from '@/utils/console';

// Re-export types and constants for convenience
export type { WritingSettings, WritingSettingsValidation };
export { DEFAULT_WRITING_SETTINGS, DEFAULT_VALIDATION_RULES, WRITING_SETTINGS_CONSTANTS };

/**
 * Validate font size using centralized utility
 */
export const validateFontSize = (
  size: number,
  rules: WritingSettingsValidation = DEFAULT_VALIDATION_RULES
): boolean => {
  const { min, max } = rules.fontSize;
  const result = validateNumericRange(size, min, max, 'fontSize');
  return result.isValid;
};

/**
 * Validate line height using centralized utility
 */
export const validateLineHeight = (
  height: number,
  rules: WritingSettingsValidation = DEFAULT_VALIDATION_RULES
): boolean => {
  const { min, max } = rules.lineHeight;
  const result = validateNumericRange(height, min, max, 'lineHeight');
  return result.isValid;
};

/**
 * Validate complete writing settings object using centralized utilities
 */
export const validateWritingSettings = (
  settings: unknown,
  rules: WritingSettingsValidation = DEFAULT_VALIDATION_RULES
): settings is WritingSettings => {
  // Check required properties
  const requiredProps: (keyof WritingSettings)[] = [
    'fontSize',
    'lineHeight',
    'focusMode',
    'typewriterMode',
    'wordWrap',
    'vimMode',
    'zenMode',
  ];

  const requiredResult = validateRequiredProperties(settings, requiredProps);
  if (!requiredResult.isValid) return false;

  const settingsObj = settings as Record<string, unknown>;

  // Validate numeric values
  if (!validateFontSize(settingsObj.fontSize as number, rules)) return false;
  if (!validateLineHeight(settingsObj.lineHeight as number, rules)) return false;

  // Validate boolean values
  const booleanProps: (keyof WritingSettings)[] = [
    'focusMode',
    'typewriterMode',
    'wordWrap',
    'vimMode',
    'zenMode',
  ];

  const booleanResult = validateBooleanProperties(settingsObj, booleanProps);

  return booleanResult.isValid;
};

/**
 * Sanitize writing settings dengan fallback ke default values
 */
export const sanitizeWritingSettings = (
  settings: unknown,
  rules: WritingSettingsValidation = DEFAULT_VALIDATION_RULES
): WritingSettings => {
  const sanitized: WritingSettings = { ...DEFAULT_WRITING_SETTINGS };

  if (!settings || typeof settings !== 'object') {
    return sanitized;
  }

  const settingsObj = settings as Record<string, unknown>;

  // Sanitize fontSize
  if (validateFontSize(settingsObj.fontSize as number, rules)) {
    sanitized.fontSize = settingsObj.fontSize as number;
  }

  // Sanitize lineHeight
  if (validateLineHeight(settingsObj.lineHeight as number, rules)) {
    sanitized.lineHeight = settingsObj.lineHeight as number;
  }

  // Sanitize boolean values
  const booleanProps: (keyof WritingSettings)[] = [
    'focusMode',
    'typewriterMode',
    'wordWrap',
    'vimMode',
    'zenMode',
  ];

  for (const prop of booleanProps) {
    if (typeof settingsObj[prop] === 'boolean') {
      (sanitized as unknown as Record<string, unknown>)[prop] = settingsObj[prop];
    }
  }

  return sanitized;
};

/**
 * Load settings dari localStorage dengan error handling
 */
export const loadSettingsFromStorage = (
  storageKey: string = WRITING_SETTINGS_CONSTANTS.DEFAULT_STORAGE_KEY,
  rules: WritingSettingsValidation = DEFAULT_VALIDATION_RULES
): WritingSettings => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return DEFAULT_WRITING_SETTINGS;

    const parsed = JSON.parse(stored);
    return sanitizeWritingSettings(parsed, rules);
  } catch (error) {
    console.warn('Failed to load writing settings from storage:', error);
    return DEFAULT_WRITING_SETTINGS;
  }
};

/**
 * Save settings ke localStorage dengan error handling
 */
export const saveSettingsToStorage = (
  settings: WritingSettings,
  storageKey: string = WRITING_SETTINGS_CONSTANTS.DEFAULT_STORAGE_KEY
): boolean => {
  try {
    const serialized = JSON.stringify(settings);
    localStorage.setItem(storageKey, serialized);
    return true;
  } catch (error) {
    safeConsole.error('Failed to save writing settings to storage:', error);
    return false;
  }
};

/**
 * Export settings sebagai JSON string
 */
export const exportWritingSettings = (settings: WritingSettings): string => {
  const exportData = {
    version: WRITING_SETTINGS_CONSTANTS.EXPORT_VERSION,
    timestamp: new Date().toISOString(),
    settings,
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Import settings dari JSON string
 */
export const importWritingSettings = (
  jsonString: string,
  rules: WritingSettingsValidation = DEFAULT_VALIDATION_RULES
): WritingSettings | null => {
  try {
    const parsed = JSON.parse(jsonString);

    // Check if it's an export format
    if (parsed.version && parsed.settings) {
      return sanitizeWritingSettings(parsed.settings, rules);
    }

    // Try to parse as direct settings object
    return sanitizeWritingSettings(parsed, rules);
  } catch (error) {
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.error('Failed to import writing settings:', error);
    });
    return null;
  }
};

// Import common utilities to avoid duplication
import { debounce } from './common';

/**
 * Deep compare untuk settings objects
 * Specific implementation for WritingSettings type
 */
export const areSettingsEqual = (
  settings1: WritingSettings,
  settings2: WritingSettings
): boolean => {
  const keys = Object.keys(settings1) as (keyof WritingSettings)[];
  return keys.every((key) => settings1[key] === settings2[key]);
};

// Re-export debounce from common utilities
export { debounce };

/**
 * Get settings diff untuk debugging
 */
export const getSettingsDiff = (
  oldSettings: WritingSettings,
  newSettings: WritingSettings
): Partial<WritingSettings> => {
  const diff: Partial<WritingSettings> = {};
  const keys = Object.keys(newSettings) as (keyof WritingSettings)[];

  keys.forEach((key) => {
    if (oldSettings[key] !== newSettings[key]) {
      (diff as unknown as Record<string, unknown>)[key] = newSettings[key];
    }
  });

  return diff;
};

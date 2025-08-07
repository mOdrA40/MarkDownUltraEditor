/**
 * @fileoverview Validation utilities
 * @author Axel Modra
 */

import type { AppPreferences, StorageInfo } from '../types';

/**
 * Validation utilities
 */
export const validationUtils = {
  /**
   * Validate app preferences
   */
  validatePreferences: (data: unknown): data is AppPreferences => {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const prefs = data as Record<string, unknown>;

    return Boolean(
      typeof prefs.showLineNumbers === 'boolean' &&
        typeof prefs.showWordCount === 'boolean' &&
        typeof prefs.showCharacterCount === 'boolean' &&
        typeof prefs.reducedMotion === 'boolean' &&
        typeof prefs.soundEffects === 'boolean' &&
        prefs.theme &&
        typeof prefs.theme === 'object' &&
        prefs.writingSettings &&
        typeof prefs.writingSettings === 'object'
    );
  },

  /**
   * Validate storage info
   */
  validateStorageInfo: (data: unknown): data is StorageInfo => {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const storage = data as Record<string, unknown>;

    return (
      (storage.type === 'local' || storage.type === 'cloud') &&
      typeof storage.used === 'string' &&
      typeof storage.percentage === 'number' &&
      typeof storage.available === 'boolean'
    );
  },

  /**
   * Validate email format
   */
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate name (first/last name)
   */
  validateName: (name: string): boolean => {
    return name.trim().length > 0 && name.trim().length <= 50;
  },

  /**
   * Sanitize string input
   */
  sanitizeString: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  },

  /**
   * Validate JSON string
   */
  validateJson: (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate file size (in bytes)
   */
  validateFileSize: (size: number, maxSize: number = 10 * 1024 * 1024): boolean => {
    return size > 0 && size <= maxSize;
  },

  /**
   * Validate URL format
   */
  validateUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

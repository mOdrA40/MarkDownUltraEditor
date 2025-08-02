/**
 * @fileoverview Editor preferences and visit tracking utilities
 * @author MarkDownUltraRemix Team
 */

import type { FileData } from '@/lib/supabase';
import { safeConsole } from '@/utils/console';

// Extended Navigator interface for device memory and connection
interface ExtendedNavigator {
  deviceMemory?: number;
  connection?: {
    effectiveType?: string;
  };
  platform?: string;
}

// Storage keys for editor preferences
export const EDITOR_PREFERENCES = {
  FIRST_VISIT: 'markdownEditor_firstVisit',
  LAST_OPENED_FILE: 'markdownEditor_lastOpenedFile',
  DEVICE_FINGERPRINT: 'markdownEditor_deviceFingerprint',
};

/**
 * Interface for last opened file data
 */
export interface LastOpenedFile {
  id?: string;
  title: string;
  content: string;
  timestamp: number;
  deviceFingerprint?: string;
}

/**
 * Interface for user preferences from Supabase
 */
export interface UserPreferences {
  id: string;
  user_id: string;
  last_opened_file_id: string | null;
  editor_theme: string;
  auto_save_enabled: boolean;
  preview_mode: string;
  font_size: number;
  line_numbers: boolean;
  word_wrap: boolean;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for device session data
 */
export interface DeviceSession {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string | null;
  browser_info: Record<string, unknown> | null;
  last_opened_file_id: string | null;
  last_activity_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Check if this is the user's first visit
 */
export const isFirstVisit = (): boolean => {
  if (typeof localStorage === 'undefined') return true;

  try {
    const visited = localStorage.getItem(EDITOR_PREFERENCES.FIRST_VISIT);
    return visited !== 'true';
  } catch (error) {
    safeConsole.error('Error checking first visit status:', error);
    return true; // Default to first visit on error
  }
};

/**
 * Mark that the user has visited the site
 */
export const markVisited = (): void => {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(EDITOR_PREFERENCES.FIRST_VISIT, 'true');
    safeConsole.dev('User marked as visited');
  } catch (error) {
    safeConsole.error('Error marking user as visited:', error);
  }
};

/**
 * Save the last opened file for guest users
 */
export const saveLastOpenedFile = (file: Pick<FileData, 'id' | 'title' | 'content'>): void => {
  if (typeof localStorage === 'undefined') return;

  try {
    const lastOpenedFile: LastOpenedFile = {
      id: file.id,
      title: file.title,
      content: file.content,
      timestamp: Date.now(),
    };

    localStorage.setItem(EDITOR_PREFERENCES.LAST_OPENED_FILE, JSON.stringify(lastOpenedFile));
  } catch (error) {
    safeConsole.error('Error saving last opened file:', error);
  }
};

/**
 * Get the last opened file for guest users
 */
export const getLastOpenedFile = (): LastOpenedFile | null => {
  if (typeof localStorage === 'undefined') return null;

  try {
    const stored = localStorage.getItem(EDITOR_PREFERENCES.LAST_OPENED_FILE);
    if (!stored) return null;

    const lastOpenedFile = JSON.parse(stored) as LastOpenedFile;

    // Validate required fields
    if (!lastOpenedFile.title || !lastOpenedFile.content) {
      safeConsole.warn('Invalid last opened file data, clearing');
      clearLastOpenedFile();
      return null;
    }

    return lastOpenedFile;
  } catch (error) {
    safeConsole.error('Error getting last opened file:', error);
    return null;
  }
};

/**
 * Clear the last opened file
 */
export const clearLastOpenedFile = (): void => {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.removeItem(EDITOR_PREFERENCES.LAST_OPENED_FILE);
  } catch (error) {
    safeConsole.error('Error clearing last opened file:', error);
  }
};

/**
 * Check if there's a last opened file available (synchronous)
 * This is used to prevent flash effect during initial load
 */
export const hasLastOpenedFile = (): boolean => {
  if (typeof localStorage === 'undefined') return false;

  try {
    const stored = localStorage.getItem(EDITOR_PREFERENCES.LAST_OPENED_FILE);
    if (!stored) return false;

    const lastOpenedFile = JSON.parse(stored) as LastOpenedFile;

    // Validate required fields
    return !!(lastOpenedFile.title && lastOpenedFile.content);
  } catch (error) {
    safeConsole.error('Error checking last opened file:', error);
    return false;
  }
};

/**
 * Generate or get device fingerprint for tracking
 */
export const getDeviceFingerprint = (): string => {
  if (typeof localStorage === 'undefined') return 'unknown-device';

  try {
    let fingerprint = localStorage.getItem(EDITOR_PREFERENCES.DEVICE_FINGERPRINT);

    if (!fingerprint) {
      // Generate a simple device fingerprint
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx?.fillText('Device fingerprint', 10, 10);

      const fingerprint_data = [
        navigator.userAgent,
        navigator.language,
        `${screen.width}x${screen.height}`,
        new Date().getTimezoneOffset(),
        canvas.toDataURL(),
        navigator.hardwareConcurrency || 'unknown',
        (navigator as ExtendedNavigator).deviceMemory || 'unknown',
      ].join('|');

      // Create a simple hash
      let hash = 0;
      for (let i = 0; i < fingerprint_data.length; i++) {
        const char = fingerprint_data.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash &= hash; // Convert to 32-bit integer
      }

      fingerprint = `device_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
      localStorage.setItem(EDITOR_PREFERENCES.DEVICE_FINGERPRINT, fingerprint);
    }

    return fingerprint;
  } catch (error) {
    safeConsole.error('Error getting device fingerprint:', error);
    return `fallback_${Date.now().toString(36)}`;
  }
};

/**
 * Get device information for session tracking
 */
export const getDeviceInfo = (): Record<string, unknown> => {
  if (typeof navigator === 'undefined') return {};

  try {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: (navigator as ExtendedNavigator).platform || 'unknown',
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      deviceMemory: (navigator as ExtendedNavigator).deviceMemory || null,
      connection: (navigator as ExtendedNavigator).connection?.effectiveType || null,
    };
  } catch (error) {
    safeConsole.error('Error getting device info:', error);
    return {};
  }
};

/**
 * Generate device name based on browser and OS
 */
export const getDeviceName = (): string => {
  if (typeof navigator === 'undefined') return 'Unknown Device';

  try {
    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    // Detect browser
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // Detect OS
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return `${browser} on ${os}`;
  } catch (error) {
    safeConsole.error('Error getting device name:', error);
    return 'Unknown Device';
  }
};

/**
 * Reset all editor preferences (for testing)
 */
export const resetEditorPreferences = (): void => {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.removeItem(EDITOR_PREFERENCES.FIRST_VISIT);
    localStorage.removeItem(EDITOR_PREFERENCES.LAST_OPENED_FILE);
    localStorage.removeItem(EDITOR_PREFERENCES.DEVICE_FINGERPRINT);
  } catch (error) {
    safeConsole.error('Error resetting editor preferences:', error);
  }
};

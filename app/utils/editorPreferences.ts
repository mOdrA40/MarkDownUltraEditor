/**
 * @fileoverview Editor preferences and visit tracking utilities
 * @author MarkDownUltraRemix Team
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { FileData } from '@/lib/supabase';
import { compressContent, decompressContent } from '@/utils/compression';
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
  HAS_VISITED: 'markdownEditor_hasVisited', // Legacy key for compatibility
  LAST_OPENED_FILE: 'markdownEditor_lastOpenedFile',
  DEVICE_FINGERPRINT: 'markdownEditor_deviceFingerprint',
  LRU_TRACKER: 'markdownEditor_lruTracker',
  FILE_INDEX: 'markdownEditor_fileIndex',
};

// Last opened file optimization limits
export const LAST_OPENED_LIMITS = {
  MAX_CONTENT_LENGTH: 50000, // 50KB untuk last opened
  PREVIEW_LENGTH: 1000, // 1KB untuk preview saja
  COMPRESSION_THRESHOLD: 500, // Compress jika > 500 bytes
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
  isPreview?: boolean;
  compressed?: boolean;
  originalSize?: number;
}

/**
 * Interface for user preferences from Supabase
 */
export interface UserPreferences {
  id: string;
  user_id: string;
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
 * Check if this is the user's first visit
 * Unified function that checks both new and legacy keys for compatibility
 */
export const isFirstVisit = (): boolean => {
  if (typeof localStorage === 'undefined') return true;

  try {
    // Check new key first
    const visited = localStorage.getItem(EDITOR_PREFERENCES.FIRST_VISIT);
    if (visited === 'true') return false;

    // Check legacy key for backward compatibility
    const hasVisited = localStorage.getItem(EDITOR_PREFERENCES.HAS_VISITED);
    if (hasVisited === 'true') {
      // Migrate to new key
      localStorage.setItem(EDITOR_PREFERENCES.FIRST_VISIT, 'true');
      return false;
    }

    return true;
  } catch (error) {
    safeConsole.error('Error checking first visit status:', error);
    return true; // Default to first visit on error
  }
};

/**
 * Mark that the user has visited the site
 * Sets both new and legacy keys for compatibility
 */
export const markVisited = (): void => {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(EDITOR_PREFERENCES.FIRST_VISIT, 'true');
    localStorage.setItem(EDITOR_PREFERENCES.HAS_VISITED, 'true'); // Keep legacy key for compatibility
    safeConsole.dev('User marked as visited');
  } catch (error) {
    safeConsole.error('Error marking user as visited:', error);
  }
};

/**
 * Reset visit status (useful for testing or after logout)
 */
export const resetVisitStatus = (): void => {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.removeItem(EDITOR_PREFERENCES.FIRST_VISIT);
    localStorage.removeItem(EDITOR_PREFERENCES.HAS_VISITED);
    safeConsole.dev('Visit status reset');
  } catch (error) {
    safeConsole.error('Error resetting visit status:', error);
  }
};

/**
 * Check if user is first-time visitor with Supabase integration for authenticated users
 * Uses the existing UserPreferencesService for better integration
 */
export const isFirstVisitWithAuth = async (
  isSignedIn: boolean,
  userId?: string | null,
  supabase?: SupabaseClient | null
): Promise<boolean> => {
  // For guest users, use localStorage
  if (!isSignedIn || !userId || !supabase) {
    return isFirstVisit();
  }

  try {
    // Use the existing UserPreferencesService for consistency
    const { createUserPreferencesService } = await import('@/services/userPreferencesService');
    const preferencesService = createUserPreferencesService(supabase);

    // Check if user has preferences (indicates not first visit)
    const preferences = await preferencesService.getUserPreferences(userId);

    // If no preferences found, this is first visit
    const isFirst = !preferences;

    // Also check localStorage for consistency
    const localFirst = isFirstVisit();

    // If there's a mismatch, prefer Supabase data for authenticated users
    if (isFirst !== localFirst && !isFirst) {
      markVisited(); // Sync localStorage with Supabase
    }

    return isFirst;
  } catch (error) {
    safeConsole.error('Error in isFirstVisitWithAuth:', error);
    return isFirstVisit(); // Fallback to localStorage
  }
};

/**
 * Mark user as visited with Supabase integration for authenticated users
 * Uses the existing UserPreferencesService for better integration
 */
export const markVisitedWithAuth = async (
  isSignedIn: boolean,
  userId?: string | null,
  supabase?: SupabaseClient | null
): Promise<void> => {
  // Always mark in localStorage
  markVisited();

  // For authenticated users, also create/update preferences in Supabase
  if (isSignedIn && userId && supabase) {
    try {
      // Use the existing UserPreferencesService for consistency
      const { createUserPreferencesService } = await import('@/services/userPreferencesService');
      const preferencesService = createUserPreferencesService(supabase);

      // Try to get existing preferences
      const existing = await preferencesService.getUserPreferences(userId);

      if (!existing) {
        // Create new preferences record with default values
        await preferencesService.upsertUserPreferences(userId, {
          editor_theme: 'light',
          auto_save_enabled: true,
          preview_mode: 'side',
          font_size: 14,
          line_numbers: true,
          word_wrap: true,
        });

        safeConsole.dev('User preferences created for first visit');
      }
    } catch (error) {
      safeConsole.error('Error in markVisitedWithAuth:', error);
    }
  }
};

/**
 * Save the last opened file to localStorage (optimized for all users)
 */
export const saveLastOpenedFile = (file: Pick<FileData, 'id' | 'title' | 'content'>): void => {
  if (typeof localStorage === 'undefined') return;

  const originalSize = file.content.length;
  let optimizedContent = file.content;
  let isPreview = false;
  let compressed = false;

  // Smart content optimization
  if (originalSize > LAST_OPENED_LIMITS.MAX_CONTENT_LENGTH) {
    // Use preview for very large files
    optimizedContent = `${file.content.substring(0, LAST_OPENED_LIMITS.PREVIEW_LENGTH)}...[preview]`;
    isPreview = true;
    safeConsole.dev(`📄 Large file detected (${originalSize} bytes), using preview mode`);
  } else if (originalSize > LAST_OPENED_LIMITS.COMPRESSION_THRESHOLD) {
    // Compress medium-sized files
    const compressionResult = compressContent(file.content);
    if (compressionResult.isCompressed) {
      optimizedContent = compressionResult.content;
      compressed = true;
      safeConsole.dev(
        `🗜️ Compressed last opened file: ${originalSize} → ${compressionResult.compressedSize} bytes (${(compressionResult.compressionRatio * 100).toFixed(1)}%)`
      );
    }
  }

  const lastOpenedFile: LastOpenedFile = {
    id: file.id,
    title: file.title,
    content: optimizedContent,
    timestamp: Date.now(),
    isPreview,
    compressed,
    originalSize,
  };

  try {
    localStorage.setItem(EDITOR_PREFERENCES.LAST_OPENED_FILE, JSON.stringify(lastOpenedFile));

    // Track access for LRU
    trackAccess(EDITOR_PREFERENCES.LAST_OPENED_FILE);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      const canRetry = handleQuotaExceeded('saveLastOpened', file);
      if (canRetry) {
        // Retry once after cleanup
        try {
          localStorage.setItem(EDITOR_PREFERENCES.LAST_OPENED_FILE, JSON.stringify(lastOpenedFile));
        } catch (retryError) {
          safeConsole.error('Retry failed after cleanup:', retryError);
        }
      }
    } else {
      safeConsole.error('Error saving last opened file:', error);
    }
  }
};

/**
 * Get the last opened file from localStorage (optimized for all users)
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

    // Decompress content if it was compressed
    if (lastOpenedFile.compressed && lastOpenedFile.content) {
      try {
        lastOpenedFile.content = decompressContent(lastOpenedFile.content);
        safeConsole.dev(`🗜️ Decompressed last opened file: ${lastOpenedFile.title}`);
      } catch (decompressError) {
        safeConsole.warn('Failed to decompress last opened file, using as-is:', decompressError);
      }
    }

    // Track access for LRU
    trackAccess(EDITOR_PREFERENCES.LAST_OPENED_FILE);

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

// ============================================================================
// STORAGE OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Interface for access tracking
 */
interface AccessTracker {
  [key: string]: {
    lastAccessed: number;
    accessCount: number;
    size: number;
  };
}

/**
 * Track access for LRU cleanup
 */
export const trackAccess = (key: string): void => {
  if (typeof localStorage === 'undefined') return;

  try {
    const tracker = JSON.parse(
      localStorage.getItem(EDITOR_PREFERENCES.LRU_TRACKER) || '{}'
    ) as AccessTracker;
    const itemSize = getItemSize(key);

    tracker[key] = {
      lastAccessed: Date.now(),
      accessCount: (tracker[key]?.accessCount || 0) + 1,
      size: itemSize,
    };

    localStorage.setItem(EDITOR_PREFERENCES.LRU_TRACKER, JSON.stringify(tracker));
  } catch (error) {
    safeConsole.warn('Failed to track access:', error);
  }
};

/**
 * Get item size in bytes
 */
export const getItemSize = (key: string): number => {
  if (typeof localStorage === 'undefined') return 0;

  try {
    const item = localStorage.getItem(key);
    return item ? new Blob([item]).size + key.length : 0;
  } catch (_error) {
    return 0;
  }
};

/**
 * Handle quota exceeded error
 */
export const handleQuotaExceeded = (operation: string, data: unknown): boolean => {
  safeConsole.warn(`Storage quota exceeded during ${operation}`);

  try {
    // Try cleanup first
    const freedBytes = smartCleanup(JSON.stringify(data).length * 2);

    if (freedBytes > 0) {
      safeConsole.dev(`🧹 Freed ${freedBytes} bytes, retrying ${operation}`);
      return true; // Indicate retry is possible
    }

    // Show user message
    safeConsole.error('Storage full and cleanup failed. Please clear some data manually.');
    return false;
  } catch (error) {
    safeConsole.error('Error handling quota exceeded:', error);
    return false;
  }
};

/**
 * Smart cleanup based on priorities
 */
export const smartCleanup = (targetBytes: number): number => {
  if (typeof localStorage === 'undefined') return 0;

  const CLEANUP_PRIORITIES = {
    NEVER: ['markdownEditor_lastOpenedFile', 'markdownEditor_preferences'],
    LOW: ['markdownEditor_theme', 'markdownEditor_settings'],
    MEDIUM: ['markdownEditor_filesList', 'markdownEditor_content'],
    HIGH: ['markdownEditor_temp_', 'markdownEditor_backup_'],
    IMMEDIATE: ['markdownEditor_cache_', 'markdownEditor_preview_'],
  };

  let freedBytes = 0;

  // Cleanup berdasarkan prioritas
  for (const [priority, patterns] of Object.entries(CLEANUP_PRIORITIES)) {
    if (freedBytes >= targetBytes) break;
    if (priority === 'NEVER') continue;

    patterns.forEach((pattern) => {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(pattern)) {
          const size = getItemSize(key);
          localStorage.removeItem(key);
          freedBytes += size;
        }
      });
    });
  }

  return freedBytes;
};

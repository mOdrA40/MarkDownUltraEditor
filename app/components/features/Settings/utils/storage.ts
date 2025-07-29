/**
 * @fileoverview Storage utilities
 * @author Axel Modra
 */

import { STORAGE_KEYS } from '../constants';

/**
 * Storage utilities
 */
export const storageUtils = {
  /**
   * Calculate localStorage usage in bytes (UTF-16 encoding)
   */
  calculateLocalStorageUsage: (): number => {
    let totalSize = 0;
    for (const key in localStorage) {
      if (Object.hasOwn(localStorage, key)) {
        // Calculate UTF-16 byte size (each character can be 2 or 4 bytes)
        const keySize = new Blob([key]).size;
        const valueSize = new Blob([localStorage[key]]).size;
        totalSize += keySize + valueSize;
      }
    }
    return totalSize;
  },

  /**
   * Format bytes to human readable string
   */
  formatBytes: (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  },

  /**
   * Calculate storage percentage
   */
  calculateStoragePercentage: (used: number, total: number): number => {
    if (total === 0) return 0;
    return Math.min((used / total) * 100, 100);
  },

  /**
   * Clear all app-related localStorage items
   */
  clearAppStorage: (): string[] => {
    const clearedKeys: string[] = [];
    const keysToRemove = Object.values(STORAGE_KEYS);

    keysToRemove.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        clearedKeys.push(key);
      }
    });

    return clearedKeys;
  },

  /**
   * Get storage quota information (if available)
   */
  getStorageQuota: async (): Promise<{
    quota: number;
    usage: number;
    available: number;
  } | null> => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota || 0,
          usage: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
        };
      } catch (error) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.warn('Failed to get storage quota:', error);
        });
      }
    }
    return null;
  },

  /**
   * Check if localStorage is available
   */
  isLocalStorageAvailable: (): boolean => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get storage info for display
   */
  getStorageInfo: async (): Promise<{
    local: {
      used: string;
      usedBytes: number;
      percentage: number;
    };
    quota: {
      total: string;
      used: string;
      available: string;
      percentage: number;
    } | null;
  }> => {
    const localUsage = storageUtils.calculateLocalStorageUsage();
    const quota = await storageUtils.getStorageQuota();

    return {
      local: {
        used: storageUtils.formatBytes(localUsage),
        usedBytes: localUsage,
        percentage: quota
          ? storageUtils.calculateStoragePercentage(localUsage, quota.quota)
          : storageUtils.calculateStoragePercentage(localUsage, 5 * 1024 * 1024), // Assume 5MB limit
      },
      quota: quota
        ? {
            total: storageUtils.formatBytes(quota.quota),
            used: storageUtils.formatBytes(quota.usage),
            available: storageUtils.formatBytes(quota.available),
            percentage: storageUtils.calculateStoragePercentage(quota.usage, quota.quota),
          }
        : null,
    };
  },
};

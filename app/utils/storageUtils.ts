/**
 * Utility functions for localStorage management and capacity checking
 */

export interface StorageInfo {
  used: number;
  available: number;
  total: number;
  usedPercentage: number;
  usedFormatted: string;
  availableFormatted: string;
  totalFormatted: string;
}

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get localStorage usage information
 */
export const getStorageInfo = (): StorageInfo => {
  if (typeof localStorage === 'undefined') {
    return {
      used: 0,
      available: 0,
      total: 0,
      usedPercentage: 0,
      usedFormatted: '0 Bytes',
      availableFormatted: '0 Bytes',
      totalFormatted: '0 Bytes',
    };
  }

  // Calculate used space
  let used = 0;
  for (const key in localStorage) {
    if (Object.hasOwn(localStorage, key)) {
      used += localStorage[key].length + key.length;
    }
  }

  // Most browsers have 5-10MB limit for localStorage
  // We'll use 5MB as conservative estimate
  const total = 5 * 1024 * 1024; // 5MB in bytes
  const available = total - used;
  const usedPercentage = (used / total) * 100;

  return {
    used,
    available,
    total,
    usedPercentage,
    usedFormatted: formatBytes(used),
    availableFormatted: formatBytes(available),
    totalFormatted: formatBytes(total),
  };
};

/**
 * Check if localStorage has enough space for new data
 */
export const hasEnoughSpace = (dataSize: number): boolean => {
  const info = getStorageInfo();
  return info.available >= dataSize;
};

/**
 * Get size of specific localStorage item
 */
export const getItemSize = (key: string): number => {
  if (typeof localStorage === 'undefined') return 0;

  const item = localStorage.getItem(key);
  if (!item) return 0;

  return item.length + key.length;
};

/**
 * Clean up old localStorage items if needed
 */
export const cleanupStorage = (keepKeys: string[] = []): number => {
  if (typeof localStorage === 'undefined') return 0;

  let cleaned = 0;
  const keysToRemove: string[] = [];

  for (const key in localStorage) {
    if (Object.hasOwn(localStorage, key) && !keepKeys.includes(key)) {
      // Remove old auto-save data (older than 7 days)
      if (key.startsWith('autosave_') || key.startsWith('backup_')) {
        const timestamp = key.split('_')[1];
        if (timestamp && Date.now() - Number.parseInt(timestamp) > 7 * 24 * 60 * 60 * 1000) {
          keysToRemove.push(key);
        }
      }
    }
  }

  keysToRemove.forEach((key) => {
    cleaned += getItemSize(key);
    localStorage.removeItem(key);
  });

  return cleaned;
};

/**
 * Test localStorage capacity by writing data until it fails
 * WARNING: This will temporarily use a lot of storage
 */
export const testStorageCapacity = (): number => {
  if (typeof localStorage === 'undefined') return 0;

  const testKey = '__storage_test__';
  const testData = 'x'.repeat(1024); // 1KB chunks
  let capacity = 0;

  try {
    // Clean up any existing test data
    localStorage.removeItem(testKey);

    // Keep adding data until we hit the limit
    while (true) {
      try {
        localStorage.setItem(testKey, testData.repeat(capacity + 1));
        capacity++;
      } catch (_e) {
        break;
      }
    }

    // Clean up test data
    localStorage.removeItem(testKey);

    return capacity * 1024; // Return in bytes
  } catch (_e) {
    // Clean up on error
    try {
      localStorage.removeItem(testKey);
    } catch {
      // Ignore cleanup errors
    }
    return 0;
  }
};

/**
 * Storage quota warning thresholds
 */
export const STORAGE_THRESHOLDS = {
  WARNING: 80, // 80% usage
  CRITICAL: 95, // 95% usage
} as const;

/**
 * Get storage warning level
 */
export const getStorageWarningLevel = (): 'safe' | 'warning' | 'critical' => {
  const info = getStorageInfo();

  if (info.usedPercentage >= STORAGE_THRESHOLDS.CRITICAL) {
    return 'critical';
  }
  if (info.usedPercentage >= STORAGE_THRESHOLDS.WARNING) {
    return 'warning';
  }

  return 'safe';
};

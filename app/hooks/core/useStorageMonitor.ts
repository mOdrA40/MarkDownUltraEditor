/**
 * Storage Monitor Hook
 * Monitors localStorage usage and prevents memory leaks
 *
 * @author Axel Modra
 */

import { useCallback, useEffect, useState } from 'react';
import {
  cleanupStorage,
  formatBytes,
  getStorageInfo,
  type StorageInfo,
} from '@/utils/storageUtils';

interface UseStorageMonitorOptions {
  /** Threshold percentage to trigger cleanup (default: 80%) */
  cleanupThreshold?: number;
  /** Interval to check storage in milliseconds (default: 30 seconds) */
  checkInterval?: number;
  /** Keys to preserve during cleanup */
  preserveKeys?: string[];
  /** Enable automatic cleanup */
  autoCleanup?: boolean;
}

interface UseStorageMonitorReturn {
  /** Current storage information */
  storageInfo: StorageInfo;
  /** Whether storage is near capacity */
  isNearCapacity: boolean;
  /** Whether storage is at critical level */
  isCritical: boolean;
  /** Manually trigger cleanup */
  triggerCleanup: () => Promise<number>;
  /** Refresh storage info */
  refreshInfo: () => void;
  /** Check if there's enough space for data */
  hasSpaceFor: (dataSize: number) => boolean;
}

/**
 * Hook for monitoring localStorage usage and preventing memory leaks
 */
export const useStorageMonitor = (
  options: UseStorageMonitorOptions = {}
): UseStorageMonitorReturn => {
  const {
    cleanupThreshold = 80,
    checkInterval = 30000, // 30 seconds
    preserveKeys = [
      'markdownEditor_content',
      'markdownEditor_fileName',
      'markdownEditor_theme',
      'markdownEditor_settings',
      'markdownEditor_uiState',
    ],
    autoCleanup = true,
  } = options;

  const [storageInfo, setStorageInfo] = useState<StorageInfo>(() => {
    // Return default values during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return {
        used: 0,
        available: 5 * 1024 * 1024, // 5MB
        total: 5 * 1024 * 1024,
        usedPercentage: 0,
        usedFormatted: '0 Bytes',
        availableFormatted: '5 MB',
        totalFormatted: '5 MB',
      };
    }
    return getStorageInfo();
  });

  /**
   * Refresh storage information
   */
  const refreshInfo = useCallback(() => {
    const info = getStorageInfo();
    setStorageInfo(info);
  }, []);

  // Update storage info after hydration to prevent mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshInfo();
    }
  }, [refreshInfo]);

  /**
   * Check if storage has enough space for new data
   */
  const hasSpaceFor = useCallback((dataSize: number): boolean => {
    const info = getStorageInfo();
    return info.available >= dataSize;
  }, []);

  /**
   * Trigger manual cleanup
   */
  const triggerCleanup = useCallback(async (): Promise<number> => {
    try {
      const cleanedBytes = cleanupStorage(preserveKeys);
      refreshInfo();

      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev(`🧹 Storage cleanup completed: ${formatBytes(cleanedBytes)} freed`);
      });
      return cleanedBytes;
    } catch (error) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.error('Storage cleanup failed:', error);
      });
      return 0;
    }
  }, [preserveKeys, refreshInfo]);

  /**
   * Auto cleanup when threshold is reached
   */
  const autoCleanupIfNeeded = useCallback(async () => {
    if (!autoCleanup) return;

    const info = getStorageInfo();
    if (info.usedPercentage >= cleanupThreshold) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev(
          `⚠️ Storage threshold reached (${info.usedPercentage.toFixed(1)}%), triggering cleanup...`
        );
      });
      await triggerCleanup();
    }
  }, [autoCleanup, cleanupThreshold, triggerCleanup]);

  /**
   * Periodic storage monitoring
   */
  useEffect(() => {
    const interval = setInterval(() => {
      refreshInfo();
      autoCleanupIfNeeded();
    }, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval, refreshInfo, autoCleanupIfNeeded]);

  /**
   * Initial cleanup check
   */
  useEffect(() => {
    autoCleanupIfNeeded();
  }, [autoCleanupIfNeeded]);

  // Calculate status flags
  const isNearCapacity = storageInfo.usedPercentage >= cleanupThreshold;
  const isCritical = storageInfo.usedPercentage >= 95;

  return {
    storageInfo,
    isNearCapacity,
    isCritical,
    triggerCleanup,
    refreshInfo,
    hasSpaceFor,
  };
};

/**
 * Storage status component hook for UI display
 */
export const useStorageStatus = () => {
  const { storageInfo, isNearCapacity, isCritical } = useStorageMonitor();

  const getStatusColor = (): string => {
    if (isCritical) return 'text-red-600 dark:text-red-400';
    if (isNearCapacity) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getStatusText = (): string => {
    if (isCritical) return 'Critical';
    if (isNearCapacity) return 'Near Capacity';
    return 'Good';
  };

  const getProgressBarColor = (): string => {
    if (isCritical) return 'bg-red-500';
    if (isNearCapacity) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return {
    storageInfo,
    isNearCapacity,
    isCritical,
    statusColor: getStatusColor(),
    statusText: getStatusText(),
    progressBarColor: getProgressBarColor(),
  };
};

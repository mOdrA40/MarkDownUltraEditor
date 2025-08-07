/**
 * Storage Monitor Hook
 * Monitors localStorage usage and prevents memory leaks
 *
 * @author Axel Modra
 */

import { useCallback, useEffect, useState } from "react";
import {
  cleanupStorage,
  formatBytes,
  getStorageInfo,
  type StorageInfo,
} from "@/utils/storageUtils";

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

interface AdaptiveLimits {
  maxFileSize: number;
  maxTotalSize: number;
  maxFiles: number;
  warningThreshold: number;
  criticalThreshold: number;
}

interface UseStorageMonitorReturn {
  /** Current storage information */
  storageInfo: StorageInfo;
  /** Whether storage is near capacity */
  isNearCapacity: boolean;
  /** Whether storage is at critical level */
  isCritical: boolean;
  /** Adaptive storage limits */
  adaptiveLimits: AdaptiveLimits | null;
  /** Manually trigger cleanup */
  triggerCleanup: () => Promise<number>;
  /** Intelligent cleanup with multiple strategies */
  intelligentCleanup: () => Promise<StorageInfo>;
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
      "markdownEditor_content",
      "markdownEditor_fileName",
      "markdownEditor_theme",
      "markdownEditor_settings",
      "markdownEditor_uiState",
    ],
    autoCleanup = true,
  } = options;

  const [storageInfo, setStorageInfo] = useState<StorageInfo>(() => {
    // Return default values during SSR to prevent hydration mismatch
    if (typeof window === "undefined") {
      return {
        used: 0,
        available: 5 * 1024 * 1024, // 5MB
        total: 5 * 1024 * 1024,
        usedPercentage: 0,
        usedFormatted: "0 Bytes",
        availableFormatted: "5 MB",
        totalFormatted: "5 MB",
      };
    }
    return getStorageInfo();
  });

  const [adaptiveLimits, setAdaptiveLimits] = useState<AdaptiveLimits | null>(
    null
  );

  /**
   * Time-based cleanup utility
   */
  const timeBasedCleanup = useCallback(() => {
    if (typeof localStorage === "undefined") return;

    const now = Date.now();
    const TIME_LIMITS = {
      HOUR: 60 * 60 * 1000,
      DAY: 24 * 60 * 60 * 1000,
      WEEK: 7 * 24 * 60 * 60 * 1000,
    };

    Object.keys(localStorage).forEach((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        const age = now - (data.timestamp || 0);

        // Cleanup rules
        if (key.startsWith("markdownEditor_temp_") && age > TIME_LIMITS.HOUR) {
          localStorage.removeItem(key);
        } else if (
          key.startsWith("markdownEditor_cache_") &&
          age > TIME_LIMITS.DAY
        ) {
          localStorage.removeItem(key);
        } else if (
          key.startsWith("markdownEditor_backup_") &&
          age > TIME_LIMITS.WEEK
        ) {
          localStorage.removeItem(key);
        }
      } catch (_e) {
        // Invalid JSON, remove it
        localStorage.removeItem(key);
      }
    });
  }, []);

  /**
   * Calculate adaptive storage limits based on available quota
   */
  const calculateAdaptiveLimits =
    useCallback(async (): Promise<AdaptiveLimits> => {
      let totalQuota = 5 * 1024 * 1024; // 5MB default

      // Try to get actual storage quota
      if (
        typeof navigator !== "undefined" &&
        "storage" in navigator &&
        "estimate" in navigator.storage
      ) {
        try {
          const estimate = await navigator.storage.estimate();
          totalQuota = estimate.quota || totalQuota;
        } catch (error) {
          import("@/utils/console").then(({ safeConsole }) => {
            safeConsole.warn("Failed to get storage quota:", error);
          });
        }
      }

      return {
        maxFileSize: Math.min(totalQuota * 0.1, 1024 * 1024), // 10% of quota or 1MB
        maxTotalSize: totalQuota * 0.8, // 80% of quota
        maxFiles: Math.max(10, Math.floor(totalQuota / (50 * 1024))), // Min 10 files
        warningThreshold: totalQuota * 0.7, // 70% warning
        criticalThreshold: totalQuota * 0.9, // 90% critical
      };
    }, []);

  /**
   * Initialize adaptive limits
   */
  useEffect(() => {
    calculateAdaptiveLimits().then(setAdaptiveLimits);
  }, [calculateAdaptiveLimits]);

  /**
   * Refresh storage information
   */
  const refreshInfo = useCallback(() => {
    const info = getStorageInfo();
    setStorageInfo(info);
  }, []);

  // Update storage info after hydration to prevent mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
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

      import("@/utils/console").then(({ safeConsole }) => {
        safeConsole.dev(
          `🧹 Storage cleanup completed: ${formatBytes(cleanedBytes)} freed`
        );
      });
      return cleanedBytes;
    } catch (error) {
      import("@/utils/console").then(({ safeConsole }) => {
        safeConsole.error("Storage cleanup failed:", error);
      });
      return 0;
    }
  }, [preserveKeys, refreshInfo]);

  /**
   * Intelligent cleanup with multiple strategies
   */
  const intelligentCleanup = useCallback(async (): Promise<StorageInfo> => {
    import("@/utils/console").then(({ safeConsole }) => {
      safeConsole.dev("🧹 Starting simple cleanup...");
    });

    const currentUsage = getStorageInfo();
    timeBasedCleanup();

    const finalInfo = getStorageInfo();
    refreshInfo();

    import("@/utils/console").then(({ safeConsole }) => {
      safeConsole.dev(
        `🧹 Simple cleanup completed: ${currentUsage.usedPercentage.toFixed(1)}% → ${finalInfo.usedPercentage.toFixed(1)}%`
      );
    });

    return finalInfo;
  }, [refreshInfo, timeBasedCleanup]);

  /**
   * Auto cleanup when threshold is reached
   */
  const autoCleanupIfNeeded = useCallback(async () => {
    if (!autoCleanup) return;

    const info = getStorageInfo();
    if (info.usedPercentage >= cleanupThreshold) {
      import("@/utils/console").then(({ safeConsole }) => {
        safeConsole.dev(
          `⚠️ Storage threshold reached (${info.usedPercentage.toFixed(1)}%), triggering intelligent cleanup...`
        );
      });
      await intelligentCleanup();
    }
  }, [autoCleanup, cleanupThreshold, intelligentCleanup]);

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
    adaptiveLimits,
    triggerCleanup,
    intelligentCleanup,
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
    if (isCritical) return "text-red-600 dark:text-red-400";
    if (isNearCapacity) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getStatusText = (): string => {
    if (isCritical) return "Critical";
    if (isNearCapacity) return "Near Capacity";
    return "Good";
  };

  const getProgressBarColor = (): string => {
    if (isCritical) return "bg-red-500";
    if (isNearCapacity) return "bg-yellow-500";
    return "bg-green-500";
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

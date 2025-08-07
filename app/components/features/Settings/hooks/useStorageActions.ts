/**
 * @fileoverview Storage actions hook
 * @author Axel Modra
 */

import { useAuth } from '@clerk/react-router';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/core/useToast';
import { useFileStorage } from '@/hooks/files';
import { safeConsole } from '@/utils/console';
import { STORAGE_KEYS } from '../constants';
import type { StorageState, UseStorageReturn } from '../types/storage';

/**
 * Storage actions hook
 */
export const useStorageActions = (): UseStorageReturn => {
  const { isSignedIn } = useAuth();
  const { toast } = useToast();
  const fileStorage = useFileStorage();

  const [state, setState] = useState<StorageState>({
    localStorage: {
      type: 'local',
      used: '0 MB',
      percentage: 0,
      available: true,
    },
    cloudStorage: null,
    isLoading: false,
    error: null,
  });

  // Calculate storage usage using consistent data from fileStorage
  const calculateStorageUsage = useCallback(async () => {
    try {
      const { storageUtils } = await import('../utils/storage');

      // Use fileStorage.storageInfo for consistent calculation with My Files page
      const storageInfo = fileStorage.storageInfo;

      if (!storageInfo) {
        safeConsole.log('Storage info not available yet');
        return;
      }

      if (storageInfo.storageType === 'local') {
        // For local storage, use the consistent calculation from fileStorage
        setState((prev) => ({
          ...prev,
          localStorage: {
            type: 'local',
            used: storageUtils.formatBytes(storageInfo.totalSize),
            percentage: Math.round(
              (storageInfo.totalSize / (storageInfo.quotaLimit || 5 * 1024 * 1024)) * 100
            ),
            available: true,
          },
          cloudStorage: null,
        }));
      } else {
        // For cloud storage, use the data from fileStorage
        const localStorageInfo = await storageUtils.getStorageInfo();

        setState((prev) => ({
          ...prev,
          localStorage: {
            type: 'local',
            used: localStorageInfo.local.used,
            percentage: Math.round(localStorageInfo.local.percentage),
            available: true,
          },
          cloudStorage: {
            type: 'cloud',
            used: storageUtils.formatBytes(storageInfo.totalSize),
            percentage: Math.min((storageInfo.totalSize / (50 * 1024 * 1024)) * 100, 100), // 50MB limit
            available: true,
          },
        }));
      }
    } catch (error) {
      safeConsole.error('Failed to calculate storage usage:', error);
    }
  }, [fileStorage.storageInfo]);

  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      const keysToRemove = [
        STORAGE_KEYS.CONTENT,
        STORAGE_KEYS.FILE_NAME,
        STORAGE_KEYS.THEME,
        STORAGE_KEYS.PREFERENCES,
        STORAGE_KEYS.WRITING_SETTINGS,
        STORAGE_KEYS.HAS_VISITED,
      ];

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Recalculate storage usage
      await calculateStorageUsage();

      toast({
        title: isSignedIn ? 'Browser Cache Cleared' : 'Local Storage Cleared',
        description: isSignedIn
          ? 'Browser cache including preferences and temporary data has been cleared.'
          : 'Local storage including documents and settings has been cleared.',
      });
    } catch (error) {
      safeConsole.error('Failed to clear cache:', error);
      toast({
        title: 'Clear Failed',
        description: 'Failed to clear cache. Please try again.',
        variant: 'destructive',
      });
    }
  }, [calculateStorageUsage, toast, isSignedIn]);

  // Export data
  const exportData = useCallback(async () => {
    try {
      const files = fileStorage.files;
      const exportData = {
        files,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `storage-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data Exported',
        description: 'Your data has been exported successfully.',
      });
    } catch (error) {
      safeConsole.error('Failed to export data:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    }
  }, [fileStorage.files, toast]);

  // Sync data
  const syncData = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      // Force refresh files from cloud
      fileStorage.refreshFiles();

      toast({
        title: 'Sync Complete',
        description: 'Your data has been synced with the cloud.',
      });
    } catch (error) {
      safeConsole.error('Failed to sync data:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync data. Please try again.',
        variant: 'destructive',
      });
    }
  }, [isSignedIn, fileStorage, toast]);

  // Refresh storage info
  const refreshStorageInfo = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await calculateStorageUsage();
    setState((prev) => ({ ...prev, isLoading: false }));
  }, [calculateStorageUsage]);

  // Calculate storage usage on mount and when dependencies change
  useEffect(() => {
    calculateStorageUsage().catch((error) => {
      safeConsole.error('Failed to calculate storage usage on mount:', error);
    });
  }, [calculateStorageUsage]);

  return {
    state,
    actions: {
      clearCache,
      exportData,
      syncData,
      refreshStorageInfo,
    },
  };
};

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

  // Calculate storage usage
  const calculateStorageUsage = useCallback(() => {
    try {
      let totalSize = 0;

      // Calculate localStorage usage
      for (const key in localStorage) {
        if (Object.hasOwn(localStorage, key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }

      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
      const percentage = Math.min((totalSize / (5 * 1024 * 1024)) * 100, 100); // Assume 5MB limit

      setState((prev) => ({
        ...prev,
        localStorage: {
          type: 'local',
          used: `${sizeInMB} MB`,
          percentage: Math.round(percentage),
          available: true,
        },
      }));

      // Calculate cloud storage if signed in
      if (isSignedIn) {
        const cloudSizeInMB = (fileStorage.files.length * 0.1).toFixed(2); // Rough estimate
        const cloudPercentage = Math.min((Number.parseFloat(cloudSizeInMB) / 50) * 100, 100); // Assume 50MB limit

        setState((prev) => ({
          ...prev,
          cloudStorage: {
            type: 'cloud',
            used: `${cloudSizeInMB} MB`,
            percentage: Math.round(cloudPercentage),
            available: true,
          },
        }));
      }
    } catch (error) {
      safeConsole.error('Failed to calculate storage usage:', error);
    }
  }, [isSignedIn, fileStorage.files.length]);

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
      calculateStorageUsage();

      toast({
        title: 'Cache Cleared',
        description: 'Local storage cache has been cleared successfully.',
      });
    } catch (error) {
      safeConsole.error('Failed to clear cache:', error);
      toast({
        title: 'Clear Failed',
        description: 'Failed to clear cache. Please try again.',
        variant: 'destructive',
      });
    }
  }, [calculateStorageUsage, toast]);

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
    calculateStorageUsage();
    setState((prev) => ({ ...prev, isLoading: false }));
  }, [calculateStorageUsage]);

  // Calculate storage usage on mount and when dependencies change
  useEffect(() => {
    calculateStorageUsage();
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

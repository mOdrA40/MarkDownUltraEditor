/**
 * @fileoverview React hook for file storage operations with Supabase and localStorage
 * @author Axel Modra
 */

import { useAuth } from '@clerk/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/core/useToast';
import { invalidateQueries, queryKeys } from '@/lib/queryClient';
import { createAuthenticatedSupabaseClient, type FileData } from '@/lib/supabase';
import {
  createFileStorageService,
  type FileStorageService,
  type StorageInfo,
} from '@/services/fileStorage';
import { safeConsole } from '@/utils/console';

/**
 * Hook return interface
 */
export interface UseFileStorageReturn {
  // Storage service
  storageService: FileStorageService | null;

  // File operations
  files: FileData[];
  isLoadingFiles: boolean;
  saveFile: (file: FileData) => Promise<FileData>;
  loadFile: (identifier: string) => Promise<FileData | null>;
  deleteFile: (identifier: string) => Promise<void>;

  // Storage info
  storageInfo: StorageInfo | null;
  isLoadingStorageInfo: boolean;

  // Utility operations
  exportAllFiles: () => Promise<void>;
  refreshFiles: () => void;

  // State
  isAuthenticated: boolean;
  isInitialized: boolean;
  error: string | null;
}

/**
 * File storage hook with React Query integration
 */
export const useFileStorage = (): UseFileStorageReturn => {
  const { isSignedIn, userId, getToken } = useAuth();
  const { toast } = useToast();
  // Using global queryClient from invalidateQueries helper functions

  const [storageService, setStorageService] = useState<FileStorageService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize storage service
  useEffect(() => {
    const initializeStorageService = async () => {
      try {
        safeConsole.log('Initializing file storage service...');
        setError(null);

        let supabaseClient = null;
        let currentUserId = null;

        if (isSignedIn && userId) {
          try {
            // NEW: Use native third-party auth integration (no template needed)
            const token = await getToken();
            if (token) {
              supabaseClient = createAuthenticatedSupabaseClient(token);
              currentUserId = userId;
              safeConsole.log('✓ Authenticated storage service initialized with third-party auth');
            } else {
              safeConsole.log('Failed to get Clerk token, using local storage');
            }
          } catch (tokenError) {
            safeConsole.log('Error getting token, falling back to local storage:', tokenError);
          }
        } else {
          safeConsole.log('User not signed in, using local storage');
        }

        const service = createFileStorageService(supabaseClient, currentUserId);
        setStorageService(service);
        setIsInitialized(true);

        safeConsole.log('File storage service initialized successfully');
      } catch (initError) {
        safeConsole.error('Error initializing storage service:', initError);
        setError('Failed to initialize storage service');

        // Fallback to local storage
        const fallbackService = createFileStorageService(null, null);
        setStorageService(fallbackService);
        setIsInitialized(true);
      }
    };

    initializeStorageService();
  }, [isSignedIn, userId, getToken]);

  // Files list query with optimized keys
  const {
    data: files = [],
    isLoading: isLoadingFiles,
    refetch: refreshFiles,
  } = useQuery<FileData[]>({
    queryKey: queryKeys.files.list(userId || 'anonymous'),
    queryFn: async () => {
      if (!storageService) {
        safeConsole.log('Storage service not initialized, returning empty files list');
        return [];
      }

      try {
        safeConsole.log('Fetching files list...');
        const filesList = await storageService.list();
        safeConsole.log(`Fetched ${filesList.length} files`);
        return filesList;
      } catch (error) {
        safeConsole.error('Error fetching files:', error);
        toast({
          title: 'Error Loading Files',
          description: 'Failed to load your files. Please try again.',
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: isInitialized && !!storageService,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in React Query v5)
  });

  // Storage info query with optimized keys
  const { data: storageInfo = null, isLoading: isLoadingStorageInfo } = useQuery({
    queryKey: queryKeys.storage.info(userId || 'anonymous'),
    queryFn: async () => {
      if (!storageService) return null;

      try {
        safeConsole.log('Fetching storage info...');
        // Use async method for more accurate data
        const info = await storageService.getStorageInfoAsync();
        safeConsole.log('Storage info:', info);
        return info;
      } catch (error) {
        safeConsole.error('Error getting storage info:', error);
        // Fallback to sync method
        try {
          return storageService.getStorageInfo();
        } catch (fallbackError) {
          safeConsole.error('Error getting fallback storage info:', fallbackError);
          return null;
        }
      }
    },
    enabled: isInitialized && !!storageService,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Save file mutation
  const saveFileMutation = useMutation({
    mutationFn: async (file: FileData) => {
      if (!storageService) {
        throw new Error('Storage service not initialized');
      }

      safeConsole.log('Saving file:', file.title);
      return await storageService.save(file);
    },
    onSuccess: (savedFile) => {
      safeConsole.log('File saved successfully:', savedFile.title);

      // Optimized invalidation using helper functions
      invalidateQueries.files.all();
      invalidateQueries.storage.all();

      toast({
        title: 'File Saved',
        description: `${savedFile.title} has been saved successfully.`,
      });
    },
    onError: (error: unknown) => {
      safeConsole.error('Error saving file:', error);
      const errorObj = error as { message?: string };
      toast({
        title: 'Save Failed',
        description: errorObj.message || 'Failed to save file. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (identifier: string) => {
      if (!storageService) {
        throw new Error('Storage service not initialized');
      }

      safeConsole.log('Deleting file:', identifier);
      await storageService.delete(identifier);
    },
    onSuccess: (_, identifier) => {
      safeConsole.log('File deleted successfully:', identifier);

      // Optimized invalidation using helper functions
      invalidateQueries.files.all();
      invalidateQueries.storage.all();

      toast({
        title: 'File Deleted',
        description: 'File has been deleted successfully.',
      });
    },
    onError: (error: unknown) => {
      safeConsole.error('Error deleting file:', error);
      const errorObj = error as { message?: string };
      toast({
        title: 'Delete Failed',
        description: errorObj.message || 'Failed to delete file. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Load file function
  const loadFile = useCallback(
    async (identifier: string): Promise<FileData | null> => {
      if (!storageService) {
        safeConsole.error('Storage service not initialized');
        return null;
      }

      try {
        safeConsole.log('Loading file:', identifier);
        const file = await storageService.load(identifier);

        if (file) {
          safeConsole.log('File loaded successfully:', file.title);
        } else {
          safeConsole.log('File not found:', identifier);
        }

        return file;
      } catch (error) {
        safeConsole.error('Error loading file:', error);
        toast({
          title: 'Load Failed',
          description: 'Failed to load file. Please try again.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [storageService, toast]
  );

  // Export all files function
  const exportAllFiles = useCallback(async (): Promise<void> => {
    if (!storageService) {
      toast({
        title: 'Export Failed',
        description: 'Storage service not initialized.',
        variant: 'destructive',
      });
      return;
    }

    try {
      safeConsole.log('Exporting all files...');
      const blob = await storageService.exportAllFiles();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `markdown-files-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      safeConsole.log('Files exported successfully');
      toast({
        title: 'Export Complete',
        description: 'All files have been exported successfully.',
      });
    } catch (error) {
      safeConsole.error('Error exporting files:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export files. Please try again.',
        variant: 'destructive',
      });
    }
  }, [storageService, toast]);

  // Memoized return value
  const returnValue = useMemo(
    (): UseFileStorageReturn => ({
      storageService,
      files,
      isLoadingFiles,
      saveFile: saveFileMutation.mutateAsync,
      loadFile,
      deleteFile: deleteFileMutation.mutateAsync,
      storageInfo,
      isLoadingStorageInfo,
      exportAllFiles,
      refreshFiles,
      isAuthenticated: isSignedIn || false,
      isInitialized,
      error,
    }),
    [
      storageService,
      files,
      isLoadingFiles,
      saveFileMutation.mutateAsync,
      loadFile,
      deleteFileMutation.mutateAsync,
      storageInfo,
      isLoadingStorageInfo,
      exportAllFiles,
      refreshFiles,
      isSignedIn,
      isInitialized,
      error,
    ]
  );

  return returnValue;
};

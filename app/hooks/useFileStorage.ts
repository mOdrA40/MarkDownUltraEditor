/**
 * @fileoverview React hook for file storage operations with Supabase and localStorage
 * @author Axel Modra
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileStorageService, 
  createFileStorageService, 
  StorageInfo 
} from '@/services/fileStorage';
import { FileData, createAuthenticatedSupabaseClient } from '@/lib/supabase';
import { useToast } from '@/hooks/core/useToast';

// Query keys for React Query
const QUERY_KEYS = {
  FILES_LIST: 'files-list',
  FILE_DETAIL: 'file-detail',
  STORAGE_INFO: 'storage-info',
} as const;

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
  const queryClient = useQueryClient();
  
  const [storageService, setStorageService] = useState<FileStorageService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize storage service
  useEffect(() => {
    const initializeStorageService = async () => {
      try {
        console.log('Initializing file storage service...');
        setError(null);
        
        let supabaseClient = null;
        let currentUserId = null;

        if (isSignedIn && userId) {
          try {
            const token = await getToken({ template: 'supabase' });
            if (token) {
              supabaseClient = createAuthenticatedSupabaseClient(token);
              currentUserId = userId;
              console.log('Authenticated storage service initialized');
            } else {
              console.warn('Failed to get Supabase token, using local storage');
            }
          } catch (tokenError) {
            console.warn('Error getting token, falling back to local storage:', tokenError);
          }
        } else {
          console.log('User not signed in, using local storage');
        }

        const service = createFileStorageService(supabaseClient, currentUserId);
        setStorageService(service);
        setIsInitialized(true);
        
        console.log('File storage service initialized successfully');
      } catch (initError) {
        console.error('Error initializing storage service:', initError);
        setError('Failed to initialize storage service');
        
        // Fallback to local storage
        const fallbackService = createFileStorageService(null, null);
        setStorageService(fallbackService);
        setIsInitialized(true);
      }
    };

    initializeStorageService();
  }, [isSignedIn, userId, getToken]);

  // Files list query
  const {
    data: files = [],
    isLoading: isLoadingFiles,
    refetch: refreshFiles,
  } = useQuery<FileData[]>({
    queryKey: [QUERY_KEYS.FILES_LIST, userId],
    queryFn: async () => {
      if (!storageService) {
        console.log('Storage service not initialized, returning empty files list');
        return [];
      }
      
      try {
        console.log('Fetching files list...');
        const filesList = await storageService.list();
        console.log(`Fetched ${filesList.length} files`);
        return filesList;
      } catch (error) {
        console.error('Error fetching files:', error);
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

  // Storage info query
  const {
    data: storageInfo = null,
    isLoading: isLoadingStorageInfo,
  } = useQuery({
    queryKey: [QUERY_KEYS.STORAGE_INFO, userId],
    queryFn: () => {
      if (!storageService) return null;
      
      try {
        console.log('Fetching storage info...');
        const info = storageService.getStorageInfo();
        console.log('Storage info:', info);
        return info;
      } catch (error) {
        console.error('Error getting storage info:', error);
        return null;
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
      
      console.log('Saving file:', file.title);
      return await storageService.save(file);
    },
    onSuccess: (savedFile) => {
      console.log('File saved successfully:', savedFile.title);
      
      // Invalidate and refetch files list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FILES_LIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STORAGE_INFO] });
      
      toast({
        title: 'File Saved',
        description: `${savedFile.title} has been saved successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('Error saving file:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save file. Please try again.',
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
      
      console.log('Deleting file:', identifier);
      await storageService.delete(identifier);
    },
    onSuccess: (_, identifier) => {
      console.log('File deleted successfully:', identifier);
      
      // Invalidate and refetch files list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FILES_LIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STORAGE_INFO] });
      
      toast({
        title: 'File Deleted',
        description: 'File has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting file:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete file. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Load file function
  const loadFile = useCallback(async (identifier: string): Promise<FileData | null> => {
    if (!storageService) {
      console.error('Storage service not initialized');
      return null;
    }

    try {
      console.log('Loading file:', identifier);
      const file = await storageService.load(identifier);
      
      if (file) {
        console.log('File loaded successfully:', file.title);
      } else {
        console.log('File not found:', identifier);
      }
      
      return file;
    } catch (error) {
      console.error('Error loading file:', error);
      toast({
        title: 'Load Failed',
        description: 'Failed to load file. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  }, [storageService, toast]);

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
      console.log('Exporting all files...');
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
      
      console.log('Files exported successfully');
      toast({
        title: 'Export Complete',
        description: 'All files have been exported successfully.',
      });
    } catch (error) {
      console.error('Error exporting files:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export files. Please try again.',
        variant: 'destructive',
      });
    }
  }, [storageService, toast]);

  // Memoized return value
  const returnValue = useMemo((): UseFileStorageReturn => ({
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
  }), [
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
  ]);

  return returnValue;
};

import { useAuth } from '@clerk/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/core/useToast';
import { batchInvalidateQueries, invalidateQueries, queryKeys } from '@/lib/queryClient';
import { createClerkSupabaseClient, type FileData } from '@/lib/supabase';
import {
  createFileStorageService,
  type FileStorageService,
  type StorageInfo,
} from '@/services/fileStorage';
import { safeConsole } from '@/utils/console';
import {
  createFileOperationError,
  FileOperationErrorCode,
  parseFileOperationError,
} from '@/utils/fileOperationErrors';

export interface UseFileStorageReturn {
  storageService: FileStorageService | null;

  // File operations
  files: FileData[];
  isLoadingFiles: boolean;
  saveFile: (file: FileData) => Promise<FileData>;
  loadFile: (identifier: string) => Promise<FileData | null>;
  deleteFile: (identifier: string) => Promise<void>;

  storageInfo: StorageInfo | null;
  isLoadingStorageInfo: boolean;

  exportAllFiles: () => Promise<void>;
  refreshFiles: () => void;

  isAuthenticated: boolean;
  isInitialized: boolean;
  error: string | null;
}

export const useFileStorage = (): UseFileStorageReturn => {
  const { isSignedIn, userId, getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [storageService, setStorageService] = useState<FileStorageService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStorageService = async () => {
      try {
        safeConsole.log('Initializing file storage service...');
        setError(null);
        setIsInitialized(false); // Ensure we start with false

        let supabaseClient = null;
        let currentUserId = null;

        if (isSignedIn && userId) {
          try {
            safeConsole.log('✓ Initializing authenticated storage with native Third Party Auth');

            const token = await getToken();
            if (!token) {
              throw new Error('No authentication token available');
            }

            supabaseClient = createClerkSupabaseClient(getToken);
            currentUserId = userId;

            const testQuery = await supabaseClient.from('user_files').select('id').limit(1);

            if (testQuery.error && testQuery.error.code !== 'PGRST116') {
              throw testQuery.error;
            }

            safeConsole.log('✓ Authenticated storage service initialized with native integration');
          } catch (tokenError) {
            safeConsole.log(
              'Error setting up authenticated client, falling back to local storage:',
              tokenError
            );
            // Reset to use local storage
            supabaseClient = null;
            currentUserId = null;
          }
        } else {
          safeConsole.log('User not signed in, using local storage');
        }

        const service = createFileStorageService(supabaseClient, currentUserId);

        setStorageService(service);

        // Run cleanup to remove duplicate files from localStorage
        if (service && 'cleanupLocalStorage' in service) {
          (service as { cleanupLocalStorage: () => void }).cleanupLocalStorage();
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        setIsInitialized(true);
        safeConsole.log('File storage service initialized successfully with cleanup');
      } catch (initError) {
        safeConsole.error('Error initializing storage service:', initError);
        setError('Failed to initialize storage service');

        const fallbackService = createFileStorageService(null, null);
        setStorageService(fallbackService);
        setIsInitialized(true);
      }
    };

    initializeStorageService();
  }, [isSignedIn, userId, getToken]);

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
    staleTime: 2 * 60 * 1000, // 2 minutes - faster refresh for file changes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false, // Only refetch if stale
    refetchOnWindowFocus: false,
    retry: 2,
    // Add background refetch for better UX
    refetchInterval: 5 * 60 * 1000, // Background refresh every 5 minutes
  });

  const { data: storageInfo = null, isLoading: isLoadingStorageInfo } = useQuery({
    queryKey: queryKeys.storage.info(userId || 'anonymous'),
    queryFn: async () => {
      if (!storageService) return null;

      try {
        safeConsole.log('Fetching storage info...');
        const info = await storageService.getStorageInfoAsync();
        safeConsole.log('Storage info:', info);
        return info;
      } catch (error) {
        safeConsole.error('Error getting storage info:', error);
        try {
          return storageService.getStorageInfo();
        } catch (fallbackError) {
          safeConsole.error('Error getting fallback storage info:', fallbackError);
          return null;
        }
      }
    },
    enabled: isInitialized && !!storageService,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

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

      invalidateQueries.files.list(userId || 'anonymous');
      if (savedFile.content.length > 10000) {
        invalidateQueries.storage.info(userId || 'anonymous');
      }

      // Only show toast for manual saves, not auto-saves
      // Auto-saves are handled by the auto-save hook with less intrusive notifications
    },
    onError: (error: unknown) => {
      safeConsole.error('Error saving file:', error);
      const fileError = parseFileOperationError(error);
      toast({
        title: 'Save Failed',
        description: fileError.userMessage,
        variant: 'destructive',
      });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation<
    void,
    Error,
    string,
    { previousFiles: FileData[] | undefined }
  >({
    mutationFn: async (identifier: string) => {
      if (!storageService) {
        throw new Error('Storage service not initialized');
      }
      await storageService.delete(identifier);
    },
    onMutate: async (identifier: string) => {
      await queryClient.cancelQueries({ queryKey: [queryKeys.files] });

      const previousFiles = queryClient.getQueryData<FileData[]>([queryKeys.files]);

      queryClient.setQueryData<FileData[]>([queryKeys.files], (old) =>
        old ? old.filter((file) => file.id !== identifier) : []
      );
      return { previousFiles };
    },
    onError: (error, _newFile, context) => {
      if (context?.previousFiles) {
        queryClient.setQueryData([queryKeys.files], context.previousFiles);
      }
      const fileError = parseFileOperationError(error);
      toast({
        title: 'Delete Failed',
        description: fileError.userMessage,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      batchInvalidateQueries.fileOperations(userId || 'anonymous');
    },
  });

  const loadFile = useCallback(
    async (identifier: string): Promise<FileData | null> => {
      if (!storageService) {
        const error = createFileOperationError(
          FileOperationErrorCode.STORAGE_NOT_INITIALIZED,
          'Storage service not initialized'
        );
        toast({
          title: 'Service Not Ready',
          description: error.userMessage,
          variant: 'destructive',
        });
        return null;
      }

      if (!isInitialized) {
        const error = createFileOperationError(
          FileOperationErrorCode.STORAGE_NOT_INITIALIZED,
          'Storage service not fully initialized'
        );
        toast({
          title: 'Service Not Ready',
          description: error.userMessage,
          variant: 'destructive',
        });
        return null;
      }

      // Check if file is already cached in query client
      const cachedFile = queryClient.getQueryData<FileData>([
        'file',
        userId || 'anonymous',
        identifier,
      ]);

      if (cachedFile) {
        safeConsole.log('File loaded from cache:', cachedFile.title);
        return cachedFile;
      }

      try {
        safeConsole.log('Loading file:', identifier);
        safeConsole.log('Storage service authenticated:', isSignedIn);
        safeConsole.log('Storage service type:', isSignedIn ? 'cloud' : 'local');

        const file = await storageService.load(identifier);

        if (file) {
          safeConsole.log(
            'File loaded successfully:',
            file.title,
            'content length:',
            file.content.length
          );
          if (!file.content || file.content.trim().length === 0) {
            safeConsole.log('Warning: Loaded file has empty content:', file.title);
          }

          // Cache the loaded file for faster subsequent access
          queryClient.setQueryData(['file', userId || 'anonymous', identifier], file, {
            updatedAt: Date.now(),
          });
        } else {
          safeConsole.log('File not found:', identifier);
          if (isSignedIn) {
            const error = createFileOperationError(
              FileOperationErrorCode.FILE_NOT_FOUND,
              'File not found in cloud storage'
            );
            toast({
              title: 'File Not Found',
              description: error.userMessage,
              variant: 'destructive',
            });
          }
        }

        return file;
      } catch (error) {
        safeConsole.error('Error loading file:', error);
        const fileError = parseFileOperationError(error);
        toast({
          title: 'Load Failed',
          description: fileError.userMessage,
          variant: 'destructive',
        });
        return null;
      }
    },
    [storageService, toast, isInitialized, isSignedIn, queryClient, userId]
  );

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

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `markdown-export-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'All files have been exported.',
      });
    } catch (error) {
      safeConsole.error('Error exporting files:', error);
      toast({
        title: 'Export Failed',
        description: 'An error occurred while exporting your files.',
        variant: 'destructive',
      });
    }
  }, [storageService, toast]);

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

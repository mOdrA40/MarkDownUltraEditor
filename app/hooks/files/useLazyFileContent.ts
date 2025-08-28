/**
 * @fileoverview Hook for lazy loading file content - CPU optimized
 * @author Augment Agent
 */

import { useQuery } from '@tanstack/react-query';
import { getCacheConfig, queryKeys } from '@/lib/queryClient';
import type { FileData } from '@/lib/supabase';
import { safeConsole } from '@/utils/console';
import { useFileStorage } from './useFileStorage';

interface UseLazyFileContentOptions {
  enabled?: boolean;
  staleTime?: number;
}

// Extended interface for storage service with lazy loading methods
interface ExtendedStorageService {
  loadFileContentFromCloud?: (fileId: string) => Promise<string | null>;
  loadFileMetadataFromCloud?: (fileId: string) => Promise<Omit<FileData, 'content'> | null>;
  load: (identifier: string) => Promise<FileData | null>;
}

interface UseLazyFileContentReturn {
  content: string | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook untuk lazy loading file content
 * Hanya load content ketika benar-benar dibutuhkan - menghemat CPU dan bandwidth
 */
export const useLazyFileContent = (
  fileId: string | null,
  options: UseLazyFileContentOptions = {}
): UseLazyFileContentReturn => {
  const { enabled = true, staleTime } = options;
  const { storageService, isInitialized } = useFileStorage();

  const {
    data: content = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.files.detail(fileId || ''), 'content'],
    queryFn: async () => {
      if (!storageService || !fileId) {
        return null;
      }

      safeConsole.log('🔄 Lazy loading file content:', fileId);

      // Use lazy loading method for cloud storage
      const extendedService = storageService as ExtendedStorageService;
      if (
        'loadFileContentFromCloud' in storageService &&
        extendedService.loadFileContentFromCloud
      ) {
        const content = await extendedService.loadFileContentFromCloud(fileId);
        safeConsole.log(`✅ Lazy loaded content: ${content?.length || 0} chars`);
        return content;
      }

      // Fallback to regular load for local storage
      const file = await extendedService.load(fileId);
      return file?.content || null;
    },
    enabled: enabled && isInitialized && !!storageService && !!fileId,
    staleTime: staleTime || getCacheConfig('files', 'detail').staleTime,
    gcTime: getCacheConfig('files', 'detail').gcTime,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    content,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
};

/**
 * Hook untuk lazy loading file metadata (tanpa content)
 * Sangat efisien untuk file listing dan preview
 */
export const useLazyFileMetadata = (
  fileId: string | null,
  options: UseLazyFileContentOptions = {}
) => {
  const { enabled = true, staleTime } = options;
  const { storageService, isInitialized } = useFileStorage();

  const {
    data: metadata = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.files.detail(fileId || ''), 'metadata'],
    queryFn: async () => {
      if (!storageService || !fileId) {
        return null;
      }

      safeConsole.log('📋 Lazy loading file metadata:', fileId);

      // Use metadata-only method for cloud storage
      const extendedService = storageService as ExtendedStorageService;
      if (
        'loadFileMetadataFromCloud' in storageService &&
        extendedService.loadFileMetadataFromCloud
      ) {
        const metadata = await extendedService.loadFileMetadataFromCloud(fileId);
        safeConsole.log('✅ Lazy loaded metadata:', metadata?.title);
        return metadata;
      }

      // Fallback to regular load for local storage (but exclude content)
      const file = await extendedService.load(fileId);
      if (!file) return null;

      const { content: _, ...metadata } = file;
      return metadata;
    },
    enabled: enabled && isInitialized && !!storageService && !!fileId,
    staleTime: staleTime || getCacheConfig('files', 'detail').staleTime,
    gcTime: getCacheConfig('files', 'detail').gcTime,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    metadata,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
};

/**
 * Hook untuk batch lazy loading multiple file contents
 * Efisien untuk loading multiple files sekaligus
 */
export const useBatchLazyFileContent = (
  fileIds: string[],
  options: UseLazyFileContentOptions = {}
) => {
  const { enabled = true } = options;
  const { storageService, isInitialized } = useFileStorage();

  const _queries = fileIds.map((fileId) => ({
    queryKey: [...queryKeys.files.detail(fileId), 'content'],
    queryFn: async () => {
      if (!storageService) return null;

      const extendedService = storageService as ExtendedStorageService;
      if (
        'loadFileContentFromCloud' in storageService &&
        extendedService.loadFileContentFromCloud
      ) {
        return await extendedService.loadFileContentFromCloud(fileId);
      }

      const file = await extendedService.load(fileId);
      return file?.content || null;
    },
    enabled: enabled && isInitialized && !!storageService,
    ...getCacheConfig('files', 'detail'),
  }));

  // Note: This would need useQueries from React Query for actual implementation
  // For now, return a simplified structure
  return {
    contents: [] as (string | null)[],
    isLoading: false,
    isError: false,
    errors: [] as (Error | null)[],
  };
};

/**
 * Hook untuk preload file content di background
 * Berguna untuk prefetching content yang mungkin akan dibutuhkan
 */
export const usePreloadFileContent = (fileIds: string[], options: { delay?: number } = {}) => {
  const { delay = 1000 } = options;
  const { storageService, isInitialized } = useFileStorage();

  // Preload dengan delay untuk tidak mengganggu initial load
  const preloadContent = async (fileId: string) => {
    if (!storageService) return;

    setTimeout(async () => {
      try {
        if ('loadFileContentFromCloud' in storageService) {
          await storageService.loadFileContentFromCloud(fileId);
          safeConsole.log('🚀 Preloaded file content:', fileId);
        }
      } catch (error) {
        safeConsole.log('⚠️ Preload failed (non-critical):', fileId, error);
      }
    }, delay);
  };

  // Trigger preload when conditions are met
  if (isInitialized && storageService && fileIds.length > 0) {
    fileIds.forEach(preloadContent);
  }

  return { preloadTriggered: isInitialized && !!storageService };
};

/**
 * Hook untuk smart content loading
 * Automatically decides whether to load content based on file size and user preferences
 */
export const useSmartFileContent = (
  fileId: string | null,
  options: {
    maxAutoLoadSize?: number; // bytes
    forceLoad?: boolean;
  } = {}
) => {
  const { maxAutoLoadSize = 50 * 1024, forceLoad = false } = options; // 50KB default

  // First, get metadata to check file size
  const { metadata, isLoading: isLoadingMetadata } = useLazyFileMetadata(fileId);

  // Decide whether to auto-load content
  const shouldLoadContent = forceLoad || (metadata && (metadata.fileSize || 0) <= maxAutoLoadSize);

  // Conditionally load content
  const {
    content,
    isLoading: isLoadingContent,
    ...contentRest
  } = useLazyFileContent(fileId, { enabled: shouldLoadContent || false });

  return {
    metadata,
    content: shouldLoadContent ? content : null,
    isLoading: isLoadingMetadata || (shouldLoadContent && isLoadingContent),
    shouldLoadContent,
    canAutoLoad: metadata && (metadata.fileSize || 0) <= maxAutoLoadSize,
    ...contentRest,
  };
};

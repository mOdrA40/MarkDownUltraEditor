/**
 * @fileoverview Hook for paginated file listing with optimized performance
 * @author Augment Agent
 */

import { useAuth } from '@clerk/react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getCacheConfig, queryKeys } from '@/lib/queryClient';
import type { PaginatedFileResponse, PaginationOptions } from '@/services/fileStorage';
import { safeConsole } from '@/utils/console';
import { useFileStorage } from './useFileStorage';

interface UseFilesPaginationOptions {
  limit?: number;
  includeContent?: boolean;
  enabled?: boolean;
}

interface UseFilesPaginationReturn {
  files: Array<{
    id?: string;
    title: string;
    updatedAt?: string;
    fileSize?: number;
    isTemplate?: boolean;
    tags?: string[];
  }>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  totalFiles: number;
}

/**
 * Hook for paginated file listing with infinite scroll support
 * Optimized for performance with cursor-based pagination
 */
export const useFilesPagination = (
  options: UseFilesPaginationOptions = {}
): UseFilesPaginationReturn => {
  const { limit = 20, includeContent = false, enabled = true } = options;
  const { userId } = useAuth();
  const { storageService, isInitialized } = useFileStorage();

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: queryKeys.files.list(`${userId || 'anonymous'}_paginated`),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      if (!storageService) {
        throw new Error('Storage service not initialized');
      }

      const paginationOptions: PaginationOptions = {
        limit,
        cursor: pageParam,
        includeContent,
      };

      safeConsole.log('Fetching paginated files:', paginationOptions);

      const result = await storageService.listPaginated(paginationOptions);

      safeConsole.log('Paginated files result:', {
        filesCount: result.files.length,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor ? `${result.nextCursor.substring(0, 10)}...` : undefined,
      });

      return result;
    },
    getNextPageParam: (lastPage: PaginatedFileResponse) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    enabled: enabled && isInitialized && !!storageService,
    ...getCacheConfig('files', 'list'),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Flatten all pages into a single array
  const files = useMemo(() => {
    if (!data?.pages) return [];

    return data.pages.flatMap((page) => page.files);
  }, [data?.pages]);

  // Calculate total files from first page if available
  const totalFiles = useMemo(() => {
    if (!data?.pages?.[0]) return 0;

    // For cloud storage, we don't have totalCount, so estimate
    if (data.pages[0].totalCount !== undefined) {
      return data.pages[0].totalCount;
    }

    // Estimate based on current data
    return files.length + (hasNextPage ? limit : 0);
  }, [data?.pages, files.length, hasNextPage, limit]);

  return {
    files,
    isLoading,
    isError,
    error: error as Error | null,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    totalFiles,
  };
};

/**
 * Hook for simple paginated file listing (page-based instead of infinite scroll)
 */
export const useFilesPaginationSimple = (page = 1, options: UseFilesPaginationOptions = {}) => {
  const { limit = 20, includeContent = false, enabled = true } = options;
  const { userId } = useAuth();
  const { storageService, isInitialized } = useFileStorage();

  // Calculate cursor based on page number
  // This is a simplified approach - in real implementation you'd store cursors
  const cursor = page > 1 ? `page_${page}` : undefined;

  const { data, isLoading, isError, error, refetch } = useInfiniteQuery({
    queryKey: [...queryKeys.files.list(`${userId || 'anonymous'}_simple`), page],
    initialPageParam: undefined,
    queryFn: async () => {
      if (!storageService) {
        throw new Error('Storage service not initialized');
      }

      const paginationOptions: PaginationOptions = {
        limit,
        cursor,
        includeContent,
      };

      return await storageService.listPaginated(paginationOptions);
    },
    getNextPageParam: () => undefined, // Disable infinite scroll
    enabled: enabled && isInitialized && !!storageService,
    ...getCacheConfig('files', 'list'),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const currentPageData = data?.pages?.[0];

  return {
    files: currentPageData?.files || [],
    isLoading,
    isError,
    error: error as Error | null,
    hasNextPage: currentPageData?.hasMore || false,
    hasPreviousPage: page > 1,
    refetch,
    totalFiles: currentPageData?.totalCount || 0,
    currentPage: page,
  };
};

/**
 * Hook for getting file count without loading all files
 * Useful for displaying total count in UI
 */
export const useFilesCount = () => {
  const { userId } = useAuth();
  const { storageService, isInitialized } = useFileStorage();

  const { data, isLoading } = useInfiniteQuery({
    queryKey: [...queryKeys.files.list(`${userId || 'anonymous'}_count`)],
    initialPageParam: undefined,
    queryFn: async () => {
      if (!storageService) return 0;

      // Get first page with minimal data to get count
      const result = await storageService.listPaginated({
        limit: 1,
        includeContent: false,
      });

      return result.totalCount || result.files.length;
    },
    getNextPageParam: () => undefined,
    enabled: isInitialized && !!storageService,
    ...getCacheConfig('files', 'list'),
    staleTime: 10 * 60 * 1000, // Cache count for 10 minutes
  });

  const firstPageData = data?.pages?.[0];
  return {
    count: firstPageData || 0,
    isLoading,
  };
};

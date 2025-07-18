/**
 * @fileoverview Global QueryClient configuration for optimal performance
 * @author Axel Modra
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Enhanced QueryClient with senior developer optimizations
 * - Optimized cache times for different data types
 * - Smart retry strategies
 * - Background refetching configuration
 * - Memory management
 */
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Enhanced cache optimization for better performance
        staleTime: 10 * 60 * 1000, // 10 minutes - increased from 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes - increased from 10 minutes for better memory management

        // Network optimization - more conservative approach
        refetchOnWindowFocus: false, // Prevent unnecessary refetches
        refetchOnReconnect: 'always', // Always refetch on reconnect
        refetchOnMount: false, // Changed: Only refetch if data is stale
        refetchInterval: false, // Disable automatic polling

        // Enhanced retry strategy with better error handling
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) return false;
          }

          // More conservative retry - only 2 attempts instead of 3
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1500 * 2 ** attemptIndex, 45000), // Slightly longer delays

        // Performance optimization - reduce unnecessary re-renders
        notifyOnChangeProps: ['data', 'error', 'isLoading'], // Only notify on specific prop changes

        // Enhanced deduplication
        structuralSharing: true, // Enable structural sharing for better performance
      },
      mutations: {
        // Mutation retry strategy
        retry: (failureCount, error) => {
          // Don't retry mutations on client errors
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) return false;
          }

          // Only retry once for mutations
          return failureCount < 1;
        },

        // Mutation timeout
        networkMode: 'online', // Only run mutations when online
      },
    },
  });
};

/**
 * Global QueryClient instance - Singleton pattern
 */
export const queryClient = createOptimizedQueryClient();

/**
 * Query key factories for consistent key management
 */
export const queryKeys = {
  // Files queries
  files: {
    all: ['files'] as const,
    lists: () => [...queryKeys.files.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.files.lists(), userId] as const,
    details: () => [...queryKeys.files.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.files.details(), id] as const,
  },

  // Storage queries
  storage: {
    all: ['storage'] as const,
    info: (userId: string) => [...queryKeys.storage.all, 'info', userId] as const,
    usage: (userId: string) => [...queryKeys.storage.all, 'usage', userId] as const,
  },

  // Templates queries
  templates: {
    all: ['templates'] as const,
    lists: () => [...queryKeys.templates.all, 'list'] as const,
    list: (category?: string) => [...queryKeys.templates.lists(), category] as const,
  },

  // User queries
  user: {
    all: ['user'] as const,
    profile: (userId: string) => [...queryKeys.user.all, 'profile', userId] as const,
    settings: (userId: string) => [...queryKeys.user.all, 'settings', userId] as const,
  },
} as const;

/**
 * Query invalidation helpers
 */
export const invalidateQueries = {
  files: {
    all: () => queryClient.invalidateQueries({ queryKey: queryKeys.files.all }),
    list: (userId: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.files.list(userId),
        exact: true, // Only invalidate exact match for better performance
      }),
    detail: (id: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.files.detail(id),
        exact: true,
      }),
  },

  storage: {
    all: () => queryClient.invalidateQueries({ queryKey: queryKeys.storage.all }),
    info: (userId: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.storage.info(userId),
        exact: true,
      }),
  },

  templates: {
    all: () => queryClient.invalidateQueries({ queryKey: queryKeys.templates.all }),
    list: (category?: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.templates.list(category),
        exact: true,
      }),
  },
} as const;

/**
 * Batch invalidation helpers for multiple operations
 */
export const batchInvalidateQueries = {
  fileOperations: (userId: string) => {
    // Batch invalidate related queries in one operation
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.files.list(userId),
        exact: true,
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.storage.info(userId),
        exact: true,
      }),
    ]);
  },

  userDataRefresh: (userId: string) => {
    // Comprehensive refresh for user data
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.files.list(userId),
        exact: true,
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.storage.info(userId),
        exact: true,
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all }),
    ]);
  },
} as const;

/**
 * Prefetch helpers for performance optimization
 */
export const prefetchQueries = {
  files: {
    list: async (userId: string) => {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.files.list(userId),
        staleTime: 10 * 60 * 1000, // 10 minutes for prefetched data
      });
    },
  },

  storage: {
    info: async (userId: string) => {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.storage.info(userId),
        staleTime: 5 * 60 * 1000, // 5 minutes for storage info
      });
    },
  },
} as const;

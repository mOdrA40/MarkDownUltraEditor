/**
 * @fileoverview Global QueryClient configuration for optimal performance
 * @author Axel Modra
 */

import { QueryClient } from '@tanstack/react-query';

export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes - optimized for faster data freshness
        gcTime: 15 * 60 * 1000, // 15 minutes - balanced memory management

        refetchOnWindowFocus: false, // Prevent unnecessary refetches
        refetchOnReconnect: 'always', // Always refetch on reconnect
        refetchOnMount: 'always', // Always refetch on mount for fresh data
        refetchInterval: false, // Disable automatic polling

        // Enhanced retry strategy with better error handling
        retry: (failureCount, error) => {
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
 * Optimized cache configurations for different data types
 * Reduces unnecessary requests and improves performance
 */
export const optimizedCacheConfig = {
  // File operations - cache longer karena jarang berubah
  files: {
    list: {
      staleTime: 10 * 60 * 1000, // 10 minutes - file list jarang berubah
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
    },
    detail: {
      staleTime: 15 * 60 * 1000, // 15 minutes - individual files
      gcTime: 60 * 60 * 1000, // 1 hour - cache file content longer
    },
  },

  // Storage info - update lebih sering karena berubah saat save
  storage: {
    info: {
      staleTime: 5 * 60 * 1000, // 5 minutes - storage usage changes
      gcTime: 15 * 60 * 1000, // 15 minutes
    },
  },

  // User preferences - cache lama karena jarang berubah
  preferences: {
    user: {
      staleTime: 30 * 60 * 1000, // 30 minutes - preferences rarely change
      gcTime: 2 * 60 * 60 * 1000, // 2 hours - keep preferences in memory
    },
  },

  // Templates - cache sangat lama karena static content
  templates: {
    list: {
      staleTime: 60 * 60 * 1000, // 1 hour - templates are static
      gcTime: 4 * 60 * 60 * 1000, // 4 hours - keep templates cached long
    },
  },

  // System data - cache very long karena rarely changes
  system: {
    timezones: {
      staleTime: 24 * 60 * 60 * 1000, // 24 hours - timezone data static
      gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days - keep in memory very long
    },
  },
} as const;

/**
 * Helper function untuk menggunakan optimized cache configuration
 * Automatically applies the right cache settings based on data type
 */
export const getCacheConfig = (type: keyof typeof optimizedCacheConfig, subType: string) => {
  const config =
    optimizedCacheConfig[type]?.[subType as keyof (typeof optimizedCacheConfig)[typeof type]];

  if (!config) {
    // Fallback to default if config not found
    return {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
    };
  }

  return config;
};

/**
 * Enhanced query deduplication helper with performance monitoring
 * Prevents duplicate requests for the same data
 */
export const createDedupedQuery = <T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  options: {
    dedupWindow?: number; // milliseconds
    cacheType?: keyof typeof optimizedCacheConfig;
    cacheSubType?: string;
    trackPerformance?: boolean;
  } = {}
) => {
  const { dedupWindow = 30 * 1000, cacheType, cacheSubType, trackPerformance = true } = options;

  // Get optimized cache config if provided
  const cacheConfig =
    cacheType && cacheSubType
      ? getCacheConfig(cacheType, cacheSubType)
      : { staleTime: dedupWindow };

  const queryKeyString = JSON.stringify(queryKey);

  // Enhanced deduplication with performance tracking
  const wrappedQueryFn = async () => {
    if (trackPerformance) {
      const { performanceMonitor } = await import('@/services/performanceMonitor');
      return performanceMonitor.trackQuery(`deduped_${queryKeyString.substring(0, 50)}`, queryFn, {
        cacheHit: false,
      });
    }
    return queryFn();
  };

  return queryClient.fetchQuery({
    queryKey,
    queryFn: wrappedQueryFn,
    ...cacheConfig,
  });
};

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

  // System queries
  system: {
    all: ['system'] as const,
    timezones: () => [...queryKeys.system.all, 'timezones'] as const,
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

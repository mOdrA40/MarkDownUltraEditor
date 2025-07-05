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
        // Cache optimization
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
        gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time
        
        // Network optimization
        refetchOnWindowFocus: false, // Prevent unnecessary refetches
        refetchOnReconnect: 'always', // Always refetch on reconnect
        refetchOnMount: true, // Refetch on component mount
        
        // Retry strategy - exponential backoff
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) return false;
          }
          
          // Retry up to 3 times with exponential backoff
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Performance optimization
        notifyOnChangeProps: ['data', 'error', 'isLoading'], // Only notify on specific prop changes
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
    list: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.files.list(userId) }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.files.detail(id) }),
  },
  
  storage: {
    all: () => queryClient.invalidateQueries({ queryKey: queryKeys.storage.all }),
    info: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.storage.info(userId) }),
  },
  
  templates: {
    all: () => queryClient.invalidateQueries({ queryKey: queryKeys.templates.all }),
    list: (category?: string) => queryClient.invalidateQueries({ queryKey: queryKeys.templates.list(category) }),
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

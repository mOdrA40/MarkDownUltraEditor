/**
 * @fileoverview Secure React hook for user file statistics
 * @author Augment Agent
 */

import { useAuth } from '@clerk/react-router';
import { useQuery } from '@tanstack/react-query';
import { getCacheConfig, queryKeys } from '@/lib/queryClient';
import { createUserStatsService, type UserFileStats } from '@/services/userStatsService';
import { safeConsole } from '@/utils/console';

interface UseUserStatsOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseUserStatsReturn {
  stats: UserFileStats | null;
  formattedSize: string;
  usagePercentage: number;
  isApproachingLimit: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  refreshStats: () => Promise<void>;
}

/**
 * Secure hook for user file statistics
 * Uses protected database function instead of direct materialized view access
 */
export const useUserStats = (options: UseUserStatsOptions = {}): UseUserStatsReturn => {
  const { enabled = true, refetchInterval } = options;
  const { getToken, userId } = useAuth();

  const {
    data: statsData = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.files.list(`${userId || 'anonymous'}_stats`)],
    queryFn: async () => {
      if (!getToken) {
        throw new Error('Authentication not available');
      }

      safeConsole.log('📊 Fetching user statistics via secure function');

      const statsService = createUserStatsService(getToken);
      const summary = await statsService.getStatsSummary();

      safeConsole.log('✅ User statistics loaded:', {
        total_files: summary.stats?.total_files || 0,
        formatted_size: summary.formattedSize,
        usage_percentage: `${summary.usagePercentage.toFixed(1)}%`,
      });

      return summary;
    },
    enabled: enabled && !!getToken && !!userId,
    ...getCacheConfig('files', 'list'),
    refetchInterval,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Function to refresh materialized view
  const refreshStats = async () => {
    if (!getToken) {
      throw new Error('Authentication not available');
    }

    try {
      safeConsole.log('🔄 Refreshing user statistics materialized view');

      const statsService = createUserStatsService(getToken);
      await statsService.refreshStats();

      // Refetch the data after refresh
      await refetch();

      safeConsole.log('✅ User statistics refreshed and refetched');
    } catch (error) {
      safeConsole.error('❌ Error refreshing user statistics:', error);
      throw error;
    }
  };

  return {
    stats: statsData?.stats || null,
    formattedSize: statsData?.formattedSize || '0 Bytes',
    usagePercentage: statsData?.usagePercentage || 0,
    isApproachingLimit: statsData?.isApproachingLimit || false,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    refreshStats,
  };
};

/**
 * Hook for monitoring storage usage with alerts
 */
export const useStorageMonitoring = () => {
  const { stats, usagePercentage, isApproachingLimit, formattedSize } = useUserStats({
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });

  const getStorageStatus = () => {
    if (usagePercentage < 50) return 'safe';
    if (usagePercentage < 80) return 'warning';
    return 'critical';
  };

  const getStorageMessage = () => {
    const status = getStorageStatus();

    switch (status) {
      case 'safe':
        return `Storage usage: ${formattedSize} (${usagePercentage.toFixed(1)}%)`;
      case 'warning':
        return `Storage usage getting high: ${formattedSize} (${usagePercentage.toFixed(1)}%)`;
      case 'critical':
        return `Storage almost full: ${formattedSize} (${usagePercentage.toFixed(1)}%)`;
      default:
        return `Storage usage: ${formattedSize}`;
    }
  };

  return {
    stats,
    usagePercentage,
    isApproachingLimit,
    formattedSize,
    storageStatus: getStorageStatus(),
    storageMessage: getStorageMessage(),
    shouldShowAlert: isApproachingLimit,
  };
};

/**
 * Hook for dashboard statistics with security
 */
export const useDashboardStats = () => {
  const { stats, isLoading, isError, refreshStats } = useUserStats();

  const dashboardData = {
    totalFiles: stats?.total_files || 0,
    totalSize: stats?.total_size || 0,
    templateCount: stats?.template_count || 0,
    markdownCount: stats?.markdown_count || 0,
    lastUpdated: stats?.last_updated ? new Date(stats.last_updated) : null,
  };

  const getFileTypeBreakdown = () => {
    if (!stats) return [];

    const total = stats.total_files;
    if (total === 0) return [];

    return [
      {
        type: 'Markdown',
        count: stats.markdown_count,
        percentage: (stats.markdown_count / total) * 100,
      },
      {
        type: 'Templates',
        count: stats.template_count,
        percentage: (stats.template_count / total) * 100,
      },
      {
        type: 'Other',
        count: total - stats.markdown_count - stats.template_count,
        percentage: ((total - stats.markdown_count - stats.template_count) / total) * 100,
      },
    ].filter((item) => item.count > 0);
  };

  return {
    ...dashboardData,
    fileTypeBreakdown: getFileTypeBreakdown(),
    isLoading,
    isError,
    refreshStats,
    hasData: !!stats,
  };
};

/**
 * Security-focused hook for admin statistics
 * Only accessible by authenticated users for their own data
 */
export const useSecureUserStats = (targetUserId?: string) => {
  const { userId: currentUserId } = useAuth();

  // Security check: prevent accessing other users' stats
  const isAuthorized = !targetUserId || targetUserId === currentUserId;

  const statsResult = useUserStats({
    enabled: isAuthorized,
  });

  if (!isAuthorized) {
    return {
      ...statsResult,
      stats: null,
      isError: true,
      error: new Error('Unauthorized: Cannot access other users statistics'),
    };
  }

  return statsResult;
};

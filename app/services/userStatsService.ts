/**
 * @fileoverview Secure user statistics service using protected database function
 * @author Augment Agent
 */

import { createClerkSupabaseClient } from '@/lib/supabase';
import { safeConsole } from '@/utils/console';

export interface UserFileStats {
  user_id: string;
  total_files: number;
  total_size: number;
  last_updated: string;
  template_count: number;
  markdown_count: number;
}

// Type for the database function response
interface DatabaseStatsResponse {
  user_id: string;
  total_files: string | number;
  total_size: string | number;
  last_updated: string;
  template_count: string | number;
  markdown_count: string | number;
}

/**
 * Secure service for accessing user file statistics
 * Uses protected database function instead of direct materialized view access
 */
export class UserStatsService {
  private supabaseClient: ReturnType<typeof createClerkSupabaseClient> | null = null;

  constructor(getToken: () => Promise<string | null>) {
    this.supabaseClient = createClerkSupabaseClient(getToken);
  }

  /**
   * Get user file statistics securely
   * Uses the protected get_user_file_statistics() database function
   */
  async getUserStats(userId?: string): Promise<UserFileStats | null> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      safeConsole.log('📊 Fetching user statistics securely');

      // Call the secure database function
      // biome-ignore lint/suspicious/noExplicitAny: Required for custom database function
      const { data, error } = await (this.supabaseClient as any)
        .rpc('get_user_file_statistics', {
          target_user_id: userId || null, // null means current user
        })
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No statistics found for user
          safeConsole.log('📊 No statistics found for user');
          return null;
        }
        throw error;
      }

      const dbResponse = data as DatabaseStatsResponse;
      const stats: UserFileStats = {
        user_id: dbResponse.user_id,
        total_files: Number(dbResponse.total_files),
        total_size: Number(dbResponse.total_size),
        last_updated: dbResponse.last_updated,
        template_count: Number(dbResponse.template_count),
        markdown_count: Number(dbResponse.markdown_count),
      };

      safeConsole.log('✅ User statistics loaded securely:', {
        total_files: stats.total_files,
        total_size: stats.total_size,
        template_count: stats.template_count,
      });

      return stats;
    } catch (error) {
      safeConsole.error('❌ Error fetching user statistics:', error);
      throw error;
    }
  }

  /**
   * Refresh the materialized view (admin operation)
   * This should be called periodically to update statistics
   */
  async refreshStats(): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      safeConsole.log('🔄 Refreshing user statistics materialized view');

      // biome-ignore lint/suspicious/noExplicitAny: Required for custom database function
      const { error } = await (this.supabaseClient as any).rpc('refresh_user_file_stats');

      if (error) {
        throw error;
      }

      safeConsole.log('✅ User statistics refreshed successfully');
    } catch (error) {
      safeConsole.error('❌ Error refreshing user statistics:', error);
      throw error;
    }
  }

  /**
   * Get formatted file size string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Get storage usage percentage (assuming 500MB limit for free plan)
   */
  getStorageUsagePercentage(totalSize: number, limit: number = 500 * 1024 * 1024): number {
    return Math.min((totalSize / limit) * 100, 100);
  }

  /**
   * Check if user is approaching storage limit
   */
  isApproachingStorageLimit(totalSize: number, limit: number = 500 * 1024 * 1024): boolean {
    return this.getStorageUsagePercentage(totalSize, limit) > 80;
  }

  /**
   * Get user statistics summary for dashboard
   */
  async getStatsSummary(userId?: string): Promise<{
    stats: UserFileStats | null;
    formattedSize: string;
    usagePercentage: number;
    isApproachingLimit: boolean;
  }> {
    const stats = await this.getUserStats(userId);

    if (!stats) {
      return {
        stats: null,
        formattedSize: '0 Bytes',
        usagePercentage: 0,
        isApproachingLimit: false,
      };
    }

    return {
      stats,
      formattedSize: this.formatFileSize(stats.total_size),
      usagePercentage: this.getStorageUsagePercentage(stats.total_size),
      isApproachingLimit: this.isApproachingStorageLimit(stats.total_size),
    };
  }
}

/**
 * Create user stats service instance
 */
export const createUserStatsService = (getToken: () => Promise<string | null>) => {
  return new UserStatsService(getToken);
};

/**
 * Hook for user statistics with security
 */
export const useUserStats = () => {
  return {
    createUserStatsService,
    UserStatsService,
  };
};

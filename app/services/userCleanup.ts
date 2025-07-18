/**
 * @fileoverview User cleanup service for handling account deletion
 * @author Axel Modra
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { safeConsole } from '@/utils/console';

export interface UserCleanupResult {
  success: boolean;
  deletedFiles: number;
  deletedSessions: number;
  deletedStats: number;
  errors: string[];
}

/**
 * Service for cleaning up user data when account is deleted
 */
export class UserCleanupService {
  constructor(private supabaseClient: SupabaseClient<Database>) {}

  /**
   * Clean up all user data from Supabase
   */
  async cleanupUserData(userId: string): Promise<UserCleanupResult> {
    const result: UserCleanupResult = {
      success: false,
      deletedFiles: 0,
      deletedSessions: 0,
      deletedStats: 0,
      errors: [],
    };

    try {
      safeConsole.log('Starting user data cleanup for user:', userId);

      // 1. Delete user files
      const filesResult = await this.deleteUserFiles(userId);
      result.deletedFiles = filesResult.count;
      if (filesResult.error) {
        result.errors.push(`Files cleanup error: ${filesResult.error}`);
      }

      // 2. Delete user sessions
      const sessionsResult = await this.deleteUserSessions(userId);
      result.deletedSessions = sessionsResult.count;
      if (sessionsResult.error) {
        result.errors.push(`Sessions cleanup error: ${sessionsResult.error}`);
      }

      // 3. Delete user stats and analytics data
      const statsResult = await this.deleteUserStats(userId);
      result.deletedStats = statsResult.count;
      if (statsResult.error) {
        result.errors.push(`Stats cleanup error: ${statsResult.error}`);
      }

      // 4. Delete file versions
      const versionsResult = await this.deleteFileVersions(userId);
      if (versionsResult.error) {
        result.errors.push(`File versions cleanup error: ${versionsResult.error}`);
      }

      result.success = result.errors.length === 0;

      safeConsole.log('User data cleanup completed:', result);
      return result;
    } catch (error) {
      safeConsole.error('User cleanup service error:', error);
      result.errors.push(`General cleanup error: ${error}`);
      return result;
    }
  }

  /**
   * Delete all user files
   */
  private async deleteUserFiles(userId: string): Promise<{ count: number; error?: string }> {
    try {
      const { data, error } = await this.supabaseClient
        .from('user_files')
        .delete()
        .eq('user_id', userId)
        .select('id');

      if (error) {
        return { count: 0, error: error.message };
      }

      return { count: data?.length || 0 };
    } catch (error) {
      return { count: 0, error: String(error) };
    }
  }

  /**
   * Delete all user sessions
   */
  private async deleteUserSessions(userId: string): Promise<{ count: number; error?: string }> {
    try {
      const { data, error } = await this.supabaseClient
        .from('user_sessions')
        .delete()
        .eq('user_id', userId)
        .select('id');

      if (error) {
        return { count: 0, error: error.message };
      }

      return { count: data?.length || 0 };
    } catch (error) {
      return { count: 0, error: String(error) };
    }
  }

  /**
   * Delete user statistics and analytics data
   */
  private async deleteUserStats(userId: string): Promise<{ count: number; error?: string }> {
    try {
      let totalDeleted = 0;

      // Delete from user_file_stats if exists
      try {
        const { data: statsData, error: statsError } = await this.supabaseClient
          .from('user_file_stats')
          .delete()
          .eq('user_id', userId)
          .select('id');

        if (!statsError && statsData) {
          totalDeleted += statsData.length;
        }
      } catch (_e) {
        // Table might not exist, continue
      }

      // Delete from security_audit_log if exists
      try {
        const { data: auditData, error: auditError } = await this.supabaseClient
          .from('security_audit_log')
          .delete()
          .eq('user_id', userId)
          .select('id');

        if (!auditError && auditData) {
          totalDeleted += auditData.length;
        }
      } catch (_e) {
        // Table might not exist, continue
      }

      return { count: totalDeleted };
    } catch (error) {
      return { count: 0, error: String(error) };
    }
  }

  /**
   * Delete file versions for user files
   */
  private async deleteFileVersions(userId: string): Promise<{ count: number; error?: string }> {
    try {
      // First get all file IDs for the user
      const { data: userFiles, error: filesError } = await this.supabaseClient
        .from('user_files')
        .select('id')
        .eq('user_id', userId);

      if (filesError) {
        return { count: 0, error: filesError.message };
      }

      if (!userFiles || userFiles.length === 0) {
        return { count: 0 };
      }

      const fileIds = userFiles.map((file) => file.id);

      // Delete file versions for these files
      const { data, error } = await this.supabaseClient
        .from('file_versions')
        .delete()
        .in('file_id', fileIds)
        .select('id');

      if (error) {
        return { count: 0, error: error.message };
      }

      return { count: data?.length || 0 };
    } catch (error) {
      return { count: 0, error: String(error) };
    }
  }
}

/**
 * Create user cleanup service instance
 */
export const createUserCleanupService = (supabaseClient: SupabaseClient<Database>) => {
  return new UserCleanupService(supabaseClient);
};

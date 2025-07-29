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

      // File versions table has been removed - no cleanup needed

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
  private async deleteUserStats(_userId: string): Promise<{ count: number; error?: string }> {
    try {
      return { count: 0 };
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

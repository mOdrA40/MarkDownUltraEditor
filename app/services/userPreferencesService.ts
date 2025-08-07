/**
 * @fileoverview Service for managing user preferences in Supabase
 * @author MarkDownUltraRemix Team
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { safeConsole } from '@/utils/console';
import type { UserPreferences } from '@/utils/editorPreferences';

export class UserPreferencesService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get user preferences from Supabase
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, return null
          return null;
        }
        throw error;
      }

      return data as UserPreferences;
    } catch (error) {
      safeConsole.error('Error getting user preferences:', error);
      return null;
    }
  }

  /**
   * Create or update user preferences
   */
  async upsertUserPreferences(
    userId: string,
    preferences: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<UserPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: userId,
            ...preferences,
            last_activity_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;

      return data as UserPreferences;
    } catch (error) {
      safeConsole.error('Error upserting user preferences:', error);
      return null;
    }
  }
}

/**
 * Factory function to create UserPreferencesService instance
 */
export const createUserPreferencesService = (
  supabase: SupabaseClient<Database>
): UserPreferencesService => {
  return new UserPreferencesService(supabase);
};

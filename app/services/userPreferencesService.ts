/**
 * @fileoverview Service for managing user preferences in Supabase
 * @author MarkDownUltraRemix Team
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { safeConsole } from '@/utils/console';
import type { DeviceSession, UserPreferences } from '@/utils/editorPreferences';
import { getDeviceFingerprint, getDeviceInfo, getDeviceName } from '@/utils/editorPreferences';

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

  /**
   * Update last opened file for user
   */
  async updateLastOpenedFile(userId: string, fileId: string): Promise<boolean> {
    try {
      const result = await this.upsertUserPreferences(userId, {
        last_opened_file_id: fileId,
      });

      return result !== null;
    } catch (error) {
      safeConsole.error('Error updating last opened file:', error);
      return false;
    }
  }

  /**
   * Get or create device session
   */
  async getOrCreateDeviceSession(userId: string): Promise<DeviceSession | null> {
    try {
      const deviceFingerprint = getDeviceFingerprint();
      const deviceInfo = getDeviceInfo();
      const deviceName = getDeviceName();

      // Try to get existing session
      const { data: existingSession, error: getError } = await this.supabase
        .from('user_device_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceFingerprint)
        .single();

      if (getError && getError.code !== 'PGRST116') {
        throw getError;
      }

      if (existingSession) {
        // Update existing session
        const { data: updatedSession, error: updateError } = await this.supabase
          .from('user_device_sessions')
          .update({
            last_activity_at: new Date().toISOString(),
            is_active: true,
            browser_info: deviceInfo,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSession.id)
          .select()
          .single();

        if (updateError) throw updateError;

        return updatedSession as DeviceSession;
      }

      // Create new session
      const { data: newSession, error: createError } = await this.supabase
        .from('user_device_sessions')
        .insert({
          user_id: userId,
          device_fingerprint: deviceFingerprint,
          device_name: deviceName,
          browser_info: deviceInfo,
          is_active: true,
          last_activity_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      return newSession as DeviceSession;
    } catch (error) {
      safeConsole.error('Error managing device session:', error);
      return null;
    }
  }

  /**
   * Update device session with last opened file
   */
  async updateDeviceSessionFile(userId: string, fileId: string): Promise<boolean> {
    try {
      const deviceFingerprint = getDeviceFingerprint();

      const { error } = await this.supabase
        .from('user_device_sessions')
        .update({
          last_opened_file_id: fileId,
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceFingerprint);

      if (error) throw error;

      return true;
    } catch (error) {
      safeConsole.error('Error updating device session file:', error);
      return false;
    }
  }

  /**
   * Get the most recent file across all devices for conflict resolution
   */
  async getMostRecentFileAcrossDevices(userId: string): Promise<{
    fileId: string;
    deviceName: string;
    lastActivity: string;
  } | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_device_sessions')
        .select('last_opened_file_id, device_name, last_activity_at')
        .eq('user_id', userId)
        .not('last_opened_file_id', 'is', null)
        .order('last_activity_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return {
        fileId: data.last_opened_file_id || '',
        deviceName: data.device_name || 'Unknown Device',
        lastActivity: data.last_activity_at,
      };
    } catch (error) {
      safeConsole.error('Error getting most recent file across devices:', error);
      return null;
    }
  }

  /**
   * Get active device sessions for conflict detection
   */
  async getActiveDeviceSessions(userId: string): Promise<DeviceSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_device_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity_at', { ascending: false });

      if (error) throw error;

      return (data as DeviceSession[]) || [];
    } catch (error) {
      safeConsole.error('Error getting active device sessions:', error);
      return [];
    }
  }

  /**
   * Deactivate old device sessions (cleanup)
   */
  async deactivateOldSessions(userId: string, maxAgeHours = 24): Promise<void> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - maxAgeHours);

      const { error } = await this.supabase
        .from('user_device_sessions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .lt('last_activity_at', cutoffTime.toISOString());

      if (error) throw error;
    } catch (error) {
      safeConsole.error('Error deactivating old sessions:', error);
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

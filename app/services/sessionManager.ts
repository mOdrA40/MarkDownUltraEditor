/**
 * @fileoverview Session Management Service with IP Detection
 * @author Security Team
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getDeviceInfo } from '@/utils/browserFingerprint';
import { safeConsole } from '@/utils/console';
import { getSecurityIPInfo } from '@/utils/ipDetection';

export interface SessionData {
  id?: string;
  user_id: string;
  session_id: string;
  session_token?: string;
  ip_address?: string;
  user_agent?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };
  device_info?: {
    browser?: string;
    os?: string;
    device?: string;
  };
  is_active?: boolean;
  last_activity?: string;
  created_at?: string;
  expires_at?: string;
  security_flags?: Record<string, unknown>;
}

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  uniqueIPs: number;
  recentActivity: SessionData[];
  suspiciousActivity: SessionData[];
}

export class SessionManager {
  private supabaseClient: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  /**
   * Create or update session
   */
  async createSession(userId: string, sessionId: string): Promise<SessionData | null> {
    try {
      if (process.env.NODE_ENV === 'development') {
        safeConsole.dev('🔄 SessionManager: Creating session');
      }

      // Clean up old sessions for this user first (keep only last 5 active sessions)
      await this.cleanupOldSessions(userId);

      // Get IP and device info
      const ipInfo = await getSecurityIPInfo();
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

      // Parse device info using improved detection
      const deviceInfo = getDeviceInfo();

      // Generate unique session_token (different from session_id to avoid constraint conflict)
      const sessionToken = `token_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const sessionData = {
        // user_id will be auto-filled from auth.jwt() ->> 'sub' (Clerk token)
        session_id: sessionId,
        session_token: sessionToken, // Use unique token to avoid constraint conflict
        ip_address: ipInfo.ip,
        user_agent: userAgent,
        location: {
          country: ipInfo.country,
          region: ipInfo.region,
          city: ipInfo.city,
          timezone: ipInfo.timezone,
        },
        device_info: deviceInfo,
        is_active: true,
        last_activity: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        security_flags: {
          suspicious: false,
          new_location: await this.isNewLocation(userId, ipInfo.ip),
          new_device: await this.isNewDevice(userId, deviceInfo),
        },
      };

      if (process.env.NODE_ENV === 'development') {
        safeConsole.dev('📝 SessionManager: Session data prepared');
      }

      const { data, error } = await this.supabaseClient
        .from('user_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          safeConsole.error('❌ SessionManager: Failed to create session:', error.message);
        } else {
          safeConsole.error('Failed to create session');
        }
        return null;
      }

      if (process.env.NODE_ENV === 'development') {
        safeConsole.dev('✅ SessionManager: Session created successfully');
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        safeConsole.error('❌ SessionManager: Session creation error:', error);
      } else {
        safeConsole.error('Session creation failed');
      }
      return null;
    }
  }

  /**
   * Update session activity
   */
  async updateActivity(sessionId: string): Promise<void> {
    try {
      await this.supabaseClient
        .from('user_sessions')
        .update({
          last_activity: new Date().toISOString(),
        })
        .eq('session_id', sessionId);
    } catch (error) {
      safeConsole.error('Failed to update session activity:', error);
    }
  }

  /**
   * Get user sessions with optimized query
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      if (process.env.NODE_ENV === 'development') {
        safeConsole.dev('🔍 SessionManager: Getting sessions');
      }

      // Optimized query - only select needed columns and limit results
      const { data, error } = await this.supabaseClient
        .from('user_sessions')
        .select(
          'id, user_id, session_id, session_token, ip_address, user_agent, location, device_info, security_flags, is_active, last_activity, created_at, expires_at'
        )
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: false })
        .limit(50); // Limit to prevent large data transfers

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          safeConsole.error('❌ SessionManager: Failed to get user sessions:', error.message);
        } else {
          safeConsole.error('Failed to get user sessions');
        }
        return [];
      }

      if (process.env.NODE_ENV === 'development') {
        safeConsole.dev('📊 SessionManager: Retrieved sessions:', data?.length || 0);
      }

      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        safeConsole.error('❌ SessionManager: Get sessions error:', error);
      } else {
        safeConsole.error('Get sessions failed');
      }
      return [];
    }
  }

  /**
   * Get session statistics with optimized single query
   */
  async getSessionStats(userId: string): Promise<SessionStats> {
    try {
      // Single optimized query instead of calling getUserSessions
      const { data: sessions, error } = await this.supabaseClient
        .from('user_sessions')
        .select(
          'id, user_id, session_id, ip_address, security_flags, is_active, last_activity, created_at'
        )
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: false })
        .limit(100); // Reasonable limit for stats calculation

      if (error) {
        safeConsole.error('Failed to get session stats:', error);
        return {
          totalSessions: 0,
          activeSessions: 0,
          uniqueIPs: 0,
          recentActivity: [],
          suspiciousActivity: [],
        };
      }

      const sessionData = sessions || [];
      const activeSessions = sessionData.filter((s) => s.is_active);
      const uniqueIPs = new Set(sessionData.map((s) => s.ip_address)).size;
      const recentActivity = sessionData.slice(0, 5);
      const suspiciousActivity = sessionData.filter(
        (s) =>
          s.security_flags?.suspicious ||
          s.security_flags?.new_location ||
          s.security_flags?.new_device
      );

      return {
        totalSessions: sessionData.length,
        activeSessions: activeSessions.length,
        uniqueIPs,
        recentActivity,
        suspiciousActivity,
      };
    } catch (error) {
      safeConsole.error('Failed to get session stats:', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        uniqueIPs: 0,
        recentActivity: [],
        suspiciousActivity: [],
      };
    }
  }

  /**
   * Terminate session
   */
  async terminateSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from('user_sessions')
        .update({ is_active: false })
        .eq('session_id', sessionId);

      return !error;
    } catch (error) {
      safeConsole.error('Failed to terminate session:', error);
      return false;
    }
  }

  /**
   * Terminate all sessions except current
   */
  async terminateAllOtherSessions(userId: string, currentSessionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .neq('session_id', currentSessionId);

      return !error;
    } catch (error) {
      safeConsole.error('Failed to terminate other sessions:', error);
      return false;
    }
  }

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions(): Promise<void> {
    try {
      await this.supabaseClient
        .from('user_sessions')
        .update({ is_active: false })
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      safeConsole.error('Failed to clean expired sessions:', error);
    }
  }

  /**
   * Clean up old sessions for a user (keep only last 5 active sessions)
   */
  async cleanupOldSessions(userId: string): Promise<void> {
    try {
      // Get all active sessions for user, ordered by last activity
      const { data: sessions, error } = await this.supabaseClient
        .from('user_sessions')
        .select('id, session_id, last_activity')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error || !sessions) {
        safeConsole.error('Failed to get user sessions for cleanup:', error);
        return;
      }

      // If more than 5 active sessions, deactivate the oldest ones
      if (sessions.length > 5) {
        const sessionsToDeactivate = sessions.slice(5); // Keep first 5, deactivate rest
        const sessionIds = sessionsToDeactivate.map((s) => s.session_id);

        const { error: updateError } = await this.supabaseClient
          .from('user_sessions')
          .update({ is_active: false })
          .in('session_id', sessionIds);

        if (updateError) {
          safeConsole.error('Failed to cleanup old sessions:', updateError);
        } else {
          safeConsole.log(`Cleaned up ${sessionIds.length} old sessions for user ${userId}`);
        }
      }
    } catch (error) {
      safeConsole.error('Error in cleanupOldSessions:', error);
    }
  }

  /**
   * Check if location is new for user
   */
  private async isNewLocation(userId: string, ip: string): Promise<boolean> {
    try {
      const { data } = await this.supabaseClient
        .from('user_sessions')
        .select('ip_address')
        .eq('user_id', userId)
        .eq('ip_address', ip)
        .limit(1);

      return !data || data.length === 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if device is new for user
   */
  private async isNewDevice(
    userId: string,
    deviceInfo: { browser?: string; os?: string; device?: string }
  ): Promise<boolean> {
    try {
      const { data } = await this.supabaseClient
        .from('user_sessions')
        .select('device_info')
        .eq('user_id', userId)
        .limit(10);

      if (!data || data.length === 0) return true;

      const deviceSignature = `${deviceInfo.browser}-${deviceInfo.os}`;
      return !data.some((session) => {
        const existingSignature = `${session.device_info?.browser}-${session.device_info?.os}`;
        return existingSignature === deviceSignature;
      });
    } catch {
      return false;
    }
  }

  // Using improved device detection from browserFingerprint.ts
}

// Export factory function to create SessionManager with Clerk-integrated client
export const createSessionManager = (supabaseClient: SupabaseClient) => {
  return new SessionManager(supabaseClient);
};

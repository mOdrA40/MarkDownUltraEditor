/**
 * @fileoverview Session management types
 * @author Axel Modra
 */

/**
 * Session data interface
 */
export interface SessionData {
  id?: string;
  session_id: string;
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: {
    browser?: string;
    os?: string;
    device?: string;
  };
  location?: {
    city?: string;
    country?: string;
    region?: string;
    timezone?: string;
  };
  security_flags?: Record<string, unknown>;
  is_active?: boolean;
  last_activity?: string;
  created_at?: string;
  expires_at?: string;
}

/**
 * Session statistics interface
 */
export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  uniqueIPs: number;
  recentActivity: SessionData[];
  suspiciousActivity: SessionData[];
}

/**
 * Session management state interface
 */
export interface SessionManagementState {
  sessionStats: SessionStats | null;
  userSessions: SessionData[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Session management actions interface
 */
export interface SessionManagementActions {
  loadSessions: () => Promise<void>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllOtherSessions: () => Promise<void>;
  refreshSessions: () => Promise<void>;
}

/**
 * Combined session management hook return type
 */
export interface UseSessionManagementReturn {
  state: SessionManagementState;
  actions: SessionManagementActions;
}

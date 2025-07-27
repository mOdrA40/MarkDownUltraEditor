/**
 * @fileoverview Session management hook
 * @author Axel Modra
 */

import { useAuth, useSession, useUser } from '@clerk/react-router';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/core/useToast';
import { createClerkSupabaseClient } from '@/lib/supabase';
import { createSessionManager } from '@/services/sessionManager';
import { safeConsole } from '@/utils/console';

import type { SessionManagementState, UseSessionManagementReturn } from '../types/session';

/**
 * Session management hook
 */
export const useSessionManagement = (): UseSessionManagementReturn => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { session } = useSession();
  const { toast } = useToast();

  const [state, setState] = useState<SessionManagementState>({
    sessionStats: null,
    userSessions: [],
    isLoading: false,
    error: null,
  });

  // Load sessions
  const loadSessions = useCallback(async () => {
    if (!isSignedIn || !user?.id || !getToken) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const supabaseClient = createClerkSupabaseClient(getToken);
      const sessionManager = createSessionManager(supabaseClient);

      const [stats, sessions] = await Promise.all([
        sessionManager.getSessionStats(user.id),
        sessionManager.getUserSessions(user.id),
      ]);

      setState((prev) => ({
        ...prev,
        sessionStats: stats,
        userSessions: sessions,
        isLoading: false,
      }));
    } catch (error) {
      safeConsole.error('Failed to load sessions:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to load sessions',
        isLoading: false,
      }));
    }
  }, [isSignedIn, user?.id, getToken]);

  // Terminate specific session
  const terminateSession = useCallback(
    async (sessionId: string) => {
      if (!getToken) return;

      try {
        const supabaseClient = createClerkSupabaseClient(getToken);
        const sessionManager = createSessionManager(supabaseClient);
        await sessionManager.terminateSession(sessionId);

        // Remove from local state
        setState((prev) => ({
          ...prev,
          userSessions: prev.userSessions.filter((s) => s.session_id !== sessionId),
        }));

        toast({
          title: 'Session Terminated',
          description: 'Session has been terminated successfully.',
        });
      } catch (error) {
        safeConsole.error('Failed to terminate session:', error);
        toast({
          title: 'Termination Failed',
          description: 'Failed to terminate session. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [getToken, toast]
  );

  // Terminate all other sessions
  const terminateAllOtherSessions = useCallback(async () => {
    if (!user?.id || !getToken) return;

    try {
      const supabaseClient = createClerkSupabaseClient(getToken);
      const sessionManager = createSessionManager(supabaseClient);

      // Get current session ID to exclude it
      const currentSessionId = session?.id;

      // Terminate all sessions except current
      const sessionsToTerminate = state.userSessions.filter(
        (userSession) => !currentSessionId || userSession.session_id !== currentSessionId
      );

      await Promise.all(
        sessionsToTerminate.map((session) => sessionManager.terminateSession(session.session_id))
      );

      // Reload sessions to reflect changes
      await loadSessions();

      toast({
        title: 'Sessions Terminated',
        description: 'All other sessions have been terminated successfully.',
      });
    } catch (error) {
      safeConsole.error('Failed to terminate sessions:', error);
      toast({
        title: 'Termination Failed',
        description: 'Failed to terminate sessions. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user?.id, getToken, state.userSessions, loadSessions, toast, session?.id]);

  // Refresh sessions
  const refreshSessions = useCallback(async () => {
    await loadSessions();
  }, [loadSessions]);

  // Load sessions on mount and when dependencies change
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    state,
    actions: {
      loadSessions,
      terminateSession,
      terminateAllOtherSessions,
      refreshSessions,
    },
  };
};

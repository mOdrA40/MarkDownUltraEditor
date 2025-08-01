/**
 * @fileoverview Session management hook with React Query optimization
 * @author Axel Modra
 */

import { useAuth, useSession, useUser } from '@clerk/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useToast } from '@/hooks/core/useToast';
import { createClerkSupabaseClient } from '@/lib/supabase';
import { createSessionManager } from '@/services/sessionManager';
import { safeConsole } from '@/utils/console';

import type { SessionManagementState, UseSessionManagementReturn } from '../types/session';

/**
 * Session management hook with React Query optimization
 */
export const useSessionManagement = (): UseSessionManagementReturn => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [error, setError] = useState<string | null>(null);

  // Query keys for caching - memoized to prevent unnecessary re-renders
  const queryKeys = useMemo(
    () => ({
      sessions: ['sessions', user?.id],
      stats: ['session-stats', user?.id],
    }),
    [user?.id]
  );

  // Fetch session stats with React Query
  const {
    data: sessionStats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: queryKeys.stats,
    queryFn: async () => {
      if (!isSignedIn || !user?.id || !getToken) return null;

      const supabaseClient = createClerkSupabaseClient(getToken);
      const sessionManager = createSessionManager(supabaseClient);
      return sessionManager.getSessionStats(user.id);
    },
    enabled: !!(isSignedIn && user?.id && getToken),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Fetch user sessions with React Query
  const {
    data: userSessions = [],
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: queryKeys.sessions,
    queryFn: async () => {
      if (!isSignedIn || !user?.id || !getToken) return [];

      const supabaseClient = createClerkSupabaseClient(getToken);
      const sessionManager = createSessionManager(supabaseClient);
      return sessionManager.getUserSessions(user.id);
    },
    enabled: !!(isSignedIn && user?.id && getToken),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const isLoading = isLoadingStats || isLoadingSessions;

  // Load sessions function for compatibility
  const loadSessions = useCallback(async () => {
    setError(null);
    try {
      await Promise.all([refetchStats(), refetchSessions()]);
    } catch (error) {
      safeConsole.error('Failed to load sessions:', error);
      setError('Failed to load sessions');
    }
  }, [refetchStats, refetchSessions]);

  // Terminate specific session
  const terminateSession = useCallback(
    async (sessionId: string) => {
      if (!getToken) return;

      try {
        const supabaseClient = createClerkSupabaseClient(getToken);
        const sessionManager = createSessionManager(supabaseClient);
        await sessionManager.terminateSession(sessionId);

        // Invalidate and refetch sessions
        await queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
        await queryClient.invalidateQueries({ queryKey: queryKeys.stats });

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
    [getToken, toast, queryClient, queryKeys]
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
      const sessionsToTerminate = userSessions.filter(
        (userSession) => !currentSessionId || userSession.session_id !== currentSessionId
      );

      await Promise.all(
        sessionsToTerminate.map((session) => sessionManager.terminateSession(session.session_id))
      );

      // Invalidate and refetch sessions
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      await queryClient.invalidateQueries({ queryKey: queryKeys.stats });

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
  }, [user?.id, getToken, userSessions, toast, session?.id, queryClient, queryKeys]);

  // Refresh sessions
  const refreshSessions = useCallback(async () => {
    await loadSessions();
  }, [loadSessions]);

  // Create state object for compatibility
  const state: SessionManagementState = {
    sessionStats: sessionStats || null,
    userSessions,
    isLoading,
    error,
  };

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

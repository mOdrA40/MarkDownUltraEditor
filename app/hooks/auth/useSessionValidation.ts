import { useAuth, useUser } from '@clerk/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useToast } from '@/hooks/core/useToast';
import { createClerkSupabaseClient } from '@/lib/supabase';
import { createSessionManager } from '@/services/sessionManager';
import { getBrowserFingerprint } from '@/utils/browserFingerprint';
import { safeConsole } from '@/utils/console';

interface SessionValidationConfig {
  checkInterval?: number;
  enabled?: boolean;
  showNotifications?: boolean;
}

interface SessionValidationState {
  isValidating: boolean;
  lastValidation: Date | null;
  sessionActive: boolean;
  validationError: string | null;
}

export const useSessionValidation = (config: SessionValidationConfig = {}) => {
  const { checkInterval = 30000, enabled = true, showNotifications = true } = config;

  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [state, setState] = useState<SessionValidationState>({
    isValidating: false,
    lastValidation: null,
    sessionActive: true,
    validationError: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);

  const initializeSession = useCallback(async () => {
    if (!isSignedIn || !user?.id) {
      if (process.env.NODE_ENV === 'development') {
        safeConsole.dev('🚫 Session init skipped');
      }
      return;
    }

    if (currentSessionIdRef.current) {
      if (process.env.NODE_ENV === 'development') {
        safeConsole.dev('✅ Session already initialized');
      }
      return;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        safeConsole.dev('🔄 Initializing session');
      }

      const supabaseClient = createClerkSupabaseClient(getToken);
      const sessionManager = createSessionManager(supabaseClient);

      const browserFingerprint = getBrowserFingerprint();
      const sessionId = `session_${user.id}_${browserFingerprint}`;

      if (process.env.NODE_ENV === 'development') {
        safeConsole.dev('🔍 Checking existing sessions');
      }

      const existingSessions = await sessionManager.getUserSessions(user.id);

      if (process.env.NODE_ENV === 'development') {
        safeConsole.dev('📊 Found existing sessions:', existingSessions.length);
      }

      const existingSession = existingSessions.find(
        (s) => s.session_id.startsWith(`session_${user.id}_${browserFingerprint}`) && s.is_active
      );

      if (existingSession) {
        currentSessionIdRef.current = existingSession.session_id;
        if (process.env.NODE_ENV === 'development') {
          safeConsole.dev('♻️ Using existing session');
        }

        await sessionManager.updateActivity(existingSession.session_id);
      } else {
        const uniqueId =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto
                .randomUUID()
                .substring(0, 8) // Shorter unique part
            : Date.now().toString(36);
        const uniqueSessionId = `${sessionId}_${uniqueId}`;

        if (process.env.NODE_ENV === 'development') {
          safeConsole.dev('🆕 Creating new session');
        }

        currentSessionIdRef.current = uniqueSessionId;
        const createdSession = await sessionManager.createSession(user.id, uniqueSessionId);

        if (process.env.NODE_ENV === 'development') {
          safeConsole.dev('✅ New session created:', !!createdSession);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        safeConsole.error('❌ Error initializing session:', error);
      } else {
        safeConsole.error('Session initialization failed');
      }
    }
  }, [isSignedIn, user?.id, getToken]);

  const forceLogout = useCallback(async () => {
    try {
      safeConsole.log('Performing force logout...');
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('markdownEditor_') || key.startsWith('clerk-'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      sessionStorage.clear();

      try {
        document.cookie.split(';').forEach((cookie) => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
          const cookieName = name.trim();
          if (cookieName) {
            // biome-ignore lint/suspicious/noDocumentCookie: Required for session cleanup
            document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            // biome-ignore lint/suspicious/noDocumentCookie: Required for session cleanup
            document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          }
        });
      } catch (error) {
        safeConsole.error('Error clearing cookies:', error);
      }

      currentSessionIdRef.current = null;
      setState({
        isValidating: false,
        lastValidation: null,
        sessionActive: false,
        validationError: null,
      });

      navigate('/', { replace: true });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      safeConsole.error('Error during force logout:', error);
    }
  }, [navigate]);

  const validateSession = useCallback(async (): Promise<boolean> => {
    if (!isSignedIn || !user?.id) {
      return false;
    }

    try {
      setState((prev) => ({
        ...prev,
        isValidating: true,
        validationError: null,
      }));

      const supabaseClient = createClerkSupabaseClient(getToken);
      const sessionManager = createSessionManager(supabaseClient);

      if (!currentSessionIdRef.current) {
        await initializeSession();
        if (!currentSessionIdRef.current) {
          return false;
        }
      }
      const currentSessionId = currentSessionIdRef.current;

      const sessions = await sessionManager.getUserSessions(user.id);
      const currentSession = sessions.find((s) => s.session_id === currentSessionId);

      if (!currentSession || !currentSession.is_active) {
        safeConsole.log('Session terminated remotely, logging out...');

        if (showNotifications) {
          toast({
            title: 'Session Terminated',
            description: 'Your session has been terminated from another device.',
            variant: 'destructive',
          });
        }

        await forceLogout();
        return false;
      }
      await sessionManager.updateActivity(currentSessionId);

      setState((prev) => ({
        ...prev,
        isValidating: false,
        lastValidation: new Date(),
        sessionActive: true,
      }));

      return true;
    } catch (error) {
      safeConsole.error('Session validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setState((prev) => ({
        ...prev,
        isValidating: false,
        validationError: errorMessage,
        sessionActive: false,
      }));

      return false;
    }
  }, [isSignedIn, user?.id, getToken, showNotifications, toast, forceLogout, initializeSession]);

  useEffect(() => {
    if (isSignedIn && user?.id) {
      initializeSession();
    }
  }, [isSignedIn, user?.id, initializeSession]);

  useEffect(() => {
    if (!enabled || !isSignedIn) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      validateSession();
    }, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isSignedIn, checkInterval, validateSession]);

  const manualValidate = async () => {
    return await validateSession();
  };
  const terminateAllOtherSessions = async (): Promise<boolean> => {
    if (!isSignedIn || !user?.id) {
      return false;
    }

    try {
      const supabaseClient = createClerkSupabaseClient(getToken);
      const sessionManager = createSessionManager(supabaseClient);

      const currentSessionId = currentSessionIdRef.current;
      if (!currentSessionId) {
        throw new Error('No current session ID');
      }

      const success = await sessionManager.terminateAllOtherSessions(user.id, currentSessionId);

      if (success && showNotifications) {
        toast({
          title: 'Sessions Terminated',
          description: 'All other sessions have been terminated successfully.',
        });
      }

      return success;
    } catch (error) {
      safeConsole.error('Error terminating other sessions:', error);

      if (showNotifications) {
        toast({
          title: 'Error',
          description: 'Failed to terminate other sessions. Please try again.',
          variant: 'destructive',
        });
      }

      return false;
    }
  };

  return {
    ...state,
    validateSession: manualValidate,
    forceLogout,
    terminateAllOtherSessions,
    currentSessionId: currentSessionIdRef.current,
  };
};

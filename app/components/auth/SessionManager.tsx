/**
 * @fileoverview Session Manager Component for real-time session validation
 * @author Axel Modra
 */

import { useAuth, useUser } from '@clerk/react-router';
import { useEffect } from 'react';
import { useSessionValidation } from '@/hooks/auth/useSessionValidation';
import { cleanupDebugSessions, runFullSessionDebug } from '@/utils/debug/sessionDebug';

/**
 * Session Manager Component
 * Handles real-time session validation and automatic logout
 */
export const SessionManager = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  // Initialize session validation for authenticated users
  const { sessionActive, validationError } = useSessionValidation({
    enabled: isSignedIn,
    checkInterval: 30000, // Check every 30 seconds
    showNotifications: true,
  });

  // Clean up debug sessions on app load and run comprehensive debug in development
  useEffect(() => {
    if (isSignedIn && user?.id && process.env.NODE_ENV === 'development') {
      // Clean up any leftover debug sessions first
      cleanupDebugSessions(getToken);

      // Run debug after a short delay to ensure everything is initialized
      const timer = setTimeout(() => {
        runFullSessionDebug(user.id, getToken);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSignedIn, user?.id, getToken]);

  // Log session status changes for debugging
  useEffect(() => {
    if (isSignedIn) {
      import('@/utils/console').then(({ safeConsole }) => {
        if (process.env.NODE_ENV === 'development') {
          safeConsole.dev('🔄 Session Manager: Session active =', sessionActive);
        }
      });
      if (validationError) {
        import('@/utils/console').then(({ safeConsole }) => {
          if (process.env.NODE_ENV === 'development') {
            safeConsole.error('❌ Session Manager: Validation error =', validationError);
          } else {
            safeConsole.error('Session validation error');
          }
        });
      }
    }
  }, [isSignedIn, sessionActive, validationError]);

  // This component doesn't render anything visible
  return null;
};

export default SessionManager;

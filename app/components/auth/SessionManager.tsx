/**
 * @fileoverview Session Manager Component for real-time session validation
 * @author Axel Modra
 */

import { useAuth } from '@clerk/react-router';
import { useEffect } from 'react';
import { useSessionValidation } from '@/hooks/auth/useSessionValidation';

/**
 * Session Manager Component
 * Handles real-time session validation and automatic logout
 */
export const SessionManager = () => {
  const { isSignedIn } = useAuth();

  // Initialize session validation for authenticated users
  const { sessionActive, validationError } = useSessionValidation({
    enabled: isSignedIn,
    checkInterval: 30000, // Check every 30 seconds
    showNotifications: true,
  });

  // Log session status changes for debugging
  useEffect(() => {
    if (isSignedIn) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('Session Manager: Session active =', sessionActive);
      });
      if (validationError) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.error('Session Manager: Validation error =', validationError);
        });
      }
    }
  }, [isSignedIn, sessionActive, validationError]);

  // This component doesn't render anything visible
  return null;
};

export default SessionManager;

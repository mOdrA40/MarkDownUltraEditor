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
  const { validationError } = useSessionValidation({
    enabled: isSignedIn,
    checkInterval: 30000, // Check every 30 seconds
    showNotifications: true,
  });

  useEffect(() => {
    if (validationError) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.error('Session validation error:', validationError);
      });
    }
  }, [validationError]);

  // This component doesn't render anything visible
  return null;
};

export default SessionManager;

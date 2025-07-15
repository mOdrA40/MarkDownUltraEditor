/**
 * @fileoverview Security system integration with existing application
 * @author Security Team
 * @version 1.0.0
 */

import { useAuth } from '@clerk/react-router';
import { useCallback, useEffect, useMemo } from 'react';
import {
  getSecurityPreset,
  initializeSecurity,
  type SecurityContext,
  SecurityEventType,
  SecurityRiskLevel,
  SecurityUtils,
} from './index';

/**
 * Initialize security system for the application
 */
export const initializeAppSecurity = () => {
  // Get environment-specific security configuration
  const securityConfig = getSecurityPreset();

  // Initialize security system
  const security = initializeSecurity({
    enableMonitoring: securityConfig.enableMonitoring,
    enableRateLimit: securityConfig.enableRateLimit,
    enableValidation: securityConfig.enableInputValidation,
    enableHeaders: true,
  });

  // Log security system initialization
  SecurityUtils.logSecurityEvent(
    SecurityEventType.AUTHENTICATION_SUCCESS,
    {
      action: 'security_system_init',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
    SecurityRiskLevel.LOW
  );

  return security;
};

/**
 * Enhanced security context hook that integrates with Clerk
 */
export const useSecurityContext = (): SecurityContext & {
  logSecurityEvent: (type: SecurityEventType, details: Record<string, unknown>) => void;
  validateInput: (input: string, fieldName: string) => boolean;
  checkSuspiciousActivity: (input: string) => boolean;
} => {
  const { isSignedIn, userId, sessionId } = useAuth();

  // Create security context
  const securityContext = useMemo((): SecurityContext => {
    return {
      userId: userId || undefined,
      sessionId: sessionId || 'anonymous',
      permissions: [], // Would be populated from your auth system
      roles: [], // Would be populated from your auth system
      lastActivity: new Date(),
      isAuthenticated: isSignedIn || false,
      isSuspicious: false,
      // These would typically come from request headers in a real app
      ipAddress: typeof window !== 'undefined' ? 'client' : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
    };
  }, [isSignedIn, userId, sessionId]);

  // Security event logging function
  const logSecurityEvent = useCallback(
    (type: SecurityEventType, details: Record<string, unknown>) => {
      SecurityUtils.logSecurityEvent(type, {
        ...details,
        userId: securityContext.userId,
        sessionId: securityContext.sessionId,
        isAuthenticated: securityContext.isAuthenticated,
      });
    },
    [securityContext]
  );

  // Input validation function
  const validateInput = useCallback(
    (input: string, fieldName: string): boolean => {
      const result = SecurityUtils.validateInput(input, fieldName);

      if (!result.isValid) {
        logSecurityEvent(SecurityEventType.INPUT_VALIDATION_FAILURE, {
          fieldName,
          errors: result.errors,
          inputLength: input.length,
        });
      }

      return result.isValid;
    },
    [logSecurityEvent]
  );

  // Suspicious activity checker
  const checkSuspiciousActivity = useCallback(
    (input: string): boolean => {
      const result = SecurityUtils.checkSuspiciousActivity(input);

      if (result.isSuspicious) {
        logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          patterns: result.patterns,
          inputLength: input.length,
          input: input.substring(0, 100), // Log first 100 chars only
        });
      }

      return result.isSuspicious;
    },
    [logSecurityEvent]
  );

  return {
    ...securityContext,
    logSecurityEvent,
    validateInput,
    checkSuspiciousActivity,
  };
};

/**
 * Security-aware form validation hook
 */
export const useSecureFormValidation = () => {
  const { validateInput, logSecurityEvent } = useSecurityContext();

  const validateForm = useCallback(
    (formData: Record<string, unknown>) => {
      const errors: Record<string, string> = {};
      let hasSecurityIssues = false;

      for (const [fieldName, value] of Object.entries(formData)) {
        if (typeof value === 'string') {
          // Validate input security
          if (!validateInput(value, fieldName)) {
            errors[fieldName] = 'Input contains invalid or suspicious content';
            hasSecurityIssues = true;
          }

          // Check for common security issues
          if (value.length > 10000) {
            errors[fieldName] = 'Input is too long';
            hasSecurityIssues = true;
          }
        }
      }

      if (hasSecurityIssues) {
        logSecurityEvent(SecurityEventType.INPUT_VALIDATION_FAILURE, {
          formFields: Object.keys(formData),
          errorCount: Object.keys(errors).length,
        });
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        hasSecurityIssues,
      };
    },
    [validateInput, logSecurityEvent]
  );

  return { validateForm };
};

/**
 * Security-aware file upload hook
 */
export const useSecureFileUpload = () => {
  const { logSecurityEvent } = useSecurityContext();

  const validateFile = useCallback(
    (file: File) => {
      // Use the security system's file validation
      const result = SecurityUtils.validateInput(file, 'file_upload');

      if (!result.isValid) {
        logSecurityEvent(SecurityEventType.FILE_UPLOAD_BLOCKED, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          errors: result.errors,
        });
      } else {
        logSecurityEvent(SecurityEventType.FILE_UPLOAD_ATTEMPT, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          status: 'allowed',
        });
      }

      return result;
    },
    [logSecurityEvent]
  );

  return { validateFile };
};

/**
 * Security monitoring hook for components
 */
export const useSecurityMonitoring = () => {
  const { logSecurityEvent } = useSecurityContext();

  // Monitor component mount/unmount for security
  useEffect(() => {
    logSecurityEvent(SecurityEventType.AUTHENTICATION_ATTEMPT, {
      action: 'component_mount',
      component: 'security_monitored',
    });

    return () => {
      logSecurityEvent(SecurityEventType.AUTHENTICATION_ATTEMPT, {
        action: 'component_unmount',
        component: 'security_monitored',
      });
    };
  }, [logSecurityEvent]);

  // Get security statistics
  const getSecurityStats = useCallback(() => {
    return SecurityUtils.getSecurityStats();
  }, []);

  // Get recent alerts
  const getRecentAlerts = useCallback((hours = 24) => {
    return SecurityUtils.getRecentAlerts(hours);
  }, []);

  return {
    getSecurityStats,
    getRecentAlerts,
    logSecurityEvent,
  };
};

/**
 * Enhanced error boundary with security logging
 */
export const useSecurityErrorHandler = () => {
  const { logSecurityEvent } = useSecurityContext();

  const handleError = useCallback(
    (error: Error, errorInfo?: { componentStack?: string }) => {
      // Log security-relevant errors
      logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 500), // Limit stack trace length
        componentStack: errorInfo?.componentStack?.substring(0, 500),
        errorType: error.name,
        timestamp: new Date().toISOString(),
      });

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Security-monitored error:', error, errorInfo);
      }
    },
    [logSecurityEvent]
  );

  return { handleError };
};

/**
 * Security-aware localStorage wrapper
 */
export const useSecureStorage = () => {
  const { logSecurityEvent } = useSecurityContext();

  const setSecureItem = useCallback(
    (key: string, value: string, encrypt = true) => {
      try {
        // Use the security system's secure storage
        const { secureStorage } = require('./core');
        secureStorage.setItem(key, value, encrypt);

        logSecurityEvent(SecurityEventType.AUTHENTICATION_ATTEMPT, {
          action: 'secure_storage_write',
          key: key.substring(0, 20), // Log partial key only
          encrypted: encrypt,
        });
      } catch (error) {
        logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          action: 'secure_storage_write_failed',
          key: key.substring(0, 20),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    },
    [logSecurityEvent]
  );

  const getSecureItem = useCallback(
    (key: string, decrypt = true): string | null => {
      try {
        const { secureStorage } = require('./core');
        const value = secureStorage.getItem(key, decrypt);

        logSecurityEvent(SecurityEventType.AUTHENTICATION_ATTEMPT, {
          action: 'secure_storage_read',
          key: key.substring(0, 20),
          decrypted: decrypt,
          found: value !== null,
        });

        return value;
      } catch (error) {
        logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          action: 'secure_storage_read_failed',
          key: key.substring(0, 20),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return null;
      }
    },
    [logSecurityEvent]
  );

  const removeSecureItem = useCallback(
    (key: string) => {
      try {
        const { secureStorage } = require('./core');
        secureStorage.removeItem(key);

        logSecurityEvent(SecurityEventType.AUTHENTICATION_ATTEMPT, {
          action: 'secure_storage_remove',
          key: key.substring(0, 20),
        });
      } catch (error) {
        logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          action: 'secure_storage_remove_failed',
          key: key.substring(0, 20),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    },
    [logSecurityEvent]
  );

  return {
    setSecureItem,
    getSecureItem,
    removeSecureItem,
  };
};

/**
 * Security initialization for React app
 */
export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Initialize security system when app starts
    initializeAppSecurity();
  }, []);

  return children as React.ReactElement;
};

/**
 * Security utilities for existing components
 */
export const SecurityIntegration = {
  /**
   * Enhance existing form validation with security
   */
  enhanceFormValidation: (originalValidator: (data: unknown) => boolean) => {
    return (data: unknown): boolean => {
      // Run original validation first
      const isValid = originalValidator(data);

      // Add security validation
      if (isValid && typeof data === 'object' && data !== null) {
        const securityResult = SecurityUtils.validateInput(JSON.stringify(data), 'form_data');
        return securityResult.isValid;
      }

      return isValid;
    };
  },

  /**
   * Add security logging to existing functions
   */
  withSecurityLogging: <T extends (...args: unknown[]) => unknown>(
    fn: T,
    eventType: SecurityEventType,
    functionName: string
  ): T => {
    return ((...args: unknown[]) => {
      try {
        const result = fn(...args);

        SecurityUtils.logSecurityEvent(eventType, {
          functionName,
          success: true,
          argsCount: args.length,
        });

        return result;
      } catch (error) {
        SecurityUtils.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          functionName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          argsCount: args.length,
        });

        throw error;
      }
    }) as T;
  },

  /**
   * Create security-aware API client
   */
  createSecureApiClient: (baseUrl: string) => {
    return {
      async request(endpoint: string, options: RequestInit = {}) {
        // Add security headers
        const securityHeaders = SecurityUtils.getSecurityHeaders();

        const response = await fetch(`${baseUrl}${endpoint}`, {
          ...options,
          headers: {
            ...options.headers,
            ...securityHeaders,
          },
        });

        // Log API request
        SecurityUtils.logSecurityEvent(SecurityEventType.AUTHENTICATION_ATTEMPT, {
          endpoint,
          method: options.method || 'GET',
          status: response.status,
          success: response.ok,
        });

        return response;
      },
    };
  },
};

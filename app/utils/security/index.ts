/**
 * @fileoverview Security utilities main export file
 * @author Security Team
 * @version 1.0.0
 */

import { createSecurityEvent, detectSuspiciousPatterns, generateSessionId } from './core';
import { getEnvironmentSecurityHeaders } from './headers';
import { createSecurityAction, createSecurityLoader, securityMiddleware } from './middleware';
// Import required modules for internal use
import { securityMonitor } from './monitoring';
import { rateLimiters } from './rateLimiter';
import { SECURITY_CONSTANTS, type SecurityEventType, SecurityRiskLevel } from './types';
import { inputValidator, ValidationSchemas } from './validation';

// Core security utilities
export {
  createSecurityEvent,
  decryptData,
  detectSuspiciousPatterns,
  encryptData,
  generateCSRFToken,
  generateSecureToken,
  generateSessionId,
  hashData,
  sanitizeInput,
  secureStorage,
  validateCSRFToken,
  validateEmail,
  validateFileUpload,
  validatePassword,
} from './core';
export type { SecurityHeadersConfig } from './headers';
// Security headers
export {
  createSecurityHeadersMiddleware,
  DEFAULT_SECURITY_CONFIG,
  ENVIRONMENT_CONFIGS,
  generateCSPHeader,
  generateHSTSHeader,
  generatePermissionsPolicyHeader,
  generateSecurityHeaders,
  getEnvironmentSecurityHeaders,
  validateCSPConfig,
} from './headers';
// Security middleware
export {
  createSecurityAction,
  createSecurityLoader,
  SecurityMiddleware,
  securityMiddleware,
} from './middleware';
// Security monitoring
export { SecurityMonitor, securityMonitor } from './monitoring';
// Rate limiting
export { createRateLimiter, RateLimiter, rateLimiters } from './rateLimiter';
// Security types
export type {
  CSRFToken,
  EncryptionConfig,
  FileScanResult,
  RateLimitConfig,
  SecurityAlert,
  SecurityAuditLog,
  SecurityConfig,
  SecurityContext,
  SecurityEvent,
  SecurityMiddlewareOptions,
  SecurityRequest,
  ValidationResult,
} from './types';
export {
  CSRFError,
  isSecurityEvent,
  isValidationResult,
  RateLimitError,
  RateLimitStrategy,
  SECURITY_CONSTANTS,
  SecurityError,
  SecurityEventType,
  SecurityRiskLevel,
  ValidationError,
} from './types';
// Input validation
export {
  createValidationMiddleware,
  InputValidator,
  inputValidator,
  ValidationSchemas,
  ValidationUtils,
} from './validation';

/**
 * Initialize security system
 */
export const initializeSecurity = (config?: {
  enableMonitoring?: boolean;
  enableRateLimit?: boolean;
  enableValidation?: boolean;
  enableHeaders?: boolean;
}) => {
  const {
    enableMonitoring = true,
    enableRateLimit = true,
    enableValidation = true,
    enableHeaders = true,
  } = config || {};

  console.log('🔒 Initializing enterprise security system...');

  // Log security initialization
  if (enableMonitoring) {
    securityMonitor.logAudit('security_init', 'system', 'success', {
      enableMonitoring,
      enableRateLimit,
      enableValidation,
      enableHeaders,
      timestamp: new Date().toISOString(),
    });
  }

  // Set up periodic cleanup
  if (typeof window === 'undefined') {
    setInterval(
      () => {
        securityMiddleware.cleanupExpiredTokens();
      },
      60 * 60 * 1000
    ); // Cleanup every hour
  }

  console.log('✅ Security system initialized successfully');

  return {
    monitor: securityMonitor,
    middleware: securityMiddleware,
    rateLimiters,
    validator: inputValidator,
  };
};

/**
 * Security utilities for common use cases
 */
export const SecurityUtils = {
  /**
   * Secure a React Router loader
   */
  secureLoader: createSecurityLoader,

  /**
   * Secure a React Router action
   */
  secureAction: createSecurityAction,

  /**
   * Get security headers for response
   */
  getSecurityHeaders: getEnvironmentSecurityHeaders,

  /**
   * Validate user input
   */
  validateInput: (input: unknown, fieldName: string) => {
    return inputValidator.validateInput(input, ValidationSchemas.markdownContent, { fieldName });
  },

  /**
   * Check if request is suspicious
   */
  checkSuspiciousActivity: (input: string) => {
    return detectSuspiciousPatterns(input);
  },

  /**
   * Generate secure session
   */
  createSecureSession: () => {
    const sessionId = generateSessionId();
    const csrfToken = securityMiddleware.generateCSRFTokenForSession(sessionId);

    return {
      sessionId,
      csrfToken,
      expiresAt: new Date(Date.now() + SECURITY_CONSTANTS.SESSION_TIMEOUT_MS),
    };
  },

  /**
   * Log security event
   */
  logSecurityEvent: (
    type: SecurityEventType,
    details: Record<string, unknown>,
    riskLevel: SecurityRiskLevel = SecurityRiskLevel.MEDIUM
  ) => {
    const event = createSecurityEvent(type, details, riskLevel);
    securityMonitor.logEvent(event);
    return event;
  },

  /**
   * Get security statistics
   */
  getSecurityStats: () => {
    return securityMonitor.getStats();
  },

  /**
   * Get recent security alerts
   */
  getRecentAlerts: (hours = 24) => {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return securityMonitor.getEvents({ since });
  },
};

/**
 * Security hooks for React components
 */
export const useSecurityContext = () => {
  // This would typically integrate with your auth system
  return {
    isSecure: true,
    securityLevel: SecurityRiskLevel.LOW,
    lastSecurityCheck: new Date(),
  };
};

/**
 * Security configuration presets
 */
export const SECURITY_PRESETS = {
  /**
   * Maximum security configuration
   */
  MAXIMUM: {
    enableRateLimit: true,
    enableCSRF: true,
    enableInputValidation: true,
    enableLogging: true,
    enableMonitoring: true,
    customValidators: {},
  },

  /**
   * Balanced security configuration
   */
  BALANCED: {
    enableRateLimit: true,
    enableCSRF: true,
    enableInputValidation: true,
    enableLogging: true,
    enableMonitoring: false,
    customValidators: {},
  },

  /**
   * Minimal security configuration
   */
  MINIMAL: {
    enableRateLimit: false,
    enableCSRF: false,
    enableInputValidation: true,
    enableLogging: false,
    enableMonitoring: false,
    customValidators: {},
  },

  /**
   * Development security configuration
   */
  DEVELOPMENT: {
    enableRateLimit: false,
    enableCSRF: false,
    enableInputValidation: true,
    enableLogging: true,
    enableMonitoring: true,
    customValidators: {},
  },
} as const;

/**
 * Get security preset based on environment
 */
export const getSecurityPreset = () => {
  const env = process.env.NODE_ENV;

  switch (env) {
    case 'development':
      return SECURITY_PRESETS.DEVELOPMENT;
    case 'production':
      return SECURITY_PRESETS.MAXIMUM;
    case 'test':
      return SECURITY_PRESETS.MINIMAL;
    default:
      return SECURITY_PRESETS.BALANCED;
  }
};

/**
 * Default export for convenience
 */
export default {
  init: initializeSecurity,
  utils: SecurityUtils,
  presets: SECURITY_PRESETS,
  getPreset: getSecurityPreset,
  monitor: securityMonitor,
  middleware: securityMiddleware,
  validator: inputValidator,
  rateLimiters,
};

/**
 * @fileoverview Simplified Sentry integration for basic error tracking
 * @author Axel Modra
 * @version 2.0.0
 */

import * as Sentry from '@sentry/react';

/**
 * Simplified error categories
 */
export enum ErrorCategory {
  USER_ACTION = 'user_action',
  SYSTEM = 'system',
}

/**
 * Simplified error severity levels
 */
export enum ErrorSeverity {
  MEDIUM = 'warning',
  HIGH = 'error',
}

/**
 * Simplified Sentry integration class
 */
export class SimpleSentryIntegration {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Sentry with minimal configuration
   */
  private initialize(): void {
    const dsn = import.meta.env?.VITE_SENTRY_DSN || process.env.VITE_SENTRY_DSN;
    const environment = import.meta.env?.MODE || process.env.NODE_ENV || 'development';

    if (!dsn) {
      console.warn('Sentry DSN not configured');
      return;
    }

    Sentry.init({
      dsn,
      environment,
      tracesSampleRate: environment === 'production' ? 0.1 : 0.5,
      beforeSend: (event) => {
        // Simple data scrubbing - remove sensitive patterns
        if (event.message) {
          event.message = this.sanitizeMessage(event.message);
        }
        return event;
      },
    });

    this.isInitialized = true;
  }

  /**
   * Simple message sanitization
   */
  private sanitizeMessage(message: string): string {
    const sensitivePatterns = [
      /password[=:]\s*[^\s]+/gi,
      /token[=:]\s*[^\s]+/gi,
      /key[=:]\s*[^\s]+/gi,
      /VITE_[A-Z_]+[=:]\s*[^\s]+/gi,
    ];

    let sanitized = message;
    sensitivePatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  /**
   * Log error to Sentry
   */
  public logError(
    error: Error,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    severity: ErrorSeverity = ErrorSeverity.HIGH,
    context?: Record<string, unknown>
  ): void {
    if (!this.isInitialized) return;

    Sentry.withScope((scope) => {
      scope.setTag('category', category);
      scope.setLevel(severity);

      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value as Record<string, unknown>);
        });
      }

      Sentry.captureException(error);
    });
  }

  /**
   * Log message to Sentry
   */
  public logMessage(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, unknown>
  ): void {
    if (!this.isInitialized) return;

    Sentry.withScope((scope) => {
      scope.setLevel(severity);

      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value as Record<string, unknown>);
        });
      }

      Sentry.captureMessage(this.sanitizeMessage(message));
    });
  }

  /**
   * Check if Sentry is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}

/**
 * Global Sentry instance
 */
export const simpleSentry = new SimpleSentryIntegration();

/**
 * Utility functions for backward compatibility
 */
export const SentryUtils = {
  logError: (error: Error, context?: Record<string, unknown>) => {
    simpleSentry.logError(error, ErrorCategory.SYSTEM, ErrorSeverity.HIGH, context);
  },

  logAuthError: (error: Error, context?: Record<string, unknown>) => {
    simpleSentry.logError(error, ErrorCategory.USER_ACTION, ErrorSeverity.HIGH, context);
  },

  logValidationError: (message: string, context?: Record<string, unknown>) => {
    simpleSentry.logMessage(message, ErrorSeverity.MEDIUM, context);
  },

  logNetworkError: (error: Error, context?: Record<string, unknown>) => {
    simpleSentry.logError(error, ErrorCategory.SYSTEM, ErrorSeverity.HIGH, context);
  },
};

/**
 * Export for backward compatibility
 */
export const secureSentry = simpleSentry;

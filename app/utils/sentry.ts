/**
 * @fileoverview Sentry integration with request ID system for secure error tracking
 * @author Security Team
 * @version 1.0.0
 */

import * as Sentry from "@sentry/react";
import { generateSecureToken } from "./security/core";

/**
 * Sentry configuration interface
 */
interface SentryConfig {
  readonly dsn: string;
  readonly environment: string;
  readonly tracesSampleRate: number;
  readonly enableInDevelopment: boolean;
  readonly enableRequestId: boolean;
  readonly enableUserContext: boolean;
  readonly enablePerformanceMonitoring: boolean;
  readonly beforeSend?: (
    event: Sentry.ErrorEvent,
    hint?: Sentry.EventHint
  ) => Sentry.ErrorEvent | null;
}

/**
 * Request ID context for error tracking
 */
interface RequestContext {
  readonly requestId: string;
  readonly sessionId: string;
  readonly timestamp: string;
  readonly route: string;
  readonly userAgent: string;
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = "info",
  MEDIUM = "warning",
  HIGH = "error",
  CRITICAL = "fatal",
}

/**
 * Error categories for better organization
 */
export enum ErrorCategory {
  SECURITY = "security",
  PERFORMANCE = "performance",
  USER_ACTION = "user_action",
  SYSTEM = "system",
  NETWORK = "network",
  VALIDATION = "validation",
}

/**
 * Sentry integration class with security features
 */
export class SecureSentryIntegration {
  private config: SentryConfig;
  private currentRequestContext: RequestContext | null = null;
  private isInitialized = false;

  constructor(config: Partial<SentryConfig>) {
    // Use import.meta.env for Vite environment variables
    const dsn =
      import.meta.env?.VITE_SENTRY_DSN || process.env.VITE_SENTRY_DSN || "";
    const environment =
      import.meta.env?.MODE || process.env.NODE_ENV || "development";

    this.config = {
      dsn,
      environment,
      tracesSampleRate: environment === "production" ? 0.05 : 1.0, // Reduced for production
      enableInDevelopment: environment === "development",
      enableRequestId: true,
      enableUserContext: environment === "production", // Only in production
      enablePerformanceMonitoring: environment === "production", // Only in production
      ...config,
    };
  }

  /**
   * Initialize Sentry with security configurations
   */
  public initialize(): void {
    if (this.isInitialized) return;

    // Skip initialization if DSN is not provided
    if (!this.config.dsn) {
      console.warn("🚨 Sentry DSN not provided - Error tracking disabled");
      return;
    }

    // Skip in development unless explicitly enabled
    if (
      this.config.environment === "development" &&
      !this.config.enableInDevelopment
    ) {
      console.info("📊 Sentry disabled in development mode");
      return;
    }

    Sentry.init({
      dsn: this.config.dsn,
      environment: this.config.environment,
      tracesSampleRate: this.config.tracesSampleRate,

      // Security-focused configuration
      beforeSend: (event, hint) => this.secureBeforeSend(event, hint),

      // Performance monitoring - optimized for production
      ...(this.config.enablePerformanceMonitoring && {
        integrations: [
          Sentry.browserTracingIntegration(),
          ...(this.config.environment === "production"
            ? [
                Sentry.replayIntegration({
                  maskAllText: true,
                  blockAllMedia: true,
                }),
              ]
            : []),
        ],
      }),

      // Privacy settings
      initialScope: {
        tags: {
          component: "MarkDownUltraRemix",
          version: "1.0.0",
        },
      },

      // Production optimizations
      ...(this.config.environment === "production" && {
        debug: false,
        maxBreadcrumbs: 20, // Reduced from default 100
        attachStacktrace: false, // Reduce payload size
      }),

      // Development settings
      ...(this.config.environment === "development" && {
        debug: true,
        maxBreadcrumbs: 100,
        attachStacktrace: true,
      }),
    });

    this.isInitialized = true;
    console.info("📊 Sentry initialized successfully");
  }

  /**
   * Secure beforeSend hook to sanitize sensitive data
   */
  private secureBeforeSend(
    event: Sentry.ErrorEvent,
    _hint?: Sentry.EventHint
  ): Sentry.ErrorEvent | null {
    // Add request context if available
    if (this.currentRequestContext) {
      event.contexts = {
        ...event.contexts,
        request: {
          request_id: this.currentRequestContext.requestId,
          session_id: this.currentRequestContext.sessionId,
          route: this.currentRequestContext.route,
          timestamp: this.currentRequestContext.timestamp,
        },
      };
    }

    // Sanitize sensitive data from error messages
    if (event.message) {
      event.message = this.sanitizeMessage(event.message);
    }

    // Sanitize exception messages
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map((exception) => ({
        ...exception,
        value: exception.value
          ? this.sanitizeMessage(exception.value)
          : exception.value,
      }));
    }

    // Remove sensitive headers and data
    if (event.request) {
      delete event.request.headers;
      delete event.request.cookies;
      delete event.request.data;
    }

    // Custom beforeSend if provided
    if (this.config.beforeSend) {
      return this.config.beforeSend(event, _hint);
    }

    return event;
  }

  /**
   * Sanitize error messages to remove sensitive information
   */
  private sanitizeMessage(message: string): string {
    // Remove potential sensitive patterns
    const sensitivePatterns = [
      /password[=:]\s*[^\s]+/gi,
      /token[=:]\s*[^\s]+/gi,
      /key[=:]\s*[^\s]+/gi,
      /secret[=:]\s*[^\s]+/gi,
      /api[_-]?key[=:]\s*[^\s]+/gi,
      /authorization[=:]\s*[^\s]+/gi,
      /bearer\s+[^\s]+/gi,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit card
    ];

    let sanitized = message;
    sensitivePatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "[REDACTED]");
    });

    return sanitized;
  }

  /**
   * Generate and set request context
   */
  public setRequestContext(
    route: string,
    additionalContext?: Record<string, unknown>
  ): string {
    const requestId = generateSecureToken(16);
    const sessionId = this.getOrCreateSessionId();

    this.currentRequestContext = {
      requestId,
      sessionId,
      timestamp: new Date().toISOString(),
      route,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    };

    // Set Sentry context
    Sentry.setContext("request", {
      ...this.currentRequestContext,
      ...additionalContext,
    });

    return requestId;
  }

  /**
   * Get or create session ID
   */
  private getOrCreateSessionId(): string {
    if (typeof window === "undefined") return "server";

    let sessionId = sessionStorage.getItem("sentry_session_id");
    if (!sessionId) {
      sessionId = generateSecureToken(12);
      sessionStorage.setItem("sentry_session_id", sessionId);
    }
    return sessionId;
  }

  /**
   * Log error with security context
   */
  public logError(
    error: Error | string,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, unknown>
  ): string | null {
    if (!this.isInitialized) return null;

    const requestId =
      this.currentRequestContext?.requestId ||
      this.setRequestContext("unknown");

    Sentry.withScope((scope) => {
      scope.setTag("category", category);
      scope.setLevel(severity as Sentry.SeverityLevel);

      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }

      if (typeof error === "string") {
        Sentry.captureMessage(error);
      } else {
        Sentry.captureException(error);
      }
    });

    return requestId;
  }

  /**
   * Log security event
   */
  public logSecurityEvent(
    event: string,
    details: Record<string, unknown>,
    severity: ErrorSeverity = ErrorSeverity.HIGH
  ): string | null {
    return this.logError(
      `Security Event: ${event}`,
      ErrorCategory.SECURITY,
      severity,
      details
    );
  }

  /**
   * Log performance issue
   */
  public logPerformanceIssue(
    metric: string,
    value: number,
    threshold: number,
    context?: Record<string, unknown>
  ): string | null {
    if (value <= threshold) return null;

    return this.logError(
      `Performance threshold exceeded: ${metric}`,
      ErrorCategory.PERFORMANCE,
      ErrorSeverity.MEDIUM,
      {
        metric,
        value,
        threshold,
        ...context,
      }
    );
  }

  /**
   * Set user context (safely)
   */
  public setUserContext(
    userId: string,
    email?: string,
    additionalData?: Record<string, unknown>
  ): void {
    if (!this.config.enableUserContext || !this.isInitialized) return;

    Sentry.setUser({
      id: userId,
      email: email ? this.sanitizeMessage(email) : undefined,
      ...additionalData,
    });
  }

  /**
   * Clear user context
   */
  public clearUserContext(): void {
    if (!this.isInitialized) return;
    Sentry.setUser(null);
  }

  /**
   * Get current request ID
   */
  public getCurrentRequestId(): string | null {
    return this.currentRequestContext?.requestId || null;
  }

  /**
   * Create error boundary component
   */
  public createErrorBoundary() {
    return Sentry.withErrorBoundary;
  }

  /**
   * Get Sentry status
   */
  public getStatus(): {
    initialized: boolean;
    dsn: string;
    environment: string;
    currentRequestId: string | null;
  } {
    return {
      initialized: this.isInitialized,
      dsn: this.config.dsn ? "[CONFIGURED]" : "[NOT_CONFIGURED]",
      environment: this.config.environment,
      currentRequestId: this.getCurrentRequestId(),
    };
  }
}

/**
 * Global Sentry instance
 */
export const secureSentry = new SecureSentryIntegration({
  dsn: import.meta.env?.VITE_SENTRY_DSN || process.env.VITE_SENTRY_DSN,
  enableInDevelopment: true, // Always enable for testing
});

/**
 * Initialize Sentry system
 */
export const initializeSentry = (config?: Partial<SentryConfig>) => {
  if (config) {
    const customSentry = new SecureSentryIntegration(config);
    customSentry.initialize();
    return customSentry;
  }

  secureSentry.initialize();
  return secureSentry;
};

/**
 * Utility functions for common error scenarios
 */
export const SentryUtils = {
  /**
   * Log authentication error
   */
  logAuthError: (error: Error, context?: Record<string, unknown>) => {
    return secureSentry.logError(
      error,
      ErrorCategory.SECURITY,
      ErrorSeverity.HIGH,
      context
    );
  },

  /**
   * Log validation error
   */
  logValidationError: (message: string, context?: Record<string, unknown>) => {
    return secureSentry.logError(
      message,
      ErrorCategory.VALIDATION,
      ErrorSeverity.MEDIUM,
      context
    );
  },

  /**
   * Log network error
   */
  logNetworkError: (error: Error, context?: Record<string, unknown>) => {
    return secureSentry.logError(
      error,
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      context
    );
  },

  /**
   * Log user action error
   */
  logUserActionError: (
    action: string,
    error: Error,
    context?: Record<string, unknown>
  ) => {
    return secureSentry.logError(
      error,
      ErrorCategory.USER_ACTION,
      ErrorSeverity.LOW,
      {
        action,
        ...context,
      }
    );
  },
};

/**
 * Default export
 */
export default {
  SecureSentryIntegration,
  secureSentry,
  initializeSentry,
  SentryUtils,
  ErrorSeverity,
  ErrorCategory,
};

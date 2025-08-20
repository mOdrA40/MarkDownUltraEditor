/**
 * @fileoverview Enhanced error handling untuk production environment
 * @author MarkDownUltraRemix Security Team
 */

import { safeConsole } from './console';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories untuk better tracking
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  STORAGE = 'storage',
  FILE_OPERATION = 'file_operation',
  UI_INTERACTION = 'ui_interaction',
  SYSTEM = 'system',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
}

/**
 * Error context interface
 */
export interface ErrorContext {
  category: ErrorCategory;
  severity: ErrorSeverity;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  stackTrace?: string;
}

/**
 * Sanitized error untuk production logging
 */
export interface SanitizedError {
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  errorId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Production error handler class
 */
export class ProductionErrorHandler {
  private static instance: ProductionErrorHandler;
  private errorCount = new Map<string, number>();
  private readonly MAX_ERRORS_PER_MINUTE = 10;
  private readonly SENSITIVE_PATTERNS = [
    /password/gi,
    /token/gi,
    /secret/gi,
    /key/gi,
    /auth/gi,
    /session/gi,
    /cookie/gi,
    /bearer/gi,
    /api[_-]?key/gi,
    /access[_-]?token/gi,
    /refresh[_-]?token/gi,
  ];

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ProductionErrorHandler {
    if (!ProductionErrorHandler.instance) {
      ProductionErrorHandler.instance = new ProductionErrorHandler();
    }
    return ProductionErrorHandler.instance;
  }

  /**
   * Handle error dengan comprehensive processing
   */
  public handleError(error: Error | unknown, context: Partial<ErrorContext> = {}): SanitizedError {
    try {
      // Rate limiting untuk error reporting
      const errorKey = this.generateErrorKey(error, context);
      if (!this.checkErrorRateLimit(errorKey)) {
        // Silent fail untuk rate limited errors
        return this.createSanitizedError(
          'Error rate limit exceeded',
          ErrorCategory.SYSTEM,
          ErrorSeverity.LOW
        );
      }

      // Create full context
      const fullContext: ErrorContext = {
        category: context.category || ErrorCategory.SYSTEM,
        severity: context.severity || this.determineSeverity(error),
        userId: context.userId || this.getCurrentUserId(),
        sessionId: context.sessionId || this.getSessionId(),
        userAgent: context.userAgent || this.getUserAgent(),
        url: context.url || this.getCurrentUrl(),
        timestamp: Date.now(),
        metadata: context.metadata,
        stackTrace: this.extractStackTrace(error),
      };

      // Sanitize error
      const sanitizedError = this.sanitizeError(error, fullContext);

      // Log based on environment
      this.logError(sanitizedError, fullContext);

      // Send to monitoring service if available
      this.sendToMonitoring(sanitizedError, fullContext);

      return sanitizedError;
    } catch (handlerError) {
      // Fallback error handling
      safeConsole.error('Error handler failed:', handlerError);
      return this.createSanitizedError(
        'Error handler failed',
        ErrorCategory.SYSTEM,
        ErrorSeverity.CRITICAL
      );
    }
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        metadata: { type: 'unhandled_promise_rejection' },
      });
    });

    // Global errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || event.message, {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        metadata: {
          type: 'global_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Resource loading errors
    window.addEventListener(
      'error',
      (event) => {
        if (event.target && event.target !== window) {
          this.handleError(new Error('Resource loading failed'), {
            category: ErrorCategory.NETWORK,
            severity: ErrorSeverity.MEDIUM,
            metadata: {
              type: 'resource_error',
              tagName: (event.target as Element).tagName,
              src: (() => {
                const target = event.target as Element;
                if ('src' in target) return (target as HTMLImageElement).src;
                if ('href' in target) return (target as HTMLLinkElement).href;
                return undefined;
              })(),
            },
          });
        }
      },
      true
    );
  }

  /**
   * Sanitize error untuk production
   */
  private sanitizeError(error: Error | unknown, context: ErrorContext): SanitizedError {
    let message = 'Unknown error occurred';

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      message = JSON.stringify(error);
    }

    // Remove sensitive information
    message = this.removeSensitiveData(message);

    // Truncate long messages
    if (message.length > 500) {
      message = `${message.substring(0, 500)}...`;
    }

    return {
      message,
      category: context.category,
      severity: context.severity,
      timestamp: context.timestamp,
      errorId: this.generateErrorId(),
      metadata: this.sanitizeMetadata(context.metadata),
    };
  }

  /**
   * Remove sensitive data dari error messages
   */
  private removeSensitiveData(text: string): string {
    let sanitized = text;

    for (const pattern of this.SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }

    // Remove potential URLs with sensitive data
    sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL_REDACTED]');

    // Remove email addresses
    sanitized = sanitized.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      '[EMAIL_REDACTED]'
    );

    return sanitized;
  }

  /**
   * Sanitize metadata
   */
  private sanitizeMetadata(
    metadata?: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    if (!metadata) return undefined;

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(metadata)) {
      // Skip sensitive keys
      if (this.SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      // Sanitize string values
      if (typeof value === 'string') {
        sanitized[key] = this.removeSensitiveData(value);
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize objects (limited depth)
        sanitized[key] = JSON.parse(JSON.stringify(value)).toString().substring(0, 100);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error | unknown): ErrorSeverity {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('network') || message.includes('fetch')) {
        return ErrorSeverity.MEDIUM;
      }

      if (message.includes('auth') || message.includes('permission')) {
        return ErrorSeverity.HIGH;
      }

      if (message.includes('security') || message.includes('unauthorized')) {
        return ErrorSeverity.CRITICAL;
      }
    }

    return ErrorSeverity.MEDIUM;
  }

  /**
   * Check error rate limiting
   */
  private checkErrorRateLimit(errorKey: string): boolean {
    const count = this.errorCount.get(errorKey) || 0;

    if (count >= this.MAX_ERRORS_PER_MINUTE) {
      return false;
    }

    this.errorCount.set(errorKey, count + 1);

    // Cleanup old entries
    setTimeout(() => {
      this.errorCount.delete(errorKey);
    }, 60000);

    return true;
  }

  /**
   * Generate error key untuk rate limiting
   */
  private generateErrorKey(error: Error | unknown, context: Partial<ErrorContext>): string {
    const message = error instanceof Error ? error.message : String(error);
    const category = context.category || 'unknown';
    return `${category}:${message.substring(0, 50)}`;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Extract stack trace safely
   */
  private extractStackTrace(error: Error | unknown): string | undefined {
    if (process.env.NODE_ENV === 'production') {
      return undefined; // Don't include stack traces in production
    }

    if (error instanceof Error && error.stack) {
      return error.stack.split('\n').slice(0, 10).join('\n'); // Limit stack trace
    }

    return undefined;
  }

  /**
   * Log error based on environment
   */
  private logError(sanitizedError: SanitizedError, context: ErrorContext): void {
    if (process.env.NODE_ENV === 'development') {
      safeConsole.error('Error occurred:', {
        ...sanitizedError,
        context: {
          category: context.category,
          severity: context.severity,
          url: context.url,
          userAgent: context.userAgent?.substring(0, 100),
        },
      });
    } else {
      // Production logging - minimal information
      safeConsole.error('Application error:', {
        errorId: sanitizedError.errorId,
        category: sanitizedError.category,
        severity: sanitizedError.severity,
        timestamp: sanitizedError.timestamp,
      });
    }
  }

  /**
   * Send to monitoring service
   */
  private sendToMonitoring(sanitizedError: SanitizedError, _context: ErrorContext): void {
    try {
      // Send to Sentry if available
      if (typeof window !== 'undefined' && 'Sentry' in window) {
        const sentry = (
          window as typeof window & {
            Sentry: {
              captureException: (error: Error, options?: object) => void;
            };
          }
        ).Sentry;
        sentry.captureException(new Error(sanitizedError.message), {
          tags: {
            category: sanitizedError.category,
            severity: sanitizedError.severity,
            errorId: sanitizedError.errorId,
          },
          extra: sanitizedError.metadata,
        });
      }
    } catch (monitoringError) {
      safeConsole.error('Failed to send error to monitoring:', monitoringError);
    }
  }

  /**
   * Helper methods untuk context
   */
  private getCurrentUserId(): string | undefined {
    try {
      // Try to get user ID from Clerk or other auth provider
      return undefined; // Implement based on your auth system
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string | undefined {
    try {
      return sessionStorage.getItem('session_id') || undefined;
    } catch {
      return undefined;
    }
  }

  private getUserAgent(): string | undefined {
    try {
      return navigator.userAgent.substring(0, 200);
    } catch {
      return undefined;
    }
  }

  private getCurrentUrl(): string | undefined {
    try {
      return window.location.href;
    } catch {
      return undefined;
    }
  }

  /**
   * Create sanitized error helper
   */
  private createSanitizedError(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity
  ): SanitizedError {
    return {
      message,
      category,
      severity,
      timestamp: Date.now(),
      errorId: this.generateErrorId(),
    };
  }
}

/**
 * Global error handler instance
 */
export const productionErrorHandler = ProductionErrorHandler.getInstance();

/**
 * Convenience function untuk error handling
 */
export const handleError = (
  error: Error | unknown,
  context?: Partial<ErrorContext>
): SanitizedError => {
  return productionErrorHandler.handleError(error, context);
};

/**
 * Specific error handlers untuk common scenarios
 */
export const handleAuthError = (error: Error | unknown, metadata?: Record<string, unknown>) =>
  handleError(error, {
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    metadata,
  });

export const handleValidationError = (error: Error | unknown, metadata?: Record<string, unknown>) =>
  handleError(error, {
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    metadata,
  });

export const handleNetworkError = (error: Error | unknown, metadata?: Record<string, unknown>) =>
  handleError(error, {
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    metadata,
  });

export const handleSecurityError = (error: Error | unknown, metadata?: Record<string, unknown>) =>
  handleError(error, {
    category: ErrorCategory.SECURITY,
    severity: ErrorSeverity.CRITICAL,
    metadata,
  });

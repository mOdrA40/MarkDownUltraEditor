/**
 * @fileoverview Production-safe error handling system
 * @author Security Team
 * @version 1.0.0
 */

import { safeConsole } from './console';

/**
 * Error types that should be handled silently in production
 */
const SILENT_ERROR_PATTERNS = [
  'Hydration failed',
  'Text content does not match server-rendered HTML',
  'There was an error while hydrating',
  'Warning: Prop',
  'Warning: An error occurred during hydration',
  'X-Frame-Options may only be set via an HTTP header',
  'The resource http://localhost',
  'CSP is blocking external images',
];

/**
 * Sensitive information patterns that should be sanitized
 */
const SENSITIVE_PATTERNS = [
  /api[_-]?key[s]?[:\s=]+[a-zA-Z0-9_-]+/gi,
  /secret[s]?[:\s=]+[a-zA-Z0-9_-]+/gi,
  /token[s]?[:\s=]+[a-zA-Z0-9_.-]+/gi,
  /password[s]?[:\s=]+[^\s]+/gi,
  /dsn[:\s=]+https?:\/\/[^\s]+/gi,
  /supabase[_-]?url[:\s=]+https?:\/\/[^\s]+/gi,
  /clerk[_-]?publishable[_-]?key[:\s=]+[a-zA-Z0-9_-]+/gi,
];

/**
 * Production-safe error handler
 */
export class ProductionErrorHandler {
  private static instance: ProductionErrorHandler;
  private isProduction: boolean;
  private errorCount = 0;
  private maxErrors = 50; // Prevent error spam

  private constructor() {
    this.isProduction = import.meta.env.PROD;
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ProductionErrorHandler {
    if (!ProductionErrorHandler.instance) {
      ProductionErrorHandler.instance = new ProductionErrorHandler();
    }
    return ProductionErrorHandler.instance;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'unhandledrejection');

      // Prevent default browser behavior in production
      if (this.isProduction) {
        event.preventDefault();
      }
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || event.message, 'global-error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle React errors (if using error boundary)
    this.setupReactErrorHandler();
  }

  /**
   * Setup React error boundary handler
   */
  private setupReactErrorHandler(): void {
    const originalConsoleError = console.error;

    console.error = (...args) => {
      const message = args[0];

      if (typeof message === 'string') {
        // Handle React hydration errors silently in production
        if (this.shouldSilenceError(message)) {
          if (!this.isProduction) {
            safeConsole.dev('Silenced React error:', message);
          }
          return;
        }

        // Sanitize sensitive information
        const sanitizedArgs = args.map((arg) =>
          typeof arg === 'string' ? this.sanitizeMessage(arg) : arg
        );

        this.handleError(sanitizedArgs[0], 'react-error');
      }

      // Call original console.error in development
      if (!this.isProduction) {
        originalConsoleError.apply(console, args);
      }
    };
  }

  /**
   * Check if error should be silenced in production
   */
  private shouldSilenceError(message: string): boolean {
    if (!this.isProduction) {
      return false;
    }

    return SILENT_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
  }

  /**
   * Sanitize error message from sensitive information
   */
  private sanitizeMessage(message: string): string {
    let sanitized = message;

    SENSITIVE_PATTERNS.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  /**
   * Handle error with appropriate logging
   */
  private handleError(error: unknown, source: string, metadata?: Record<string, unknown>): void {
    // Prevent error spam
    if (this.errorCount >= this.maxErrors) {
      return;
    }

    this.errorCount++;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const sanitizedMessage = this.sanitizeMessage(errorMessage);

    // Skip if should be silenced
    if (this.shouldSilenceError(sanitizedMessage)) {
      return;
    }

    // Log appropriately based on environment
    if (this.isProduction) {
      // In production, log minimal information
      safeConsole.error('Application error occurred', {
        source,
        timestamp: new Date().toISOString(),
        ...(metadata && { metadata }),
      });

      // Send to monitoring service (Sentry) if available
      this.sendToMonitoring(sanitizedMessage, source, metadata);
    } else {
      // In development, log full details
      safeConsole.error(`[${source}] Error:`, error, metadata);
    }
  }

  /**
   * Send error to monitoring service
   */
  private sendToMonitoring(
    message: string,
    source: string,
    metadata?: Record<string, unknown>
  ): void {
    try {
      // Import Sentry dynamically to avoid issues if not available
      import('@sentry/react')
        .then(({ captureException }) => {
          const error = new Error(message);
          error.name = `ProductionError_${source}`;

          captureException(error, {
            tags: {
              source,
              handled: true,
            },
            extra: metadata,
          });
        })
        .catch(() => {
          // Sentry not available, ignore silently
        });
    } catch {
      // Ignore monitoring errors
    }
  }

  /**
   * Reset error count (useful for testing)
   */
  public resetErrorCount(): void {
    this.errorCount = 0;
  }

  /**
   * Get current error count
   */
  public getErrorCount(): number {
    return this.errorCount;
  }
}

/**
 * Initialize production error handler
 */
export const initializeErrorHandler = (): ProductionErrorHandler => {
  return ProductionErrorHandler.getInstance();
};

/**
 * Utility function to handle async errors safely
 */
export const safeAsync = async <T>(
  asyncFn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> => {
  try {
    return await asyncFn();
  } catch (_error) {
    ProductionErrorHandler.getInstance();
    return fallback;
  }
};

/**
 * Utility function to handle sync operations safely
 */
export const safeSync = <T>(syncFn: () => T, fallback?: T): T | undefined => {
  try {
    return syncFn();
  } catch (_error) {
    ProductionErrorHandler.getInstance();
    return fallback;
  }
};

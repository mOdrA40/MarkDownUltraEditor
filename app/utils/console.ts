/**
 * @fileoverview Console protection and logging utilities for production security
 * @author Security Team
 * @version 1.0.0
 */

/**
 * Console protection configuration
 */
interface ConsoleProtectionConfig {
  readonly disableInProduction: boolean;
  readonly allowedMethods: readonly string[];
  readonly showWarningMessage: boolean;
  readonly enableAntiDebug: boolean;
}

/**
 * Default console protection configuration
 */
const DEFAULT_CONFIG: ConsoleProtectionConfig = {
  disableInProduction: true,
  allowedMethods: ['error'], // Only allow error logging in production
  showWarningMessage: true,
  enableAntiDebug: true,
};

/**
 * Original console methods backup
 */
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
  trace: console.trace,
  group: console.group,
  groupEnd: console.groupEnd,
  groupCollapsed: console.groupCollapsed,
  table: console.table,
  time: console.time,
  timeEnd: console.timeEnd,
  clear: console.clear,
};

/**
 * Security warning message
 */
const SECURITY_WARNING = `
🚨 SECURITY WARNING 🚨
This is a browser feature intended for developers. 
If someone told you to copy-paste something here, it's likely a scam.
Pasting malicious code here can compromise your account and data.
`;

/**
 * No-operation function for disabled console methods
 */
const noop = () => {
  // Intentionally empty - used to disable console methods
};

/**
 * Protected console method that shows warning
 */
const protectedMethod =
  (method: string) =>
  (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // biome-ignore lint/suspicious/noExplicitAny: Console methods need dynamic access
      (originalConsole as any)[method](...args);
    } else {
      // Show security warning in production
      originalConsole.warn(SECURITY_WARNING);
    }
  };

/**
 * Console protection class
 */
export class ConsoleProtection {
  private config: ConsoleProtectionConfig;
  private isProtected = false;
  private debuggerDetectionInterval?: NodeJS.Timeout;

  constructor(config: Partial<ConsoleProtectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Enable console protection
   */
  public enable(): void {
    if (this.isProtected || process.env.NODE_ENV === 'development') {
      return;
    }

    // Disable console methods
    this.disableConsoleMethods();

    // Enable anti-debugging measures
    if (this.config.enableAntiDebug) {
      this.enableAntiDebug();
    }

    this.isProtected = true;
    console.info('🔒 Console protection enabled');
  }

  /**
   * Disable console protection (for development)
   */
  public disable(): void {
    if (!this.isProtected) return;

    // Restore original console methods
    Object.assign(console, originalConsole);

    // Clear debugger detection
    if (this.debuggerDetectionInterval) {
      clearInterval(this.debuggerDetectionInterval);
    }

    this.isProtected = false;
    console.info('🔓 Console protection disabled');
  }

  /**
   * Disable console methods based on configuration
   */
  private disableConsoleMethods(): void {
    const methodsToDisable = Object.keys(originalConsole).filter(
      (method) => !this.config.allowedMethods.includes(method)
    );

    methodsToDisable.forEach((method) => {
      if (this.config.showWarningMessage) {
        // biome-ignore lint/suspicious/noExplicitAny: Console methods need dynamic access
        (console as any)[method] = protectedMethod(method);
      } else {
        // biome-ignore lint/suspicious/noExplicitAny: Console methods need dynamic access
        (console as any)[method] = noop;
      }
    });
  }

  /**
   * Enable anti-debugging measures
   */
  private enableAntiDebug(): void {
    // Detect debugger
    this.debuggerDetectionInterval = setInterval(() => {
      const start = performance.now();
      // biome-ignore lint/suspicious/noDebugger: Intentional debugger detection
      debugger; // This will pause if debugger is open
      const end = performance.now();

      // If debugger was open, the time difference will be significant
      if (end - start > 100) {
        this.handleDebuggerDetected();
      }
    }, 1000);

    // Detect DevTools by console.clear behavior
    const devtools = { open: false };
    const threshold = 160;

    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true;
          this.handleDevToolsDetected();
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Prevent right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Prevent F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
    });
  }

  /**
   * Handle debugger detection
   */
  private handleDebuggerDetected(): void {
    console.warn('🚨 Debugger detected - Security monitoring active');

    // You can add additional security measures here
    // For example, log to security monitoring system
    // biome-ignore lint/suspicious/noExplicitAny: Global security monitor access
    if (typeof window !== 'undefined' && (window as any).securityMonitor) {
      // biome-ignore lint/suspicious/noExplicitAny: Global security monitor access
      (window as any).securityMonitor.logEvent({
        type: 'debugger_detected',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
    }
  }

  /**
   * Handle DevTools detection
   */
  private handleDevToolsDetected(): void {
    console.warn('🚨 Developer Tools detected - Security monitoring active');

    // Log security event
    // biome-ignore lint/suspicious/noExplicitAny: Global security monitor access
    if (typeof window !== 'undefined' && (window as any).securityMonitor) {
      // biome-ignore lint/suspicious/noExplicitAny: Global security monitor access
      (window as any).securityMonitor.logEvent({
        type: 'devtools_detected',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
    }
  }

  /**
   * Get protection status
   */
  public isEnabled(): boolean {
    return this.isProtected;
  }
}

/**
 * Sanitize error messages to remove sensitive information
 */
const sanitizeErrorMessage = (message: string): string => {
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
    /VITE_[A-Z_]+[=:]\s*[^\s]+/gi, // Environment variables
    /supabase[_-]?url[=:]\s*[^\s]+/gi,
    /clerk[_-]?key[=:]\s*[^\s]+/gi,
    /sentry[_-]?dsn[=:]\s*[^\s]+/gi,
  ];

  let sanitized = message;
  sensitivePatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });

  return sanitized;
};

/**
 * Global console protection instance
 */
export const consoleProtection = new ConsoleProtection();

/**
 * Safe console methods that work in both development and production
 */
export const safeConsole = {
  /**
   * Development-only logging
   */
  dev: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development' && !import.meta.env?.VITE_PRODUCTION_BUILD) {
      // Filter out noisy debug messages
      const message = args[0];
      if (
        typeof message === 'string' &&
        (message.includes('Heading Cache Debug') ||
          message.includes('Production safety audit') ||
          message.includes('Global Theme applied'))
      ) {
        return; // Skip noisy debug messages
      }
      originalConsole.log('[DEV]', ...args);
    }
  },

  /**
   * Production-safe error logging (sanitized)
   */
  error: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'production') {
      // In production, sanitize error messages
      const sanitizedArgs = args.map((arg) => {
        if (typeof arg === 'string') {
          return sanitizeErrorMessage(arg);
        }
        if (arg instanceof Error) {
          return new Error(sanitizeErrorMessage(arg.message));
        }
        return '[REDACTED]';
      });
      originalConsole.error(...sanitizedArgs);
    } else {
      originalConsole.error(...args);
    }
  },

  /**
   * Conditional logging based on environment (development only)
   */
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      originalConsole.log(...args);
    }
    // Completely silent in production
  },

  /**
   * Warning logging (development only)
   */
  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      originalConsole.warn(...args);
    }
    // Completely silent in production
  },

  /**
   * Performance logging (development only)
   */
  perf: (message: string, duration?: number) => {
    if (process.env.NODE_ENV === 'development') {
      const perfMessage = duration ? `⚡ ${message}: ${duration.toFixed(2)}ms` : `⚡ ${message}`;
      originalConsole.log(perfMessage);
    }
    // Completely silent in production
  },

  /**
   * Security logging (production-safe, sanitized)
   */
  security: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'production') {
      // In production, only log sanitized security events
      const sanitizedArgs = args.map((arg) => {
        if (typeof arg === 'string') {
          return sanitizeErrorMessage(arg);
        }
        return '[SECURITY_EVENT]';
      });
      originalConsole.warn('🔒 [SECURITY]', ...sanitizedArgs);
    } else {
      originalConsole.warn('🔒 [SECURITY]', ...args);
    }
  },

  /**
   * Group logging (development only)
   */
  group: (label: string, callback: () => void) => {
    if (process.env.NODE_ENV === 'development') {
      originalConsole.group(label);
      callback();
      originalConsole.groupEnd();
    }
    // Completely silent in production
  },

  /**
   * Info logging (development only)
   */
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      originalConsole.info(...args);
    }
    // Completely silent in production
  },

  /**
   * Debug logging (development only)
   */
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      originalConsole.debug(...args);
    }
    // Completely silent in production
  },
};

/**
 * Initialize console protection
 */
export const initializeConsoleProtection = (config?: Partial<ConsoleProtectionConfig>) => {
  if (typeof window === 'undefined') return;

  const protection = new ConsoleProtection(config);

  // Enable protection in production
  if (process.env.NODE_ENV === 'production') {
    protection.enable();
  }

  // Make available globally for debugging
  // biome-ignore lint/suspicious/noExplicitAny: Global console protection access
  (window as any).consoleProtection = protection;

  return protection;
};

/**
 * Default export
 */
export default {
  ConsoleProtection,
  consoleProtection,
  safeConsole,
  initializeConsoleProtection,
};

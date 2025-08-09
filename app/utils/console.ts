/**
 * @fileoverview Simplified console utilities for development
 * @author Axel Modra
 * @version 2.0.0
 */

/**
 * Check if we're in a development environment
 */
const isDevelopment = (): boolean => {
  return (
    process.env.NODE_ENV === 'development' ||
    import.meta.env?.MODE === 'development' ||
    import.meta.env?.DEV === true ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  );
};

/**
 * Simplified safe console that works in both development and production
 * Production console removal is handled by build process (vite.config.ts)
 */
export const safeConsole = {
  /**
   * Development-only logging
   */
  dev: (...args: unknown[]): void => {
    if (isDevelopment()) {
      console.log('[DEV]', ...args);
    }
  },

  /**
   * Always available error logging
   */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },

  /**
   * Always available warning logging
   */
  warn: (...args: unknown[]): void => {
    console.warn(...args);
  },

  /**
   * Production-safe info logging
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment()) {
      console.info(...args);
    }
  },

  /**
   * Production-safe debug logging
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment()) {
      console.debug(...args);
    }
  },

  /**
   * Production-safe general logging
   */
  log: (...args: unknown[]): void => {
    if (isDevelopment()) {
      console.log(...args);
    }
  },

  /**
   * Performance logging (development only)
   */
  perf: (message: string, duration?: number): void => {
    if (isDevelopment()) {
      const perfMessage = duration ? `⚡ ${message}: ${duration.toFixed(2)}ms` : `⚡ ${message}`;
      console.log(perfMessage);
    }
  },

  /**
   * Group logging (development only)
   */
  group: (label: string, callback: () => void): void => {
    if (isDevelopment()) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  },
};

/**
 * Export utilities
 */
export { isDevelopment };

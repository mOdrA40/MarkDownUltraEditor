/**
 * @fileoverview Client-side rate limiting utility untuk mencegah abuse
 * @author MarkDownUltraRemix Security Team
 */

import { safeConsole } from './console';

/**
 * Interface untuk rate limiter configuration
 */
interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (context: string) => string;
  onLimitExceeded?: (key: string, attempts: number) => void;
}

/**
 * Interface untuk request tracking
 */
interface RequestRecord {
  timestamp: number;
  count: number;
}

/**
 * Client-side rate limiter class
 * Menggunakan localStorage untuk persistence dan memory untuk performance
 */
export class ClientRateLimiter {
  private requests = new Map<string, RequestRecord[]>();
  private config: Required<RateLimiterConfig>;
  private readonly STORAGE_KEY = 'rate_limiter_data';
  private readonly MAX_STORAGE_ENTRIES = 100;

  constructor(config: RateLimiterConfig) {
    this.config = {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      keyGenerator: config.keyGenerator || ((context: string) => context),
      onLimitExceeded:
        config.onLimitExceeded ||
        (() => {
          // Default empty handler
        }),
    };

    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      // Load existing data from localStorage
      this.loadFromStorage();

      // Cleanup old entries periodically
      this.scheduleCleanup();
    }
  }

  /**
   * Check if request is allowed
   */
  isAllowed(context: string, userIdentifier?: string): boolean {
    const key = this.generateKey(context, userIdentifier);
    const now = Date.now();

    // Get or create request records for this key
    let records = this.requests.get(key) || [];

    // Remove expired records
    records = records.filter((record) => now - record.timestamp < this.config.windowMs);

    // Count total requests in current window
    const totalRequests = records.reduce((sum, record) => sum + record.count, 0);

    if (totalRequests >= this.config.maxRequests) {
      // Rate limit exceeded
      this.config.onLimitExceeded(key, totalRequests);

      safeConsole.warn('Rate limit exceeded:', {
        key,
        totalRequests,
        maxRequests: this.config.maxRequests,
        windowMs: this.config.windowMs,
      });

      return false;
    }

    // Add new request record
    const existingRecord = records.find(
      (record) => now - record.timestamp < 1000 // Group requests within 1 second
    );

    if (existingRecord) {
      existingRecord.count++;
    } else {
      records.push({ timestamp: now, count: 1 });
    }

    // Update storage
    this.requests.set(key, records);
    this.saveToStorage();

    return true;
  }

  /**
   * Get current usage for a context
   */
  getCurrentUsage(
    context: string,
    userIdentifier?: string
  ): {
    requests: number;
    maxRequests: number;
    resetTime: number;
  } {
    const key = this.generateKey(context, userIdentifier);
    const now = Date.now();
    const records = this.requests.get(key) || [];

    // Filter valid records
    const validRecords = records.filter((record) => now - record.timestamp < this.config.windowMs);

    const totalRequests = validRecords.reduce((sum, record) => sum + record.count, 0);
    const oldestRecord =
      validRecords.length > 0 ? Math.min(...validRecords.map((r) => r.timestamp)) : now;

    return {
      requests: totalRequests,
      maxRequests: this.config.maxRequests,
      resetTime: oldestRecord + this.config.windowMs,
    };
  }

  /**
   * Reset rate limit for specific key
   */
  reset(context: string, userIdentifier?: string): void {
    const key = this.generateKey(context, userIdentifier);
    this.requests.delete(key);
    this.saveToStorage();
  }

  /**
   * Clear all rate limit data
   */
  clearAll(): void {
    this.requests.clear();

    // Skip localStorage operations if not in browser
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      safeConsole.error('Failed to clear rate limiter storage:', error);
    }
  }

  /**
   * Generate unique key for rate limiting
   */
  private generateKey(context: string, userIdentifier?: string): string {
    const baseKey = this.config.keyGenerator(context);
    const identifier = userIdentifier || this.getClientIdentifier();
    return `${baseKey}:${identifier}`;
  }

  /**
   * Get client identifier (IP simulation using browser fingerprint)
   */
  private getClientIdentifier(): string {
    try {
      // Create a simple browser fingerprint
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset(),
      ].join('|');

      // Simple hash function
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash &= hash; // Convert to 32-bit integer
      }

      return Math.abs(hash).toString(36);
    } catch {
      return 'anonymous';
    }
  }

  /**
   * Load data from localStorage (browser only)
   */
  private loadFromStorage(): void {
    // Skip if not in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();

        // Convert and filter expired data
        Object.entries(data).forEach(([key, records]) => {
          const validRecords = (records as RequestRecord[]).filter(
            (record) => now - record.timestamp < this.config.windowMs
          );

          if (validRecords.length > 0) {
            this.requests.set(key, validRecords);
          }
        });
      }
    } catch (error) {
      safeConsole.error('Failed to load rate limiter data from storage:', error);
    }
  }

  /**
   * Save data to localStorage
   */
  private saveToStorage(): void {
    // Skip if not in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      // Limit storage size
      if (this.requests.size > this.MAX_STORAGE_ENTRIES) {
        const entries = Array.from(this.requests.entries());
        const sortedEntries = entries.sort((a, b) => {
          const aLatest = Math.max(...a[1].map((r) => r.timestamp));
          const bLatest = Math.max(...b[1].map((r) => r.timestamp));
          return bLatest - aLatest;
        });

        this.requests.clear();
        sortedEntries.slice(0, this.MAX_STORAGE_ENTRIES).forEach(([key, records]) => {
          this.requests.set(key, records);
        });
      }

      const data = Object.fromEntries(this.requests);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      safeConsole.error('Failed to save rate limiter data to storage:', error);
    }
  }

  /**
   * Schedule periodic cleanup
   */
  private scheduleCleanup(): void {
    // Skip if not in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    setInterval(
      () => {
        const now = Date.now();
        let hasChanges = false;

        for (const [key, records] of this.requests.entries()) {
          const validRecords = records.filter(
            (record) => now - record.timestamp < this.config.windowMs
          );

          if (validRecords.length !== records.length) {
            hasChanges = true;
            if (validRecords.length === 0) {
              this.requests.delete(key);
            } else {
              this.requests.set(key, validRecords);
            }
          }
        }

        if (hasChanges) {
          this.saveToStorage();
        }
      },
      Math.min(this.config.windowMs / 4, 60000)
    ); // Cleanup every 1/4 window or 1 minute max
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // File operations: 50 requests per minute
  fileOperations: new ClientRateLimiter({
    maxRequests: 50,
    windowMs: 60 * 1000,
    onLimitExceeded: (key, attempts) => {
      safeConsole.warn(`File operations rate limit exceeded for ${key}: ${attempts} attempts`);
    },
  }),

  // API calls: 100 requests per minute
  apiCalls: new ClientRateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000,
    onLimitExceeded: (key, attempts) => {
      safeConsole.warn(`API rate limit exceeded for ${key}: ${attempts} attempts`);
    },
  }),

  // Authentication: 10 attempts per 5 minutes
  authentication: new ClientRateLimiter({
    maxRequests: 10,
    windowMs: 5 * 60 * 1000,
    onLimitExceeded: (key, attempts) => {
      safeConsole.warn(`Auth rate limit exceeded for ${key}: ${attempts} attempts`);
    },
  }),

  // Export operations: 5 requests per minute (resource intensive)
  exports: new ClientRateLimiter({
    maxRequests: 5,
    windowMs: 60 * 1000,
    onLimitExceeded: (key, attempts) => {
      safeConsole.warn(`Export rate limit exceeded for ${key}: ${attempts} attempts`);
    },
  }),
};

/**
 * Utility function untuk check rate limit dengan error handling
 */
export const checkRateLimit = (
  limiter: ClientRateLimiter,
  context: string,
  userIdentifier?: string
): boolean => {
  try {
    return limiter.isAllowed(context, userIdentifier);
  } catch (error) {
    safeConsole.error('Rate limiter error:', error);
    // Fail open - allow request if rate limiter fails
    return true;
  }
};

/**
 * Hook untuk rate limiting dalam React components
 */
export const useRateLimit = (limiter: ClientRateLimiter, context: string) => {
  const isAllowed = (userIdentifier?: string) => checkRateLimit(limiter, context, userIdentifier);

  const getCurrentUsage = (userIdentifier?: string) =>
    limiter.getCurrentUsage(context, userIdentifier);

  const reset = (userIdentifier?: string) => limiter.reset(context, userIdentifier);

  return { isAllowed, getCurrentUsage, reset };
};

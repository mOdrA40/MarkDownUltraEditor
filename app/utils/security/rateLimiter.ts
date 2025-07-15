/**
 * @fileoverview Advanced rate limiting service for enterprise security
 * @author Security Team
 * @version 1.0.0
 */

import { createSecurityEvent } from './core';
import {
  type RateLimitConfig,
  RateLimitStrategy,
  SECURITY_CONSTANTS,
  type SecurityEvent,
  SecurityEventType,
  type SecurityRequest,
  SecurityRiskLevel,
} from './types';

/**
 * Rate limit entry interface
 */
interface RateLimitEntry {
  readonly count: number;
  readonly windowStart: number;
  readonly tokens: number;
  readonly lastRefill: number;
}

/**
 * Rate limiter class with multiple strategies
 */
export class RateLimiter {
  private readonly storage = new Map<string, RateLimitEntry>();
  private readonly config: RateLimitConfig;
  private readonly cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // Cleanup expired entries every minute
    if (typeof window === 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 60000);
    }
  }

  /**
   * Check if request is within rate limit
   */
  public checkLimit(request: SecurityRequest): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    securityEvent?: SecurityEvent;
  } {
    const key = this.generateKey(request);
    const now = Date.now();

    // Check whitelist
    if (this.config.whitelist?.includes(request.ip || '')) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }

    // Check blacklist
    if (this.config.blacklist?.includes(request.ip || '')) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + this.config.windowMs,
        securityEvent: createSecurityEvent(
          SecurityEventType.RATE_LIMIT_EXCEEDED,
          { reason: 'IP in blacklist', ip: request.ip },
          SecurityRiskLevel.HIGH
        ),
      };
    }

    const entry = this.storage.get(key);

    switch (this.config.strategy) {
      case RateLimitStrategy.FIXED_WINDOW:
        return this.checkFixedWindow(key, entry, now, request);
      case RateLimitStrategy.SLIDING_WINDOW:
        return this.checkSlidingWindow(key, entry, now, request);
      case RateLimitStrategy.TOKEN_BUCKET:
        return this.checkTokenBucket(key, entry, now, request);
      case RateLimitStrategy.LEAKY_BUCKET:
        return this.checkLeakyBucket(key, entry, now, request);
      default:
        return this.checkFixedWindow(key, entry, now, request);
    }
  }

  /**
   * Fixed window rate limiting
   */
  private checkFixedWindow(
    key: string,
    entry: RateLimitEntry | undefined,
    now: number,
    request: SecurityRequest
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    securityEvent?: SecurityEvent;
  } {
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs;
    const resetTime = windowStart + this.config.windowMs;

    if (!entry || entry.windowStart !== windowStart) {
      // New window
      this.storage.set(key, {
        count: 1,
        windowStart,
        tokens: this.config.maxRequests - 1,
        lastRefill: now,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        securityEvent: createSecurityEvent(
          SecurityEventType.RATE_LIMIT_EXCEEDED,
          {
            strategy: 'fixed_window',
            count: entry.count,
            limit: this.config.maxRequests,
            ip: request.ip,
            url: request.url,
          },
          SecurityRiskLevel.MEDIUM
        ),
      };
    }

    // Update count
    this.storage.set(key, {
      ...entry,
      count: entry.count + 1,
    });

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count - 1,
      resetTime,
    };
  }

  /**
   * Sliding window rate limiting
   */
  private checkSlidingWindow(
    key: string,
    entry: RateLimitEntry | undefined,
    now: number,
    request: SecurityRequest
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    securityEvent?: SecurityEvent;
  } {
    const windowStart = now - this.config.windowMs;

    if (!entry || entry.windowStart < windowStart) {
      // New or expired window
      this.storage.set(key, {
        count: 1,
        windowStart: now,
        tokens: this.config.maxRequests - 1,
        lastRefill: now,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    // Calculate sliding window count
    const timeInWindow = now - entry.windowStart;
    const slidingCount = Math.ceil(entry.count * (timeInWindow / this.config.windowMs));

    if (slidingCount >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.windowStart + this.config.windowMs,
        securityEvent: createSecurityEvent(
          SecurityEventType.RATE_LIMIT_EXCEEDED,
          {
            strategy: 'sliding_window',
            count: slidingCount,
            limit: this.config.maxRequests,
            ip: request.ip,
            url: request.url,
          },
          SecurityRiskLevel.MEDIUM
        ),
      };
    }

    // Update entry
    this.storage.set(key, {
      count: entry.count + 1,
      windowStart: entry.windowStart,
      tokens: this.config.maxRequests - slidingCount - 1,
      lastRefill: now,
    });

    return {
      allowed: true,
      remaining: this.config.maxRequests - slidingCount - 1,
      resetTime: entry.windowStart + this.config.windowMs,
    };
  }

  /**
   * Token bucket rate limiting
   */
  private checkTokenBucket(
    key: string,
    entry: RateLimitEntry | undefined,
    now: number,
    request: SecurityRequest
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    securityEvent?: SecurityEvent;
  } {
    const refillRate = this.config.maxRequests / (this.config.windowMs / 1000); // tokens per second

    if (!entry) {
      // New bucket
      this.storage.set(key, {
        count: 0,
        windowStart: now,
        tokens: this.config.maxRequests - 1,
        lastRefill: now,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + 1000 / refillRate,
      };
    }

    // Refill tokens
    const timePassed = (now - entry.lastRefill) / 1000;
    const tokensToAdd = Math.floor(timePassed * refillRate);
    const currentTokens = Math.min(this.config.maxRequests, entry.tokens + tokensToAdd);

    if (currentTokens < 1) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + ((1 - currentTokens) * 1000) / refillRate,
        securityEvent: createSecurityEvent(
          SecurityEventType.RATE_LIMIT_EXCEEDED,
          {
            strategy: 'token_bucket',
            tokens: currentTokens,
            limit: this.config.maxRequests,
            ip: request.ip,
            url: request.url,
          },
          SecurityRiskLevel.MEDIUM
        ),
      };
    }

    // Consume token
    this.storage.set(key, {
      count: entry.count + 1,
      windowStart: entry.windowStart,
      tokens: currentTokens - 1,
      lastRefill: now,
    });

    return {
      allowed: true,
      remaining: currentTokens - 1,
      resetTime: now + 1000 / refillRate,
    };
  }

  /**
   * Leaky bucket rate limiting
   */
  private checkLeakyBucket(
    key: string,
    entry: RateLimitEntry | undefined,
    now: number,
    request: SecurityRequest
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    securityEvent?: SecurityEvent;
  } {
    const leakRate = this.config.maxRequests / (this.config.windowMs / 1000); // requests per second

    if (!entry) {
      // New bucket
      this.storage.set(key, {
        count: 1,
        windowStart: now,
        tokens: this.config.maxRequests - 1,
        lastRefill: now,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + 1000 / leakRate,
      };
    }

    // Leak requests
    const timePassed = (now - entry.lastRefill) / 1000;
    const requestsToLeak = Math.floor(timePassed * leakRate);
    const currentCount = Math.max(0, entry.count - requestsToLeak);

    if (currentCount >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + ((currentCount - this.config.maxRequests + 1) * 1000) / leakRate,
        securityEvent: createSecurityEvent(
          SecurityEventType.RATE_LIMIT_EXCEEDED,
          {
            strategy: 'leaky_bucket',
            count: currentCount,
            limit: this.config.maxRequests,
            ip: request.ip,
            url: request.url,
          },
          SecurityRiskLevel.MEDIUM
        ),
      };
    }

    // Add request to bucket
    this.storage.set(key, {
      count: currentCount + 1,
      windowStart: entry.windowStart,
      tokens: this.config.maxRequests - currentCount - 1,
      lastRefill: now,
    });

    return {
      allowed: true,
      remaining: this.config.maxRequests - currentCount - 1,
      resetTime: now + 1000 / leakRate,
    };
  }

  /**
   * Generate rate limit key
   */
  private generateKey(request: SecurityRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request);
    }

    // Default key generation
    const parts = [request.ip || 'unknown', request.url, request.userId || 'anonymous'];

    return parts.join(':');
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.storage.entries()) {
      if (now - entry.windowStart > this.config.windowMs * 2) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.storage.delete(key);
    }
  }

  /**
   * Get current stats
   */
  public getStats(): {
    totalEntries: number;
    activeWindows: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    let activeWindows = 0;

    for (const entry of this.storage.values()) {
      if (now - entry.windowStart <= this.config.windowMs) {
        activeWindows++;
      }
    }

    return {
      totalEntries: this.storage.size,
      activeWindows,
      memoryUsage: this.storage.size * 100, // Rough estimate in bytes
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  public reset(request: SecurityRequest): void {
    const key = this.generateKey(request);
    this.storage.delete(key);
  }

  /**
   * Destroy rate limiter
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.storage.clear();
  }
}

/**
 * Rate limiter factory
 */
export const createRateLimiter = (config: Partial<RateLimitConfig> = {}): RateLimiter => {
  const defaultConfig: RateLimitConfig = {
    strategy: RateLimitStrategy.FIXED_WINDOW,
    windowMs: SECURITY_CONSTANTS.RATE_LIMIT_WINDOW_MS,
    maxRequests: SECURITY_CONSTANTS.DEFAULT_RATE_LIMIT,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  };

  return new RateLimiter({ ...defaultConfig, ...config });
};

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict rate limiter for authentication endpoints
  auth: createRateLimiter({
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req) => `auth:${req.ip}`,
  }),

  // API rate limiter
  api: createRateLimiter({
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyGenerator: (req) => `api:${req.userId || req.ip}`,
  }),

  // File upload rate limiter
  upload: createRateLimiter({
    strategy: RateLimitStrategy.LEAKY_BUCKET,
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyGenerator: (req) => `upload:${req.userId || req.ip}`,
  }),

  // General rate limiter
  general: createRateLimiter({
    strategy: RateLimitStrategy.FIXED_WINDOW,
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
    keyGenerator: (req) => `general:${req.ip}`,
  }),
};

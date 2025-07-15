/**
 * @fileoverview Simple Rate Limiting for React Router v7 on Vercel Free Plan
 * @author Security Team
 * @version 1.0.0
 */

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

/**
 * In-memory rate limiting store
 * Note: This resets on each deployment/restart
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiter
 */
export class SimpleRateLimit {
  public config: RateLimitConfig;
  private keyPrefix: string;

  constructor(config: RateLimitConfig, keyPrefix = 'rate_limit') {
    this.config = config;
    this.keyPrefix = keyPrefix;
  }

  checkLimit(identifier: string): RateLimitResult {
    const key = `${this.keyPrefix}:${identifier}`;
    const now = Date.now();

    const current = rateLimitStore.get(key);

    if (!current || now > current.resetTime) {
      const resetTime = now + this.config.windowMs;
      rateLimitStore.set(key, { count: 1, resetTime });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
        totalHits: 1,
      };
    }

    current.count++;
    rateLimitStore.set(key, current);

    const allowed = current.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - current.count);

    return {
      allowed,
      remaining,
      resetTime: current.resetTime,
      totalHits: current.count,
    };
  }

  static cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Pre-configured rate limiters
 */
export const rateLimiters = {
  general: new SimpleRateLimit(
    {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
    },
    'general'
  ),

  api: new SimpleRateLimit(
    {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 50,
    },
    'api'
  ),

  auth: new SimpleRateLimit(
    {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10,
    },
    'auth'
  ),

  upload: new SimpleRateLimit(
    {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 20,
    },
    'upload'
  ),
};

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const vercelIP = request.headers.get('x-vercel-forwarded-for');

  if (vercelIP) return vercelIP.split(',')[0].trim();
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;

  return 'unknown';
}

/**
 * Rate limiting check function
 */
export function checkRateLimit(
  request: Request,
  type: 'general' | 'api' | 'auth' | 'upload' = 'general',
  identifier?: string
): RateLimitResult {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return {
      allowed: true,
      remaining: 999,
      resetTime: Date.now() + 900000,
      totalHits: 1,
    };
  }

  const limiter = rateLimiters[type];
  const ip = identifier || getClientIP(request);
  const result = limiter.checkLimit(ip);

  // Cleanup expired entries occasionally
  if (Math.random() < 0.01) {
    SimpleRateLimit.cleanupExpiredEntries();
  }

  return result;
}

/**
 * Throw rate limit error response
 */
export function throwRateLimitError(result: RateLimitResult, config: RateLimitConfig): never {
  throw new Response('Rate limit exceeded', {
    status: 429,
    headers: {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
      'X-RateLimit-Window': (config.windowMs / 1000).toString(),
      'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
      'Content-Type': 'application/json',
    },
    statusText: 'Too Many Requests',
  });
}

/**
 * Rate limiting middleware for React Router v7
 */
export function withRateLimit(type: 'general' | 'api' | 'auth' | 'upload' = 'general') {
  return (request: Request, identifier?: string) => {
    const result = checkRateLimit(request, type, identifier);

    if (!result.allowed) {
      const limiter = rateLimiters[type];
      throwRateLimitError(result, limiter.config);
    }

    return result;
  };
}

/**
 * Example usage in React Router v7 loader:
 *
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   // Check rate limit
 *   withRateLimit('api')(request);
 *
 *   // Your loader logic here
 *   return json({ data: 'success' });
 * }
 */

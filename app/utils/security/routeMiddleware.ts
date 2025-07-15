/**
 * @fileoverview Security middleware untuk React Router v7 routes
 * @author Security Team
 * @version 1.0.0
 */

import { getAuth } from '@clerk/react-router/ssr.server';
import type { LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { extractIPFromHeaders } from '@/utils/ipDetection';
import { createSecurityEvent } from './core';
import { securityMonitor } from './monitoring';
import { rateLimiters } from './rateLimiter';
import { SecurityEventType, type SecurityRequest, SecurityRiskLevel } from './types';
import { inputValidator, ValidationSchemas } from './validation';

/**
 * Security middleware options
 */
interface SecurityMiddlewareOptions {
  requireAuth?: boolean;
  rateLimitKey?: 'auth' | 'api' | 'upload' | 'general';
  validateInput?: boolean;
  logAccess?: boolean;
  allowedRoles?: string[];
}

/**
 * Default security options
 */
const DEFAULT_OPTIONS: SecurityMiddlewareOptions = {
  requireAuth: true,
  rateLimitKey: 'general',
  validateInput: true,
  logAccess: true,
  allowedRoles: [],
};

/**
 * Create security middleware for routes
 */
export function createSecurityMiddleware(options: SecurityMiddlewareOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return async function securityMiddleware(args: LoaderFunctionArgs) {
    const { request } = args;
    const url = new URL(request.url);

    // Create security request object with improved IP detection
    const securityRequest: SecurityRequest = {
      method: request.method,
      url: url.pathname,
      headers: Object.fromEntries(request.headers.entries()),
      ip: extractIPFromHeaders(request.headers),
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date(),
    };

    try {
      // 1. Rate limiting check
      if (config.rateLimitKey) {
        const rateLimiter = rateLimiters[config.rateLimitKey];
        const rateLimit = rateLimiter.checkLimit(securityRequest);

        if (!rateLimit.allowed) {
          securityMonitor.logEvent(
            createSecurityEvent(
              SecurityEventType.RATE_LIMIT_EXCEEDED,
              {
                ip: securityRequest.ip,
                endpoint: securityRequest.url,
                remaining: rateLimit.remaining,
                resetTime: rateLimit.resetTime,
              },
              SecurityRiskLevel.HIGH
            )
          );

          throw new Response('Rate limit exceeded', {
            status: 429,
            headers: {
              'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            },
          });
        }
      }

      // 2. Authentication check
      let userId: string | null = null;
      if (config.requireAuth) {
        const auth = await getAuth(args);
        userId = auth.userId;

        if (!userId) {
          securityMonitor.logEvent(
            createSecurityEvent(
              SecurityEventType.UNAUTHORIZED_ACCESS,
              {
                ip: securityRequest.ip,
                endpoint: securityRequest.url,
                userAgent: securityRequest.userAgent,
              },
              SecurityRiskLevel.MEDIUM
            )
          );

          return redirect('/sign-in');
        }

        // Add userId to security request
        securityRequest.userId = userId;
      }

      // 3. Input validation for POST/PUT/PATCH requests
      if (config.validateInput && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const formData = await request.clone().formData();
          const data = Object.fromEntries(formData.entries());

          // Validate each field
          for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
              const result = inputValidator.validateInput(value, ValidationSchemas.searchQuery, {
                fieldName: key,
                userId: userId || undefined,
                ipAddress: securityRequest.ip,
              });

              if (!result.isValid) {
                securityMonitor.logEvent(
                  createSecurityEvent(
                    SecurityEventType.MALICIOUS_INPUT,
                    {
                      field: key,
                      errors: result.errors,
                      ip: securityRequest.ip,
                      userId: userId || undefined,
                    },
                    SecurityRiskLevel.HIGH
                  )
                );

                throw new Response('Invalid input detected', { status: 400 });
              }
            }
          }
        } catch (_error) {
          // If we can't parse the request body, continue
          // This might be a file upload or other non-form data
        }
      }

      // 4. Log successful access
      if (config.logAccess) {
        securityMonitor.logEvent(
          createSecurityEvent(
            SecurityEventType.ROUTE_ACCESS,
            {
              endpoint: securityRequest.url,
              method: securityRequest.method,
              userId: userId || undefined,
              ip: securityRequest.ip,
              userAgent: securityRequest.userAgent,
            },
            SecurityRiskLevel.LOW
          )
        );
      }

      return { userId, securityRequest };
    } catch (error) {
      // If it's already a Response (like rate limit), re-throw
      if (error instanceof Response) {
        throw error;
      }

      // Log unexpected errors
      securityMonitor.logEvent(
        createSecurityEvent(
          SecurityEventType.SECURITY_ERROR,
          {
            error: error instanceof Error ? error.message : 'Unknown error',
            endpoint: securityRequest.url,
            ip: securityRequest.ip,
          },
          SecurityRiskLevel.HIGH
        )
      );

      throw new Response('Security check failed', { status: 500 });
    }
  };
}

/**
 * Pre-configured security middleware for common use cases
 */
export const securityMiddleware = {
  // For protected routes that require authentication
  protected: createSecurityMiddleware({
    requireAuth: true,
    rateLimitKey: 'general',
    validateInput: true,
    logAccess: true,
  }),

  // For API endpoints
  api: createSecurityMiddleware({
    requireAuth: true,
    rateLimitKey: 'api',
    validateInput: true,
    logAccess: true,
  }),

  // For authentication routes
  auth: createSecurityMiddleware({
    requireAuth: false,
    rateLimitKey: 'auth',
    validateInput: true,
    logAccess: true,
  }),

  // For file upload routes
  upload: createSecurityMiddleware({
    requireAuth: true,
    rateLimitKey: 'upload',
    validateInput: false, // File uploads need special handling
    logAccess: true,
  }),

  // For public routes (minimal security)
  public: createSecurityMiddleware({
    requireAuth: false,
    rateLimitKey: 'general',
    validateInput: false,
    logAccess: false,
  }),
};

/**
 * Helper function to combine security middleware with existing loaders
 */
interface SecurityResult {
  userId: string | null;
  securityRequest: SecurityRequest;
}

export function withSecurity<T>(
  loader: (args: LoaderFunctionArgs & { security: SecurityResult }) => Promise<T>,
  middleware = securityMiddleware.protected
) {
  return async (args: LoaderFunctionArgs) => {
    const security = await middleware(args);
    // If security check throws a Response (redirect/error), it will be thrown
    // Otherwise, we have a SecurityResult
    return loader({ ...args, security: security as SecurityResult });
  };
}

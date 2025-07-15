/**
 * @fileoverview Security middleware for React Router v7
 * @author Security Team
 * @version 1.0.0
 */

import type { z } from 'zod';
import { createSecurityEvent, generateCSRFToken, validateCSRFToken } from './core';
import { securityMonitor } from './monitoring';
import { rateLimiters } from './rateLimiter';
import {
  CSRFError,
  RateLimitError,
  type SecurityContext,
  SecurityError,
  SecurityEventType,
  type SecurityMiddlewareOptions,
  type SecurityRequest,
  SecurityRiskLevel,
  ValidationError,
  type ValidationResult,
} from './types';
import { inputValidator, ValidationSchemas } from './validation';

/**
 * Security middleware for route protection
 */
export class SecurityMiddleware {
  private readonly options: SecurityMiddlewareOptions;
  private readonly csrfTokens = new Map<string, { token: string; expiresAt: Date }>();

  constructor(options: Partial<SecurityMiddlewareOptions> = {}) {
    this.options = {
      enableRateLimit: true,
      enableCSRF: true,
      enableInputValidation: true,
      enableLogging: true,
      enableMonitoring: true,
      ...options,
    };
  }

  /**
   * Main security middleware function
   */
  public async processRequest(
    request: SecurityRequest,
    context: SecurityContext
  ): Promise<{
    allowed: boolean;
    error?: SecurityError;
    headers?: Record<string, string>;
  }> {
    try {
      // Rate limiting check
      if (this.options.enableRateLimit) {
        const rateLimitResult = this.checkRateLimit(request);
        if (!rateLimitResult.allowed) {
          return {
            allowed: false,
            error: new RateLimitError('Rate limit exceeded'),
            headers: {
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            },
          };
        }
      }

      // CSRF protection
      if (this.options.enableCSRF && this.requiresCSRFProtection(request)) {
        const csrfResult = this.validateCSRF(request, context);
        if (!csrfResult.valid) {
          return {
            allowed: false,
            error: new CSRFError('CSRF token validation failed'),
          };
        }
      }

      // Input validation
      if (this.options.enableInputValidation && request.body) {
        const validationResult = this.validateInput(request.body, context);
        if (!validationResult.isValid) {
          return {
            allowed: false,
            error: new ValidationError(
              `Input validation failed: ${validationResult.errors.join(', ')}`
            ),
          };
        }
      }

      // Log successful request
      if (this.options.enableLogging) {
        securityMonitor.logAudit(
          request.method,
          request.url,
          'success',
          { userAgent: request.userAgent },
          context
        );
      }

      return { allowed: true };
    } catch (error) {
      const securityError =
        error instanceof SecurityError
          ? error
          : new SecurityError('Security middleware error', SecurityEventType.SUSPICIOUS_ACTIVITY);

      if (this.options.enableMonitoring) {
        securityMonitor.logEvent(
          createSecurityEvent(
            securityError.type,
            { error: securityError.message, url: request.url },
            securityError.riskLevel,
            context
          )
        );
      }

      return {
        allowed: false,
        error: securityError,
      };
    }
  }

  /**
   * Check rate limits
   */
  private checkRateLimit(request: SecurityRequest): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    // Choose appropriate rate limiter based on request type
    let rateLimiter = rateLimiters.general;

    if (request.url.includes('/auth/') || request.url.includes('/sign-')) {
      rateLimiter = rateLimiters.auth;
    } else if (request.url.includes('/api/')) {
      rateLimiter = rateLimiters.api;
    } else if (request.url.includes('/upload')) {
      rateLimiter = rateLimiters.upload;
    }

    const result = rateLimiter.checkLimit(request);

    if (result.securityEvent) {
      securityMonitor.logEvent(result.securityEvent);
    }

    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetTime: result.resetTime,
    };
  }

  /**
   * Validate CSRF token
   */
  private validateCSRF(request: SecurityRequest, context: SecurityContext): { valid: boolean } {
    const token =
      request.headers['x-csrf-token'] ||
      ((request.body as Record<string, unknown>)?.csrfToken as string);

    if (!token) {
      securityMonitor.logEvent(
        createSecurityEvent(
          SecurityEventType.CSRF_TOKEN_MISMATCH,
          { reason: 'Missing CSRF token', url: request.url },
          SecurityRiskLevel.HIGH,
          context
        )
      );
      return { valid: false };
    }

    const storedToken = this.csrfTokens.get(context.sessionId);
    if (!storedToken) {
      securityMonitor.logEvent(
        createSecurityEvent(
          SecurityEventType.CSRF_TOKEN_MISMATCH,
          { reason: 'No stored CSRF token', url: request.url },
          SecurityRiskLevel.HIGH,
          context
        )
      );
      return { valid: false };
    }

    const isValid = validateCSRFToken(token, context.sessionId, {
      token: storedToken.token,
      expiresAt: storedToken.expiresAt,
      sessionId: context.sessionId,
    });

    if (!isValid) {
      securityMonitor.logEvent(
        createSecurityEvent(
          SecurityEventType.CSRF_TOKEN_MISMATCH,
          { reason: 'Invalid CSRF token', url: request.url },
          SecurityRiskLevel.HIGH,
          context
        )
      );
    }

    return { valid: isValid };
  }

  /**
   * Validate request input
   */
  private validateInput(body: unknown, context: SecurityContext): ValidationResult {
    if (typeof body !== 'object' || body === null) {
      return {
        isValid: false,
        errors: ['Request body must be an object'],
      };
    }

    const bodyObj = body as Record<string, unknown>;
    const errors: string[] = [];

    // Validate common fields
    for (const [key, value] of Object.entries(bodyObj)) {
      if (typeof value === 'string') {
        let schema: z.ZodSchema<string> | undefined;

        // Choose appropriate schema based on field name
        switch (key.toLowerCase()) {
          case 'email':
            schema = ValidationSchemas.email;
            break;
          case 'username':
            schema = ValidationSchemas.username;
            break;
          case 'password':
            schema = ValidationSchemas.password;
            break;
          case 'filename':
          case 'file_name':
            schema = ValidationSchemas.fileName;
            break;
          case 'content':
          case 'markdown':
            schema = ValidationSchemas.markdownContent;
            break;
          case 'search':
          case 'query':
            schema = ValidationSchemas.searchQuery;
            break;
          case 'tag':
          case 'tagname':
            schema = ValidationSchemas.tagName;
            break;
          case 'url':
          case 'link':
            schema = ValidationSchemas.url;
            break;
          default:
            // Generic string validation
            continue;
        }

        const result = inputValidator.validateInput(value, schema, {
          fieldName: key,
          userId: context.userId,
          sessionId: context.sessionId,
          ipAddress: context.ipAddress,
        });

        if (!result.isValid) {
          errors.push(...result.errors);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if request requires CSRF protection
   */
  private requiresCSRFProtection(request: SecurityRequest): boolean {
    // CSRF protection for state-changing operations
    const stateMutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    // Skip CSRF for API endpoints that use other authentication
    const skipPaths = ['/api/auth/', '/api/webhook/'];

    return (
      stateMutatingMethods.includes(request.method) &&
      !skipPaths.some((path) => request.url.includes(path))
    );
  }

  /**
   * Generate CSRF token for session
   */
  public generateCSRFTokenForSession(sessionId: string): string {
    const csrfToken = generateCSRFToken(sessionId);

    this.csrfTokens.set(sessionId, {
      token: csrfToken.token,
      expiresAt: csrfToken.expiresAt,
    });

    return csrfToken.token;
  }

  /**
   * Clean up expired CSRF tokens
   */
  public cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [sessionId, tokenData] of this.csrfTokens.entries()) {
      if (tokenData.expiresAt <= now) {
        this.csrfTokens.delete(sessionId);
      }
    }
  }
}

/**
 * Create security middleware for React Router loaders
 */
export const createSecurityLoader = (options: Partial<SecurityMiddlewareOptions> = {}) => {
  const middleware = new SecurityMiddleware(options);

  return async (args: { request: Request }) => {
    const { request } = args;
    const url = new URL(request.url);

    // Extract security context from request
    const context: SecurityContext = {
      sessionId: request.headers.get('x-session-id') || 'anonymous',
      permissions: [],
      roles: [],
      lastActivity: new Date(),
      isAuthenticated: false,
      isSuspicious: false,
      ipAddress:
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    // Convert Request to SecurityRequest
    const securityRequest: SecurityRequest = {
      url: url.pathname,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(url.searchParams.entries()),
      ip: context.ipAddress,
      userAgent: context.userAgent,
      timestamp: new Date(),
    };

    // Process request through security middleware
    const result = await middleware.processRequest(securityRequest, context);

    if (!result.allowed) {
      // Log security violation
      securityMonitor.logEvent(
        createSecurityEvent(
          result.error?.type || SecurityEventType.AUTHORIZATION_FAILURE,
          {
            url: securityRequest.url,
            method: securityRequest.method,
            error: result.error?.message,
          },
          result.error?.riskLevel || SecurityRiskLevel.MEDIUM,
          context
        )
      );

      // Return appropriate response based on error type
      if (result.error instanceof RateLimitError) {
        throw new Response('Rate limit exceeded', {
          status: 429,
          headers: result.headers,
        });
      }
      if (result.error instanceof CSRFError) {
        throw new Response('CSRF token validation failed', { status: 403 });
      }
      if (result.error instanceof ValidationError) {
        throw new Response('Input validation failed', { status: 400 });
      }
      throw new Response('Security check failed', { status: 403 });
    }

    return null; // Allow request to proceed
  };
};

/**
 * Create security action for React Router actions
 */
export const createSecurityAction = (options: Partial<SecurityMiddlewareOptions> = {}) => {
  const middleware = new SecurityMiddleware(options);

  return async (args: { request: Request }) => {
    const { request } = args;
    const url = new URL(request.url);

    // Get request body
    let body: unknown;
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        body = await request.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        body = Object.fromEntries(formData.entries());
      }
    } catch {
      body = null;
    }

    // Extract security context
    const context: SecurityContext = {
      sessionId: request.headers.get('x-session-id') || 'anonymous',
      permissions: [],
      roles: [],
      lastActivity: new Date(),
      isAuthenticated: false,
      isSuspicious: false,
      ipAddress:
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    // Convert to SecurityRequest
    const securityRequest: SecurityRequest = {
      url: url.pathname,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      query: Object.fromEntries(url.searchParams.entries()),
      ip: context.ipAddress,
      userAgent: context.userAgent,
      timestamp: new Date(),
    };

    // Process through security middleware
    const result = await middleware.processRequest(securityRequest, context);

    if (!result.allowed) {
      // Log and handle security violation
      securityMonitor.logEvent(
        createSecurityEvent(
          result.error?.type || SecurityEventType.AUTHORIZATION_FAILURE,
          {
            url: securityRequest.url,
            method: securityRequest.method,
            error: result.error?.message,
          },
          result.error?.riskLevel || SecurityRiskLevel.MEDIUM,
          context
        )
      );

      if (result.error instanceof RateLimitError) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...result.headers },
        });
      }
      if (result.error instanceof CSRFError) {
        return new Response(JSON.stringify({ error: 'CSRF token validation failed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (result.error instanceof ValidationError) {
        return new Response(JSON.stringify({ error: 'Input validation failed' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Security check failed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return null; // Allow action to proceed
  };
};

/**
 * Global security middleware instance
 */
export const securityMiddleware = new SecurityMiddleware();

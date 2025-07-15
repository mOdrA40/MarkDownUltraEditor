/**
 * @fileoverview Advanced input validation and sanitization
 * @author Security Team
 * @version 1.0.0
 */

import DOMPurify from 'dompurify';
import { z } from 'zod';
import { createSecurityEvent, detectSuspiciousPatterns, sanitizeInput } from './core';
import {
  SECURITY_CONSTANTS,
  type SecurityEvent,
  SecurityEventType,
  SecurityRiskLevel,
  type ValidationResult,
} from './types';

/**
 * Advanced validation schemas
 */
export const ValidationSchemas = {
  // User input schemas
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),

  email: z
    .string()
    .email('Invalid email format')
    .max(254, 'Email must not exceed 254 characters')
    .transform((email) => email.toLowerCase().trim()),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),

  // Content schemas
  markdownContent: z
    .string()
    .max(1000000, 'Content must not exceed 1MB')
    .transform((content) => sanitizeInput(content, { allowHtml: false, maxLength: 1000000 })),

  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must not exceed 255 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'File name contains invalid characters')
    .refine((name) => !name.startsWith('.'), 'File name cannot start with a dot')
    .refine((name) => {
      const suspiciousExtensions = [
        '.exe',
        '.bat',
        '.cmd',
        '.scr',
        '.pif',
        '.com',
        '.php',
        '.jsp',
        '.asp',
      ];
      return !suspiciousExtensions.some((ext) => name.toLowerCase().endsWith(ext));
    }, 'File extension is not allowed'),

  // URL and path schemas
  url: z
    .string()
    .url('Invalid URL format')
    .max(2048, 'URL must not exceed 2048 characters')
    .refine((url) => {
      const allowedProtocols = ['http:', 'https:'];
      try {
        const urlObj = new URL(url);
        return allowedProtocols.includes(urlObj.protocol);
      } catch {
        return false;
      }
    }, 'Only HTTP and HTTPS protocols are allowed'),

  // API input schemas
  searchQuery: z
    .string()
    .max(500, 'Search query must not exceed 500 characters')
    .transform((query) => sanitizeInput(query, { allowHtml: false, maxLength: 500 })),

  tagName: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9-_\s]+$/, 'Tag name contains invalid characters')
    .transform((tag) => tag.trim().toLowerCase()),

  // File upload schemas
  fileSize: z
    .number()
    .min(1, 'File cannot be empty')
    .max(
      SECURITY_CONSTANTS.MAX_FILE_SIZE_BYTES,
      `File size must not exceed ${SECURITY_CONSTANTS.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`
    ),

  mimeType: z.string().refine((type) => {
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/json',
      'text/csv',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    return allowedTypes.includes(type);
  }, 'File type is not allowed'),
};

/**
 * Advanced input validator class
 */
export class InputValidator {
  private readonly securityEvents: SecurityEvent[] = [];

  /**
   * Validate input with comprehensive security checks
   */
  public validateInput<T>(
    input: unknown,
    schema: z.ZodSchema<T>,
    context: {
      fieldName: string;
      userId?: string;
      sessionId?: string;
      ipAddress?: string;
    }
  ): ValidationResult<T> {
    try {
      // Basic type and format validation
      const validated = schema.parse(input);

      // Additional security checks for string inputs
      if (typeof input === 'string') {
        const securityCheck = this.performSecurityChecks(input, context);
        if (!securityCheck.isSecure) {
          return {
            isValid: false,
            errors: securityCheck.errors,
            warnings: securityCheck.warnings,
          };
        }
      }

      return {
        isValid: true,
        data: validated,
        sanitizedData: validated,
        errors: [],
      };
    } catch (error) {
      const errors =
        error instanceof z.ZodError
          ? error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
          : ['Validation failed'];

      // Log validation failure as security event
      this.securityEvents.push(
        createSecurityEvent(
          SecurityEventType.INPUT_VALIDATION_FAILURE,
          {
            fieldName: context.fieldName,
            input: typeof input === 'string' ? input.substring(0, 100) : String(input),
            errors,
          },
          SecurityRiskLevel.LOW,
          context
        )
      );

      return {
        isValid: false,
        errors,
      };
    }
  }

  /**
   * Perform comprehensive security checks on string input
   */
  private performSecurityChecks(
    input: string,
    context: {
      fieldName: string;
      userId?: string;
      sessionId?: string;
      ipAddress?: string;
    }
  ): {
    isSecure: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for suspicious patterns
    const suspiciousCheck = detectSuspiciousPatterns(input);
    if (suspiciousCheck.isSuspicious) {
      errors.push(`Suspicious patterns detected: ${suspiciousCheck.patterns.join(', ')}`);

      // Log as high-risk security event
      this.securityEvents.push(
        createSecurityEvent(
          SecurityEventType.SUSPICIOUS_ACTIVITY,
          {
            fieldName: context.fieldName,
            patterns: suspiciousCheck.patterns,
            input: input.substring(0, 200),
          },
          SecurityRiskLevel.HIGH,
          context
        )
      );
    }

    // Check for excessive length
    if (input.length > SECURITY_CONSTANTS.MAX_INPUT_LENGTH) {
      errors.push(
        `Input exceeds maximum length of ${SECURITY_CONSTANTS.MAX_INPUT_LENGTH} characters`
      );
    }

    // Check for null bytes
    if (input.includes('\0')) {
      errors.push('Input contains null bytes');
    }

    // Check for control characters (except common ones)
    // biome-ignore lint/suspicious/noControlCharactersInRegex: Security validation requires control character detection
    const controlCharPattern = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
    if (controlCharPattern.test(input)) {
      warnings.push('Input contains control characters');
    }

    // Check for Unicode normalization issues
    if (input !== input.normalize('NFC')) {
      warnings.push('Input contains non-normalized Unicode characters');
    }

    return {
      isSecure: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate and sanitize HTML content
   */
  public validateHtmlContent(
    html: string,
    options: {
      allowedTags?: string[];
      allowedAttributes?: string[];
      maxLength?: number;
    } = {}
  ): ValidationResult<string> {
    const {
      allowedTags = [
        'p',
        'br',
        'strong',
        'em',
        'u',
        'ol',
        'ul',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
      ],
      allowedAttributes = ['class', 'id'],
      maxLength = 100000,
    } = options;

    // Check length
    if (html.length > maxLength) {
      return {
        isValid: false,
        errors: [`HTML content exceeds maximum length of ${maxLength} characters`],
      };
    }

    // Sanitize HTML
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    });

    // Check if content was modified during sanitization
    const wasModified = sanitized !== html;
    if (wasModified) {
      this.securityEvents.push(
        createSecurityEvent(
          SecurityEventType.XSS_ATTEMPT,
          {
            originalLength: html.length,
            sanitizedLength: sanitized.length,
            wasModified,
          },
          SecurityRiskLevel.MEDIUM
        )
      );
    }

    return {
      isValid: true,
      data: sanitized,
      sanitizedData: sanitized,
      errors: [],
      warnings: wasModified ? ['Content was sanitized for security'] : [],
    };
  }

  /**
   * Validate file upload
   */
  public validateFileUpload(file: File): ValidationResult<File> {
    const errors: string[] = [];

    // Validate file size
    const sizeValidation = ValidationSchemas.fileSize.safeParse(file.size);
    if (!sizeValidation.success) {
      errors.push(...sizeValidation.error.issues.map((e) => e.message));
    }

    // Validate MIME type
    const mimeValidation = ValidationSchemas.mimeType.safeParse(file.type);
    if (!mimeValidation.success) {
      errors.push(...mimeValidation.error.issues.map((e) => e.message));
    }

    // Validate file name
    const nameValidation = ValidationSchemas.fileName.safeParse(file.name);
    if (!nameValidation.success) {
      errors.push(...nameValidation.error.issues.map((e) => e.message));
    }

    // Additional security checks
    if (file.name.includes('..')) {
      errors.push('File name contains path traversal characters');
    }

    if (errors.length > 0) {
      this.securityEvents.push(
        createSecurityEvent(
          SecurityEventType.FILE_UPLOAD_BLOCKED,
          {
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            errors,
          },
          SecurityRiskLevel.MEDIUM
        )
      );

      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: true,
      data: file,
      errors: [],
    };
  }

  /**
   * Get security events
   */
  public getSecurityEvents(): readonly SecurityEvent[] {
    return [...this.securityEvents];
  }

  /**
   * Clear security events
   */
  public clearSecurityEvents(): void {
    this.securityEvents.length = 0;
  }
}

/**
 * Global input validator instance
 */
export const inputValidator = new InputValidator();

/**
 * Utility functions for common validation tasks
 */
export const ValidationUtils = {
  /**
   * Validate and sanitize user input
   */
  sanitizeUserInput: (input: string, maxLength = 1000): string => {
    return sanitizeInput(input, {
      allowHtml: false,
      maxLength,
      stripScripts: true,
    });
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    return ValidationSchemas.email.safeParse(email).success;
  },

  /**
   * Validate URL format
   */
  isValidUrl: (url: string): boolean => {
    return ValidationSchemas.url.safeParse(url).success;
  },

  /**
   * Check if string contains only safe characters
   */
  isSafeString: (input: string): boolean => {
    const safePattern = /^[a-zA-Z0-9\s\-_.,!?()]+$/;
    return safePattern.test(input) && !detectSuspiciousPatterns(input).isSuspicious;
  },

  /**
   * Validate and normalize file name
   */
  normalizeFileName: (fileName: string): string => {
    return fileName
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  },
};

/**
 * Validation middleware for forms
 */
export const createValidationMiddleware = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): ValidationResult<T> => {
    return inputValidator.validateInput(data, schema, {
      fieldName: 'form_data',
    });
  };
};

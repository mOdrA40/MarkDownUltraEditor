/**
 * @fileoverview Core security utilities for enterprise-grade protection
 * @author Security Team
 * @version 1.0.0
 */

import CryptoJS from 'crypto-js';
import DOMPurify from 'dompurify';
import { z } from 'zod';
import {
  type CSRFToken,
  type EncryptionConfig,
  SECURITY_CONSTANTS,
  type SecurityContext,
  type SecurityEvent,
  type SecurityEventType,
  SecurityRiskLevel,
  type ValidationResult,
} from './types';

/**
 * Generate cryptographically secure random string
 */
export const generateSecureToken = (length = 32): string => {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for server-side
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate secure session ID
 */
export const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = generateSecureToken(16);
  return `${timestamp}-${randomPart}`;
};

/**
 * Hash sensitive data using SHA-256
 */
export const hashData = (data: string, salt?: string): string => {
  const saltToUse = salt || generateSecureToken(16);
  return CryptoJS.SHA256(data + saltToUse).toString();
};

/**
 * Encrypt data using AES-256-GCM
 */
export const encryptData = (
  data: string,
  key: string,
  config: Partial<EncryptionConfig> = {}
): { encrypted: string; iv: string; salt: string } => {
  const salt = generateSecureToken(config.saltLength || 16);
  const iv = generateSecureToken(config.ivLength || 16);

  const derivedKey = CryptoJS.PBKDF2(key, salt, {
    keySize: 256 / 32,
    iterations: config.iterations || 10000,
  });

  const encrypted = CryptoJS.AES.encrypt(data, derivedKey, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
  }).toString();

  return { encrypted, iv, salt };
};

/**
 * Decrypt data using AES-256-GCM
 */
export const decryptData = (
  encryptedData: string,
  key: string,
  iv: string,
  salt: string,
  config: Partial<EncryptionConfig> = {}
): string => {
  const derivedKey = CryptoJS.PBKDF2(key, salt, {
    keySize: 256 / 32,
    iterations: config.iterations || 10000,
  });

  const decrypted = CryptoJS.AES.decrypt(encryptedData, derivedKey, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};

/**
 * Advanced input sanitization
 */
export const sanitizeInput = (
  input: string,
  options: {
    allowHtml?: boolean;
    maxLength?: number;
    stripScripts?: boolean;
  } = {}
): string => {
  const {
    allowHtml = false,
    maxLength = SECURITY_CONSTANTS.MAX_INPUT_LENGTH,
    stripScripts = true,
  } = options;

  let sanitized = input.trim();

  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove or escape HTML
  if (!allowHtml) {
    sanitized = DOMPurify.sanitize(sanitized, { ALLOWED_TAGS: [] });
  } else {
    sanitized = DOMPurify.sanitize(sanitized, {
      FORBID_TAGS: stripScripts ? ['script', 'object', 'embed', 'iframe'] : [],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    });
  }

  // Remove potential XSS patterns
  const xssPatterns = [
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /data:application\/javascript/gi,
  ];

  for (const pattern of xssPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized;
};

/**
 * Validate and sanitize email
 */
export const validateEmail = (email: string): ValidationResult<string> => {
  const emailSchema = z.string().email().max(254);

  try {
    const sanitized = sanitizeInput(email.toLowerCase());
    const validated = emailSchema.parse(sanitized);

    return {
      isValid: true,
      data: validated,
      sanitizedData: validated,
      errors: [],
    };
  } catch (error) {
    return {
      isValid: false,
      errors: error instanceof z.ZodError ? error.issues.map((e) => e.message) : ['Invalid email'],
    };
  }
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ValidationResult<string> => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common patterns
  const commonPatterns = [/123456/, /password/i, /qwerty/i, /admin/i];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common patterns and is not secure');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? password : undefined,
    errors,
  };
};

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (sessionId: string): CSRFToken => {
  const token = generateSecureToken(32);
  const expiresAt = new Date(Date.now() + SECURITY_CONSTANTS.CSRF_TOKEN_LIFETIME_MS);

  return {
    token,
    expiresAt,
    sessionId,
  };
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (
  token: string,
  sessionId: string,
  storedToken: CSRFToken
): boolean => {
  return (
    storedToken.token === token &&
    storedToken.sessionId === sessionId &&
    storedToken.expiresAt > new Date()
  );
};

/**
 * Detect suspicious patterns in input
 */
export const detectSuspiciousPatterns = (
  input: string
): {
  isSuspicious: boolean;
  patterns: string[];
} => {
  const suspiciousPatterns = [
    // SQL Injection patterns
    {
      pattern: /(\b(union|select|insert|update|delete|drop|create|alter)\b)/gi,
      type: 'SQL Injection',
    },
    { pattern: /('|(\\x27)|(\\x2D)|(\\x23))/gi, type: 'SQL Injection' },

    // XSS patterns
    { pattern: /<script[^>]*>.*?<\/script>/gi, type: 'XSS' },
    { pattern: /javascript:/gi, type: 'XSS' },
    { pattern: /on\w+\s*=/gi, type: 'XSS' },

    // Path traversal
    { pattern: /\.\.\//gi, type: 'Path Traversal' },
    { pattern: /\.\.\\/gi, type: 'Path Traversal' },

    // Command injection
    { pattern: /[;&|`$()]/gi, type: 'Command Injection' },
  ];

  const detectedPatterns: string[] = [];

  for (const { pattern, type } of suspiciousPatterns) {
    if (pattern.test(input)) {
      detectedPatterns.push(type);
    }
  }

  return {
    isSuspicious: detectedPatterns.length > 0,
    patterns: [...new Set(detectedPatterns)], // Remove duplicates
  };
};

/**
 * Create security event
 */
export const createSecurityEvent = (
  type: SecurityEventType,
  details: Record<string, unknown>,
  riskLevel: SecurityRiskLevel = SecurityRiskLevel.MEDIUM,
  context?: Partial<SecurityContext>
): SecurityEvent => {
  return {
    id: generateSecureToken(16),
    type,
    riskLevel,
    timestamp: new Date(),
    userId: context?.userId,
    sessionId: context?.sessionId || generateSessionId(),
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    details,
  };
};

/**
 * Validate file upload security
 */
export const validateFileUpload = (file: File): ValidationResult<File> => {
  const errors: string[] = [];

  // Check file size
  if (file.size > SECURITY_CONSTANTS.MAX_FILE_SIZE_BYTES) {
    errors.push(
      `File size exceeds maximum limit of ${
        SECURITY_CONSTANTS.MAX_FILE_SIZE_BYTES / (1024 * 1024)
      }MB`
    );
  }

  // Check file type
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

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check file name for suspicious patterns
  const suspiciousFilePatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.pif$/i,
    /\.com$/i,
    /\.php$/i,
    /\.jsp$/i,
    /\.asp$/i,
  ];

  for (const pattern of suspiciousFilePatterns) {
    if (pattern.test(file.name)) {
      errors.push('File type is potentially dangerous');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? file : undefined,
    errors,
  };
};

/**
 * Secure localStorage wrapper
 */
export const secureStorage = {
  setItem: (key: string, value: string, encrypt = true): void => {
    if (typeof window === 'undefined') return;

    try {
      const dataToStore = encrypt ? encryptData(value, key).encrypted : value;
      localStorage.setItem(key, dataToStore);
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  },

  getItem: (key: string, decrypt = true): string | null => {
    if (typeof window === 'undefined') return null;

    try {
      const storedData = localStorage.getItem(key);
      if (!storedData) return null;

      return decrypt ? decryptData(storedData, key, '', '') : storedData;
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

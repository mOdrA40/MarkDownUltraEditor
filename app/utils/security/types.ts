/**
 * @fileoverview Enterprise-grade security type definitions
 * @author Security Team
 * @version 1.0.0
 */

/**
 * Security event types for logging and monitoring
 */
export enum SecurityEventType {
  AUTHENTICATION_ATTEMPT = 'auth_attempt',
  AUTHENTICATION_SUCCESS = 'auth_success',
  AUTHENTICATION_FAILURE = 'auth_failure',
  AUTHORIZATION_FAILURE = 'authz_failure',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  INPUT_VALIDATION_FAILURE = 'input_validation_failure',
  MALICIOUS_INPUT = 'malicious_input',
  FILE_UPLOAD_ATTEMPT = 'file_upload_attempt',
  FILE_UPLOAD_BLOCKED = 'file_upload_blocked',
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  CSRF_TOKEN_MISMATCH = 'csrf_token_mismatch',
  SESSION_HIJACK_ATTEMPT = 'session_hijack_attempt',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  SECURITY_SCAN_DETECTED = 'security_scan_detected',
  ROUTE_ACCESS = 'route_access',
  SECURITY_ERROR = 'security_error',
}

/**
 * Security risk levels
 */
export enum SecurityRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Rate limiting strategies
 */
export enum RateLimitStrategy {
  FIXED_WINDOW = 'fixed_window',
  SLIDING_WINDOW = 'sliding_window',
  TOKEN_BUCKET = 'token_bucket',
  LEAKY_BUCKET = 'leaky_bucket',
}

/**
 * Security event interface
 */
export interface SecurityEvent {
  readonly id: string;
  readonly type: SecurityEventType;
  readonly riskLevel: SecurityRiskLevel;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly resource?: string;
  readonly action?: string;
  readonly details: Record<string, unknown>;
  readonly metadata?: {
    readonly geolocation?: {
      readonly country?: string;
      readonly region?: string;
      readonly city?: string;
    };
    readonly device?: {
      readonly type?: string;
      readonly os?: string;
      readonly browser?: string;
    };
  };
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  readonly strategy: RateLimitStrategy;
  readonly windowMs: number;
  readonly maxRequests: number;
  readonly skipSuccessfulRequests?: boolean;
  readonly skipFailedRequests?: boolean;
  readonly keyGenerator?: (request: SecurityRequest) => string;
  readonly onLimitReached?: (request: SecurityRequest) => void;
  readonly whitelist?: readonly string[];
  readonly blacklist?: readonly string[];
}

/**
 * Security request interface
 */
export interface SecurityRequest {
  readonly url: string;
  readonly method: string;
  readonly headers: Record<string, string>;
  readonly body?: unknown;
  readonly query?: Record<string, string>;
  readonly params?: Record<string, string>;
  readonly ip?: string;
  readonly userAgent?: string;
  userId?: string; // Made mutable for middleware assignment
  readonly sessionId?: string;
  readonly timestamp: Date;
}

/**
 * Input validation result
 */
export interface ValidationResult<T = unknown> {
  readonly isValid: boolean;
  readonly data?: T;
  readonly errors: readonly string[];
  readonly warnings?: readonly string[];
  readonly sanitizedData?: T;
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  readonly rateLimiting: {
    readonly enabled: boolean;
    readonly configs: Record<string, RateLimitConfig>;
  };
  readonly inputValidation: {
    readonly enabled: boolean;
    readonly strictMode: boolean;
    readonly sanitizeHtml: boolean;
    readonly maxInputLength: number;
  };
  readonly contentSecurity: {
    readonly enabled: boolean;
    readonly allowedFileTypes: readonly string[];
    readonly maxFileSize: number;
    readonly scanUploads: boolean;
  };
  readonly sessionSecurity: {
    readonly enabled: boolean;
    readonly sessionTimeout: number;
    readonly rotateTokens: boolean;
    readonly detectHijacking: boolean;
  };
  readonly monitoring: {
    readonly enabled: boolean;
    readonly logLevel: SecurityRiskLevel;
    readonly alertThreshold: number;
    readonly retentionDays: number;
  };
}

/**
 * CSRF token interface
 */
export interface CSRFToken {
  readonly token: string;
  readonly expiresAt: Date;
  readonly sessionId: string;
}

/**
 * Security context interface
 */
export interface SecurityContext {
  readonly userId?: string;
  readonly sessionId: string;
  readonly permissions: readonly string[];
  readonly roles: readonly string[];
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly csrfToken?: CSRFToken;
  readonly lastActivity: Date;
  readonly isAuthenticated: boolean;
  readonly isSuspicious: boolean;
}

/**
 * File security scan result
 */
export interface FileScanResult {
  readonly isClean: boolean;
  readonly threats: readonly {
    readonly type: string;
    readonly severity: SecurityRiskLevel;
    readonly description: string;
  }[];
  readonly metadata: {
    readonly fileSize: number;
    readonly mimeType: string;
    readonly hash: string;
  };
}

/**
 * Security middleware options
 */
export interface SecurityMiddlewareOptions {
  readonly enableRateLimit: boolean;
  readonly enableCSRF: boolean;
  readonly enableInputValidation: boolean;
  readonly enableLogging: boolean;
  readonly enableMonitoring: boolean;
  readonly customValidators?: Record<string, (value: unknown) => ValidationResult>;
}

/**
 * Security alert interface
 */
export interface SecurityAlert {
  readonly id: string;
  readonly type: SecurityEventType;
  readonly severity: SecurityRiskLevel;
  readonly message: string;
  readonly timestamp: Date;
  readonly affectedResources: readonly string[];
  readonly recommendedActions: readonly string[];
  readonly isResolved: boolean;
}

/**
 * Encryption configuration
 */
export interface EncryptionConfig {
  readonly algorithm: 'AES-256-GCM' | 'AES-256-CBC';
  readonly keyDerivation: 'PBKDF2' | 'scrypt' | 'argon2';
  readonly iterations: number;
  readonly saltLength: number;
  readonly ivLength: number;
}

/**
 * Security audit log entry
 */
export interface SecurityAuditLog {
  readonly id: string;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly action: string;
  readonly resource: string;
  readonly outcome: 'success' | 'failure' | 'blocked';
  readonly details: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

/**
 * Type guards for security types
 */
export const isSecurityEvent = (obj: unknown): obj is SecurityEvent => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'riskLevel' in obj &&
    'timestamp' in obj
  );
};

export const isValidationResult = <T>(obj: unknown): obj is ValidationResult<T> => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'isValid' in obj &&
    'errors' in obj &&
    typeof (obj as ValidationResult).isValid === 'boolean' &&
    Array.isArray((obj as ValidationResult).errors)
  );
};

/**
 * Security constants
 */
export const SECURITY_CONSTANTS = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
  CSRF_TOKEN_LIFETIME_MS: 60 * 60 * 1000, // 1 hour
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_INPUT_LENGTH: 10000,
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  DEFAULT_RATE_LIMIT: 100,
  SECURITY_LOG_RETENTION_DAYS: 90,
} as const;

/**
 * Security error types
 */
export class SecurityError extends Error {
  constructor(
    message: string,
    public readonly type: SecurityEventType,
    public readonly riskLevel: SecurityRiskLevel = SecurityRiskLevel.MEDIUM
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class RateLimitError extends SecurityError {
  constructor(message = 'Rate limit exceeded') {
    super(message, SecurityEventType.RATE_LIMIT_EXCEEDED, SecurityRiskLevel.MEDIUM);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends SecurityError {
  constructor(message = 'Input validation failed') {
    super(message, SecurityEventType.INPUT_VALIDATION_FAILURE, SecurityRiskLevel.LOW);
    this.name = 'ValidationError';
  }
}

export class CSRFError extends SecurityError {
  constructor(message = 'CSRF token mismatch') {
    super(message, SecurityEventType.CSRF_TOKEN_MISMATCH, SecurityRiskLevel.HIGH);
    this.name = 'CSRFError';
  }
}

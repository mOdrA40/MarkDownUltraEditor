/**
 * @fileoverview Enhanced security headers for enterprise-grade protection
 * @author Security Team
 * @version 1.0.0
 */

/**
 * Security headers configuration
 */
export interface SecurityHeadersConfig {
  readonly contentSecurityPolicy: {
    readonly enabled: boolean;
    readonly reportOnly: boolean;
    readonly directives: Record<string, string[]>;
    readonly reportUri?: string;
  };
  readonly strictTransportSecurity: {
    readonly enabled: boolean;
    readonly maxAge: number;
    readonly includeSubDomains: boolean;
    readonly preload: boolean;
  };
  readonly frameOptions: {
    readonly enabled: boolean;
    readonly policy: "DENY" | "SAMEORIGIN" | "ALLOW-FROM";
    readonly allowFrom?: string;
  };
  readonly contentTypeOptions: {
    readonly enabled: boolean;
  };
  readonly referrerPolicy: {
    readonly enabled: boolean;
    readonly policy: string;
  };
  readonly permissionsPolicy: {
    readonly enabled: boolean;
    readonly directives: Record<string, string[]>;
  };
}

/**
 * Default security headers configuration
 */
export const DEFAULT_SECURITY_CONFIG: SecurityHeadersConfig = {
  contentSecurityPolicy: {
    enabled: true,
    reportOnly: false,
    directives: {
      "default-src": ["'self'"],
      "script-src": [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://clerk.com",
        "https://*.clerk.accounts.dev",
        "https://*.clerk.com",
        "https://challenges.cloudflare.com",
        "https://js.stripe.com",
        "https://checkout.stripe.com",
      ],
      "style-src": [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://clerk.com",
        "https://*.clerk.accounts.dev",
      ],
      "img-src": [
        "'self'",
        "data:",
        "blob:",
        "https://*.clerk.com",
        "https://*.clerk.accounts.dev",
        "https://img.clerk.com",
        "https://images.unsplash.com",
        "https://avatars.githubusercontent.com",
      ],
      "font-src": [
        "'self'",
        "data:",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
      ],
      "connect-src": [
        "'self'",
        "https://*.supabase.co",
        "https://clerk.com",
        "https://*.clerk.accounts.dev",
        "https://*.clerk.com",
        "wss://*.supabase.co",
        "wss://*.clerk.com",
        "https://api.stripe.com",
        "https://checkout.stripe.com",
        // Sentry endpoints
        "https://*.ingest.sentry.io",
        "https://*.ingest.us.sentry.io",
        "https://sentry.io",
      ],
      "media-src": ["'self'", "blob:", "data:"],
      "object-src": ["'none'"],
      "child-src": ["'none'"],
      "worker-src": ["'self'", "blob:"],
      "frame-src": [
        "'self'",
        "https://clerk.com",
        "https://*.clerk.accounts.dev",
        "https://*.clerk.com",
        "https://challenges.cloudflare.com",
        "https://js.stripe.com",
        "https://checkout.stripe.com",
      ],
      "frame-ancestors": ["'none'"],
      "form-action": [
        "'self'",
        "https://clerk.com",
        "https://*.clerk.accounts.dev",
      ],
      "base-uri": ["'self'"],
      "upgrade-insecure-requests": [],
    },
    reportUri: "/api/csp-report",
  },
  strictTransportSecurity: {
    enabled: true,
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameOptions: {
    enabled: true,
    policy: "DENY",
  },
  contentTypeOptions: {
    enabled: true,
  },
  referrerPolicy: {
    enabled: true,
    policy: "strict-origin-when-cross-origin",
  },
  permissionsPolicy: {
    enabled: true,
    directives: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'none'"],
      payment: ["'self'"],
      fullscreen: ["'self'"],
      "display-capture": ["'none'"],
      "web-share": ["'self'"],
      "clipboard-read": ["'self'"],
      "clipboard-write": ["'self'"],
    },
  },
};

/**
 * Generate Content Security Policy header value
 */
export const generateCSPHeader = (
  config: SecurityHeadersConfig["contentSecurityPolicy"]
): string => {
  if (!config.enabled) return "";

  const directives = Object.entries(config.directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(" ")}`;
    })
    .join("; ");

  let csp = directives;

  if (config.reportUri) {
    csp += `; report-uri ${config.reportUri}`;
  }

  return csp;
};

/**
 * Generate Strict Transport Security header value
 */
export const generateHSTSHeader = (
  config: SecurityHeadersConfig["strictTransportSecurity"]
): string => {
  if (!config.enabled) return "";

  let hsts = `max-age=${config.maxAge}`;

  if (config.includeSubDomains) {
    hsts += "; includeSubDomains";
  }

  if (config.preload) {
    hsts += "; preload";
  }

  return hsts;
};

/**
 * Generate Permissions Policy header value
 */
export const generatePermissionsPolicyHeader = (
  config: SecurityHeadersConfig["permissionsPolicy"]
): string => {
  if (!config.enabled) return "";

  return Object.entries(config.directives)
    .map(([directive, allowlist]) => {
      if (allowlist.length === 0) {
        return `${directive}=()`;
      }
      return `${directive}=(${allowlist.join(" ")})`;
    })
    .join(", ");
};

/**
 * Generate all security headers
 */
export const generateSecurityHeaders = (
  config: SecurityHeadersConfig = DEFAULT_SECURITY_CONFIG
): Record<string, string> => {
  const headers: Record<string, string> = {};

  // Content Security Policy
  if (config.contentSecurityPolicy.enabled) {
    const cspHeader = generateCSPHeader(config.contentSecurityPolicy);
    if (cspHeader) {
      const headerName = config.contentSecurityPolicy.reportOnly
        ? "Content-Security-Policy-Report-Only"
        : "Content-Security-Policy";
      headers[headerName] = cspHeader;
    }
  }

  // Strict Transport Security
  if (config.strictTransportSecurity.enabled) {
    const hstsHeader = generateHSTSHeader(config.strictTransportSecurity);
    if (hstsHeader) {
      headers["Strict-Transport-Security"] = hstsHeader;
    }
  }

  // X-Frame-Options
  if (config.frameOptions.enabled) {
    let frameOptions = config.frameOptions.policy;
    if (
      config.frameOptions.policy === "ALLOW-FROM" &&
      config.frameOptions.allowFrom
    ) {
      frameOptions += ` ${config.frameOptions.allowFrom}`;
    }
    headers["X-Frame-Options"] = frameOptions;
  }

  // X-Content-Type-Options
  if (config.contentTypeOptions.enabled) {
    headers["X-Content-Type-Options"] = "nosniff";
  }

  // Referrer Policy
  if (config.referrerPolicy.enabled) {
    headers["Referrer-Policy"] = config.referrerPolicy.policy;
  }

  // Permissions Policy
  if (config.permissionsPolicy.enabled) {
    const permissionsPolicyHeader = generatePermissionsPolicyHeader(
      config.permissionsPolicy
    );
    if (permissionsPolicyHeader) {
      headers["Permissions-Policy"] = permissionsPolicyHeader;
    }
  }

  // Additional security headers
  headers["X-XSS-Protection"] = "1; mode=block";
  headers["X-DNS-Prefetch-Control"] = "off";
  headers["X-Download-Options"] = "noopen";
  headers["X-Permitted-Cross-Domain-Policies"] = "none";
  headers["Cross-Origin-Embedder-Policy"] = "require-corp";
  headers["Cross-Origin-Opener-Policy"] = "same-origin";
  headers["Cross-Origin-Resource-Policy"] = "same-origin";

  return headers;
};

/**
 * Validate CSP configuration
 */
export const validateCSPConfig = (
  config: SecurityHeadersConfig["contentSecurityPolicy"]
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for unsafe directives
  const unsafeDirectives = ["unsafe-inline", "unsafe-eval"];
  for (const [directive, sources] of Object.entries(config.directives)) {
    for (const source of sources) {
      if (unsafeDirectives.some((unsafe) => source.includes(unsafe))) {
        warnings.push(
          `Directive '${directive}' contains unsafe source: ${source}`
        );
      }
    }
  }

  // Check for missing essential directives
  const essentialDirectives = ["default-src", "script-src", "style-src"];
  for (const directive of essentialDirectives) {
    if (!config.directives[directive]) {
      errors.push(`Missing essential directive: ${directive}`);
    }
  }

  // Check for overly permissive directives
  for (const [directive, sources] of Object.entries(config.directives)) {
    if (sources.includes("*")) {
      warnings.push(
        `Directive '${directive}' uses wildcard (*) which is overly permissive`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Security headers middleware for React Router
 */
export const createSecurityHeadersMiddleware = (
  config: Partial<SecurityHeadersConfig> = {}
) => {
  const mergedConfig: SecurityHeadersConfig = {
    ...DEFAULT_SECURITY_CONFIG,
    ...config,
    contentSecurityPolicy: {
      ...DEFAULT_SECURITY_CONFIG.contentSecurityPolicy,
      ...config.contentSecurityPolicy,
      directives: {
        ...DEFAULT_SECURITY_CONFIG.contentSecurityPolicy.directives,
        ...config.contentSecurityPolicy?.directives,
      },
    },
    permissionsPolicy: {
      ...DEFAULT_SECURITY_CONFIG.permissionsPolicy,
      ...config.permissionsPolicy,
      directives: {
        ...DEFAULT_SECURITY_CONFIG.permissionsPolicy.directives,
        ...config.permissionsPolicy?.directives,
      },
    },
  };

  return () => generateSecurityHeaders(mergedConfig);
};

/**
 * Environment-specific security configurations
 */
export const ENVIRONMENT_CONFIGS = {
  development: {
    ...DEFAULT_SECURITY_CONFIG,
    contentSecurityPolicy: {
      enabled: false, // Disable CSP in development for easier debugging
      reportOnly: true,
      directives: {},
    },
  },
  production: {
    ...DEFAULT_SECURITY_CONFIG,
    contentSecurityPolicy: {
      ...DEFAULT_SECURITY_CONFIG.contentSecurityPolicy,
      reportOnly: false,
      directives: {
        ...DEFAULT_SECURITY_CONFIG.contentSecurityPolicy.directives,
        "script-src": DEFAULT_SECURITY_CONFIG.contentSecurityPolicy.directives[
          "script-src"
        ].filter((src) => src !== "'unsafe-eval'"),
      },
    },
  },
} as const;

/**
 * Get security headers for current environment
 */
export const getEnvironmentSecurityHeaders = (): Record<string, string> => {
  const environment = process.env.NODE_ENV as keyof typeof ENVIRONMENT_CONFIGS;
  const config =
    ENVIRONMENT_CONFIGS[environment] || ENVIRONMENT_CONFIGS.production;
  return generateSecurityHeaders(config as SecurityHeadersConfig);
};

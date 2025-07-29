/**
 * @fileoverview Production safety checks and environment configuration
 * @author Security Team
 * @version 1.0.0
 */

import { safeConsole } from '@/utils/console';

/**
 * Environment types
 */
export type Environment = 'development' | 'production' | 'test' | 'staging';

/**
 * Production safety check result
 */
interface SafetyCheckResult {
  check: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
  recommendation?: string;
}

/**
 * Production safety audit result
 */
interface ProductionSafetyAudit {
  environment: Environment;
  overall: 'SAFE' | 'WARNING' | 'CRITICAL';
  checks: SafetyCheckResult[];
  recommendations: string[];
}

/**
 * Get current environment
 */
export const getCurrentEnvironment = (): Environment => {
  const env = import.meta.env.MODE || process.env.NODE_ENV || 'development';

  if (env === 'production' || env === 'prod') return 'production';
  if (env === 'test') return 'test';
  if (env === 'staging') return 'staging';
  return 'development';
};

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return getCurrentEnvironment() === 'production';
};

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => {
  return getCurrentEnvironment() === 'development';
};

/**
 * Verify environment variables are properly configured
 */
const checkEnvironmentVariables = (): SafetyCheckResult => {
  const requiredVars = [
    'VITE_CLERK_PUBLISHABLE_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredVars.filter((varName) => !import.meta.env[varName]);

  if (missingVars.length > 0) {
    return {
      check: 'Environment Variables',
      status: 'FAIL',
      message: `Missing required environment variables: ${missingVars.join(', ')}`,
      recommendation: 'Ensure all required environment variables are set in production',
    };
  }

  // Check for development-specific variables in production
  if (isProduction()) {
    const devVars = ['VITE_DEBUG', 'VITE_DEV_MODE'];
    const foundDevVars = devVars.filter((varName) => import.meta.env[varName]);

    if (foundDevVars.length > 0) {
      return {
        check: 'Environment Variables',
        status: 'WARN',
        message: `Development variables found in production: ${foundDevVars.join(', ')}`,
        recommendation: 'Remove development-specific variables from production environment',
      };
    }
  }

  return {
    check: 'Environment Variables',
    status: 'PASS',
    message: 'All required environment variables are properly configured',
  };
};

/**
 * Check for debug code and console statements
 */
const checkDebugCode = (): SafetyCheckResult => {
  // In production, we should not have debug flags enabled
  if (isProduction()) {
    // Check for common debug indicators
    const debugIndicators = [
      typeof window !== 'undefined' &&
        (window as unknown as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown })
          .__REACT_DEVTOOLS_GLOBAL_HOOK__,
      import.meta.env.DEV,
      import.meta.env.VITE_DEBUG === 'true',
    ];

    const hasDebugCode = debugIndicators.some((indicator) => indicator);

    if (hasDebugCode) {
      return {
        check: 'Debug Code',
        status: 'WARN',
        message: 'Debug code or development tools detected in production',
        recommendation: 'Ensure debug code is removed from production builds',
      };
    }
  }

  return {
    check: 'Debug Code',
    status: 'PASS',
    message: 'No debug code detected',
  };
};

/**
 * Check security headers and CSP configuration
 */
const checkSecurityConfiguration = (): SafetyCheckResult => {
  if (isProduction()) {
    // Check if CSP is properly configured for production
    const hasStrictCSP = !import.meta.env.VITE_DISABLE_CSP;

    if (!hasStrictCSP) {
      return {
        check: 'Security Configuration',
        status: 'FAIL',
        message: 'Content Security Policy is disabled in production',
        recommendation: 'Enable strict CSP for production environment',
      };
    }

    // Check for unsafe CSP directives
    const hasUnsafeEval = document
      .querySelector('meta[http-equiv="Content-Security-Policy"]')
      ?.getAttribute('content')
      ?.includes("'unsafe-eval'");

    if (hasUnsafeEval) {
      return {
        check: 'Security Configuration',
        status: 'WARN',
        message: 'Unsafe CSP directive detected in production',
        recommendation: 'Remove unsafe-eval from production CSP',
      };
    }
  }

  return {
    check: 'Security Configuration',
    status: 'PASS',
    message: 'Security configuration is appropriate for environment',
  };
};

/**
 * Check error handling configuration
 */
const checkErrorHandling = (): SafetyCheckResult => {
  if (isProduction()) {
    // Check if Sentry is properly configured
    const hasSentryDSN = !!import.meta.env.VITE_SENTRY_DSN;

    if (!hasSentryDSN) {
      return {
        check: 'Error Handling',
        status: 'WARN',
        message: 'Error tracking (Sentry) not configured for production',
        recommendation: 'Configure Sentry for production error tracking',
      };
    }

    // Check if error boundaries are in place
    const hasErrorBoundaries = document.querySelector('[data-error-boundary]') !== null;

    if (!hasErrorBoundaries) {
      return {
        check: 'Error Handling',
        status: 'WARN',
        message: 'Error boundaries may not be properly configured',
        recommendation: 'Ensure error boundaries are implemented throughout the application',
      };
    }
  }

  return {
    check: 'Error Handling',
    status: 'PASS',
    message: 'Error handling is properly configured',
  };
};

/**
 * Check performance configuration
 */
const checkPerformanceConfiguration = (): SafetyCheckResult => {
  if (isProduction()) {
    // Check if source maps are disabled in production
    const hasSourceMaps = import.meta.env.VITE_GENERATE_SOURCEMAP === 'true';

    if (hasSourceMaps) {
      return {
        check: 'Performance Configuration',
        status: 'WARN',
        message: 'Source maps are enabled in production',
        recommendation: 'Disable source maps in production for better performance and security',
      };
    }

    // Check if development dependencies are included
    const hasDevDependencies =
      typeof window !== 'undefined' &&
      (window as unknown as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown })
        .__REACT_DEVTOOLS_GLOBAL_HOOK__;

    if (hasDevDependencies) {
      return {
        check: 'Performance Configuration',
        status: 'WARN',
        message: 'Development dependencies detected in production',
        recommendation: 'Ensure development dependencies are excluded from production build',
      };
    }
  }

  return {
    check: 'Performance Configuration',
    status: 'PASS',
    message: 'Performance configuration is optimized',
  };
};

/**
 * Check logging configuration
 */
const checkLoggingConfiguration = (): SafetyCheckResult => {
  if (isProduction()) {
    // Check if verbose logging is disabled
    const hasVerboseLogging = import.meta.env.VITE_VERBOSE_LOGGING === 'true';

    if (hasVerboseLogging) {
      return {
        check: 'Logging Configuration',
        status: 'WARN',
        message: 'Verbose logging is enabled in production',
        recommendation: 'Disable verbose logging in production',
      };
    }
  }

  return {
    check: 'Logging Configuration',
    status: 'PASS',
    message: 'Logging configuration is appropriate',
  };
};

/**
 * Perform comprehensive production safety audit
 */
export const performProductionSafetyAudit = (): ProductionSafetyAudit => {
  const environment = getCurrentEnvironment();

  const checks: SafetyCheckResult[] = [
    checkEnvironmentVariables(),
    checkDebugCode(),
    checkSecurityConfiguration(),
    checkErrorHandling(),
    checkPerformanceConfiguration(),
    checkLoggingConfiguration(),
  ];

  // Determine overall status
  const failedChecks = checks.filter((check) => check.status === 'FAIL');
  const warningChecks = checks.filter((check) => check.status === 'WARN');

  let overall: 'SAFE' | 'WARNING' | 'CRITICAL';
  if (failedChecks.length > 0) {
    overall = 'CRITICAL';
  } else if (warningChecks.length > 0) {
    overall = 'WARNING';
  } else {
    overall = 'SAFE';
  }

  // Generate recommendations
  const recommendations: string[] = [
    ...checks
      .filter((check) => check.recommendation)
      .map((check) => check.recommendation as string),
    'Regularly review and update security configurations',
    'Monitor application performance and error rates',
    'Keep dependencies up to date',
    'Implement proper backup and disaster recovery procedures',
  ];

  const audit: ProductionSafetyAudit = {
    environment,
    overall,
    checks,
    recommendations,
  };

  // Log audit results
  safeConsole.dev(`🔍 Production safety audit completed for ${environment}:`, {
    overall,
    checksCount: checks.length,
    failedCount: failedChecks.length,
    warningCount: warningChecks.length,
  });

  return audit;
};

/**
 * Initialize production safety monitoring
 */
export const initializeProductionSafety = (): void => {
  const environment = getCurrentEnvironment();

  safeConsole.dev(`🚀 Initializing application in ${environment} mode`);

  // Perform safety audit
  const audit = performProductionSafetyAudit();

  // Log critical issues
  if (audit.overall === 'CRITICAL') {
    safeConsole.error('🚨 CRITICAL: Production safety issues detected!', {
      failedChecks: audit.checks.filter((check) => check.status === 'FAIL'),
    });
  } else if (audit.overall === 'WARNING') {
    safeConsole.warn('⚠️ WARNING: Production safety warnings detected', {
      warningChecks: audit.checks.filter((check) => check.status === 'WARN'),
    });
  } else {
    safeConsole.dev('✅ Production safety checks passed');
  }

  // Set up runtime monitoring for production
  if (isProduction()) {
    // Monitor for runtime errors
    window.addEventListener('error', (event) => {
      safeConsole.error('Runtime error detected:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Monitor for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      safeConsole.error('Unhandled promise rejection:', {
        reason: event.reason,
      });
    });
  }
};

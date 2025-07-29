/**
 * @fileoverview Supabase security utilities and RLS verification
 * @author Security Team
 * @version 1.0.0
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { safeConsole } from '@/utils/console';

/**
 * RLS Policy verification result
 */
interface RLSVerificationResult {
  table: string;
  hasRLS: boolean;
  policies: string[];
  isSecure: boolean;
  issues: string[];
}

/**
 * Security audit result for Supabase
 */
interface SupabaseSecurityAudit {
  overall: 'SECURE' | 'WARNING' | 'CRITICAL';
  tables: RLSVerificationResult[];
  recommendations: string[];
}

/**
 * Tables that should have RLS enabled
 */
const REQUIRED_RLS_TABLES = ['user_files', 'user_sessions'] as const;

/**
 * Verify RLS policies for a specific table
 */
export const verifyTableRLS = async (
  supabase: SupabaseClient<Database>,
  tableName: string
): Promise<RLSVerificationResult> => {
  const result: RLSVerificationResult = {
    table: tableName,
    hasRLS: false,
    policies: [],
    isSecure: false,
    issues: [],
  };

  try {
    // Check if RLS is enabled on the table
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('check_rls_enabled', { table_name: tableName })
      .single();

    if (rlsError) {
      result.issues.push(`Failed to check RLS status: ${rlsError.message}`);
      return result;
    }

    result.hasRLS = (rlsData as { rls_enabled?: boolean })?.rls_enabled || false;

    if (!result.hasRLS) {
      result.issues.push('RLS is not enabled on this table');
      return result;
    }

    // Check for existing policies
    const { data: policiesData, error: policiesError } = await supabase.rpc('get_table_policies', {
      table_name: tableName,
    });

    if (policiesError) {
      result.issues.push(`Failed to fetch policies: ${policiesError.message}`);
      return result;
    }

    result.policies = policiesData?.map((p: { policy_name: string }) => p.policy_name) || [];

    // Verify minimum required policies
    const requiredPolicies = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
    const missingPolicies = requiredPolicies.filter(
      (policy) => !result.policies.some((p) => p.toUpperCase().includes(policy))
    );

    if (missingPolicies.length > 0) {
      result.issues.push(`Missing policies for: ${missingPolicies.join(', ')}`);
    }

    // Check if policies are properly restrictive
    if (result.policies.length === 0) {
      result.issues.push('No policies found - table may be inaccessible');
    }

    result.isSecure = result.hasRLS && result.issues.length === 0;
  } catch (error) {
    result.issues.push(
      `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return result;
};

/**
 * Perform comprehensive Supabase security audit
 */
export const auditSupabaseSecurity = async (
  supabase: SupabaseClient<Database>
): Promise<SupabaseSecurityAudit> => {
  const audit: SupabaseSecurityAudit = {
    overall: 'SECURE',
    tables: [],
    recommendations: [],
  };

  try {
    safeConsole.dev('🔍 Starting Supabase security audit...');

    // Verify RLS for all required tables
    for (const tableName of REQUIRED_RLS_TABLES) {
      const tableResult = await verifyTableRLS(supabase, tableName);
      audit.tables.push(tableResult);

      if (!tableResult.isSecure) {
        audit.overall = tableResult.hasRLS ? 'WARNING' : 'CRITICAL';
      }
    }

    // Generate recommendations
    const tablesWithoutRLS = audit.tables.filter((t) => !t.hasRLS);
    const tablesWithIssues = audit.tables.filter((t) => t.issues.length > 0);

    if (tablesWithoutRLS.length > 0) {
      audit.recommendations.push(
        `Enable RLS on tables: ${tablesWithoutRLS.map((t) => t.table).join(', ')}`
      );
    }

    if (tablesWithIssues.length > 0) {
      audit.recommendations.push('Review and fix policy issues on tables with warnings');
    }

    // Additional security recommendations
    audit.recommendations.push(
      'Regularly review and update RLS policies',
      'Monitor database access logs',
      'Use least-privilege principle for database roles',
      'Implement proper error handling to prevent information disclosure'
    );

    safeConsole.dev(`✅ Security audit completed. Status: ${audit.overall}`);
  } catch (error) {
    safeConsole.error('Security audit failed:', error);
    audit.overall = 'CRITICAL';
    audit.recommendations.push('Security audit failed - manual review required');
  }

  return audit;
};

/**
 * Validate Supabase environment configuration
 */
export const validateSupabaseConfig = (): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check required environment variables
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      issues.push(`Missing environment variable: ${varName}`);
    }
  }

  // Validate URL format
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('.supabase.co')) {
    recommendations.push('Ensure Supabase URL is from official Supabase domain');
  }

  // Check for development vs production configuration
  if (process.env.NODE_ENV === 'production') {
    recommendations.push(
      'Ensure anon key has minimal permissions in production',
      'Use service role key only on server-side',
      'Enable RLS on all tables',
      'Configure proper CORS settings'
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
  };
};

/**
 * Sanitize Supabase error for client consumption
 */
export const sanitizeSupabaseError = (
  error: unknown
): {
  message: string;
  code?: string;
  safe: boolean;
} => {
  if (!error) {
    return { message: 'Unknown error occurred', safe: true };
  }

  // Common safe error patterns
  const safeErrors = [
    'PGRST116', // No rows found
    'PGRST301', // Singular response expected
    '23505', // Unique constraint violation
    '23503', // Foreign key violation
    '42501', // Insufficient privilege (safe to show)
  ];

  const errorObj = error as {
    code?: string;
    error_code?: string;
    message?: string;
  };
  const errorCode = errorObj.code || errorObj.error_code;
  const isSafeError = errorCode && safeErrors.includes(errorCode);

  if (isSafeError) {
    return {
      message: errorObj.message || 'Operation failed',
      code: errorCode,
      safe: true,
    };
  }

  // For unsafe errors, return generic message
  return {
    message: 'A database error occurred. Please try again.',
    code: errorCode,
    safe: false,
  };
};

/**
 * Log Supabase operation securely
 */
export const logSupabaseOperation = (
  operation: string,
  table: string,
  success: boolean,
  error?: unknown,
  metadata?: Record<string, unknown>
): void => {
  const logData = {
    operation,
    table,
    success,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  if (success) {
    safeConsole.dev(`Supabase ${operation} on ${table}: SUCCESS`, logData);
  } else {
    const sanitizedError = sanitizeSupabaseError(error);
    safeConsole.error(`Supabase ${operation} on ${table}: FAILED`, {
      ...logData,
      error: sanitizedError,
    });
  }
};

/**
 * @fileoverview Session debugging utilities for development
 * @author Axel Modra
 */

import { createClerkSupabaseClient } from '@/lib/supabase';
import { createSessionManager } from '@/services/sessionManager';
import { safeConsole } from '@/utils/console';

/**
 * Debug session integration between Clerk and Supabase
 * Only works in development mode
 */
export const debugSessionIntegration = async () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    safeConsole.dev('🔧 Starting session integration debug...');

    // Test basic Supabase connection
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      safeConsole.error('❌ Missing Supabase environment variables');
      return;
    }

    const basicClient = createClient(supabaseUrl, supabaseAnonKey);

    // Test basic connection
    const { error: testError } = await basicClient.from('user_sessions').select('count').limit(1);

    if (testError) {
      safeConsole.error('❌ Basic Supabase connection failed:', testError);
    } else {
      safeConsole.dev('✅ Basic Supabase connection successful');
    }

    safeConsole.dev('🔧 Session integration debug completed');
  } catch (error) {
    safeConsole.error('❌ Session debug error:', error);
  }
};

/**
 * Debug Clerk token for Supabase integration
 */
export const debugClerkToken = async (getToken: () => Promise<string | null>) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    safeConsole.dev('🔧 Starting Clerk token debug...');

    const token = await getToken();

    if (!token) {
      safeConsole.error('❌ No Clerk token available');
      return;
    }

    safeConsole.dev('✅ Clerk token exists');

    // Parse token payload
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        safeConsole.error('❌ Invalid JWT format');
        return;
      }

      const payload = JSON.parse(atob(parts[1]));

      safeConsole.dev('🔍 Token payload: [REDACTED FOR SECURITY]');

      // Check if token has required claims for Supabase
      if (!payload.role) {
        safeConsole.error('❌ Token missing "role" claim required for Supabase RLS');
      } else if (payload.role === 'authenticated') {
        safeConsole.dev('✅ Token has correct "authenticated" role for Supabase');
      } else {
        safeConsole.warn('⚠️ Token role is not "authenticated":', payload.role);
      }

      if (!payload.sub) {
        safeConsole.error('❌ Token missing "sub" claim (user ID)');
      } else {
        safeConsole.dev('✅ Token has user ID (sub): [REDACTED]');
      }
    } catch (parseError) {
      safeConsole.error('❌ Failed to parse token payload:', parseError);
    }

    safeConsole.dev('🔧 Clerk token debug completed');
  } catch (error) {
    safeConsole.error('❌ Token debug error:', error);
  }
};

/**
 * Test session creation with debugging
 */
export const debugSessionCreation = async (
  userId: string,
  getToken: () => Promise<string | null>
) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    safeConsole.dev('🔧 Starting session creation debug');

    // Debug token first
    await debugClerkToken(getToken);

    // Create Supabase client with Clerk token
    const supabaseClient = createClerkSupabaseClient(getToken);
    const sessionManager = createSessionManager(supabaseClient);

    // Test basic database access first
    safeConsole.dev('🔍 Testing basic database access...');
    const { error: accessError } = await supabaseClient
      .from('user_sessions')
      .select('count')
      .limit(1);

    if (accessError) {
      safeConsole.error('❌ Database access failed:', {
        error: accessError,
        code: accessError.code,
        message: accessError.message,
        details: accessError.details,
        hint: accessError.hint,
      });
      return;
    }

    safeConsole.dev('✅ Database access successful');

    // Test session creation
    const testSessionId = `debug_session_${userId}_${Date.now()}`;

    safeConsole.dev('🔄 Attempting to create test session');

    const createdSession = await sessionManager.createSession(userId, testSessionId);

    if (createdSession) {
      safeConsole.dev('✅ Test session created successfully');

      // Test session retrieval
      const sessions = await sessionManager.getUserSessions(userId);
      safeConsole.dev('📊 Retrieved sessions after creation:', sessions.length);

      // Clean up test session immediately
      try {
        await sessionManager.terminateSession(testSessionId);
        // Also delete from database to ensure cleanup
        const supabaseClient = createClerkSupabaseClient(getToken);
        await supabaseClient.from('user_sessions').delete().eq('session_id', testSessionId);
        safeConsole.dev('🧹 Test session cleaned up');
      } catch (cleanupError) {
        safeConsole.error('⚠️ Failed to cleanup test session:', cleanupError);
      }
    } else {
      safeConsole.error('❌ Failed to create test session - check previous error logs');
    }

    safeConsole.dev('🔧 Session creation debug completed');
  } catch (error) {
    safeConsole.error('❌ Session creation debug error:', error);
  }
};

/**
 * Debug RLS policies
 */
export const debugRLSPolicies = async (getToken: () => Promise<string | null>) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    safeConsole.dev('🔧 Starting RLS policies debug...');

    const supabaseClient = createClerkSupabaseClient(getToken);

    // Test if we can access user_sessions table
    const { error } = await supabaseClient.from('user_sessions').select('count').limit(1);

    if (error) {
      safeConsole.error('❌ RLS policy test failed:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
    } else {
      safeConsole.dev('✅ RLS policy test passed - can access user_sessions table');
    }

    safeConsole.dev('🔧 RLS policies debug completed');
  } catch (error) {
    safeConsole.error('❌ RLS debug error:', error);
  }
};

/**
 * Clean up all debug sessions from database
 */
export const cleanupDebugSessions = async (getToken: () => Promise<string | null>) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    const supabaseClient = createClerkSupabaseClient(getToken);
    const { error } = await supabaseClient
      .from('user_sessions')
      .delete()
      .or('session_id.like.%debug%,session_id.like.%test%');

    if (!error) {
      safeConsole.dev('🧹 Debug sessions cleaned up');
    }
  } catch (_error) {
    // Silent cleanup - don't log errors
  }
};

/**
 * Comprehensive session debug
 */
export const runFullSessionDebug = async (
  userId: string,
  getToken: () => Promise<string | null>
) => {
  if (process.env.NODE_ENV !== 'development') {
    safeConsole.dev('🚫 Session debug only available in development mode');
    return;
  }

  // Clean up any leftover debug sessions first
  await cleanupDebugSessions(getToken);

  safeConsole.dev('🚀 Starting comprehensive session debug...');

  await debugSessionIntegration();
  await debugClerkToken(getToken);
  await debugRLSPolicies(getToken);
  await debugSessionCreation(userId, getToken);

  // Clean up again after debug
  await cleanupDebugSessions(getToken);

  safeConsole.dev('🏁 Comprehensive session debug completed');
};

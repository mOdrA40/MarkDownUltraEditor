/**
 * @fileoverview Supabase client configuration with Clerk authentication integration
 * @author Axel Modra
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/react-router';

// Environment variables validation
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// Database types for type safety
export interface Database {
  public: {
    Tables: {
      user_files: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          file_type: string;
          created_at: string;
          updated_at: string;
          is_template: boolean;
          tags: string[];
          file_size: number;
          version: number;
          is_deleted: boolean;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          file_type?: string;
          created_at?: string;
          updated_at?: string;
          is_template?: boolean;
          tags?: string[];
          file_size?: number;
          version?: number;
          is_deleted?: boolean;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          file_type?: string;
          created_at?: string;
          updated_at?: string;
          is_template?: boolean;
          tags?: string[];
          file_size?: number;
          version?: number;
          is_deleted?: boolean;
          deleted_at?: string | null;
        };
      };
      file_versions: {
        Row: {
          id: string;
          file_id: string;
          content: string;
          version_number: number;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          file_id: string;
          content: string;
          version_number: number;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          file_id?: string;
          content?: string;
          version_number?: number;
          created_at?: string;
          created_by?: string;
        };
      };
    };
  };
}

// Create base Supabase client
const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'markdown-ultra-editor',
    },
  },
});

/**
 * Create authenticated Supabase client with Clerk JWT token
 */
export const createAuthenticatedSupabaseClient = (token: string): SupabaseClient<Database> => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'markdown-ultra-editor',
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

/**
 * Hook to get authenticated Supabase client
 * Using native Third Party Auth integration (no JWT template needed)
 */
export const useSupabase = (): SupabaseClient<Database> | null => {
  const { getToken, isSignedIn } = useAuth();

  if (!isSignedIn) {
    console.log('User not signed in, returning base Supabase client');
    return supabaseClient; // Return base client for non-authenticated users
  }

  // For Third Party Auth integration, we use the default token
  const getAuthenticatedClient = async (): Promise<SupabaseClient<Database> | null> => {
    try {
      // Get default Clerk token (no template needed for Third Party Auth)
      const token = await getToken();
      if (!token) {
        console.warn('Failed to get Clerk token');
        return supabaseClient; // Fallback to base client
      }

      console.log('✓ Creating authenticated Supabase client with Third Party Auth');
      return createAuthenticatedSupabaseClient(token);
    } catch (error) {
      console.error('Error creating authenticated Supabase client:', error);
      return supabaseClient; // Fallback to base client
    }
  };

  // Return base client for now - will be enhanced with proper async handling
  return supabaseClient;
};

/**
 * Get authenticated Supabase client with token
 * This function should be called from components with Clerk context
 */
export const getAuthenticatedSupabaseClient = async (
  getToken: () => Promise<string | null>
): Promise<SupabaseClient<Database> | null> => {
  try {
    console.log('Getting authenticated Supabase client with Third Party Auth');

    // Get Clerk token
    const token = await getToken();
    if (!token) {
      console.warn('No Clerk token available, using base client');
      return supabaseClient;
    }

    console.log('✓ Creating authenticated client with token');
    return createAuthenticatedSupabaseClient(token);
  } catch (error) {
    console.error('Error getting authenticated Supabase client:', error);
    return supabaseClient; // Fallback to base client
  }
};

/**
 * Test Supabase connection
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabaseClient.from('user_files').select('count').limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }

    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

// Export the base client for non-authenticated operations
export { supabaseClient as supabase };

/**
 * Utility function to handle Supabase errors
 */
export const handleSupabaseError = (error: any, operation: string): void => {
  console.error(`Supabase ${operation} error:`, {
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
  });
};

/**
 * File data interface for type safety
 */
export interface FileData {
  id?: string;
  title: string;
  content: string;
  fileType?: string;
  tags?: string[];
  isTemplate?: boolean;
  createdAt?: string;
  updatedAt?: string;
  fileSize?: number;
  version?: number;
}

/**
 * Convert database row to FileData interface
 */
export const dbRowToFileData = (
  row: Database['public']['Tables']['user_files']['Row']
): FileData => {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    fileType: row.file_type,
    tags: row.tags,
    isTemplate: row.is_template,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fileSize: row.file_size,
    version: row.version,
  };
};

/**
 * Convert FileData to database insert format
 */
export const fileDataToDbInsert = (
  fileData: FileData,
  userId: string
): Database['public']['Tables']['user_files']['Insert'] => {
  return {
    user_id: userId,
    title: fileData.title,
    content: fileData.content,
    file_type: fileData.fileType || 'markdown',
    tags: fileData.tags || [],
    is_template: fileData.isTemplate || false,
    file_size: fileData.content.length,
    version: 1,
  };
};

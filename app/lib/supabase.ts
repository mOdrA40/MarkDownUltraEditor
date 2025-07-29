import { useAuth } from '@clerk/react-router';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

export const createClerkSupabaseClient = (
  getToken: () => Promise<string | null>
): SupabaseClient<Database> => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
    // Native Third Party Auth integration
    accessToken: async () => {
      try {
        const token = await getToken();
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.dev('Native accessToken called:', token ? '✅ Token exists' : '❌ No token');
        });
        return token;
      } catch (error) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.error('Error getting token in accessToken():', error);
        });
        return null;
      }
    },
  });
};

export const useSupabase = (): SupabaseClient<Database> | null => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev('User not signed in, returning base Supabase client');
    });
    return supabaseClient; // Return base client for non-authenticated users
  }

  // Return base client for now - will be enhanced with proper async handling
  return supabaseClient;
};

/**
 * Get authenticated Supabase client with native Third Party Auth
 * This function should be called from components with Clerk context
 */
export const getAuthenticatedSupabaseClient = async (
  getToken: () => Promise<string | null>
): Promise<SupabaseClient<Database> | null> => {
  try {
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev('Getting authenticated Supabase client with Native Third Party Auth');
    });

    // Test if we can get a token
    const token = await getToken();
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev('Token test:', token ? '✅ Token available' : '❌ No token');
    });

    if (!token) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.warn('No Clerk token available, using base client');
      });
      return supabaseClient;
    }

    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev('✓ Creating authenticated client with native accessToken()');
    });
    return createClerkSupabaseClient(getToken);
  } catch (error) {
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.error('Error getting authenticated Supabase client:', error);
    });
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
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.error('Supabase connection test failed:', error);
      });
      return false;
    }

    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev('Supabase connection test successful');
    });
    return true;
  } catch (error) {
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.error('Supabase connection test error:', error);
    });
    return false;
  }
};

// Export the base client for non-authenticated operations
export { supabaseClient as supabase };

/**
 * Utility function to handle Supabase errors securely
 */
export const handleSupabaseError = (error: unknown, operation: string): void => {
  const errorObj = error as {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  };

  // Sanitize error details to prevent information disclosure
  const sanitizedError = {
    message: errorObj?.message?.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]'), // Remove IP addresses
    code: errorObj?.code,
    operation,
    timestamp: new Date().toISOString(),
  };

  // Only log detailed information in development
  if (process.env.NODE_ENV === 'development') {
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.error(`Supabase ${operation} error:`, {
        ...sanitizedError,
        details: errorObj?.details,
        hint: errorObj?.hint,
      });
    });
  } else {
    // In production, log minimal information
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.error('Supabase operation failed:', sanitizedError);
    });
  }
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

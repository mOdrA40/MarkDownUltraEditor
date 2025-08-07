import { reactRouter } from '@react-router/dev/vite';
import { config } from 'dotenv';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Load environment variables
config();

// Security: Only expose VITE_ prefixed variables to client
// Never expose server-side secrets like CLERK_SECRET_KEY
const getSecureEnvVars = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Validate required environment variables
  const requiredVars = [
    'VITE_CLERK_PUBLISHABLE_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    // Only log in development to prevent information disclosure
    if (!isProduction) {
      console.error('❌ Missing required environment variables:', missingVars);
    }
    if (isProduction) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  return {
    'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(
      process.env.VITE_CLERK_PUBLISHABLE_KEY || ''
    ),
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
    'process.env.VITE_SENTRY_DSN': JSON.stringify(process.env.VITE_SENTRY_DSN || ''),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  };
};

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  server: {
    port: 5173,
    host: 'localhost', // Security: Only bind to localhost in development
  },
  define: getSecureEnvVars(),
  envPrefix: 'VITE_',
  build: {
    // Security: Remove console logs in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
    // Security: Generate source maps only in development
    sourcemap: process.env.NODE_ENV === 'development',
  },
});

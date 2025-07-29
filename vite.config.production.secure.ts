import { reactRouter } from '@react-router/dev/vite';
import { config } from 'dotenv';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Load environment variables
config();

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],

  // Production-specific configuration
  mode: 'production',

  build: {
    // Security: Disable source maps in production
    sourcemap: false,

    // Performance: Enable minification
    minify: 'terser',

    // Security: Remove console statements in production
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
    },

    // Performance: Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router', '@react-router/dev'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          editor: ['@uiw/react-md-editor', '@uiw/react-markdown-preview'],
          auth: ['@clerk/react-router'],
          database: ['@supabase/supabase-js'],
          monitoring: ['@sentry/react'],
        },
      },
    },

    // Security: Set appropriate target
    target: 'es2020',

    // Performance: Optimize asset handling
    assetsInlineLimit: 4096,

    // Security: Ensure proper file naming
    chunkSizeWarningLimit: 1000,
  },

  // Production server configuration
  server: {
    port: 5174,
    strictPort: true,
    host: false, // Security: Don't expose to external hosts
  },

  // Production preview configuration
  preview: {
    port: 4173,
    strictPort: true,
    host: false, // Security: Don't expose to external hosts
  },

  // Environment variables for production
  define: {
    // Only expose necessary environment variables
    'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(
      process.env.VITE_CLERK_PUBLISHABLE_KEY
    ),
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    'process.env.VITE_SENTRY_DSN': JSON.stringify(process.env.VITE_SENTRY_DSN),
    'process.env.NODE_ENV': JSON.stringify('production'),

    // Security: Disable debug features
    'process.env.VITE_DEBUG': JSON.stringify('false'),
    'process.env.VITE_VERBOSE_LOGGING': JSON.stringify('false'),
    'process.env.VITE_GENERATE_SOURCEMAP': JSON.stringify('false'),

    // Performance: Optimize for production
    __DEV__: false,
    __PROD__: true,
  },

  // Security: Configure environment prefix
  envPrefix: 'VITE_',

  // Performance: Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router', '@clerk/react-router', '@supabase/supabase-js'],
    exclude: [
      // Exclude development-only dependencies
      '@testing-library/react',
      '@testing-library/jest-dom',
      'vitest',
    ],
  },

  // Security: Configure CSP and other security headers
  // Note: These should also be configured at the server/CDN level
  html: {
    cspNonce: 'VITE_NONCE',
  },

  // Performance: Configure asset handling
  assetsInclude: ['**/*.md', '**/*.txt'],

  // Security: Prevent information disclosure
  logLevel: 'warn', // Reduce log verbosity in production

  // Performance: Configure worker handling
  worker: {
    format: 'es',
  },
});

import { reactRouter } from '@react-router/dev/vite';
import { config } from 'dotenv';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Load environment variables
config();

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],

  // Production-specific optimizations
  build: {
    // Minify for production
    minify: 'terser',

    // Disable source maps for security
    sourcemap: false,

    // Optimize chunks
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
          ],
          editor: ['react-markdown', 'rehype-highlight', 'remark-gfm'],
          auth: ['@clerk/react-router'],
          database: ['@supabase/supabase-js'],
          monitoring: ['@sentry/react', '@sentry/integrations'],
        },

        // Clean file names without hashes for better compression
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },

      // External dependencies that shouldn't be bundled
      external: [],
    },

    // Target modern browsers for better optimization
    target: 'es2020',

    // Optimize CSS
    cssCodeSplit: true,

    // Reduce bundle size
    chunkSizeWarningLimit: 1000,
  },

  // Production environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(
      process.env.VITE_CLERK_PUBLISHABLE_KEY
    ),
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    'process.env.VITE_SENTRY_DSN': JSON.stringify(process.env.VITE_SENTRY_DSN),

    // Disable development features
    __DEV__: false,
    'import.meta.env.DEV': false,
    'import.meta.env.PROD': true,
  },

  // Environment prefix
  envPrefix: 'VITE_',

  // Server configuration for preview
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      '@clerk/react-router',
      '@supabase/supabase-js',
      '@sentry/react',
    ],
    exclude: [
      // Exclude development-only dependencies
    ],
  },

  // Security headers for development server
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },

  // CSS configuration
  css: {
    // Minimize CSS in production
    postcss: {
      plugins: [
        // Add any PostCSS plugins here
      ],
    },
  },

  // Experimental features
  experimental: {
    // Enable any experimental features if needed
  },

  // Worker configuration
  worker: {
    format: 'es',
  },

  // JSON configuration
  json: {
    namedExports: true,
    stringify: false,
  },
});

import { reactRouter } from "@react-router/dev/vite";
import { config } from "dotenv";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Load environment variables
config();

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  server: {
    port: 5174,
  },
  define: {
    "process.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_CLERK_PUBLISHABLE_KEY
    ),
    "process.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.VITE_SUPABASE_URL
    ),
    "process.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
      process.env.VITE_SUPABASE_ANON_KEY
    ),
    "process.env.VITE_SENTRY_DSN": JSON.stringify(process.env.VITE_SENTRY_DSN),
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
  envPrefix: "VITE_",
  
  // Production optimizations
  build: {
    // Enable tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info'], // Remove specific console methods
      },
    },
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover'],
          'editor-vendor': ['react-markdown', 'rehype-highlight', 'remark-gfm'],
          'query-vendor': ['@tanstack/react-query'],
          'clerk-vendor': ['@clerk/react-router'],
          'sentry-vendor': ['@sentry/react'],
          
          // Feature chunks
          'editor': ['app/components/editor'],
          'features': ['app/components/features'],
          'utils': ['app/utils'],
        },
      },
    },
    
    // Bundle size limits
    chunkSizeWarningLimit: 1000, // 1MB warning
    
    // Source maps for production debugging (optional)
    sourcemap: false, // Disable for smaller bundle
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'react-markdown',
      'lucide-react',
    ],
    exclude: [
      // Exclude debug components from optimization
      '@/components/debug/EnvDebugPanel',
      '@/components/debug/ErrorBoundaryTest', 
      '@/components/debug/SentryTestPanel',
    ],
  },
});

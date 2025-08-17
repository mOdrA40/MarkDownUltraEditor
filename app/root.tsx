import { ClerkProvider } from '@clerk/react-router';
import { rootAuthLoader } from '@clerk/react-router/ssr.server';
import type React from 'react';
import { Suspense, useEffect } from 'react';
import type { HeadersFunction, LinksFunction } from 'react-router';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigation } from 'react-router';

import { ThemeProvider } from '@/components/features/ThemeSelector';
import { PageLoader } from '@/components/shared/PageLoader';
import { FileContextProvider } from '@/contexts/FileContextProvider';
import { fixRedirectLoop } from '@/utils/auth/redirects';
import type { Route } from './+types/root';

import './tailwind.css';
import './styles/dropdown-improvements.css';
import './styles/transitions.css';

if (typeof window !== 'undefined') {
  import('@/utils/performance').then(({ initializePerformanceOptimizations }) => {
    initializePerformanceOptimizations();
  });

  import('@/utils/memoryOptimization').then(({ initializeMemoryOptimization }) => {
    initializeMemoryOptimization();
  });
}

if (typeof window !== 'undefined') {
  import('@/utils/errorHandling').then(({ initializeErrorHandler }) => {
    initializeErrorHandler();
  });
}

export async function loader(args: Route.LoaderArgs) {
  return rootAuthLoader(args);
}

export const links: LinksFunction = () => [
  { rel: 'icon', href: '/markdownlogo.svg?v=2024', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: '/markdownlogo.svg?v=2024' },
  { rel: 'manifest', href: '/site.webmanifest' },

  // Fonts
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export const headers: HeadersFunction = () => {
  return {};
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Security Meta Tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

        {/* 🎨 Force favicon override - dengan cache busting */}
        <link rel="icon" href="/markdownlogo.svg?v=2024" type="image/svg+xml" />
        <link rel="shortcut icon" href="/markdownlogo.svg?v=2024" type="image/svg+xml" />
        <Meta />
        <Links />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-600 mb-8">
          We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY;
  const navigation = useNavigation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fixRedirectLoop();
    }
  }, []);

  if (!publishableKey) {
    throw new Error('Missing Clerk Publishable Key');
  }

  return (
    <ClerkProvider
      loaderData={loaderData}
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      appearance={{
        elements: {
          formButtonPrimary: 'normal-case',
        },
      }}
    >
      <ThemeProvider>
        <FileContextProvider>
          <div
            className={`transition-opacity duration-300 ${
              navigation.state === 'loading' ? 'opacity-25' : 'opacity-100'
            }`}
          >
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </FileContextProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

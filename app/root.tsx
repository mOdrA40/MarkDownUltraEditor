import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { LinksFunction, HeadersFunction } from "react-router";

import "./tailwind.css";

export const links: LinksFunction = () => [
  // 🎨 Custom favicon - dengan cache busting
  { rel: "icon", href: "/markdownlogo.svg?v=2024", type: "image/svg+xml" },
  { rel: "apple-touch-icon", href: "/markdownlogo.svg?v=2024" },
  { rel: "manifest", href: "/site.webmanifest" },

  // Fonts
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// Security headers untuk HSTS dan lainnya
export const headers: HeadersFunction = () => ({
  // HSTS - HTTP Strict Transport Security
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // XSS Protection
  "X-XSS-Protection": "1; mode=block",
  // Referrer Policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Content Security Policy
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self'; media-src 'self'; object-src 'none'; child-src 'none'; worker-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self';"
});

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
      <body style={{
        margin: 0,
        padding: 0,
        overflowX: 'hidden',
        position: 'relative',
        width: '100%',
        minHeight: '100vh'
      }}>
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
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return <Outlet />;
}

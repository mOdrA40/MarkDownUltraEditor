import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { LinksFunction } from "react-router";

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



export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* 🎨 Force favicon override - dengan cache busting */}
        <link rel="icon" href="/markdownlogo.svg?v=2024" type="image/svg+xml" />
        <link rel="shortcut icon" href="/markdownlogo.svg?v=2024" type="image/svg+xml" />
        <Meta />
        <Links />
      </head>
      <body style={{ margin: 0, padding: 0, overflowX: 'hidden' }}>
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

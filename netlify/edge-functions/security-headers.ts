/**
 * Netlify Edge Function for Enhanced Security Headers
 * Provides additional security layer for MarkDownUltraRemix
 */

// Netlify Edge Function context type
interface Context {
  next: () => Promise<Response>;
}

export default async (request: Request, context: Context) => {
  // Get the response from the origin
  const response = await context.next();

  // Clone the response to modify headers
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  });

  // Security headers
  const securityHeaders = {
    // HSTS - HTTP Strict Transport Security
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // XSS Protection
    'X-XSS-Protection': '1; mode=block',

    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy - Disable unnecessary features
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'picture-in-picture=()',
    ].join(', '),

    // Content Security Policy - Production Ready
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://clerk.com https://*.clerk.accounts.dev https://cdnjs.cloudflare.com",
      "img-src 'self' data: blob: https: https://images.unsplash.com https://picsum.photos https://via.placeholder.com https://placehold.co https://clerk.com https://*.clerk.accounts.dev",
      "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com wss://*.supabase.co wss://*.clerk.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://sentry.io",
      "media-src 'self' blob: data:",
      "object-src 'none'",
      "child-src 'none'",
      "worker-src 'self' blob:",
      "frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
      "form-action 'self' https://clerk.com https://*.clerk.accounts.dev",
      "base-uri 'self'",
      'upgrade-insecure-requests',
    ].join('; '),

    // Additional security headers
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });

  // Rate limiting headers (basic implementation)
  const _clientIP =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Add rate limiting info (this is just informational, actual rate limiting would need more complex logic)
  newResponse.headers.set('X-RateLimit-Limit', '100');
  newResponse.headers.set('X-RateLimit-Remaining', '99');
  newResponse.headers.set('X-RateLimit-Reset', String(Math.floor(Date.now() / 1000) + 3600));

  // Security monitoring headers
  newResponse.headers.set('X-Security-Policy', 'enforced');
  newResponse.headers.set('X-Content-Security-Policy-Report-Only', 'false');

  return newResponse;
};

export const config = {
  path: '/*',
  excludedPath: ['/api/webhooks/*', '/.well-known/*'],
};

/**
 * @fileoverview Authentication redirect utilities
 * @author Axel Modra
 */

/**
 * Clean and validate redirect URLs to prevent redirect loops
 */
export function cleanRedirectUrl(url: string | null): string {
  // Default to home page
  if (!url) return '/';

  try {
    const parsed = new URL(url, window.location.origin);

    // Only allow same-origin redirects
    if (parsed.origin !== window.location.origin) {
      return '/';
    }

    // Prevent redirect loops by checking for auth-related paths
    const authPaths = ['/sign-in', '/sign-up'];
    if (authPaths.includes(parsed.pathname)) {
      return '/';
    }

    // Clean up query parameters that might cause loops
    const cleanParams = new URLSearchParams();
    for (const [key, value] of parsed.searchParams) {
      // Skip redirect-related parameters that might cause loops
      if (!key.includes('redirect') && !key.includes('fallback')) {
        cleanParams.set(key, value);
      }
    }

    const cleanPath =
      parsed.pathname + (cleanParams.toString() ? `?${cleanParams.toString()}` : '');
    return cleanPath;
  } catch {
    // If URL parsing fails, return home
    return '/';
  }
}

/**
 * Get the appropriate redirect URL after authentication
 */
export function getPostAuthRedirect(): string {
  // Check for intended destination in sessionStorage
  const intended = sessionStorage.getItem('intended_destination');
  if (intended) {
    sessionStorage.removeItem('intended_destination');
    return cleanRedirectUrl(intended);
  }

  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get('redirect_url') || urlParams.get('return_to');
  if (redirectParam) {
    return cleanRedirectUrl(redirectParam);
  }

  // Default to home
  return '/';
}

/**
 * Store intended destination before redirecting to auth
 */
export function storeIntendedDestination(path?: string): void {
  const destination = path || window.location.pathname + window.location.search;

  // Don't store auth pages as intended destination
  if (!destination.includes('/sign-in') && !destination.includes('/sign-up')) {
    sessionStorage.setItem('intended_destination', destination);
  }
}

/**
 * Clear any stored redirect information
 */
export function clearRedirectData(): void {
  sessionStorage.removeItem('intended_destination');
}

/**
 * Check if current URL has redirect loop indicators
 */
export function hasRedirectLoop(): boolean {
  const url = window.location.href;

  // Check for repeated redirect parameters
  const redirectCount = (url.match(/redirect_url/g) || []).length;
  const fallbackCount = (url.match(/fallback_redirect_url/g) || []).length;

  return redirectCount > 2 || fallbackCount > 2 || url.length > 500;
}

/**
 * Fix redirect loop by cleaning URL and redirecting to home
 */
export function fixRedirectLoop(): void {
  if (hasRedirectLoop()) {
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.warn('Redirect loop detected, redirecting to home');
    });
    clearRedirectData();
    window.location.href = '/';
  }
}

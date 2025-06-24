/**
 * Media Query utility functions
 * 
 * Kumpulan utility functions untuk responsive design
 * dan media query management.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { MediaQueryBreakpoints, DeviceType } from '../types';

/**
 * Breakpoint constants sesuai dengan design system
 */
export const BREAKPOINTS = {
  /** Mobile breakpoint (max-width) */
  MOBILE: '767px',
  /** Tablet breakpoint (max-width) */
  TABLET: '1023px',
  /** Desktop breakpoint (min-width) */
  DESKTOP: '1024px',
  /** Large desktop breakpoint (min-width) */
  LARGE_DESKTOP: '1440px',
} as const;

/**
 * Media query strings untuk berbagai breakpoints
 */
export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.MOBILE})`,
  tablet: `(min-width: 768px) and (max-width: ${BREAKPOINTS.TABLET})`,
  desktop: `(min-width: ${BREAKPOINTS.DESKTOP})`,
  largeDesktop: `(min-width: ${BREAKPOINTS.LARGE_DESKTOP})`,
  prefersReducedMotion: '(prefers-reduced-motion: reduce)',
  prefersDarkMode: '(prefers-color-scheme: dark)',
  prefersLightMode: '(prefers-color-scheme: light)',
  highContrast: '(prefers-contrast: high)',
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
} as const;

/**
 * Membuat MediaQueryList objects untuk semua breakpoints
 * 
 * @returns MediaQueryBreakpoints object
 */
export const createMediaQueryBreakpoints = (): MediaQueryBreakpoints | null => {
  // Check jika window tersedia (browser environment)
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null;
  }

  return {
    mobile: window.matchMedia(MEDIA_QUERIES.mobile),
    tablet: window.matchMedia(MEDIA_QUERIES.tablet),
    desktop: window.matchMedia(MEDIA_QUERIES.desktop),
    prefersReducedMotion: window.matchMedia(MEDIA_QUERIES.prefersReducedMotion),
    prefersDarkMode: window.matchMedia(MEDIA_QUERIES.prefersDarkMode),
  };
};

/**
 * Mendeteksi device type berdasarkan viewport width
 * 
 * @param mediaQueries - MediaQueryBreakpoints object
 * @returns Device type
 */
export const detectDeviceType = (mediaQueries: MediaQueryBreakpoints | null): DeviceType => {
  if (!mediaQueries) {
    // Fallback untuk server-side rendering
    return 'desktop';
  }

  if (mediaQueries.mobile.matches) {
    return 'mobile';
  } else if (mediaQueries.tablet.matches) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * Check apakah user prefers reduced motion
 * 
 * @param mediaQueries - MediaQueryBreakpoints object
 * @returns Boolean indicating reduced motion preference
 */
export const checkReducedMotionPreference = (mediaQueries: MediaQueryBreakpoints | null): boolean => {
  return mediaQueries?.prefersReducedMotion.matches ?? false;
};

/**
 * Check apakah user prefers dark mode
 * 
 * @param mediaQueries - MediaQueryBreakpoints object
 * @returns Boolean indicating dark mode preference
 */
export const checkDarkModePreference = (mediaQueries: MediaQueryBreakpoints | null): boolean => {
  return mediaQueries?.prefersDarkMode.matches ?? false;
};

/**
 * Membuat media query listener dengan cleanup
 * 
 * @param query - Media query string
 * @param callback - Callback function
 * @returns Cleanup function
 */
export const createMediaQueryListener = (
  query: string,
  callback: (event: MediaQueryListEvent) => void
): (() => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {}; // No-op cleanup untuk server-side
  }

  const mediaQuery = window.matchMedia(query);
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  }
  
  // Legacy browsers
  if (mediaQuery.addListener) {
    mediaQuery.addListener(callback);
    return () => mediaQuery.removeListener(callback);
  }
  
  return () => {}; // Fallback no-op
};

/**
 * Get viewport dimensions
 * 
 * @returns Viewport width and height
 */
export const getViewportDimensions = (): { width: number; height: number } => {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 }; // Default untuk SSR
  }

  return {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
  };
};

/**
 * Check apakah viewport dalam portrait mode
 * 
 * @returns Boolean indicating portrait orientation
 */
export const isPortraitMode = (): boolean => {
  const { width, height } = getViewportDimensions();
  return height > width;
};

/**
 * Check apakah viewport dalam landscape mode
 * 
 * @returns Boolean indicating landscape orientation
 */
export const isLandscapeMode = (): boolean => {
  return !isPortraitMode();
};

/**
 * Get device pixel ratio
 * 
 * @returns Device pixel ratio
 */
export const getDevicePixelRatio = (): number => {
  if (typeof window === 'undefined') {
    return 1; // Default untuk SSR
  }

  return window.devicePixelRatio || 1;
};

/**
 * Check apakah device memiliki retina display
 * 
 * @returns Boolean indicating retina display
 */
export const isRetinaDisplay = (): boolean => {
  return getDevicePixelRatio() >= 2;
};

/**
 * Responsive utilities untuk standardisasi breakpoints dan deteksi device
 * Menggunakan standar breakpoints yang konsisten di seluruh aplikasi
 */

/**
 * Standar breakpoints untuk aplikasi
 * Mengikuti best practices mobile-first design
 */
export const BREAKPOINTS = {
  mobile: {
    min: 320,
    max: 767,
  },
  tablet: {
    min: 768,
    max: 1023,
  },
  desktop: {
    min: 1024,
    max: Number.POSITIVE_INFINITY,
  },
} as const;

/**
 * Media query strings untuk CSS dan JavaScript
 */
export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.mobile.max}px)`,
  tablet: `(min-width: ${BREAKPOINTS.tablet.min}px) and (max-width: ${BREAKPOINTS.tablet.max}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop.min}px)`,
  mobileAndTablet: `(max-width: ${BREAKPOINTS.tablet.max}px)`,
  tabletAndDesktop: `(min-width: ${BREAKPOINTS.tablet.min}px)`,
  prefersReducedMotion: '(prefers-reduced-motion: reduce)',
  prefersDarkMode: '(prefers-color-scheme: dark)',
} as const;

/**
 * Type definitions untuk responsive state
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveState {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  windowWidth: number;
  windowHeight: number;
}

/**
 * Utility function untuk mendapatkan device type berdasarkan width
 */
export const getDeviceType = (width: number): DeviceType => {
  if (width <= BREAKPOINTS.mobile.max) return 'mobile';
  if (width <= BREAKPOINTS.tablet.max) return 'tablet';
  return 'desktop';
};

/**
 * Utility function untuk check apakah sedang di mobile
 */
export const isMobileWidth = (width: number): boolean => {
  return width <= BREAKPOINTS.mobile.max;
};

/**
 * Utility function untuk check apakah sedang di tablet
 */
export const isTabletWidth = (width: number): boolean => {
  return width >= BREAKPOINTS.tablet.min && width <= BREAKPOINTS.tablet.max;
};

/**
 * Utility function untuk check apakah sedang di desktop
 */
export const isDesktopWidth = (width: number): boolean => {
  return width >= BREAKPOINTS.desktop.min;
};

/**
 * Utility function untuk membuat MediaQueryList objects
 */
export const createMediaQueryList = (query: string): MediaQueryList | null => {
  if (typeof window === 'undefined') return null;
  return window.matchMedia(query);
};

/**
 * Utility function untuk mendapatkan window dimensions dengan fallback
 */
export const getWindowDimensions = () => {
  if (typeof window === 'undefined') {
    return { width: BREAKPOINTS.desktop.min, height: 800 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * Utility function untuk debounce resize events
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Utility function untuk throttle resize events
 */
export const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

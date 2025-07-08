/**
 * Responsive utilities untuk standardisasi breakpoints dan deteksi device
 * Menggunakan standar breakpoints yang konsisten dengan aspect ratio detection
 *
 * Device Analysis:
 * - Mobile Small: 320-575px (iPhone SE, older phones)
 * - Mobile: 576-767px (iPhone 12/13/14, Galaxy S series)
 * - Tablet Small: 768-991px (iPad Mini, small tablets)
 * - Tablet Large: 992-1199px (iPad Air, iPad Pro 11")
 * - Desktop Small: 1200-1399px (small laptops, 13" screens)
 * - Desktop Large: 1400px+ (large monitors, 15"+ laptops)
 */

/**
 * Comprehensive breakpoints dengan aspect ratio considerations
 */
export const BREAKPOINTS = {
  mobileSmall: {
    min: 320,
    max: 575,
    aspectRatio: { min: 0.4, max: 0.8 }, // Portrait phones
  },
  mobile: {
    min: 576,
    max: 767,
    aspectRatio: { min: 0.4, max: 0.8 }, // Modern phones
  },
  tabletSmall: {
    min: 768,
    max: 991,
    aspectRatio: { min: 0.6, max: 1.5 }, // Small tablets, some phones landscape
  },
  tabletLarge: {
    min: 992,
    max: 1199,
    aspectRatio: { min: 0.6, max: 1.8 }, // Large tablets, iPad Pro
  },
  desktopSmall: {
    min: 1200,
    max: 1399,
    aspectRatio: { min: 1.0, max: 2.5 }, // Small laptops, ultrabooks
  },
  desktopLarge: {
    min: 1400,
    max: Number.POSITIVE_INFINITY,
    aspectRatio: { min: 1.0, max: 3.0 }, // Large monitors, wide screens
  },
} as const;

/**
 * Media query strings untuk CSS dan JavaScript
 */
export const MEDIA_QUERIES = {
  // Individual breakpoints
  mobileSmall: `(min-width: ${BREAKPOINTS.mobileSmall.min}px) and (max-width: ${BREAKPOINTS.mobileSmall.max}px)`,
  mobile: `(min-width: ${BREAKPOINTS.mobile.min}px) and (max-width: ${BREAKPOINTS.mobile.max}px)`,
  tabletSmall: `(min-width: ${BREAKPOINTS.tabletSmall.min}px) and (max-width: ${BREAKPOINTS.tabletSmall.max}px)`,
  tabletLarge: `(min-width: ${BREAKPOINTS.tabletLarge.min}px) and (max-width: ${BREAKPOINTS.tabletLarge.max}px)`,
  desktopSmall: `(min-width: ${BREAKPOINTS.desktopSmall.min}px) and (max-width: ${BREAKPOINTS.desktopSmall.max}px)`,
  desktopLarge: `(min-width: ${BREAKPOINTS.desktopLarge.min}px)`,

  // Combined ranges
  allMobile: `(max-width: ${BREAKPOINTS.mobile.max}px)`,
  allTablet: `(min-width: ${BREAKPOINTS.tabletSmall.min}px) and (max-width: ${BREAKPOINTS.tabletLarge.max}px)`,
  allDesktop: `(min-width: ${BREAKPOINTS.desktopSmall.min}px)`,
  mobileAndTablet: `(max-width: ${BREAKPOINTS.tabletLarge.max}px)`,
  tabletAndDesktop: `(min-width: ${BREAKPOINTS.tabletSmall.min}px)`,

  // Orientation and special cases
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  prefersReducedMotion: '(prefers-reduced-motion: reduce)',
  prefersDarkMode: '(prefers-color-scheme: dark)',

  // Special device detection
  largeTabletPortrait: '(min-width: 1024px) and (max-width: 1199px) and (orientation: portrait)',
  ultrawide: '(min-aspect-ratio: 21/9)',
} as const;

/**
 * Type definitions untuk responsive state
 */
export type DeviceType =
  | 'mobile-small'
  | 'mobile'
  | 'tablet-small'
  | 'tablet-large'
  | 'desktop-small'
  | 'desktop-large';

export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveState {
  deviceType: DeviceType;
  deviceCategory: DeviceCategory;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  windowWidth: number;
  windowHeight: number;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape';
}

/**
 * Utility function untuk mendapatkan device type berdasarkan width dan height
 */
export const getDeviceType = (width: number, height?: number): DeviceType => {
  const aspectRatio = height ? width / height : 1.5; // Default landscape ratio

  if (width <= BREAKPOINTS.mobileSmall.max) return 'mobile-small';
  if (width <= BREAKPOINTS.mobile.max) return 'mobile';
  if (width <= BREAKPOINTS.tabletSmall.max) {
    // Check if it's actually a phone in landscape
    if (aspectRatio > 1.8) return 'mobile';
    return 'tablet-small';
  }
  if (width <= BREAKPOINTS.tabletLarge.max) {
    // Special case for iPad Pro portrait
    if (height && height > width && width >= 1024) return 'tablet-large';
    return 'tablet-large';
  }
  if (width <= BREAKPOINTS.desktopSmall.max) return 'desktop-small';
  return 'desktop-large';
};

/**
 * Utility function untuk mendapatkan device category
 */
export const getDeviceCategory = (deviceType: DeviceType): DeviceCategory => {
  if (deviceType.startsWith('mobile')) return 'mobile';
  if (deviceType.startsWith('tablet')) return 'tablet';
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
  return width >= BREAKPOINTS.tabletSmall.min && width <= BREAKPOINTS.tabletLarge.max;
};

/**
 * Utility function untuk check apakah sedang di desktop
 */
export const isDesktopWidth = (width: number): boolean => {
  return width >= BREAKPOINTS.desktopSmall.min;
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
    return { width: BREAKPOINTS.desktopSmall.min, height: 800 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * Comprehensive device detection dengan aspect ratio
 */
export const detectDevice = (width: number, height: number) => {
  const aspectRatio = width / height;
  const deviceType = getDeviceType(width, height);
  const deviceCategory = getDeviceCategory(deviceType);

  return {
    deviceType,
    deviceCategory,
    aspectRatio,
    orientation: width > height ? 'landscape' : ('portrait' as const),
    isMobile: deviceCategory === 'mobile',
    isTablet: deviceCategory === 'tablet',
    isDesktop: deviceCategory === 'desktop',
    isPhone: deviceCategory === 'mobile',
    isTabletPortrait: deviceCategory === 'tablet' && width < height,
    isTabletLandscape: deviceCategory === 'tablet' && width > height,
    isLaptop: deviceType === 'desktop-small',
    isDesktopLarge: deviceType === 'desktop-large',
    isUltrawide: aspectRatio > 2.1,
    isLargeTabletPortrait: width >= 1024 && width <= 1199 && height > width,
  };
};

// Import common utilities to avoid duplication
import { debounce, throttle } from './common';

// Re-export for backward compatibility
export { debounce, throttle };

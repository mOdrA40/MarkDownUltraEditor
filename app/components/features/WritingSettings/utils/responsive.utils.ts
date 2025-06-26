/**
 * Responsive Utilities - Helper Functions untuk Responsive Design
 * Utility functions untuk menangani responsive behavior
 * 
 * @author Axel Modra
 */

import { BREAKPOINTS } from '../constants/settings.constants';
import type { BreakpointType } from '../types/settings.types';

/**
 * Mendapatkan breakpoint berdasarkan window width
 * @param width - Window width dalam pixels
 * @returns Breakpoint type yang sesuai
 */
export const getBreakpointFromWidth = (width: number): BreakpointType => {
  if (width < BREAKPOINTS.mobile.max) {
    return 'mobile';
  } else if (width <= BREAKPOINTS.smallTablet.max) {
    return 'small-tablet';
  } else if (width <= BREAKPOINTS.tablet.max) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * Cek apakah width termasuk dalam breakpoint mobile
 * @param width - Window width dalam pixels
 * @returns True jika mobile
 */
export const isMobileWidth = (width: number): boolean => {
  return width >= BREAKPOINTS.mobile.min && width <= BREAKPOINTS.mobile.max;
};

/**
 * Cek apakah width termasuk dalam breakpoint small tablet
 * @param width - Window width dalam pixels
 * @returns True jika small tablet
 */
export const isSmallTabletWidth = (width: number): boolean => {
  return width >= BREAKPOINTS.smallTablet.min && width <= BREAKPOINTS.smallTablet.max;
};

/**
 * Cek apakah width termasuk dalam breakpoint tablet
 * @param width - Window width dalam pixels
 * @returns True jika tablet
 */
export const isTabletWidth = (width: number): boolean => {
  return width >= BREAKPOINTS.tablet.min && width <= BREAKPOINTS.tablet.max;
};

/**
 * Cek apakah width termasuk dalam breakpoint desktop
 * @param width - Window width dalam pixels
 * @returns True jika desktop
 */
export const isDesktopWidth = (width: number): boolean => {
  return width >= BREAKPOINTS.desktop.min;
};

/**
 * Mendapatkan CSS media query string untuk breakpoint
 * @param breakpoint - Breakpoint type
 * @returns CSS media query string
 */
export const getMediaQuery = (breakpoint: BreakpointType): string => {
  const bp = BREAKPOINTS[breakpoint === 'small-tablet' ? 'smallTablet' : breakpoint];
  
  if (bp.max === Infinity) {
    return `(min-width: ${bp.min}px)`;
  }
  
  return `(min-width: ${bp.min}px) and (max-width: ${bp.max}px)`;
};

/**
 * Cek apakah media query cocok dengan breakpoint saat ini
 * @param breakpoint - Breakpoint type
 * @returns True jika media query match
 */
export const matchesMediaQuery = (breakpoint: BreakpointType): boolean => {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = getMediaQuery(breakpoint);
  return window.matchMedia(mediaQuery).matches;
};

/**
 * Mendapatkan breakpoint saat ini berdasarkan window
 * @returns Current breakpoint type
 */
export const getCurrentBreakpoint = (): BreakpointType => {
  if (typeof window === 'undefined') return 'desktop';
  
  return getBreakpointFromWidth(window.innerWidth);
};

/**
 * Debounce function untuk resize events
 * @param func - Function yang akan di-debounce
 * @param wait - Delay dalam milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
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
 * Throttle function untuk resize events
 * @param func - Function yang akan di-throttle
 * @param limit - Limit dalam milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Mendapatkan viewport dimensions
 * @returns Object dengan width dan height
 */
export const getViewportDimensions = (): { width: number; height: number } => {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 }; // Default untuk SSR
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

/**
 * Cek apakah device mendukung touch
 * @returns True jika mendukung touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Mendapatkan orientation device
 * @returns 'portrait' atau 'landscape'
 */
export const getOrientation = (): 'portrait' | 'landscape' => {
  if (typeof window === 'undefined') return 'landscape';
  
  const { width, height } = getViewportDimensions();
  return width > height ? 'landscape' : 'portrait';
};

/**
 * Cek apakah dalam mode landscape
 * @returns True jika landscape
 */
export const isLandscape = (): boolean => {
  return getOrientation() === 'landscape';
};

/**
 * Cek apakah dalam mode portrait
 * @returns True jika portrait
 */
export const isPortrait = (): boolean => {
  return getOrientation() === 'portrait';
};

/**
 * Mendapatkan safe area insets (untuk mobile dengan notch)
 * @returns Object dengan insets
 */
export const getSafeAreaInsets = (): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} => {
  if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0', 10),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0', 10),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0', 10)
  };
};

/**
 * Mendapatkan preferred color scheme
 * @returns 'light' atau 'dark'
 */
export const getPreferredColorScheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Cek apakah user prefer reduced motion
 * @returns True jika prefer reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

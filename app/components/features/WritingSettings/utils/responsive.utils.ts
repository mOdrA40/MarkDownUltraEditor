/**
 * Responsive Utilities - Helper Functions untuk Responsive Design
 * Utility functions untuk menangani responsive behavior
 *
 * @author Axel Modra
 */

import { matchesMediaQuery } from '@/utils/common';
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
  }
  if (width <= BREAKPOINTS.smallTablet.max) {
    return 'small-tablet';
  }
  if (width <= BREAKPOINTS.tablet.max) {
    return 'tablet';
  }
  return 'desktop';
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

  if (bp.max === Number.POSITIVE_INFINITY) {
    return `(min-width: ${bp.min}px)`;
  }

  return `(min-width: ${bp.min}px) and (max-width: ${bp.max}px)`;
};

/**
 * Cek apakah media query cocok dengan breakpoint saat ini
 * @param breakpoint - Breakpoint type
 * @returns True jika media query match
 */
export const matchesBreakpoint = (breakpoint: BreakpointType): boolean => {
  const mediaQuery = getMediaQuery(breakpoint);
  return matchesMediaQuery(mediaQuery);
};

/**
 * Mendapatkan breakpoint saat ini berdasarkan window
 * @returns Current breakpoint type
 */
export const getCurrentBreakpoint = (): BreakpointType => {
  if (typeof window === 'undefined') return 'desktop';

  return getBreakpointFromWidth(window.innerWidth);
};

// Import common utilities to avoid duplication
import { debounce, throttle } from '@/utils/common';

// Re-export for backward compatibility
export { debounce, throttle };

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
    height: window.innerHeight,
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
    top: Number.parseInt(style.getPropertyValue('--safe-area-inset-top') || '0', 10),
    right: Number.parseInt(style.getPropertyValue('--safe-area-inset-right') || '0', 10),
    bottom: Number.parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0', 10),
    left: Number.parseInt(style.getPropertyValue('--safe-area-inset-left') || '0', 10),
  };
};

// Removed duplicate getPreferredColorScheme and prefersReducedMotion functions
// Using centralized utilities from common.ts

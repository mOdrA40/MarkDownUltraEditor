/**
 * Responsive Utilities
@author Axel Modra
 */

import { matchesMediaQuery } from '@/utils/common';
import { BREAKPOINTS } from '../constants/settings.constants';
import type { BreakpointType } from '../types/settings.types';

/**
 * Get breakpoint based on window width
 * @param width - Window width in pixels
 * @returns Breakpoint type
 */
export const getBreakpointFromWidth = (width: number): BreakpointType => {
  if (width < 500) {
    return 'mobile';
  }
  if (width <= 768) {
    return 'small-tablet';
  }
  if (width <= BREAKPOINTS.tablet.max) {
    return 'tablet';
  }
  return 'desktop';
};

/**
 * Check if width is in mobile breakpoint
 * @param width - Window width in pixels
 * @returns True if mobile
 */
export const isMobileWidth = (width: number): boolean => {
  return width >= BREAKPOINTS.mobile.min && width <= BREAKPOINTS.mobile.max;
};

/**
 * Check if width is in small tablet breakpoint
 * @param width - Window width in pixels
 * @returns True if small tablet
 */
export const isSmallTabletWidth = (width: number): boolean => {
  return width >= BREAKPOINTS.smallTablet.min && width <= BREAKPOINTS.smallTablet.max;
};

/**
 * Check if width is in tablet breakpoint
 * @param width - Window width in pixels
 * @returns True if tablet
 */
export const isTabletWidth = (width: number): boolean => {
  return width >= BREAKPOINTS.tablet.min && width <= BREAKPOINTS.tablet.max;
};

/**
 * Check if width is in desktop breakpoint
 * @param width - Window width in pixels
 * @returns True if desktop
 */
export const isDesktopWidth = (width: number): boolean => {
  return width >= BREAKPOINTS.desktop.min;
};

/**
 * Get CSS media query string for breakpoint
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
 * Check if media query matches current breakpoint
 * @param breakpoint - Breakpoint type
 * @returns True if media query matches
 */
export const matchesBreakpoint = (breakpoint: BreakpointType): boolean => {
  const mediaQuery = getMediaQuery(breakpoint);
  return matchesMediaQuery(mediaQuery);
};

/**
 * Get current breakpoint based on window
 * @returns Current breakpoint type
 */
export const getCurrentBreakpoint = (): BreakpointType => {
  if (typeof window === 'undefined') return 'desktop';

  return getBreakpointFromWidth(window.innerWidth);
};

import { debounce, throttle } from '@/utils/common';

export { debounce, throttle };

/**
 * Get viewport dimensions
 * @returns Object with width and height
 */
export const getViewportDimensions = (): { width: number; height: number } => {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * Check if device supports touch
 * @returns True if device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get device orientation
 * @returns 'portrait' or 'landscape'
 */
export const getOrientation = (): 'portrait' | 'landscape' => {
  if (typeof window === 'undefined') return 'landscape';

  const { width, height } = getViewportDimensions();
  return width > height ? 'landscape' : 'portrait';
};

/**
 * Check if in landscape mode
 * @returns True if landscape
 */
export const isLandscape = (): boolean => {
  return getOrientation() === 'landscape';
};

/**
 * Check if in portrait mode
 * @returns True if portrait
 */
export const isPortrait = (): boolean => {
  return getOrientation() === 'portrait';
};

/**
 * Get safe area insets (for mobile with notch)
 * @returns Object with insets
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


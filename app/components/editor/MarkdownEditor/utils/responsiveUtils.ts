/**
 * @fileoverview Responsive utility functions
 * @author Axel Modra
 */

import { type ComponentSizing, DeviceType, type LayoutConfig } from '../types';
import type { Breakpoints } from '../types/responsive.types';
import { BREAKPOINTS } from './constants';

/**
 * Get device type based on screen width
 */
export const getDeviceType = (width: number): DeviceType => {
  if (width < 576) return DeviceType.MOBILE_SMALL;
  if (width >= 576 && width < 768) return DeviceType.MOBILE;
  if (width >= 768 && width < 992) return DeviceType.TABLET_SMALL;
  if (width >= 992 && width < 1200) return DeviceType.TABLET_LARGE;
  if (width >= 1200 && width < 1400) return DeviceType.DESKTOP_SMALL;
  return DeviceType.DESKTOP_LARGE;
};

/**
 * Check if device is mobile
 */
export const isMobileDevice = (width: number): boolean => {
  return width < 500;
};

/**
 * Check if device is tablet
 */
export const isTabletDevice = (width: number): boolean => {
  return width >= 500 && width < 1024;
};

/**
 * Check if device is desktop
 */
export const isDesktopDevice = (width: number): boolean => {
  return width >= 1024;
};

/**
 * Check if device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    ('msMaxTouchPoints' in navigator &&
      (navigator as { msMaxTouchPoints: number }).msMaxTouchPoints > 0)
  );
};

/**
 * Get screen orientation
 */
export const getScreenOrientation = (): 'portrait' | 'landscape' => {
  if (typeof window === 'undefined') {
    return 'landscape'; // Default for SSR
  }

  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
};

/**
 * Get optimal layout configuration for device type
 */
export const getOptimalLayout = (deviceType: DeviceType): LayoutConfig => {
  const layouts: Record<DeviceType, LayoutConfig> = {
    [DeviceType.MOBILE_SMALL]: {
      showSidebar: false,
      sidebarWidth: 0,
      autoCollapseSidebar: true,
      stackLayout: true,
      compactMode: true,
      touchFriendly: true,
    },
    [DeviceType.MOBILE]: {
      showSidebar: false,
      sidebarWidth: 0,
      autoCollapseSidebar: true,
      stackLayout: true,
      compactMode: true,
      touchFriendly: true,
    },
    [DeviceType.TABLET_SMALL]: {
      showSidebar: true,
      sidebarWidth: 200,
      autoCollapseSidebar: true,
      stackLayout: true,
      compactMode: true,
      touchFriendly: true,
    },
    [DeviceType.TABLET_LARGE]: {
      showSidebar: true,
      sidebarWidth: 250,
      autoCollapseSidebar: true,
      stackLayout: false,
      compactMode: false,
      touchFriendly: true,
    },
    [DeviceType.DESKTOP_SMALL]: {
      showSidebar: true,
      sidebarWidth: 300,
      autoCollapseSidebar: false,
      stackLayout: false,
      compactMode: false,
      touchFriendly: false,
    },
    [DeviceType.DESKTOP_LARGE]: {
      showSidebar: true,
      sidebarWidth: 350,
      autoCollapseSidebar: false,
      stackLayout: false,
      compactMode: false,
      touchFriendly: false,
    },
  };

  return layouts[deviceType];
};

/**
 * Get optimal component sizing for device type
 */
export const getOptimalSizing = (deviceType: DeviceType): ComponentSizing => {
  const sizings: Record<DeviceType, ComponentSizing> = {
    [DeviceType.MOBILE_SMALL]: {
      buttonSize: 'sm',
      iconSize: 14,
      fontSizeMultiplier: 0.85,
      spacingMultiplier: 0.75,
      minTouchTarget: 44,
    },
    [DeviceType.MOBILE]: {
      buttonSize: 'sm',
      iconSize: 16,
      fontSizeMultiplier: 0.9,
      spacingMultiplier: 0.8,
      minTouchTarget: 44,
    },
    [DeviceType.TABLET_SMALL]: {
      buttonSize: 'sm',
      iconSize: 18,
      fontSizeMultiplier: 0.95,
      spacingMultiplier: 0.9,
      minTouchTarget: 44,
    },
    [DeviceType.TABLET_LARGE]: {
      buttonSize: 'md',
      iconSize: 20,
      fontSizeMultiplier: 1,
      spacingMultiplier: 1,
      minTouchTarget: 44,
    },
    [DeviceType.DESKTOP_SMALL]: {
      buttonSize: 'md',
      iconSize: 20,
      fontSizeMultiplier: 1,
      spacingMultiplier: 1,
      minTouchTarget: 32,
    },
    [DeviceType.DESKTOP_LARGE]: {
      buttonSize: 'lg',
      iconSize: 24,
      fontSizeMultiplier: 1.1,
      spacingMultiplier: 1.2,
      minTouchTarget: 32,
    },
  };

  return sizings[deviceType];
};

/**
 * Generate responsive CSS classes
 */
export const generateResponsiveClasses = (deviceType: DeviceType): string[] => {
  const classes = ['responsive-container'];

  switch (deviceType) {
    case DeviceType.MOBILE_SMALL:
      classes.push('mobile-small-device', 'touch-device', 'compact-mode', 'stack-layout');
      break;
    case DeviceType.MOBILE:
      classes.push('mobile-device', 'touch-device', 'compact-mode', 'stack-layout');
      break;
    case DeviceType.TABLET_SMALL:
      classes.push('tablet-small-device', 'touch-device', 'compact-mode', 'stack-layout');
      break;
    case DeviceType.TABLET_LARGE:
      classes.push('tablet-large-device', 'touch-device');
      break;
    case DeviceType.DESKTOP_SMALL:
      classes.push('desktop-small-device');
      break;
    case DeviceType.DESKTOP_LARGE:
      classes.push('desktop-large-device');
      break;
  }

  if (isTouchDevice()) {
    classes.push('touch-device');
  }

  return classes;
};

/**
 * Calculate responsive font size
 */
export const calculateResponsiveFontSize = (
  baseFontSize: number,
  deviceType: DeviceType
): number => {
  const sizing = getOptimalSizing(deviceType);
  return Math.round(baseFontSize * sizing.fontSizeMultiplier);
};

/**
 * Calculate responsive spacing
 */
export const calculateResponsiveSpacing = (baseSpacing: number, deviceType: DeviceType): number => {
  const sizing = getOptimalSizing(deviceType);
  return Math.round(baseSpacing * sizing.spacingMultiplier);
};

/**
 * Get responsive breakpoint media queries
 */
export const getMediaQueries = (breakpoints: Breakpoints = BREAKPOINTS) => {
  return {
    mobile: `(max-width: ${breakpoints.mobile}px)`,
    smallTablet: `(min-width: ${breakpoints.mobile + 1}px) and (max-width: ${breakpoints.smallTablet}px)`,
    tablet: `(min-width: ${breakpoints.smallTablet + 1}px) and (max-width: ${breakpoints.tablet}px)`,
    desktop: `(min-width: ${breakpoints.tablet + 1}px) and (max-width: ${breakpoints.desktop}px)`,
    largeDesktop: `(min-width: ${breakpoints.largeDesktop}px)`,
    touchDevice: '(pointer: coarse)',
    hoverDevice: '(hover: hover)',
    highDensity: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  };
};

/**
 * Check if screen width matches breakpoint
 */
export const matchesBreakpoint = (
  width: number,
  breakpoint: keyof Breakpoints,
  breakpoints: Breakpoints = BREAKPOINTS
): boolean => {
  switch (breakpoint) {
    case 'mobile':
      return width <= breakpoints.mobile;
    case 'smallTablet':
      return width > breakpoints.mobile && width <= breakpoints.smallTablet;
    case 'tablet':
      return width > breakpoints.smallTablet && width <= breakpoints.tablet;
    case 'desktop':
      return width > breakpoints.tablet && width <= breakpoints.desktop;
    case 'largeDesktop':
      return width > breakpoints.largeDesktop;
    default:
      return false;
  }
};

/**
 * Check if screen width is at least the specified breakpoint
 */
export const isAtLeastBreakpoint = (
  width: number,
  breakpoint: keyof Breakpoints,
  breakpoints: Breakpoints = BREAKPOINTS
): boolean => {
  return width >= breakpoints[breakpoint];
};

/**
 * Check if screen width is at most the specified breakpoint
 */
export const isAtMostBreakpoint = (
  width: number,
  breakpoint: keyof Breakpoints,
  breakpoints: Breakpoints = BREAKPOINTS
): boolean => {
  return width <= breakpoints[breakpoint];
};

/**
 * Get responsive grid columns based on device type
 */
export const getResponsiveGridColumns = (deviceType: DeviceType): number => {
  switch (deviceType) {
    case DeviceType.MOBILE_SMALL:
      return 1;
    case DeviceType.MOBILE:
      return 1;
    case DeviceType.TABLET_SMALL:
      return 2;
    case DeviceType.TABLET_LARGE:
      return 3;
    case DeviceType.DESKTOP_SMALL:
      return 4;
    case DeviceType.DESKTOP_LARGE:
      return 6;
    default:
      return 4;
  }
};

/**
 * Get responsive container max width
 */
export const getResponsiveMaxWidth = (deviceType: DeviceType): string => {
  switch (deviceType) {
    case DeviceType.MOBILE_SMALL:
      return '100%';
    case DeviceType.MOBILE:
      return '100%';
    case DeviceType.TABLET_SMALL:
      return '100%';
    case DeviceType.TABLET_LARGE:
      return '100%';
    case DeviceType.DESKTOP_SMALL:
      return '1200px';
    case DeviceType.DESKTOP_LARGE:
      return '1400px';
    default:
      return '1200px';
  }
};

// Import common utilities to avoid duplication
import { debounce, throttle } from '@/utils/common';

// Re-export for backward compatibility
export { debounce, throttle };

/**
 * Create responsive observer for element size changes
 */
export const createResponsiveObserver = (
  element: HTMLElement,
  callback: (width: number, height: number) => void
): ResizeObserver | null => {
  if (typeof window === 'undefined' || !window.ResizeObserver) return null;

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      callback(width, height);
    }
  });

  observer.observe(element);
  return observer;
};

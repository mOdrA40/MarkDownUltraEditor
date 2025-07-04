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
  if (width < 500) return DeviceType.MOBILE;
  if (width >= 500 && width < 768) return DeviceType.SMALL_TABLET;
  if (width >= 768 && width < 1024) return DeviceType.TABLET;
  if (width >= 1024 && width < 1440) return DeviceType.DESKTOP;
  return DeviceType.LARGE_DESKTOP;
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
    [DeviceType.MOBILE]: {
      showSidebar: false,
      sidebarWidth: 0,
      autoCollapseSidebar: true,
      stackLayout: true,
      compactMode: true,
      touchFriendly: true,
    },
    [DeviceType.SMALL_TABLET]: {
      showSidebar: true,
      sidebarWidth: 200,
      autoCollapseSidebar: true,
      stackLayout: true,
      compactMode: true,
      touchFriendly: true,
    },
    [DeviceType.TABLET]: {
      showSidebar: true,
      sidebarWidth: 250,
      autoCollapseSidebar: true,
      stackLayout: false,
      compactMode: false,
      touchFriendly: true,
    },
    [DeviceType.DESKTOP]: {
      showSidebar: true,
      sidebarWidth: 300,
      autoCollapseSidebar: false,
      stackLayout: false,
      compactMode: false,
      touchFriendly: false,
    },
    [DeviceType.LARGE_DESKTOP]: {
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
    [DeviceType.MOBILE]: {
      buttonSize: 'sm',
      iconSize: 16,
      fontSizeMultiplier: 0.9,
      spacingMultiplier: 0.8,
      minTouchTarget: 44,
    },
    [DeviceType.SMALL_TABLET]: {
      buttonSize: 'sm',
      iconSize: 18,
      fontSizeMultiplier: 0.95,
      spacingMultiplier: 0.9,
      minTouchTarget: 44,
    },
    [DeviceType.TABLET]: {
      buttonSize: 'md',
      iconSize: 20,
      fontSizeMultiplier: 1,
      spacingMultiplier: 1,
      minTouchTarget: 44,
    },
    [DeviceType.DESKTOP]: {
      buttonSize: 'md',
      iconSize: 20,
      fontSizeMultiplier: 1,
      spacingMultiplier: 1,
      minTouchTarget: 32,
    },
    [DeviceType.LARGE_DESKTOP]: {
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
    case DeviceType.MOBILE:
      classes.push('mobile-device', 'touch-device', 'compact-mode', 'stack-layout');
      break;
    case DeviceType.SMALL_TABLET:
      classes.push('small-tablet-device', 'touch-device', 'compact-mode', 'stack-layout');
      break;
    case DeviceType.TABLET:
      classes.push('tablet-device', 'touch-device');
      break;
    case DeviceType.DESKTOP:
      classes.push('desktop-device');
      break;
    case DeviceType.LARGE_DESKTOP:
      classes.push('large-desktop-device');
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
    case DeviceType.MOBILE:
      return 1;
    case DeviceType.SMALL_TABLET:
      return 2;
    case DeviceType.TABLET:
      return 3;
    case DeviceType.DESKTOP:
      return 4;
    case DeviceType.LARGE_DESKTOP:
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
    case DeviceType.MOBILE:
      return '100%';
    case DeviceType.SMALL_TABLET:
      return '100%';
    case DeviceType.TABLET:
      return '100%';
    case DeviceType.DESKTOP:
      return '1200px';
    case DeviceType.LARGE_DESKTOP:
      return '1400px';
    default:
      return '1200px';
  }
};

/**
 * Debounce function for resize events
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
 * Throttle function for scroll events
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
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

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

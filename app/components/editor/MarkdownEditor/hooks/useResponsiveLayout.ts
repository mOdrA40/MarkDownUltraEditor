/**
 * @fileoverview Responsive layout management hook
 * @author Axel Modra
 */

import { useCallback, useEffect, useState } from 'react';
import {
  type ComponentSizing,
  DeviceType,
  type LayoutConfig,
  type ResponsiveState,
  type UseResponsiveLayoutReturn,
} from '../types';
import { BREAKPOINTS } from '../utils/constants';

/**
 * Custom hook for managing responsive layout behavior
 * Handles device detection, breakpoint management, and layout configuration
 */
export const useResponsiveLayout = (): UseResponsiveLayoutReturn => {
  // Responsive state
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isSmallTablet: false,
  });

  // Additional responsive configuration
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [deviceType, setDeviceType] = useState<DeviceType>(DeviceType.DESKTOP);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  /**
   * Determine device type based on screen width
   */
  const getDeviceType = useCallback((width: number): DeviceType => {
    if (width < 500) return DeviceType.MOBILE;
    if (width >= 500 && width < 768) return DeviceType.SMALL_TABLET;
    if (width >= 768 && width < 1024) return DeviceType.TABLET;
    if (width >= 1024 && width < 1440) return DeviceType.DESKTOP;
    return DeviceType.LARGE_DESKTOP;
  }, []);

  /**
   * Get layout configuration based on device type
   */
  const getLayoutConfig = useCallback((deviceType: DeviceType): LayoutConfig => {
    switch (deviceType) {
      case DeviceType.MOBILE:
        return {
          showSidebar: false,
          sidebarWidth: 0,
          autoCollapseSidebar: true,
          stackLayout: true,
          compactMode: true,
          touchFriendly: true,
        };

      case DeviceType.SMALL_TABLET:
        return {
          showSidebar: true,
          sidebarWidth: 200,
          autoCollapseSidebar: true,
          stackLayout: true,
          compactMode: true,
          touchFriendly: true,
        };

      case DeviceType.TABLET:
        return {
          showSidebar: true,
          sidebarWidth: 250,
          autoCollapseSidebar: true,
          stackLayout: false,
          compactMode: false,
          touchFriendly: true,
        };

      case DeviceType.DESKTOP:
        return {
          showSidebar: true,
          sidebarWidth: 300,
          autoCollapseSidebar: false,
          stackLayout: false,
          compactMode: false,
          touchFriendly: false,
        };

      case DeviceType.LARGE_DESKTOP:
        return {
          showSidebar: true,
          sidebarWidth: 350,
          autoCollapseSidebar: false,
          stackLayout: false,
          compactMode: false,
          touchFriendly: false,
        };

      default:
        return {
          showSidebar: true,
          sidebarWidth: 300,
          autoCollapseSidebar: false,
          stackLayout: false,
          compactMode: false,
          touchFriendly: false,
        };
    }
  }, []);

  /**
   * Get component sizing based on device type
   */
  const getComponentSizing = useCallback((deviceType: DeviceType): ComponentSizing => {
    switch (deviceType) {
      case DeviceType.MOBILE:
        return {
          buttonSize: 'sm',
          iconSize: 16,
          fontSizeMultiplier: 0.9,
          spacingMultiplier: 0.8,
          minTouchTarget: 44,
        };

      case DeviceType.SMALL_TABLET:
        return {
          buttonSize: 'sm',
          iconSize: 18,
          fontSizeMultiplier: 0.95,
          spacingMultiplier: 0.9,
          minTouchTarget: 44,
        };

      case DeviceType.TABLET:
        return {
          buttonSize: 'md',
          iconSize: 20,
          fontSizeMultiplier: 1,
          spacingMultiplier: 1,
          minTouchTarget: 44,
        };

      case DeviceType.DESKTOP:
        return {
          buttonSize: 'md',
          iconSize: 20,
          fontSizeMultiplier: 1,
          spacingMultiplier: 1,
          minTouchTarget: 32,
        };

      case DeviceType.LARGE_DESKTOP:
        return {
          buttonSize: 'lg',
          iconSize: 24,
          fontSizeMultiplier: 1.1,
          spacingMultiplier: 1.2,
          minTouchTarget: 32,
        };

      default:
        return {
          buttonSize: 'md',
          iconSize: 20,
          fontSizeMultiplier: 1,
          spacingMultiplier: 1,
          minTouchTarget: 32,
        };
    }
  }, []);

  /**
   * Handle window resize
   */
  const handleResize = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const newDeviceType = getDeviceType(width);
    const newOrientation = width > height ? 'landscape' : 'portrait';

    setScreenWidth(width);
    setScreenHeight(height);
    setDeviceType(newDeviceType);
    setOrientation(newOrientation);

    // Update responsive state based on breakpoints
    setResponsiveState({
      isMobile: width < 500,
      isSmallTablet: width >= 500 && width < 768,
      isTablet: width >= 500 && width < 1024,
    });
  }, [getDeviceType]);

  /**
   * Detect touch device
   */
  const detectTouchDevice = useCallback(() => {
    if (typeof window === 'undefined') return;

    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      ('msMaxTouchPoints' in navigator &&
        (navigator as { msMaxTouchPoints: number }).msMaxTouchPoints > 0);
    setIsTouchDevice(hasTouch);
  }, []);

  /**
   * Initialize responsive detection
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    handleResize();
    detectTouchDevice();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize, detectTouchDevice]);

  /**
   * Utility functions
   */
  const utils = {
    isDevice: (type: DeviceType) => deviceType === type,
    isAtLeast: (breakpoint: keyof typeof BREAKPOINTS) => screenWidth >= BREAKPOINTS[breakpoint],
    isAtMost: (breakpoint: keyof typeof BREAKPOINTS) => screenWidth <= BREAKPOINTS[breakpoint],
    getOptimalLayout: () => getLayoutConfig(deviceType),
    getComponentSizing: () => getComponentSizing(deviceType),
  };

  return {
    state: responsiveState,
    config: {
      deviceType,
      screenWidth,
      screenHeight,
      isTouchDevice,
      orientation,
    },
    layout: getLayoutConfig(deviceType),
    sizing: getComponentSizing(deviceType),
    breakpoints: BREAKPOINTS,
    actions: {
      updateBreakpoints: handleResize,
    },
    utils,
  };
};

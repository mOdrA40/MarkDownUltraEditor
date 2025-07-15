/**
 * @fileoverview Responsive layout management hook
 * @author Axel Modra
 */

import { useCallback, useEffect, useState } from 'react';
import { detectDevice } from '@/utils/responsive';
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
  // Get initial dimensions safely
  const getInitialDimensions = () => {
    if (typeof window === 'undefined') return { width: 1200, height: 800 }; // Default desktop size for SSR
    return { width: window.innerWidth, height: window.innerHeight };
  };

  const initialDimensions = getInitialDimensions();
  const initialDeviceInfo = detectDevice(initialDimensions.width, initialDimensions.height);

  // Responsive state with proper initial values
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>({
    isMobile: initialDimensions.width < 500,
    isSmallTablet: initialDimensions.width >= 500 && initialDimensions.width <= 768,
    isTablet: initialDimensions.width >= 500 && initialDimensions.width < 1024,
  });

  // Additional responsive configuration with proper initial values
  const [screenWidth, setScreenWidth] = useState(initialDimensions.width);
  const [screenHeight, setScreenHeight] = useState(initialDimensions.height);
  const [deviceType, setDeviceType] = useState<DeviceType>(
    initialDeviceInfo.deviceType as DeviceType
  );
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    initialDimensions.width > initialDimensions.height ? 'landscape' : 'portrait'
  );
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  /**
   * Use the new comprehensive device detection
   */
  const getDeviceInfo = useCallback((width: number, height: number) => {
    return detectDevice(width, height);
  }, []);

  /**
   * Get layout configuration based on device type
   */
  const getLayoutConfig = useCallback((deviceType: DeviceType): LayoutConfig => {
    switch (deviceType) {
      case DeviceType.MOBILE_SMALL:
      case DeviceType.MOBILE:
        return {
          showSidebar: false,
          sidebarWidth: 0,
          autoCollapseSidebar: true,
          stackLayout: true,
          compactMode: true,
          touchFriendly: true,
        };

      case DeviceType.TABLET_SMALL:
        return {
          showSidebar: true,
          sidebarWidth: 200,
          autoCollapseSidebar: true,
          stackLayout: true,
          compactMode: true,
          touchFriendly: true,
        };

      case DeviceType.TABLET_LARGE:
        return {
          showSidebar: true,
          sidebarWidth: 250,
          autoCollapseSidebar: true,
          stackLayout: false,
          compactMode: false,
          touchFriendly: true,
        };

      case DeviceType.DESKTOP_SMALL:
        return {
          showSidebar: true,
          sidebarWidth: 300,
          autoCollapseSidebar: false,
          stackLayout: false,
          compactMode: false,
          touchFriendly: false,
        };

      case DeviceType.DESKTOP_LARGE:
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

      case DeviceType.TABLET_SMALL:
        return {
          buttonSize: 'sm',
          iconSize: 18,
          fontSizeMultiplier: 0.95,
          spacingMultiplier: 0.9,
          minTouchTarget: 44,
        };

      case DeviceType.TABLET_LARGE:
        return {
          buttonSize: 'md',
          iconSize: 20,
          fontSizeMultiplier: 1,
          spacingMultiplier: 1,
          minTouchTarget: 44,
        };

      case DeviceType.DESKTOP_SMALL:
        return {
          buttonSize: 'md',
          iconSize: 20,
          fontSizeMultiplier: 1,
          spacingMultiplier: 1,
          minTouchTarget: 32,
        };

      case DeviceType.DESKTOP_LARGE:
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
    const deviceInfo = getDeviceInfo(width, height);
    const newDeviceType = deviceInfo.deviceType as DeviceType;
    const newOrientation = width > height ? 'landscape' : 'portrait';

    setScreenWidth(width);
    setScreenHeight(height);
    setDeviceType(newDeviceType);
    setOrientation(newOrientation);

    // Update responsive state based on breakpoints
    setResponsiveState({
      isMobile: width < 500,
      isSmallTablet: width >= 500 && width <= 768,
      isTablet: width >= 500 && width < 1024,
    });
  }, [getDeviceInfo]);

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

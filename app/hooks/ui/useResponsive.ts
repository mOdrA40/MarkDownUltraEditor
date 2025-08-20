/**
 * Hook untuk deteksi responsive breakpoints dengan performance optimization
 * Menggunakan standardized breakpoints dan efficient event handling
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { addEventListenerWithCleanup, throttle } from '@/utils/common';
import {
  type DeviceType,
  detectDevice,
  getWindowDimensions,
  MEDIA_QUERIES,
  type ResponsiveState,
} from '@/utils/responsive';

/**
 * Options untuk useResponsiveDetection hook
 */
interface UseResponsiveDetectionOptions {
  /**
   * Throttle delay untuk resize events (ms)
   * @default 100
   */
  throttleDelay?: number;

  /**
   * Enable/disable resize listener
   * @default true
   */
  enableResize?: boolean;

  /**
   * Initial window dimensions untuk SSR
   */
  initialDimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Return type untuk useResponsiveDetection hook
 */
interface UseResponsiveDetectionReturn extends ResponsiveState {
  /**
   * Force update responsive state
   */
  updateResponsiveState: () => void;
}

/**
 * Custom hook untuk comprehensive responsive detection
 * Menggunakan efficient event handling dan memory management
 */
export const useResponsiveDetection = (
  options: UseResponsiveDetectionOptions = {}
): UseResponsiveDetectionReturn => {
  const { throttleDelay = 100, enableResize = true, initialDimensions } = options;

  // Get initial dimensions
  const getInitialDimensions = useCallback(() => {
    if (initialDimensions) return initialDimensions;
    return getWindowDimensions();
  }, [initialDimensions]);

  // State untuk responsive information
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>(() => {
    const dimensions = getInitialDimensions();
    const deviceInfo = detectDevice(dimensions.width, dimensions.height);

    return {
      deviceType: deviceInfo.deviceType,
      deviceCategory: deviceInfo.deviceCategory,
      isMobile: deviceInfo.isMobile,
      isTablet: deviceInfo.isTablet,
      isDesktop: deviceInfo.isDesktop,
      windowWidth: dimensions.width,
      windowHeight: dimensions.height,
      aspectRatio: deviceInfo.aspectRatio,
      orientation: deviceInfo.orientation as 'portrait' | 'landscape',
    };
  });

  // Ref untuk cleanup
  const cleanupRef = useRef<(() => void) | null>(null);

  /**
   * Update responsive state berdasarkan current window dimensions
   */
  const updateResponsiveState = useCallback(() => {
    const dimensions = getWindowDimensions();
    const deviceInfo = detectDevice(dimensions.width, dimensions.height);

    setResponsiveState((prevState) => {
      // Only update if something actually changed
      if (
        prevState.windowWidth === dimensions.width &&
        prevState.windowHeight === dimensions.height &&
        prevState.deviceType === deviceInfo.deviceType
      ) {
        return prevState;
      }

      return {
        deviceType: deviceInfo.deviceType,
        deviceCategory: deviceInfo.deviceCategory,
        isMobile: deviceInfo.isMobile,
        isTablet: deviceInfo.isTablet,
        isDesktop: deviceInfo.isDesktop,
        windowWidth: dimensions.width,
        windowHeight: dimensions.height,
        aspectRatio: deviceInfo.aspectRatio,
        orientation: deviceInfo.orientation as 'portrait' | 'landscape',
      };
    });
  }, []);

  /**
   * Setup event listeners dan media query listeners
   */
  useEffect(() => {
    if (!enableResize || typeof window === 'undefined') return;

    // Throttled resize handler
    const throttledUpdate = throttle(updateResponsiveState, throttleDelay);

    // Setup resize listener with centralized utility
    const cleanupResize = addEventListenerWithCleanup(window, 'resize', throttledUpdate);

    // Setup media query listeners untuk better performance
    const mediaQueryLists = [
      window.matchMedia(MEDIA_QUERIES.allMobile),
      window.matchMedia(MEDIA_QUERIES.allTablet),
      window.matchMedia(MEDIA_QUERIES.allDesktop),
    ];

    const handleMediaQueryChange = () => {
      updateResponsiveState();
    };

    // Add listeners to all media queries with cleanup tracking
    const cleanupMediaQueries = mediaQueryLists.map((mql) => {
      mql.addEventListener('change', handleMediaQueryChange);
      return () => mql.removeEventListener('change', handleMediaQueryChange);
    });

    // Initial update
    updateResponsiveState();

    // Cleanup function
    cleanupRef.current = () => {
      cleanupResize();
      for (const cleanup of cleanupMediaQueries) {
        cleanup();
      }
    };

    return cleanupRef.current;
  }, [enableResize, throttleDelay, updateResponsiveState]);

  return {
    ...responsiveState,
    updateResponsiveState,
  };
};

/**
 * Simplified hook untuk mobile detection
 */
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsiveDetection();
  return isMobile;
};

/**
 * Simplified hook untuk tablet detection
 */
export const useIsTablet = (): boolean => {
  const { isTablet } = useResponsiveDetection();
  return isTablet;
};

/**
 * Simplified hook untuk desktop detection
 */
export const useIsDesktop = (): boolean => {
  const { isDesktop } = useResponsiveDetection();
  return isDesktop;
};

/**
 * Hook untuk mendapatkan device type saja
 */
export const useDeviceType = (): DeviceType => {
  const { deviceType } = useResponsiveDetection();
  return deviceType;
};

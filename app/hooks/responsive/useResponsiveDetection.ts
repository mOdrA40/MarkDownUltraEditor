/**
 * Hook untuk deteksi responsive breakpoints dengan performance optimization
 * Menggunakan standardized breakpoints dan efficient event handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MEDIA_QUERIES, 
  getDeviceType, 
  getWindowDimensions, 
  throttle,
  type DeviceType,
  type ResponsiveState 
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
  const {
    throttleDelay = 100,
    enableResize = true,
    initialDimensions
  } = options;

  // Get initial dimensions
  const getInitialDimensions = useCallback(() => {
    if (initialDimensions) return initialDimensions;
    return getWindowDimensions();
  }, [initialDimensions]);

  // State untuk responsive information
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>(() => {
    const dimensions = getInitialDimensions();
    const deviceType = getDeviceType(dimensions.width);
    
    return {
      deviceType,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      windowWidth: dimensions.width,
      windowHeight: dimensions.height
    };
  });

  // Ref untuk cleanup
  const cleanupRef = useRef<(() => void) | null>(null);

  /**
   * Update responsive state berdasarkan current window dimensions
   */
  const updateResponsiveState = useCallback(() => {
    const dimensions = getWindowDimensions();
    const deviceType = getDeviceType(dimensions.width);
    
    setResponsiveState(prevState => {
      // Only update if something actually changed
      if (
        prevState.windowWidth === dimensions.width &&
        prevState.windowHeight === dimensions.height &&
        prevState.deviceType === deviceType
      ) {
        return prevState;
      }
      
      return {
        deviceType,
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
        windowWidth: dimensions.width,
        windowHeight: dimensions.height
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

    // Setup resize listener
    window.addEventListener('resize', throttledUpdate);

    // Setup media query listeners untuk better performance
    const mediaQueryLists = [
      window.matchMedia(MEDIA_QUERIES.mobile),
      window.matchMedia(MEDIA_QUERIES.tablet),
      window.matchMedia(MEDIA_QUERIES.desktop)
    ];

    const handleMediaQueryChange = () => {
      updateResponsiveState();
    };

    // Add listeners to all media queries
    mediaQueryLists.forEach(mql => {
      mql.addEventListener('change', handleMediaQueryChange);
    });

    // Initial update
    updateResponsiveState();

    // Cleanup function
    cleanupRef.current = () => {
      window.removeEventListener('resize', throttledUpdate);
      mediaQueryLists.forEach(mql => {
        mql.removeEventListener('change', handleMediaQueryChange);
      });
    };

    return cleanupRef.current;
  }, [enableResize, throttleDelay, updateResponsiveState]);

  return {
    ...responsiveState,
    updateResponsiveState
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

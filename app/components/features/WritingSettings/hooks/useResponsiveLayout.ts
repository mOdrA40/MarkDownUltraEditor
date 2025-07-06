/**
 * Responsive Layout Hook - Custom Hook untuk Responsive Detection
 * Hook untuk mendeteksi dan mengelola responsive breakpoints
 *
 * @author Axel Modra
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BreakpointType, UseResponsiveLayoutReturn } from '../types/settings.types';
import {
  debounce,
  getBreakpointFromWidth,
  getCurrentBreakpoint,
  getViewportDimensions,
} from '../utils/responsive.utils';

/**
 * Hook untuk mendeteksi dan mengelola responsive layout
 * @param debounceMs - Delay untuk debounce resize events (default: 150ms)
 * @returns Object dengan breakpoint info dan utilities
 */
export const useResponsiveLayout = (debounceMs = 150): UseResponsiveLayoutReturn => {
  // State untuk menyimpan breakpoint dan window width
  const [breakpoint, setBreakpoint] = useState<BreakpointType>(() => {
    // Initial value - safe untuk SSR
    if (typeof window === 'undefined') return 'desktop';
    return getCurrentBreakpoint();
  });

  const [windowWidth, setWindowWidth] = useState<number>(() => {
    // Initial value - safe untuk SSR
    if (typeof window === 'undefined') return 1024;
    return window.innerWidth;
  });

  // Debounced resize handler
  const handleResize = useCallback(() => {
    const debouncedFn = debounce(() => {
      const { width } = getViewportDimensions();
      const newBreakpoint = getBreakpointFromWidth(width);

      setWindowWidth(width);
      setBreakpoint(newBreakpoint);
    }, debounceMs);

    return debouncedFn();
  }, [debounceMs]);

  // Effect untuk setup resize listener
  useEffect(() => {
    // Initial setup
    const { width } = getViewportDimensions();
    const initialBreakpoint = getBreakpointFromWidth(width);

    setWindowWidth(width);
    setBreakpoint(initialBreakpoint);

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Memoized computed values
  const computedValues = useMemo(
    () => ({
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'small-tablet' || breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop',
    }),
    [breakpoint]
  );

  return {
    breakpoint,
    windowWidth,
    ...computedValues,
  };
};

/**
 * Hook sederhana untuk deteksi mobile
 * @returns True jika sedang di mobile
 */
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsiveLayout();
  return isMobile;
};

/**
 * Hook sederhana untuk deteksi tablet
 * @returns True jika sedang di tablet
 */
export const useIsTablet = (): boolean => {
  const { isTablet } = useResponsiveLayout();
  return isTablet;
};

/**
 * Hook sederhana untuk deteksi desktop
 * @returns True jika sedang di desktop
 */
export const useIsDesktop = (): boolean => {
  const { isDesktop } = useResponsiveLayout();
  return isDesktop;
};

/**
 * Hook untuk mendapatkan window dimensions
 * @param debounceMs - Delay untuk debounce resize events
 * @returns Object dengan width dan height
 */
export const useWindowDimensions = (debounceMs = 150) => {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 };
    }
    return getViewportDimensions();
  });

  const handleResize = useCallback(() => {
    const debouncedFn = debounce(() => {
      setDimensions(getViewportDimensions());
    }, debounceMs);

    return debouncedFn();
  }, [debounceMs]);

  useEffect(() => {
    // Initial setup
    setDimensions(getViewportDimensions());

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return dimensions;
};

// useMediaQuery hook moved to app/hooks/useMediaQuery.ts to avoid duplication
// Import from there: import { useMediaQuery } from '~/hooks/useMediaQuery';

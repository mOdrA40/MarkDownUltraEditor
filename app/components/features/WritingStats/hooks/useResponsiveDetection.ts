/**
 * Responsive Detection Hook - Custom Hook untuk Screen Size Detection
 * Hook untuk mendeteksi ukuran layar dan responsive behavior
 *
 * @author Axel Modra
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BREAKPOINTS_STATS } from '../constants/stats.constants';
import type { ScreenSize, UseResponsiveDetectionReturn } from '../types/stats.types';

/**
 * Mendapatkan screen size berdasarkan window width
 * @param width - Window width dalam pixels
 * @returns Screen size type yang sesuai
 */
const getScreenSizeFromWidth = (width: number): ScreenSize => {
  if (width < BREAKPOINTS_STATS.mobile.max) {
    return 'mobile';
  }
  if (width <= BREAKPOINTS_STATS.smallTablet.max) {
    return 'small-tablet';
  }
  if (width <= BREAKPOINTS_STATS.tablet.max) {
    return 'tablet';
  }
  return 'desktop';
};

/**
 * Debounce function untuk resize events
 */
const debounce = <T extends (...args: unknown[]) => unknown>(
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
 * Hook untuk mendeteksi dan mengelola responsive screen size
 * @param debounceMs - Delay untuk debounce resize events (default: 150ms)
 * @returns Object dengan screen size info dan utilities
 */
export const useResponsiveDetection = (debounceMs = 150): UseResponsiveDetectionReturn => {
  // State untuk menyimpan screen size dan dimensions
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    // Initial value - safe untuk SSR
    if (typeof window === 'undefined') return 'desktop';
    return getScreenSizeFromWidth(window.innerWidth);
  });

  const [windowWidth, setWindowWidth] = useState<number>(() => {
    // Initial value - safe untuk SSR
    if (typeof window === 'undefined') return 1024;
    return window.innerWidth;
  });

  const [windowHeight, setWindowHeight] = useState<number>(() => {
    // Initial value - safe untuk SSR
    if (typeof window === 'undefined') return 768;
    return window.innerHeight;
  });

  // Debounced resize handler
  const handleResize = useCallback(() => {
    const debouncedFn = debounce(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const newScreenSize = getScreenSizeFromWidth(width);

      setWindowWidth(width);
      setWindowHeight(height);
      setScreenSize(newScreenSize);
    }, debounceMs);

    return debouncedFn();
  }, [debounceMs]);

  // Effect untuk setup resize listener
  useEffect(() => {
    // Initial setup
    const width = window.innerWidth;
    const height = window.innerHeight;
    const initialScreenSize = getScreenSizeFromWidth(width);

    setWindowWidth(width);
    setWindowHeight(height);
    setScreenSize(initialScreenSize);

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
      isMobile: screenSize === 'mobile',
      isTablet: screenSize === 'small-tablet' || screenSize === 'tablet',
      isDesktop: screenSize === 'desktop',
    }),
    [screenSize]
  );

  return {
    screenSize,
    windowWidth,
    windowHeight,
    ...computedValues,
  };
};

/**
 * Hook sederhana untuk deteksi mobile
 * @returns True jika sedang di mobile
 */
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsiveDetection();
  return isMobile;
};

/**
 * Hook sederhana untuk deteksi tablet
 * @returns True jika sedang di tablet
 */
export const useIsTablet = (): boolean => {
  const { isTablet } = useResponsiveDetection();
  return isTablet;
};

/**
 * Hook sederhana untuk deteksi desktop
 * @returns True jika sedang di desktop
 */
export const useIsDesktop = (): boolean => {
  const { isDesktop } = useResponsiveDetection();
  return isDesktop;
};

/**
 * Hook untuk mendapatkan window dimensions saja
 * @param debounceMs - Delay untuk debounce resize events
 * @returns Object dengan width dan height
 */
export const useWindowDimensions = (debounceMs = 150) => {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  });

  const handleResize = useCallback(() => {
    const debouncedFn = debounce(() => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, debounceMs);

    return debouncedFn();
  }, [debounceMs]);

  useEffect(() => {
    // Initial setup
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return dimensions;
};

/**
 * Hook untuk media query matching
 * @param query - CSS media query string
 * @returns True jika media query match
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Initial check
    setMatches(mediaQuery.matches);

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

/**
 * Hook untuk orientation detection
 * @returns 'portrait' atau 'landscape'
 */
export const useOrientation = (): 'portrait' | 'landscape' => {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    return width > height ? 'landscape' : 'portrait';
  }, [width, height]);
};

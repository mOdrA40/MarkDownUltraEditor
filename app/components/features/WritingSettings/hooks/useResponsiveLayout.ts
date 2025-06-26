/**
 * Responsive Layout Hook - Custom Hook untuk Responsive Detection
 * Hook untuk mendeteksi dan mengelola responsive breakpoints
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getBreakpointFromWidth, 
  getCurrentBreakpoint, 
  getViewportDimensions,
  debounce
} from '../utils/responsive.utils';
import type { 
  BreakpointType, 
  UseResponsiveLayoutReturn 
} from '../types/settings.types';

/**
 * Hook untuk mendeteksi dan mengelola responsive layout
 * @param debounceMs - Delay untuk debounce resize events (default: 150ms)
 * @returns Object dengan breakpoint info dan utilities
 */
export const useResponsiveLayout = (
  debounceMs: number = 150
): UseResponsiveLayoutReturn => {
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
  const computedValues = useMemo(() => ({
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'small-tablet' || breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop'
  }), [breakpoint]);

  return {
    breakpoint,
    windowWidth,
    ...computedValues
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
export const useWindowDimensions = (debounceMs: number = 150) => {
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

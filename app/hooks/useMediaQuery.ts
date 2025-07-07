/**
 * useMediaQuery Hook
 * Shared hook untuk media query matching
 *
 * @author Axel Modra
 */

import { useEffect, useState } from 'react';
import { addMediaQueryListener, matchesMediaQuery } from '@/utils/common';

/**
 * Hook untuk media query matching
 * @param query - CSS media query string
 * @returns True jika media query match
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    return matchesMediaQuery(query);
  });

  useEffect(() => {
    // Initial check
    setMatches(matchesMediaQuery(query));

    // Setup listener with centralized utility
    const cleanup = addMediaQueryListener(query, (e) => {
      setMatches(e.matches);
    });

    return cleanup;
  }, [query]);

  return matches;
};

/**
 * Common media queries untuk kemudahan penggunaan
 */
export const MEDIA_QUERIES = {
  mobile: '(max-width: 499px)',
  smallTablet: '(min-width: 500px) and (max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  largeDesktop: '(min-width: 1440px)',
  touchDevice: '(pointer: coarse)',
  hoverDevice: '(hover: hover)',
  prefersReducedMotion: '(prefers-reduced-motion: reduce)',
  prefersDarkMode: '(prefers-color-scheme: dark)',
} as const;

/**
 * Convenience hooks untuk breakpoint umum
 */
export const useIsMobile = () => useMediaQuery(MEDIA_QUERIES.mobile);
export const useIsSmallTablet = () => useMediaQuery(MEDIA_QUERIES.smallTablet);
export const useIsTablet = () => useMediaQuery(MEDIA_QUERIES.tablet);
export const useIsDesktop = () => useMediaQuery(MEDIA_QUERIES.desktop);
export const useIsLargeDesktop = () => useMediaQuery(MEDIA_QUERIES.largeDesktop);
export const useIsTouchDevice = () => useMediaQuery(MEDIA_QUERIES.touchDevice);
export const useHasHover = () => useMediaQuery(MEDIA_QUERIES.hoverDevice);
export const usePrefersReducedMotion = () => useMediaQuery(MEDIA_QUERIES.prefersReducedMotion);
export const usePrefersDarkMode = () => useMediaQuery(MEDIA_QUERIES.prefersDarkMode);

/**
 * Hook untuk mendapatkan breakpoint saat ini
 */
export const useCurrentBreakpoint = ():
  | 'mobile'
  | 'smallTablet'
  | 'tablet'
  | 'desktop'
  | 'largeDesktop' => {
  const isMobile = useIsMobile();
  const isSmallTablet = useIsSmallTablet();
  const isTablet = useIsTablet();
  const isLargeDesktop = useIsLargeDesktop();

  if (isMobile) return 'mobile';
  if (isSmallTablet) return 'smallTablet';
  if (isTablet) return 'tablet';
  if (isLargeDesktop) return 'largeDesktop';
  return 'desktop';
};

/**
 * useMediaQuery Hook
 * @author Axel Modra
 */

import { useEffect, useState } from 'react';
import { addMediaQueryListener, matchesMediaQuery } from '@/utils/common';
import { MEDIA_QUERIES } from '@/utils/responsive';

/**
 * Hook for media query matching
 * @param query - CSS media query string
 * @returns True if media query matches
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
 * Convenience hooks for common breakpoints
 * Using MEDIA_QUERIES from @/utils/responsive for consistency
 */
export const useIsMobile = () => useMediaQuery(MEDIA_QUERIES.allMobile);
export const useIsSmallTablet = () => useMediaQuery(MEDIA_QUERIES.tabletSmall);
export const useIsTablet = () => useMediaQuery(MEDIA_QUERIES.allTablet);
export const useIsDesktop = () => useMediaQuery(MEDIA_QUERIES.allDesktop);
export const useIsLargeDesktop = () => useMediaQuery(MEDIA_QUERIES.desktopLarge);
export const useIsTouchDevice = () => useMediaQuery('(pointer: coarse)');
export const useHasHover = () => useMediaQuery('(hover: hover)');
export const usePrefersReducedMotion = () => useMediaQuery(MEDIA_QUERIES.prefersReducedMotion);
export const usePrefersDarkMode = () => useMediaQuery(MEDIA_QUERIES.prefersDarkMode);

/**
 * Hook for getting current breakpoint
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

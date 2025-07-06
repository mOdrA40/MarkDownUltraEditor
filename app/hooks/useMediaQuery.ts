/**
 * useMediaQuery Hook
 * Shared hook untuk media query matching
 *
 * @author Axel Modra
 */

import { useEffect, useState } from 'react';

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

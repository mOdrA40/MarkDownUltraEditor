/**
 * useScrollSpy Hook (Combined)
 * 
 * Hook gabungan yang menggabungkan scroll detection dan intersection observer
 * untuk scroll spy functionality yang komprehensif.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useEffect, useCallback } from 'react';
import { UseScrollSpyReturn, ScrollSpyOptions } from '../types';
import { useScrollDetection } from './useScrollDetection';
import { useIntersectionSpy } from './useIntersectionSpy';
import { throttleScrollEvent, SCROLL_SPY_CONSTANTS } from '../utils/scrollSpyUtils';

/**
 * Combined scroll spy hook dengan scroll detection dan intersection observer
 * 
 * @param headingIds - Array of heading IDs untuk tracking
 * @param options - Scroll spy options
 * @returns Object dengan scroll spy functions
 */
export const useScrollSpy = (
  headingIds: string[],
  options: ScrollSpyOptions = {}
): UseScrollSpyReturn => {
  const {
    offset = SCROLL_SPY_CONSTANTS.DEFAULT_OFFSET,
    threshold = SCROLL_SPY_CONSTANTS.DEFAULT_THRESHOLD,
    rootMargin = SCROLL_SPY_CONSTANTS.DEFAULT_ROOT_MARGIN,
    container = null,
    throttleDelay = SCROLL_SPY_CONSTANTS.DEFAULT_THROTTLE_DELAY
  } = options;

  // Setup scroll detection
  const { 
    activeId, 
    updateActiveHeading, 
    setActiveId 
  } = useScrollDetection(headingIds, {
    offset,
    container,
    onActiveChange: (id) => {
      // Optional: additional logic ketika active heading berubah
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Active heading changed to: ${id}`);
      }
    }
  });

  // Setup intersection observer untuk additional optimization
  const {
    setupObserver,
    cleanup: cleanupIntersection
  } = useIntersectionSpy({
    threshold,
    rootMargin,
    root: container,
    onIntersectionChange: (entries) => {
      // Optional: additional logic untuk intersection changes
      if (process.env.NODE_ENV === 'development') {
        const visibleCount = entries.filter(entry => entry.isIntersecting).length;
        console.debug(`Visible headings count: ${visibleCount}`);
      }
    }
  });

  /**
   * Throttled scroll handler untuk performance optimization
   */
  const throttledScrollHandler = useCallback(() => {
    const throttledFn = throttleScrollEvent(updateActiveHeading, throttleDelay);
    return throttledFn();
  }, [updateActiveHeading, throttleDelay]);

  /**
   * Check apakah heading dengan ID tertentu sedang aktif
   * 
   * @param id - Heading ID untuk check
   * @returns Boolean indicating if heading is active
   */
  const isActive = useCallback((id: string): boolean => {
    return activeId === id;
  }, [activeId]);

  /**
   * Set active heading secara manual
   * 
   * @param id - Heading ID yang akan di-set sebagai aktif
   */
  const setActiveHeading = useCallback((id: string) => {
    setActiveId(id);
  }, [setActiveId]);

  /**
   * Setup scroll event listener dan intersection observer
   */
  useEffect(() => {
    if (headingIds.length === 0) return;

    // Setup intersection observer
    setupObserver(headingIds);

    // Setup scroll event listener
    const scrollContainer = container || window;
    
    // Add scroll event listener dengan throttling
    scrollContainer.addEventListener('scroll', throttledScrollHandler, { passive: true });

    // Initial update untuk set active heading
    updateActiveHeading();

    // Cleanup function
    return () => {
      scrollContainer.removeEventListener('scroll', throttledScrollHandler);
      cleanupIntersection();
    };
  }, [
    headingIds, 
    container, 
    throttledScrollHandler, 
    updateActiveHeading, 
    setupObserver, 
    cleanupIntersection
  ]);

  return {
    activeId,
    isActive,
    setActiveHeading
  };
};

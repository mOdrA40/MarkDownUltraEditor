/**
 * useScrollSpy Hook (Legacy)
 *
 * @deprecated Use hooks from @/components/useScrollSpy instead
 * This file is kept for backward compatibility only.
 *
 * @author Senior Developer
 * @version 2.0.0
 */

// Re-export dari refactored module untuk backward compatibility
export {
  useScrollDetection,
  useIntersectionSpy
} from '@/components/useScrollSpy';

// Re-export dengan alias untuk menghindari konflik
export { useScrollSpy as useScrollSpyNew } from '@/components/useScrollSpy';

// Legacy implementation untuk backward compatibility
import { useState, useEffect, useCallback, useRef } from 'react';

import { useIntersectionOptimizationNew, usePerformanceOptimization } from './usePerformanceOptimization';

export interface ScrollSpyOptions {
  /**
   * Offset dari top untuk menentukan kapan heading dianggap aktif
   */
  offset?: number;
  
  /**
   * Threshold untuk intersection observer (0-1)
   */
  threshold?: number;
  
  /**
   * Root margin untuk intersection observer
   */
  rootMargin?: string;
  
  /**
   * Container element untuk scroll spy (default: window)
   */
  container?: Element | null;
  
  /**
   * Throttle delay untuk scroll events (ms)
   */
  throttleDelay?: number;
}

/**
 * Custom hook untuk scroll spy functionality
 * Mendeteksi heading mana yang sedang aktif berdasarkan scroll position
 */
export const useScrollSpy = (
  headingIds: string[],
  options: ScrollSpyOptions = {}
) => {
  const {
    offset = 100,
    threshold = 0.6,
    rootMargin = '-20% 0px -35% 0px',
    container = null,
    throttleDelay = 100
  } = options;

  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const headingElementsRef = useRef<Map<string, Element>>(new Map());

  // Performance optimization hooks
  const { createOptimizedObserver, cleanup: cleanupObserver } = useIntersectionOptimizationNew();
  const { throttle: performanceThrottle } = usePerformanceOptimization();

  /**
   * Update active heading berdasarkan intersection
   */
  const updateActiveHeading = useCallback((entries: IntersectionObserverEntry[]) => {
    const visibleHeadings = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => {
        // Sort berdasarkan posisi di document
        const aRect = a.boundingClientRect;
        const bRect = b.boundingClientRect;
        return aRect.top - bRect.top;
      });

    if (visibleHeadings.length > 0) {
      const topHeading = visibleHeadings[0];
      const headingId = topHeading.target.id;
      setActiveId(headingId);
    }
  }, []);

  /**
   * Optimized scroll handler sebagai fallback
   */
  const handleScroll = useCallback(() => {
    const throttledFn = performanceThrottle(() => {
      if (headingIds.length === 0) return;

      const scrollContainer = container || document.documentElement;
      const scrollTop = scrollContainer.scrollTop;

      let activeHeading = '';
      let minDistance = Infinity;

      // Use requestAnimationFrame untuk smooth performance
      requestAnimationFrame(() => {
        headingIds.forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            const rect = element.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementTop = rect.top - containerRect.top + scrollTop;
            const distance = Math.abs(elementTop - scrollTop - offset);

            if (distance < minDistance && elementTop <= scrollTop + offset + 50) {
              minDistance = distance;
              activeHeading = id;
            }
          }
        });

        if (activeHeading && activeHeading !== activeId) {
          setActiveId(activeHeading);
        }
      });
    }, throttleDelay);

    return throttledFn();
  }, [headingIds, activeId, offset, container, throttleDelay, performanceThrottle]);

  /**
   * Setup optimized intersection observer
   */
  useEffect(() => {
    if (headingIds.length === 0) return;

    // Clear previous observer
    cleanupObserver();

    // Update heading elements map
    headingElementsRef.current.clear();
    headingIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        headingElementsRef.current.set(id, element);
      }
    });

    // Create optimized intersection observer
    observerRef.current = createOptimizedObserver(
      updateActiveHeading,
      {
        root: container,
        rootMargin,
        threshold: Array.isArray(threshold) ? threshold : [threshold]
      }
    );

    // Observe all heading elements
    headingElementsRef.current.forEach(element => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    // Setup scroll listener sebagai fallback dengan passive listener
    const scrollContainer = container || window;
    scrollContainer.addEventListener('scroll', handleScroll, {
      passive: true,
      capture: false
    });

    return () => {
      cleanupObserver();
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [headingIds, updateActiveHeading, handleScroll, container, rootMargin, threshold, createOptimizedObserver, cleanupObserver]);

  /**
   * Manually set active heading
   */
  const setActiveHeading = useCallback((id: string) => {
    if (headingIds.includes(id)) {
      setActiveId(id);
    }
  }, [headingIds]);

  /**
   * Get next/previous heading for keyboard navigation
   */
  const getNextHeading = useCallback((currentId: string): string | null => {
    const currentIndex = headingIds.indexOf(currentId);
    if (currentIndex >= 0 && currentIndex < headingIds.length - 1) {
      return headingIds[currentIndex + 1];
    }
    return null;
  }, [headingIds]);

  const getPreviousHeading = useCallback((currentId: string): string | null => {
    const currentIndex = headingIds.indexOf(currentId);
    if (currentIndex > 0) {
      return headingIds[currentIndex - 1];
    }
    return null;
  }, [headingIds]);

  return {
    activeId,
    setActiveHeading,
    getNextHeading,
    getPreviousHeading,
    isActive: (id: string) => activeId === id
  };
};

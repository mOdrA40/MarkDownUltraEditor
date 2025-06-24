/**
 * useIntersectionSpy Hook
 * 
 * Custom hook untuk intersection observer based scroll spy
 * dengan optimasi performance dan memory management.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { UseIntersectionSpyReturn, IntersectionSpyOptions } from '../types';
import { SCROLL_SPY_CONSTANTS } from '../utils/scrollSpyUtils';

/**
 * Hook untuk intersection observer based scroll spy
 * 
 * @param options - Intersection spy options
 * @returns Object dengan intersection spy functions
 */
export const useIntersectionSpy = (
  options: IntersectionSpyOptions = {}
): UseIntersectionSpyReturn => {
  const {
    threshold = SCROLL_SPY_CONSTANTS.DEFAULT_THRESHOLD,
    rootMargin = SCROLL_SPY_CONSTANTS.DEFAULT_ROOT_MARGIN,
    root = null,
    onIntersectionChange
  } = options;

  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const headingElementsRef = useRef<Map<string, Element>>(new Map());

  /**
   * Intersection observer callback
   * Mengelola visible headings berdasarkan intersection changes
   */
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    try {
      setVisibleIds(prevVisibleIds => {
        const newVisibleIds = new Set(prevVisibleIds);

        entries.forEach(entry => {
          const headingId = entry.target.id;
          
          if (entry.isIntersecting) {
            newVisibleIds.add(headingId);
          } else {
            newVisibleIds.delete(headingId);
          }
        });

        return newVisibleIds;
      });

      // Call callback jika ada
      if (onIntersectionChange) {
        onIntersectionChange(entries);
      }
    } catch (error) {
      console.error('Error in intersection observer callback:', error);
    }
  }, [onIntersectionChange]);

  /**
   * Cleanup intersection observer dan references
   */
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    headingElementsRef.current.clear();
    setVisibleIds(new Set());
  }, []);

  /**
   * Setup intersection observer untuk heading elements
   *
   * @param headingIds - Array of heading IDs untuk observe
   */
  const setupObserver = useCallback((headingIds: string[]) => {
    // Cleanup existing observer
    cleanup();

    if (headingIds.length === 0) return;

    try {
      // Update heading elements map
      headingElementsRef.current.clear();
      headingIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          headingElementsRef.current.set(id, element);
        }
      });

      // Create intersection observer dengan optimized settings
      const observerOptions: IntersectionObserverInit = {
        root,
        rootMargin,
        threshold: Array.isArray(threshold) ? threshold : [threshold]
      };

      observerRef.current = new IntersectionObserver(handleIntersection, observerOptions);

      // Observe all heading elements
      headingElementsRef.current.forEach(element => {
        if (observerRef.current) {
          observerRef.current.observe(element);
        }
      });

      // Log setup untuk debugging
      if (process.env.NODE_ENV === 'development') {
        console.info(`Intersection observer setup for ${headingElementsRef.current.size} headings`);
      }
    } catch (error) {
      console.error('Error setting up intersection observer:', error);
    }
  }, [threshold, rootMargin, root, handleIntersection, cleanup]);

  /**
   * Cleanup effect untuk mencegah memory leaks
   */
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    visibleIds,
    setupObserver,
    cleanup
  };
};

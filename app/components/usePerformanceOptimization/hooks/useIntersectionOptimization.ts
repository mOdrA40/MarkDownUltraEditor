/**
 * useIntersectionOptimization Hook
 * 
 * Custom hook untuk optimasi intersection observer dengan
 * lazy loading dan viewport detection.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useCallback, useRef, useEffect } from 'react';
import { UseIntersectionOptimizationReturn } from '../types';

/**
 * Hook untuk lazy loading dan intersection observer optimization
 * 
 * @returns Object dengan functions untuk intersection observer management
 */
export const useIntersectionOptimization = (): UseIntersectionOptimizationReturn => {
  const observerRef = useRef<IntersectionObserver>();
  const observedElements = useRef<Set<Element>>(new Set());

  /**
   * Membuat optimized intersection observer dengan default settings yang baik
   * 
   * @param callback - Intersection observer callback
   * @param options - Intersection observer options
   * @returns Intersection observer instance
   */
  const createOptimizedObserver = useCallback((
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
  ): IntersectionObserver => {
    // Cleanup existing observer jika ada
    if (observerRef.current) {
      observerRef.current.disconnect();
      observedElements.current.clear();
    }

    // Default optimized options untuk performance yang baik
    const optimizedOptions: IntersectionObserverInit = {
      // Pre-load elements 50px sebelum masuk viewport
      rootMargin: '50px 0px',
      // Multiple thresholds untuk smooth transitions
      threshold: [0, 0.25, 0.5, 0.75, 1],
      ...options
    };

    // Wrapper callback untuk additional logging dan error handling
    const wrappedCallback: IntersectionObserverCallback = (entries, observer) => {
      try {
        // Filter entries yang benar-benar berubah status
        const changedEntries = entries.filter(entry => {
          const element = entry.target;
          const wasIntersecting = observedElements.current.has(element);
          const isIntersecting = entry.isIntersecting;
          
          if (isIntersecting && !wasIntersecting) {
            observedElements.current.add(element);
            return true;
          } else if (!isIntersecting && wasIntersecting) {
            observedElements.current.delete(element);
            return true;
          }
          
          return false;
        });

        // Hanya call original callback jika ada perubahan
        if (changedEntries.length > 0) {
          callback(changedEntries, observer);
        }
      } catch (error) {
        console.error('Error in intersection observer callback:', error);
      }
    };

    // Create new observer dengan optimized settings
    observerRef.current = new IntersectionObserver(wrappedCallback, optimizedOptions);
    return observerRef.current;
  }, []);

  /**
   * Cleanup function untuk disconnect observer dan clear references
   */
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = undefined;
    }
    observedElements.current.clear();
  }, []);

  /**
   * Check apakah element sedang dalam viewport
   * Menggunakan getBoundingClientRect untuk immediate check
   * 
   * @param element - Element yang akan dicek
   * @param threshold - Threshold untuk visibility (0-1)
   * @returns Boolean indicating if element is in viewport
   */
  const isElementInViewport = useCallback((
    element: Element,
    threshold: number = 0
  ): boolean => {
    if (!element) return false;

    try {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;

      // Calculate visible area
      const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
      const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
      
      // Element harus visible dan memenuhi threshold
      const isVisible = visibleHeight > 0 && visibleWidth > 0;
      
      if (!isVisible) return false;
      
      // Check threshold jika specified
      if (threshold > 0) {
        const elementArea = rect.width * rect.height;
        const visibleArea = visibleHeight * visibleWidth;
        const visibilityRatio = elementArea > 0 ? visibleArea / elementArea : 0;
        
        return visibilityRatio >= threshold;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking element viewport visibility:', error);
      return false;
    }
  }, []);

  /**
   * Cleanup effect untuk mencegah memory leaks
   */
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    createOptimizedObserver,
    cleanup,
    isElementInViewport
  };
};

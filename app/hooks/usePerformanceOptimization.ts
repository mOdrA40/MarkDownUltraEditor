/**
 * usePerformanceOptimization Hook (Legacy)
 *
 * @deprecated Use individual hooks from @/components/usePerformanceOptimization instead
 * This file is kept for backward compatibility only.
 *
 * @author Senior Developer
 * @version 2.0.0
 */

// Re-export dari refactored module untuk backward compatibility
export {
  usePerformanceOptimization,
  useDebounceThrottle
} from '@/components/usePerformanceOptimization';

// Re-export dengan alias untuk menghindari konflik
export {
  useScrollPerformance as useScrollPerformanceNew,
  useIntersectionOptimization as useIntersectionOptimizationNew,
  useResponsiveOptimization as useResponsiveOptimizationNew
} from '@/components/usePerformanceOptimization';

// Legacy implementations untuk backward compatibility
import { useRef, useCallback, useEffect } from 'react';

/**
 * @deprecated Use useScrollPerformanceNew from @/components/usePerformanceOptimization instead
 */
export const useScrollPerformance = () => {
  const lastScrollTime = useRef<number>(0);
  const scrollCount = useRef<number>(0);
  const performanceData = useRef<{
    averageScrollTime: number;
    maxScrollTime: number;
    totalScrollEvents: number;
  }>({
    averageScrollTime: 0,
    maxScrollTime: 0,
    totalScrollEvents: 0
  });

  const measureScrollPerformance = useCallback((callback: () => void) => {
    const startTime = performance.now();
    
    callback();
    
    const endTime = performance.now();
    const scrollTime = endTime - startTime;
    
    scrollCount.current++;
    performanceData.current.totalScrollEvents = scrollCount.current;
    
    // Update max scroll time
    if (scrollTime > performanceData.current.maxScrollTime) {
      performanceData.current.maxScrollTime = scrollTime;
    }
    
    // Update average scroll time
    const totalTime = performanceData.current.averageScrollTime * (scrollCount.current - 1) + scrollTime;
    performanceData.current.averageScrollTime = totalTime / scrollCount.current;
    
    lastScrollTime.current = endTime;
    
    // Log performance warning if scroll is taking too long
    if (scrollTime > 16) { // 16ms = 60fps threshold
      console.warn(`Slow scroll detected: ${scrollTime.toFixed(2)}ms`);
    }
  }, []);

  const getPerformanceData = useCallback(() => {
    return { ...performanceData.current };
  }, []);

  const resetPerformanceData = useCallback(() => {
    scrollCount.current = 0;
    performanceData.current = {
      averageScrollTime: 0,
      maxScrollTime: 0,
      totalScrollEvents: 0
    };
  }, []);

  return {
    measureScrollPerformance,
    getPerformanceData,
    resetPerformanceData
  };
};

/**
 * Hook untuk lazy loading dan intersection observer optimization
 */
export const useIntersectionOptimization = () => {
  const observerRef = useRef<IntersectionObserver>();
  const observedElements = useRef<Set<Element>>(new Set());

  const createOptimizedObserver = useCallback((
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
  ) => {
    // Cleanup existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observedElements.current.clear();
    }

    // Create new observer with optimized settings
    const optimizedOptions: IntersectionObserverInit = {
      rootMargin: '50px 0px', // Pre-load elements 50px before they enter viewport
      threshold: [0, 0.25, 0.5, 0.75, 1], // Multiple thresholds for smooth transitions
      ...options
    };

    observerRef.current = new IntersectionObserver(callback, optimizedOptions);
    return observerRef.current;
  }, []);

  const observeElement = useCallback((element: Element) => {
    if (observerRef.current && !observedElements.current.has(element)) {
      observerRef.current.observe(element);
      observedElements.current.add(element);
    }
  }, []);

  const unobserveElement = useCallback((element: Element) => {
    if (observerRef.current && observedElements.current.has(element)) {
      observerRef.current.unobserve(element);
      observedElements.current.delete(element);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observedElements.current.clear();
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    createOptimizedObserver,
    observeElement,
    unobserveElement,
    cleanup
  };
};

/**
 * Hook untuk memory management dan cleanup
 */
export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef<(() => void)[]>([]);

  const addCleanupFunction = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup);
  }, []);

  const runCleanup = useCallback(() => {
    cleanupFunctions.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    cleanupFunctions.current = [];
  }, []);

  useEffect(() => {
    return runCleanup;
  }, [runCleanup]);

  return {
    addCleanupFunction,
    runCleanup
  };
};

/**
 * Hook untuk responsive design optimization
 */
export const useResponsiveOptimization = () => {
  const mediaQueries = useRef<{
    mobile: MediaQueryList;
    tablet: MediaQueryList;
    desktop: MediaQueryList;
    prefersReducedMotion: MediaQueryList;
    prefersDarkMode: MediaQueryList;
  }>();

  const initializeMediaQueries = useCallback(() => {
    if (typeof window === 'undefined') return;

    mediaQueries.current = {
      mobile: window.matchMedia('(max-width: 767px)'),
      tablet: window.matchMedia('(min-width: 768px) and (max-width: 1023px)'),
      desktop: window.matchMedia('(min-width: 1024px)'),
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)')
    };
  }, []);

  const getDeviceType = useCallback(() => {
    if (!mediaQueries.current) {
      initializeMediaQueries();
    }

    if (mediaQueries.current?.mobile.matches) return 'mobile';
    if (mediaQueries.current?.tablet.matches) return 'tablet';
    return 'desktop';
  }, [initializeMediaQueries]);

  const shouldReduceMotion = useCallback(() => {
    return mediaQueries.current?.prefersReducedMotion.matches ?? false;
  }, []);

  const prefersDarkMode = useCallback(() => {
    return mediaQueries.current?.prefersDarkMode.matches ?? false;
  }, []);

  useEffect(() => {
    initializeMediaQueries();
  }, [initializeMediaQueries]);

  return {
    getDeviceType,
    shouldReduceMotion,
    prefersDarkMode
  };
};

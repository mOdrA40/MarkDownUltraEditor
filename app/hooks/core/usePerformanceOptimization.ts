/**
 * usePerformanceOptimization Hook (Simplified)
 *
 * Hook sederhana untuk performance optimization dengan implementasi dasar.
 *
 * @author Axel Modra
 */

import { useCallback, useRef } from 'react';

/**
 * Simplified performance optimization hook
 *
 * @returns Object dengan basic performance optimization functions
 */
export const usePerformanceOptimization = () => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const frameRef = useRef<number>();

  const debounce = useCallback((fn: (...args: unknown[]) => void, delay = 300) => {
    return (...args: unknown[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => fn(...args), delay);
    };
  }, []);

  const throttle = useCallback((fn: (...args: unknown[]) => void, delay = 100) => {
    let lastCall = 0;
    return (...args: unknown[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      }
    };
  }, []);

  const requestAnimationFrame = useCallback((fn: () => void) => {
    if (typeof window === 'undefined') return;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = window.requestAnimationFrame(() => fn());
  }, []);

  return {
    debounce,
    throttle,
    requestAnimationFrame,
    // Legacy compatibility
    measureScrollPerformance: () => ({}),
    getPerformanceData: () => ({}),
    resetPerformanceData: () => {},
    createOptimizedObserver: () => null,
    cleanup: () => {},
    isElementInViewport: () => false,
    getDeviceType: () => 'desktop',
    shouldReduceMotion: () => false,
    prefersDarkMode: () => false,
  };
};

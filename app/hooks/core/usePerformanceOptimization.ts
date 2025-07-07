/**
 * usePerformanceOptimization Hook (Simplified)
 *
 * Hook sederhana untuk performance optimization dengan implementasi dasar.
 *
 * @author Axel Modra
 */

import { useCallback, useRef } from 'react';
import { debounce as commonDebounce, throttle as commonThrottle } from '@/utils/common';

/**
 * Simplified performance optimization hook
 * Using centralized utilities to avoid duplication
 *
 * @returns Object dengan basic performance optimization functions
 */
export const usePerformanceOptimization = () => {
  const frameRef = useRef<number>();

  // Use centralized debounce/throttle functions
  const debounce = useCallback((fn: (...args: unknown[]) => void, delay = 300) => {
    return commonDebounce(fn, delay);
  }, []);

  const throttle = useCallback((fn: (...args: unknown[]) => void, delay = 100) => {
    return commonThrottle(fn, delay);
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
    resetPerformanceData: () => {
      // No-op fallback
    },
    createOptimizedObserver: () => null,
    cleanup: () => {
      // No-op fallback
    },
    isElementInViewport: () => false,
    getDeviceType: () => 'desktop',
    shouldReduceMotion: () => false,
    prefersDarkMode: () => false,
  };
};

/**
 * useDebounceThrottle Hook
 * 
 * Custom hook untuk debouncing dan throttling dengan optimasi performance
 * dan memory management yang baik.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useEffect, useCallback, useRef } from 'react';
import { UseDebounceThrottleReturn } from '../types';
import { createDebounce, createThrottle, safeRequestAnimationFrame, safeCancelAnimationFrame } from '../utils/performanceUtils';

/**
 * Hook untuk debouncing dan throttling functions dengan optimasi performance
 * 
 * @returns Object dengan debounce, throttle, dan requestAnimationFrame functions
 */
export const useDebounceThrottle = (): UseDebounceThrottleReturn => {
  const rafId = useRef<number>();
  const timeoutId = useRef<NodeJS.Timeout>();

  /**
   * Request Animation Frame wrapper untuk smooth animations
   * Menggunakan RAF untuk memastikan updates terjadi pada frame yang tepat
   */
  const requestAnimationFrame = useCallback((callback: () => void) => {
    // Cancel previous RAF jika ada
    if (rafId.current) {
      safeCancelAnimationFrame(rafId.current);
    }
    
    rafId.current = safeRequestAnimationFrame(callback);
  }, []);

  /**
   * Debounced function untuk mengurangi frequency calls
   * Menggunakan utility function untuk consistency
   */
  const debounce = useCallback(<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    return createDebounce(func, wait);
  }, []);

  /**
   * Throttled function untuk limiting execution rate
   * Menggunakan utility function untuk consistency
   */
  const throttle = useCallback(<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    return createThrottle(func, limit);
  }, []);

  /**
   * Cleanup effect untuk mencegah memory leaks
   * Membersihkan semua pending timeouts dan animation frames
   */
  useEffect(() => {
    return () => {
      // Cleanup animation frame - capture current value
      const currentRafId = rafId.current;
      if (currentRafId) {
        safeCancelAnimationFrame(currentRafId);
      }

      // Cleanup timeout - capture current value
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const currentTimeoutId = timeoutId.current;
      if (currentTimeoutId) {
        clearTimeout(currentTimeoutId);
      }
    };
  }, []);

  return {
    requestAnimationFrame,
    debounce,
    throttle
  };
};

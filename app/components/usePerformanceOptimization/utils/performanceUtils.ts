/**
 * Performance utility functions
 * 
 * Kumpulan utility functions untuk optimasi performance
 * yang dapat digunakan secara independen.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { PerformanceData } from '../types';

/**
 * Konstanta untuk performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  /** 60fps threshold dalam milliseconds */
  FRAME_BUDGET: 16,
  /** Warning threshold untuk slow operations */
  SLOW_OPERATION_WARNING: 50,
  /** Critical threshold untuk very slow operations */
  CRITICAL_OPERATION_WARNING: 100,
} as const;

/**
 * Membuat debounced function
 * 
 * @param func - Function yang akan di-debounce
 * @param wait - Delay dalam milliseconds
 * @returns Debounced function
 */
export const createDebounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
};

/**
 * Membuat throttled function
 * 
 * @param func - Function yang akan di-throttle
 * @param limit - Limit dalam milliseconds
 * @returns Throttled function
 */
export const createThrottle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Wrapper untuk requestAnimationFrame dengan fallback
 * 
 * @param callback - Callback function
 * @returns Animation frame ID
 */
export const safeRequestAnimationFrame = (callback: () => void): number => {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    return window.requestAnimationFrame(callback);
  }
  
  // Fallback untuk environment tanpa requestAnimationFrame
  return setTimeout(callback, 16) as unknown as number;
};

/**
 * Cancel animation frame dengan fallback
 * 
 * @param id - Animation frame ID
 */
export const safeCancelAnimationFrame = (id: number): void => {
  if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
    window.cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
};

/**
 * Mengukur performance dari sebuah operation
 * 
 * @param operation - Operation yang akan diukur
 * @param label - Label untuk logging
 * @returns Hasil operation dan waktu eksekusi
 */
export const measurePerformance = async <T>(
  operation: () => T | Promise<T>,
  label?: string
): Promise<{ result: T; executionTime: number }> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Log warning jika operation lambat
    if (executionTime > PERFORMANCE_THRESHOLDS.SLOW_OPERATION_WARNING) {
      console.warn(
        `Slow operation detected${label ? ` (${label})` : ''}: ${executionTime.toFixed(2)}ms`
      );
    }
    
    return { result, executionTime };
  } catch (error) {
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    console.error(
      `Operation failed${label ? ` (${label})` : ''} after ${executionTime.toFixed(2)}ms:`,
      error
    );
    
    throw error;
  }
};

/**
 * Menghitung rata-rata dari array numbers
 * 
 * @param numbers - Array of numbers
 * @returns Average value
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

/**
 * Membuat performance data object baru
 * 
 * @returns Empty performance data
 */
export const createEmptyPerformanceData = (): PerformanceData => ({
  averageScrollTime: 0,
  maxScrollTime: 0,
  totalScrollEvents: 0,
});

/**
 * Update performance data dengan measurement baru
 * 
 * @param currentData - Current performance data
 * @param newMeasurement - New measurement time
 * @returns Updated performance data
 */
export const updatePerformanceData = (
  currentData: PerformanceData,
  newMeasurement: number
): PerformanceData => {
  const newTotalEvents = currentData.totalScrollEvents + 1;
  const totalTime = currentData.averageScrollTime * currentData.totalScrollEvents + newMeasurement;
  
  return {
    averageScrollTime: totalTime / newTotalEvents,
    maxScrollTime: Math.max(currentData.maxScrollTime, newMeasurement),
    totalScrollEvents: newTotalEvents,
  };
};

/**
 * Check apakah performance measurement menunjukkan masalah
 * 
 * @param measurement - Performance measurement dalam ms
 * @returns Performance status
 */
export const getPerformanceStatus = (measurement: number): 'good' | 'warning' | 'critical' => {
  if (measurement <= PERFORMANCE_THRESHOLDS.FRAME_BUDGET) {
    return 'good';
  } else if (measurement <= PERFORMANCE_THRESHOLDS.SLOW_OPERATION_WARNING) {
    return 'warning';
  } else {
    return 'critical';
  }
};

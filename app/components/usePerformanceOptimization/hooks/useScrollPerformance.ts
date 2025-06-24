/**
 * useScrollPerformance Hook
 * 
 * Custom hook untuk monitoring scroll performance dengan
 * detailed metrics dan warning system.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useCallback, useRef } from 'react';
import { UseScrollPerformanceReturn, PerformanceData } from '../types';
import { 
  createEmptyPerformanceData, 
  updatePerformanceData, 
  getPerformanceStatus,
  PERFORMANCE_THRESHOLDS 
} from '../utils/performanceUtils';

/**
 * Hook untuk monitoring scroll performance dengan detailed metrics
 * 
 * @returns Object dengan functions untuk measuring dan monitoring scroll performance
 */
export const useScrollPerformance = (): UseScrollPerformanceReturn => {
  const lastScrollTime = useRef<number>(0);
  const scrollCount = useRef<number>(0);
  const performanceData = useRef<PerformanceData>(createEmptyPerformanceData());

  /**
   * Mengukur performance dari scroll operation
   * Mencatat waktu eksekusi dan memberikan warning jika terlalu lambat
   * 
   * @param callback - Callback function yang akan diukur performancenya
   */
  const measureScrollPerformance = useCallback((callback: () => void) => {
    const startTime = performance.now();
    
    try {
      // Eksekusi callback
      callback();
    } catch (error) {
      console.error('Error during scroll performance measurement:', error);
      return;
    }
    
    const endTime = performance.now();
    const scrollTime = endTime - startTime;
    
    // Update scroll count
    scrollCount.current++;
    
    // Update performance data
    performanceData.current = updatePerformanceData(performanceData.current, scrollTime);
    
    // Update last scroll time
    lastScrollTime.current = endTime;
    
    // Performance status checking dan logging
    const status = getPerformanceStatus(scrollTime);
    
    switch (status) {
      case 'warning':
        console.warn(
          `Slow scroll detected: ${scrollTime.toFixed(2)}ms ` +
          `(threshold: ${PERFORMANCE_THRESHOLDS.FRAME_BUDGET}ms)`
        );
        break;
      case 'critical':
        console.error(
          `Critical scroll performance issue: ${scrollTime.toFixed(2)}ms ` +
          `(threshold: ${PERFORMANCE_THRESHOLDS.SLOW_OPERATION_WARNING}ms)`
        );
        break;
      default:
        // Good performance, no logging needed
        break;
    }
    
    // Log detailed performance data setiap 100 scroll events
    if (scrollCount.current % 100 === 0) {
      console.info('Scroll Performance Summary:', {
        totalEvents: performanceData.current.totalScrollEvents,
        averageTime: `${performanceData.current.averageScrollTime.toFixed(2)}ms`,
        maxTime: `${performanceData.current.maxScrollTime.toFixed(2)}ms`,
        lastMeasurement: `${scrollTime.toFixed(2)}ms`
      });
    }
  }, []);

  /**
   * Mendapatkan current performance data
   * 
   * @returns Copy dari current performance data
   */
  const getPerformanceData = useCallback((): PerformanceData => {
    return { ...performanceData.current };
  }, []);

  /**
   * Reset semua performance data ke initial state
   * Berguna untuk testing atau ketika ingin memulai measurement baru
   */
  const resetPerformanceData = useCallback(() => {
    scrollCount.current = 0;
    lastScrollTime.current = 0;
    performanceData.current = createEmptyPerformanceData();
    
    console.info('Scroll performance data has been reset');
  }, []);

  return {
    measureScrollPerformance,
    getPerformanceData,
    resetPerformanceData
  };
};

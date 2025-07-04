/**
 * @fileoverview Performance monitoring React hook
 * @author Axel Modra
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getPerformanceMonitor,
  type PerformanceMetrics,
  performanceUtils,
} from '@/utils/performance';

/**
 * Performance hook return interface
 */
export interface UsePerformanceReturn {
  metrics: PerformanceMetrics;
  score: number;
  isSupported: boolean;
  measureRender: (componentName: string) => {
    start: () => void;
    end: () => number | null;
  };
  measureAsync: <T>(
    operation: () => Promise<T>,
    name: string
  ) => Promise<{ result: T; duration: number }>;
  recordCustomMetric: (key: keyof PerformanceMetrics, value: number) => void;
  getMemoryUsage: () => any;
}

/**
 * Hook for performance monitoring
 */
export const usePerformance = (): UsePerformanceReturn => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [score, setScore] = useState<number>(100);
  const monitorRef = useRef(getPerformanceMonitor());

  // Update metrics when they change
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const monitor = monitorRef.current;

    const unsubscribe = monitor.onMetricsUpdate((newMetrics) => {
      setMetrics(newMetrics);
      setScore(monitor.getPerformanceScore());
    });

    // Get initial metrics
    setMetrics(monitor.getMetrics());
    setScore(monitor.getPerformanceScore());

    return unsubscribe;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't cleanup the global monitor, just unsubscribe
    };
  }, []);

  const measureRender = useCallback((componentName: string) => {
    return performanceUtils.measureRender(componentName);
  }, []);

  const measureAsync = useCallback(
    async <T>(
      operation: () => Promise<T>,
      name: string
    ): Promise<{ result: T; duration: number }> => {
      return performanceUtils.measureAsync(operation, name);
    },
    []
  );

  const recordCustomMetric = useCallback((key: keyof PerformanceMetrics, value: number) => {
    monitorRef.current.recordCustomMetric(key, value);
  }, []);

  const getMemoryUsage = useCallback(() => {
    return performanceUtils.getMemoryUsage();
  }, []);

  return {
    metrics,
    score,
    isSupported: typeof window !== 'undefined' ? performanceUtils.isSupported() : false,
    measureRender,
    measureAsync,
    recordCustomMetric,
    getMemoryUsage,
  };
};

/**
 * Hook for component render performance measurement
 */
export const useRenderPerformance = (componentName: string) => {
  const { measureRender } = usePerformance();
  const renderMeasure = useRef(measureRender(componentName));

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    renderMeasure.current.start();

    return () => {
      const duration = renderMeasure.current.end();
      if (duration && process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
      }
    };
  });
};

/**
 * Hook for measuring async operations
 */
export const useAsyncPerformance = () => {
  const { measureAsync } = usePerformance();

  const measure = useCallback(
    async <T>(operation: () => Promise<T>, name: string, logResult = true): Promise<T> => {
      const { result, duration } = await measureAsync(operation, name);

      if (logResult && process.env.NODE_ENV === 'development') {
        console.log(`${name} completed in ${duration.toFixed(2)}ms`);
      }

      return result;
    },
    [measureAsync]
  );

  return { measure };
};

/**
 * Hook for Core Web Vitals monitoring
 */
export const useWebVitals = () => {
  const { metrics, score } = usePerformance();

  const getVitalsStatus = useCallback(() => {
    const { fcp, lcp, fid, cls } = metrics;

    return {
      fcp: {
        value: fcp,
        status: !fcp
          ? 'unknown'
          : fcp <= 1800
            ? 'good'
            : fcp <= 3000
              ? 'needs-improvement'
              : 'poor',
      },
      lcp: {
        value: lcp,
        status: !lcp
          ? 'unknown'
          : lcp <= 2500
            ? 'good'
            : lcp <= 4000
              ? 'needs-improvement'
              : 'poor',
      },
      fid: {
        value: fid,
        status: !fid ? 'unknown' : fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor',
      },
      cls: {
        value: cls,
        status: !cls ? 'unknown' : cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs-improvement' : 'poor',
      },
    };
  }, [metrics]);

  return {
    metrics,
    score,
    vitalsStatus: getVitalsStatus(),
  };
};

/**
 * Hook for memory usage monitoring
 */
export const useMemoryMonitoring = (interval = 5000) => {
  const [memoryUsage, setMemoryUsage] = useState<any>(null);
  const { getMemoryUsage } = usePerformance();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const updateMemoryUsage = () => {
      const usage = getMemoryUsage();
      if (usage) {
        setMemoryUsage(usage);
      }
    };

    // Initial measurement
    updateMemoryUsage();

    // Set up interval
    const intervalId = setInterval(updateMemoryUsage, interval);

    return () => clearInterval(intervalId);
  }, [interval, getMemoryUsage]);

  return memoryUsage;
};

/**
 * Hook for performance debugging in development
 */
export const usePerformanceDebug = (enabled = process.env.NODE_ENV === 'development') => {
  const { metrics, score } = usePerformance();
  const memoryUsage = useMemoryMonitoring();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !enabled) return;

    const logPerformanceInfo = () => {
      console.group('🚀 Performance Debug Info');
      console.log('Core Web Vitals:', {
        FCP: metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A',
        LCP: metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A',
        FID: metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A',
        CLS: metrics.cls ? metrics.cls.toFixed(4) : 'N/A',
      });
      console.log('Performance Score:', score);
      if (memoryUsage) {
        console.log('Memory Usage:', {
          used: `${(memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          total: `${(memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          limit: `${(memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
        });
      }
      console.groupEnd();
    };

    // Log every 10 seconds
    const interval = setInterval(logPerformanceInfo, 10000);

    return () => clearInterval(interval);
  }, [enabled, metrics, score, memoryUsage]);
};

export default usePerformance;

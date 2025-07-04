/**
 * @fileoverview Performance monitoring component
 * @author Axel Modra
 */

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PerformanceMetrics } from '../../types';

/**
 * Performance monitor props
 */
interface PerformanceMonitorProps {
  enabled?: boolean;
  sampleRate?: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  children: React.ReactNode;
}

/**
 * Performance monitoring component that tracks render times and memory usage
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  sampleRate = 0.1,
  onMetricsUpdate,
  children,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    loadTime: 0,
  });

  const renderStartTime = useRef<number>(0);
  const componentMountTime = useRef<number>(0);

  /**
   * Measure memory usage
   */
  const measureMemoryUsage = useCallback((): number => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize?: number } }).memory;
      return memory?.usedJSHeapSize || 0;
    }
    return 0;
  }, []);

  /**
   * Measure bundle size (approximate)
   */
  const measureBundleSize = useCallback((): number => {
    // This is an approximation based on script tags
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;

    scripts.forEach((script) => {
      // This is a rough estimate - in production you'd want more accurate measurements
      const src = script.getAttribute('src');
      if (src && !src.startsWith('http')) {
        totalSize += 1024; // Rough estimate per script
      }
    });

    return totalSize;
  }, []);

  /**
   * Update performance metrics
   */
  const updateMetrics = useCallback(() => {
    if (!enabled || Math.random() > sampleRate) return;

    const newMetrics: PerformanceMetrics = {
      renderTime: performance.now() - renderStartTime.current,
      memoryUsage: measureMemoryUsage(),
      bundleSize: measureBundleSize(),
      loadTime: performance.now() - componentMountTime.current,
    };

    setMetrics(newMetrics);
    onMetricsUpdate?.(newMetrics);
  }, [enabled, sampleRate, measureMemoryUsage, measureBundleSize, onMetricsUpdate]);

  /**
   * Track component mount time
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      componentMountTime.current = performance.now();
    }
  }, []);

  /**
   * Track render times
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      renderStartTime.current = performance.now();

      // Use requestAnimationFrame to measure after render
      const measureRender = () => {
        updateMetrics();
      };

      requestAnimationFrame(measureRender);
    }
  });

  /**
   * Set up performance observer for Core Web Vitals
   */
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`Performance measure: ${entry.name} - ${entry.duration}ms`);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }

    return () => observer.disconnect();
  }, [enabled]);

  /**
   * Log performance metrics periodically
   */
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      console.log('Performance Metrics:', metrics);
    }, 10000); // Log every 10 seconds

    return () => clearInterval(interval);
  }, [enabled, metrics]);

  return <>{children}</>;
};

/**
 * Hook for performance measurement
 */
export const usePerformanceMeasure = (name: string, enabled = true) => {
  const startMeasure = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;
    performance.mark(`${name}-start`);
  }, [name, enabled]);

  const endMeasure = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }, [name, enabled]);

  return { startMeasure, endMeasure };
};

/**
 * Hook for tracking component render times
 */
export const useRenderTime = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      renderStartTime.current = performance.now();
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const endTime = performance.now();
      const duration = endTime - renderStartTime.current;
      setRenderTime(duration);

      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
      }
    }
  }, [componentName]);

  return renderTime;
};

/**
 * Hook for memory usage tracking
 */
export const useMemoryUsage = () => {
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as { memory: { usedJSHeapSize?: number } }).memory;
        setMemoryUsage(memory?.usedJSHeapSize || 0);
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
};

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  /**
   * Debounce function with performance tracking
   */
  debounce: <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number,
    trackPerformance = false
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      const start = trackPerformance ? performance.now() : 0;

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);

        if (trackPerformance) {
          const duration = performance.now() - start;
          console.log(`Debounced function execution time: ${duration.toFixed(2)}ms`);
        }
      }, wait);
    };
  },

  /**
   * Throttle function with performance tracking
   */
  throttle: <T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number,
    trackPerformance = false
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        const start = trackPerformance ? performance.now() : 0;

        func(...args);
        inThrottle = true;

        setTimeout(() => {
          inThrottle = false;

          if (trackPerformance) {
            const duration = performance.now() - start;
            console.log(`Throttled function execution time: ${duration.toFixed(2)}ms`);
          }
        }, limit);
      }
    };
  },

  /**
   * Measure function execution time
   */
  measureExecution: <T extends (...args: unknown[]) => R, R = unknown>(
    func: T,
    name?: string
  ): ((...args: Parameters<T>) => R) => {
    return (...args: Parameters<T>): R => {
      const start = performance.now();
      const result = func(...args) as R;
      const duration = performance.now() - start;

      console.log(`${name || 'Function'} execution time: ${duration.toFixed(2)}ms`);

      return result;
    };
  },
};

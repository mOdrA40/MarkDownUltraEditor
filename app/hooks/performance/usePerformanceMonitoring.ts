/**
 * @fileoverview Performance monitoring hooks for optimization insights
 * @author Axel Modra
 */

import { useCallback, useEffect, useRef } from 'react';
import { useDeepMemo } from './useMemoization';

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  renderTime: number;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  componentName: string;
}

/**
 * Hook for monitoring component render performance
 */
export function useRenderPerformance(componentName: string): PerformanceMetrics {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const lastRenderStart = useRef(performance.now());

  // Track render start
  const renderStart = performance.now();
  
  useEffect(() => {
    // Track render end
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;
    
    renderCount.current += 1;
    renderTimes.current.push(renderTime);
    
    // Keep only last 100 render times for average calculation
    if (renderTimes.current.length > 100) {
      renderTimes.current = renderTimes.current.slice(-100);
    }
    
    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  });

  return useDeepMemo(() => {
    const times = renderTimes.current;
    const averageRenderTime = times.length > 0 
      ? times.reduce((sum, time) => sum + time, 0) / times.length 
      : 0;

    return {
      renderTime: renderStart - lastRenderStart.current,
      renderCount: renderCount.current,
      lastRenderTime: times[times.length - 1] || 0,
      averageRenderTime,
      componentName,
    };
  }, [componentName, renderCount.current, renderTimes.current.length]);
}

/**
 * Hook for monitoring memory usage
 */
export function useMemoryMonitoring(intervalMs = 5000) {
  const memoryInfo = useRef<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    if (!('memory' in performance)) return;

    const updateMemoryInfo = () => {
      // biome-ignore lint/suspicious/noExplicitAny: Performance.memory is not in standard types
      const memory = (performance as any).memory;
      memoryInfo.current = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        timestamp: Date.now(),
      };

      // Log memory warnings in development
      if (process.env.NODE_ENV === 'development') {
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercent > 80) {
          console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`);
        }
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return memoryInfo.current;
}

/**
 * Hook for monitoring FPS (Frames Per Second)
 */
export function useFPSMonitoring() {
  const fps = useRef(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      const now = performance.now();
      frameCount.current++;

      if (now - lastTime.current >= 1000) {
        fps.current = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        frameCount.current = 0;
        lastTime.current = now;

        // Log FPS warnings in development
        if (process.env.NODE_ENV === 'development' && fps.current < 30) {
          console.warn(`Low FPS detected: ${fps.current}`);
        }
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return fps.current;
}

/**
 * Hook for measuring operation performance
 */
export function useOperationTiming() {
  const timings = useRef<Map<string, number[]>>(new Map());

  const startTiming = useCallback((operationName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const operationTimings = timings.current.get(operationName) || [];
      operationTimings.push(duration);
      
      // Keep only last 50 timings
      if (operationTimings.length > 50) {
        operationTimings.splice(0, operationTimings.length - 50);
      }
      
      timings.current.set(operationName, operationTimings);
      
      // Log slow operations in development
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.warn(`Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    };
  }, []);

  const getOperationStats = useCallback((operationName: string) => {
    const operationTimings = timings.current.get(operationName) || [];
    
    if (operationTimings.length === 0) {
      return null;
    }
    
    const sum = operationTimings.reduce((a, b) => a + b, 0);
    const average = sum / operationTimings.length;
    const min = Math.min(...operationTimings);
    const max = Math.max(...operationTimings);
    
    return {
      count: operationTimings.length,
      average,
      min,
      max,
      total: sum,
    };
  }, []);

  return { startTiming, getOperationStats };
}

/**
 * Hook for detecting performance bottlenecks
 */
export function usePerformanceBottleneckDetection() {
  const bottlenecks = useRef<{
    slowRenders: string[];
    memoryLeaks: string[];
    slowOperations: string[];
  }>({
    slowRenders: [],
    memoryLeaks: [],
    slowOperations: [],
  });

  const reportBottleneck = useCallback((type: 'render' | 'memory' | 'operation', details: string) => {
    switch (type) {
      case 'render':
        bottlenecks.current.slowRenders.push(details);
        break;
      case 'memory':
        bottlenecks.current.memoryLeaks.push(details);
        break;
      case 'operation':
        bottlenecks.current.slowOperations.push(details);
        break;
    }

    // Keep only last 20 bottlenecks per type
    Object.keys(bottlenecks.current).forEach(key => {
      const arr = bottlenecks.current[key as keyof typeof bottlenecks.current];
      if (arr.length > 20) {
        arr.splice(0, arr.length - 20);
      }
    });
  }, []);

  const getBottlenecks = useCallback(() => {
    return { ...bottlenecks.current };
  }, []);

  const clearBottlenecks = useCallback(() => {
    bottlenecks.current = {
      slowRenders: [],
      memoryLeaks: [],
      slowOperations: [],
    };
  }, []);

  return { reportBottleneck, getBottlenecks, clearBottlenecks };
}

/**
 * Hook for bundle size monitoring
 */
export function useBundleAnalysis() {
  const bundleInfo = useRef<{
    totalSize: number;
    gzippedSize: number;
    chunks: Array<{ name: string; size: number }>;
  } | null>(null);

  useEffect(() => {
    // This would typically be populated by webpack-bundle-analyzer or similar
    // For now, we'll use a placeholder
    if (process.env.NODE_ENV === 'development') {
      bundleInfo.current = {
        totalSize: 0, // Would be populated by build tools
        gzippedSize: 0,
        chunks: [],
      };
    }
  }, []);

  return bundleInfo.current;
}

/**
 * Hook for Core Web Vitals monitoring
 */
export function useCoreWebVitals() {
  const vitals = useRef<{
    LCP: number | null; // Largest Contentful Paint
    FID: number | null; // First Input Delay
    CLS: number | null; // Cumulative Layout Shift
    FCP: number | null; // First Contentful Paint
    TTFB: number | null; // Time to First Byte
  }>({
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null,
  });

  useEffect(() => {
    // Use web-vitals library if available
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        // biome-ignore lint/suspicious/noExplicitAny: PerformanceEntry types are not fully typed
        const lastEntry = entries[entries.length - 1] as any;
        vitals.current.LCP = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FCP
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        // biome-ignore lint/suspicious/noExplicitAny: PerformanceEntry types are not fully typed
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint') as any;
        if (fcpEntry) {
          vitals.current.FCP = fcpEntry.startTime;
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        // biome-ignore lint/suspicious/noExplicitAny: LayoutShift entries are not fully typed
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            vitals.current.CLS = clsValue;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      return () => {
        lcpObserver.disconnect();
        fcpObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);

  return vitals.current;
}

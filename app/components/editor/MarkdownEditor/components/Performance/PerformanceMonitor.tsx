/**
 * @fileoverview Performance monitoring component
 * @author Axel Modra
 */

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PerformanceMetrics } from "../../types";

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
  enabled = process.env.NODE_ENV === "development",
  sampleRate = 0.1,
  onMetricsUpdate,
  children,
}) => {
  const [_metrics, setMetrics] = useState<PerformanceMetrics>({
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
    if (typeof window !== "undefined" && "memory" in performance) {
      const memory = (performance as { memory: { usedJSHeapSize?: number } })
        .memory;
      return memory?.usedJSHeapSize || 0;
    }
    return 0;
  }, []);

  /**
   * Measure bundle size (approximate)
   */
  const measureBundleSize = useCallback((): number => {
    // This is an approximation based on script tags
    const scripts = document.querySelectorAll("script[src]");
    let totalSize = 0;

    scripts.forEach((script) => {
      // This is a rough estimate - in production you'd want more accurate measurements
      const src = script.getAttribute("src");
      if (src && !src.startsWith("http")) {
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
  }, [
    enabled,
    sampleRate,
    measureMemoryUsage,
    measureBundleSize,
    onMetricsUpdate,
  ]);

  /**
   * Track component mount time
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      componentMountTime.current = performance.now();
    }
  }, []);

  /**
   * Track render times
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
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
    if (
      !enabled ||
      typeof window === "undefined" ||
      !window.PerformanceObserver
    )
      return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (
          entry.entryType === "measure" &&
          process.env.NODE_ENV === "development"
        ) {
          // Performance logging only in development
        }
      });
    });

    try {
      observer.observe({ entryTypes: ["measure", "navigation"] });
    } catch (error) {
      import("@/utils/console").then(({ safeConsole }) => {
        safeConsole.warn("Performance observer not supported:", error);
      });
    }

    return () => observer.disconnect();
  }, [enabled]);

  /**
   * Log performance metrics periodically
   */
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      // Performance metrics monitoring (development only)
    }, 10000);

    return () => clearInterval(interval);
  }, [enabled]);

  return <>{children}</>;
};

/**
 * Hook for performance measurement
 */
export const usePerformanceMeasure = (name: string, enabled = true) => {
  const startMeasure = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    performance.mark(`${name}-start`);
  }, [name, enabled]);

  const endMeasure = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }, [name, enabled]);

  return { startMeasure, endMeasure };
};

/**
 * Hook for tracking component render times
 */
export const useRenderTime = (_componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      renderStartTime.current = performance.now();
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const endTime = performance.now();
      const duration = endTime - renderStartTime.current;
      setRenderTime(duration);

      // Performance logging removed for production
    }
  }, []);

  return renderTime;
};

/**
 * Hook for memory usage tracking
 */
export const useMemoryUsage = () => {
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateMemoryUsage = () => {
      if ("memory" in performance) {
        const memory = (performance as { memory: { usedJSHeapSize?: number } })
          .memory;
        setMemoryUsage(memory?.usedJSHeapSize || 0);
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
};

// Import common utilities to avoid duplication
import {
  debounce as commonDebounce,
  throttle as commonThrottle,
} from "@/utils/common";

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  /**
   * Debounce function - uses centralized implementation
   */
  debounce: commonDebounce,

  /**
   * Throttle function - uses centralized implementation
   */
  throttle: commonThrottle,

  /**
   * Measure function execution time
   */
  measureExecution: <T extends (...args: unknown[]) => R, R = unknown>(
    func: T,
    _name?: string
  ): ((...args: Parameters<T>) => R) => {
    return (...args: Parameters<T>): R => {
      return func(...args) as R;
    };
  },
};

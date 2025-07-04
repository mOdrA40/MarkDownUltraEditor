/**
 * @fileoverview Performance monitoring utilities
 * @author Axel Modra
 */

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift

  // Additional metrics
  ttfb?: number; // Time to First Byte
  domContentLoaded?: number;
  loadComplete?: number;

  // Custom metrics
  editorReady?: number;
  firstEdit?: number;
  fileLoadTime?: number;
}

/**
 * Performance observer for Core Web Vitals
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private callbacks: Array<(metrics: PerformanceMetrics) => void> = [];

  constructor() {
    this.initializeObservers();
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    // Only run in browser
    if (typeof window === 'undefined') return;

    try {
      // First Contentful Paint & Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        this.observePaintMetrics();
        this.observeLayoutShift();
        this.observeFirstInputDelay();
        this.observeNavigationTiming();
      }
    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error);
    }
  }

  /**
   * Observe paint metrics (FCP, LCP)
   */
  private observePaintMetrics(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              this.updateMetric('fcp', entry.startTime);
            }
          } else if (entry.entryType === 'largest-contentful-paint') {
            this.updateMetric('lcp', entry.startTime);
          }
        }
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to observe paint metrics:', error);
    }
  }

  /**
   * Observe layout shift (CLS)
   */
  private observeLayoutShift(): void {
    try {
      let clsValue = 0;

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as unknown as { hadRecentInput: boolean }).hadRecentInput) {
            clsValue += (entry as unknown as { value: number }).value;
            this.updateMetric('cls', clsValue);
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to observe layout shift:', error);
    }
  }

  /**
   * Observe First Input Delay (FID)
   */
  private observeFirstInputDelay(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            this.updateMetric('fid', (entry as unknown as { processingStart: number }).processingStart - entry.startTime);
          }
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to observe first input delay:', error);
    }
  }

  /**
   * Observe navigation timing
   */
  private observeNavigationTiming(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.updateMetric('ttfb', navEntry.responseStart - navEntry.requestStart);
            this.updateMetric(
              'domContentLoaded',
              navEntry.domContentLoadedEventEnd - navEntry.fetchStart
            );
            this.updateMetric('loadComplete', navEntry.loadEventEnd - navEntry.fetchStart);
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to observe navigation timing:', error);
    }
  }

  /**
   * Update a metric and notify callbacks
   */
  private updateMetric(key: keyof PerformanceMetrics, value: number): void {
    this.metrics[key] = value;
    this.notifyCallbacks();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${key} = ${value.toFixed(2)}ms`);
    }
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach((callback) => {
      try {
        callback({ ...this.metrics });
      } catch (error) {
        console.error('Performance callback error:', error);
      }
    });
  }

  /**
   * Add a callback for metric updates
   */
  public onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Mark a custom timing
   */
  public mark(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * Measure time between marks
   */
  public measure(name: string, startMark: string, endMark?: string): number | null {
    try {
      if (typeof performance !== 'undefined' && performance.measure) {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name, 'measure');
        return entries.length > 0 ? entries[entries.length - 1].duration : null;
      }
    } catch (error) {
      console.warn('Performance measure failed:', error);
    }
    return null;
  }

  /**
   * Record custom metric
   */
  public recordCustomMetric(key: keyof PerformanceMetrics, value: number): void {
    this.updateMetric(key, value);
  }

  /**
   * Get performance score based on Core Web Vitals
   */
  public getPerformanceScore(): number {
    const { fcp, lcp, fid, cls } = this.metrics;
    let score = 100;

    // FCP scoring (good: <1.8s, needs improvement: 1.8-3s, poor: >3s)
    if (fcp) {
      if (fcp > 3000) score -= 25;
      else if (fcp > 1800) score -= 10;
    }

    // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (lcp) {
      if (lcp > 4000) score -= 25;
      else if (lcp > 2500) score -= 10;
    }

    // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (fid) {
      if (fid > 300) score -= 25;
      else if (fid > 100) score -= 10;
    }

    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (cls) {
      if (cls > 0.25) score -= 25;
      else if (cls > 0.1) score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Cleanup observers
   */
  public cleanup(): void {
    this.observers.forEach((observer) => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Failed to disconnect performance observer:', error);
      }
    });
    this.observers = [];
    this.callbacks = [];
  }
}

// Global performance monitor instance
let performanceMonitor: PerformanceMonitor | null = null;

/**
 * Get or create performance monitor instance
 */
export const getPerformanceMonitor = (): PerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
};

/**
 * Utility functions for common performance measurements
 */
export const performanceUtils = {
  /**
   * Measure component render time
   */
  measureRender: (componentName: string) => {
    const monitor = getPerformanceMonitor();
    const startMark = `${componentName}-render-start`;
    const endMark = `${componentName}-render-end`;

    return {
      start: () => monitor.mark(startMark),
      end: () => {
        monitor.mark(endMark);
        return monitor.measure(`${componentName}-render`, startMark, endMark);
      },
    };
  },

  /**
   * Measure async operation time
   */
  measureAsync: async <T>(
    operation: () => Promise<T>,
    name: string
  ): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;

    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);

    return { result, duration };
  },

  /**
   * Debounced performance logging
   */
  debouncedLog: (() => {
    let timeout: NodeJS.Timeout;
    return (message: string, delay = 1000) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        console.log(`Performance: ${message}`);
      }, delay);
    };
  })(),

  /**
   * Memory usage monitoring
   */
  getMemoryUsage: (): unknown => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as unknown as { memory: unknown }).memory;
    }
    return null;
  },

  /**
   * Check if performance API is available
   */
  isSupported: (): boolean => {
    return (
      typeof window !== 'undefined' &&
      typeof performance !== 'undefined' &&
      'PerformanceObserver' in window
    );
  },
};

export default getPerformanceMonitor;

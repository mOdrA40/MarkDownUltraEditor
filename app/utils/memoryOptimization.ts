/**
 * @fileoverview Memory optimization utilities for production
 * @author Performance Team
 * @version 1.0.0
 */

import { useEffect, useRef } from 'react';

/**
 * Memory leak detection and prevention utilities
 */
export class MemoryManager {
  private static instance: MemoryManager;
  private cleanupFunctions: Set<() => void> = new Set();
  private timers: Set<NodeJS.Timeout> = new Set();
  private observers: Set<IntersectionObserver | MutationObserver | ResizeObserver> = new Set();
  private eventListeners: Set<{
    target: EventTarget;
    type: string;
    listener: EventListener;
  }> = new Set();

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Register cleanup function
   */
  registerCleanup(cleanup: () => void): void {
    this.cleanupFunctions.add(cleanup);
  }

  /**
   * Register timer for automatic cleanup
   */
  registerTimer(timer: NodeJS.Timeout): void {
    this.timers.add(timer);
  }

  /**
   * Register observer for automatic cleanup
   */
  registerObserver(observer: IntersectionObserver | MutationObserver | ResizeObserver): void {
    this.observers.add(observer);
  }

  /**
   * Register event listener for automatic cleanup
   */
  registerEventListener(target: EventTarget, type: string, listener: EventListener): void {
    this.eventListeners.add({ target, type, listener });
  }

  /**
   * Clean up all registered resources
   */
  cleanup(): void {
    // Clear timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    // Disconnect observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    // Remove event listeners
    this.eventListeners.forEach(({ target, type, listener }) => {
      target.removeEventListener(type, listener);
    });
    this.eventListeners.clear();

    // Run custom cleanup functions
    this.cleanupFunctions.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    this.cleanupFunctions.clear();
  }

  /**
   * Get memory usage information
   */
  getMemoryInfo(): { used: number; total: number; percentage: number } | null {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      // biome-ignore lint/suspicious/noExplicitAny: Performance memory API is not fully typed
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      };
    }
    return null;
  }

  /**
   * Force garbage collection (if available)
   */
  forceGC(): void {
    if (typeof window !== 'undefined') {
      // biome-ignore lint/suspicious/noExplicitAny: GC API is not standardized
      const windowWithGC = window as any;
      if (windowWithGC.gc) {
        windowWithGC.gc();
      }
    }
  }
}

/**
 * Hook for automatic memory management
 */
export function useMemoryManager() {
  const manager = MemoryManager.getInstance();
  const cleanupRef = useRef<(() => void)[]>([]);

  const addCleanup = (cleanup: () => void) => {
    cleanupRef.current.push(cleanup);
    manager.registerCleanup(cleanup);
  };

  const addTimer = (callback: () => void, delay: number) => {
    const timer = setTimeout(callback, delay);
    manager.registerTimer(timer);
    return timer;
  };

  const addInterval = (callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay);
    manager.registerTimer(interval);
    return interval;
  };

  const addEventListener = (target: EventTarget, type: string, listener: EventListener) => {
    target.addEventListener(type, listener);
    manager.registerEventListener(target, type, listener);
    return () => target.removeEventListener(type, listener);
  };

  const addObserver = (observer: IntersectionObserver | MutationObserver | ResizeObserver) => {
    manager.registerObserver(observer);
    return observer;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];
    };
  }, []);

  return {
    addCleanup,
    addTimer,
    addInterval,
    addEventListener,
    addObserver,
    getMemoryInfo: manager.getMemoryInfo.bind(manager),
    forceGC: manager.forceGC.bind(manager),
  };
}

/**
 * Hook for monitoring memory usage
 */
export function useMemoryMonitor(threshold = 80) {
  const memoryRef = useRef<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const checkMemory = () => {
      const manager = MemoryManager.getInstance();
      const memoryInfo = manager.getMemoryInfo();

      if (memoryInfo && memoryInfo.percentage > threshold) {
        // Report high memory usage to Sentry
        import('@/utils/sentry').then(({ secureSentry }) => {
          // biome-ignore lint/suspicious/noExplicitAny: Sentry types need proper enum import
          secureSentry.logError(
            `High memory usage detected: ${memoryInfo.percentage.toFixed(2)}%`,
            'PERFORMANCE' as any,
            'MEDIUM' as any,
            memoryInfo
          );
        });

        // Force garbage collection if available
        manager.forceGC();
      }

      memoryRef.current = memoryInfo;
    };

    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    checkMemory(); // Initial check

    return () => clearInterval(interval);
  }, [threshold]);

  return memoryRef.current;
}

/**
 * Debounced function creator with automatic cleanup
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic function type requires any for flexibility
export function createDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout;
  const manager = MemoryManager.getInstance();

  const debouncedFunc = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
    manager.registerTimer(timeoutId);
  }) as T & { cancel: () => void };

  debouncedFunc.cancel = () => {
    clearTimeout(timeoutId);
  };

  return debouncedFunc;
}

/**
 * Throttled function creator with automatic cleanup
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic function type requires any for flexibility
export function createThrottledFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let lastCall = 0;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  }) as T;
}

/**
 * Initialize memory optimization for the app
 */
export function initializeMemoryOptimization() {
  if (typeof window === 'undefined') return;

  const manager = MemoryManager.getInstance();

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    manager.cleanup();
  });

  // Clean up on visibility change (tab switch)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Force garbage collection when tab is hidden
      manager.forceGC();
    }
  });

  // Monitor memory usage in production
  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      const memoryInfo = manager.getMemoryInfo();
      if (memoryInfo && memoryInfo.percentage > 90) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.log('Critical memory usage:', memoryInfo);
        });
        manager.forceGC();
      }
    }, 60000); // Check every minute
  }
}

export default MemoryManager;

/**
 * Type definitions untuk usePerformanceOptimization module
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

/**
 * Interface untuk performance data monitoring
 */
export interface PerformanceData {
  /** Rata-rata waktu scroll dalam milliseconds */
  averageScrollTime: number;
  /** Waktu scroll maksimum dalam milliseconds */
  maxScrollTime: number;
  /** Total scroll events yang terjadi */
  totalScrollEvents: number;
}

/**
 * Interface untuk scroll performance monitoring
 */
export interface ScrollPerformanceMetrics extends PerformanceData {
  /** Timestamp terakhir scroll event */
  lastScrollTime: number;
  /** Jumlah scroll events */
  scrollCount: number;
}

/**
 * Interface untuk media query breakpoints
 */
export interface MediaQueryBreakpoints {
  /** Mobile breakpoint (max-width) */
  mobile: MediaQueryList;
  /** Tablet breakpoint (max-width) */
  tablet: MediaQueryList;
  /** Desktop breakpoint (min-width) */
  desktop: MediaQueryList;
  /** Prefers reduced motion */
  prefersReducedMotion: MediaQueryList;
  /** Prefers dark mode */
  prefersDarkMode: MediaQueryList;
}

/**
 * Device types yang didukung
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Interface untuk debounce/throttle options
 */
export interface DebounceThrottleOptions {
  /** Delay untuk debounce dalam milliseconds */
  debounceDelay?: number;
  /** Limit untuk throttle dalam milliseconds */
  throttleLimit?: number;
}

/**
 * Interface untuk intersection observer options
 */
export interface IntersectionOptions extends IntersectionObserverInit {
  /** Custom callback untuk intersection changes */
  onIntersection?: (entries: IntersectionObserverEntry[]) => void;
}

/**
 * Interface untuk performance optimization hooks return values
 */
export interface UseDebounceThrottleReturn {
  /** Debounced function */
  debounce: <T extends (...args: unknown[]) => unknown>(func: T, wait: number) => (...args: Parameters<T>) => void;
  /** Throttled function */
  throttle: <T extends (...args: unknown[]) => unknown>(func: T, limit: number) => (...args: Parameters<T>) => void;
  /** Request animation frame wrapper */
  requestAnimationFrame: (callback: () => void) => void;
}

export interface UseScrollPerformanceReturn {
  /** Measure scroll performance */
  measureScrollPerformance: (callback: () => void) => void;
  /** Get current performance data */
  getPerformanceData: () => PerformanceData;
  /** Reset performance data */
  resetPerformanceData: () => void;
}

export interface UseIntersectionOptimizationReturn {
  /** Create optimized intersection observer */
  createOptimizedObserver: (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => IntersectionObserver;
  /** Cleanup observer */
  cleanup: () => void;
  /** Check if element is in viewport */
  isElementInViewport: (element: Element, threshold?: number) => boolean;
}

export interface UseResponsiveOptimizationReturn {
  /** Get current device type */
  getDeviceType: () => DeviceType;
  /** Check if user prefers reduced motion */
  shouldReduceMotion: () => boolean;
  /** Check if user prefers dark mode */
  prefersDarkMode: () => boolean;
}

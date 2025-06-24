/**
 * usePerformanceOptimization Hook (Combined)
 * 
 * Hook gabungan untuk backward compatibility yang menggabungkan
 * semua performance optimization hooks dalam satu interface.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useDebounceThrottle } from './useDebounceThrottle';
import { useScrollPerformance } from './useScrollPerformance';
import { useIntersectionOptimization } from './useIntersectionOptimization';
import { useResponsiveOptimization } from './useResponsiveOptimization';

/**
 * Combined performance optimization hook untuk backward compatibility
 * 
 * @returns Object dengan semua performance optimization functions
 */
export const usePerformanceOptimization = () => {
  // Get all individual hooks
  const debounceThrottle = useDebounceThrottle();
  const scrollPerformance = useScrollPerformance();
  const intersectionOptimization = useIntersectionOptimization();
  const responsiveOptimization = useResponsiveOptimization();

  // Return combined interface untuk backward compatibility
  return {
    // Debounce & Throttle functions
    requestAnimationFrame: debounceThrottle.requestAnimationFrame,
    debounce: debounceThrottle.debounce,
    throttle: debounceThrottle.throttle,
    
    // Scroll performance functions
    measureScrollPerformance: scrollPerformance.measureScrollPerformance,
    getPerformanceData: scrollPerformance.getPerformanceData,
    resetPerformanceData: scrollPerformance.resetPerformanceData,
    
    // Intersection optimization functions
    createOptimizedObserver: intersectionOptimization.createOptimizedObserver,
    cleanup: intersectionOptimization.cleanup,
    isElementInViewport: intersectionOptimization.isElementInViewport,
    
    // Responsive optimization functions
    getDeviceType: responsiveOptimization.getDeviceType,
    shouldReduceMotion: responsiveOptimization.shouldReduceMotion,
    prefersDarkMode: responsiveOptimization.prefersDarkMode,
  };
};

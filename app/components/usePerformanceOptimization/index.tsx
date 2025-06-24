/**
 * usePerformanceOptimization Component Module
 *
 * Modul komprehensif untuk optimasi performance dengan separation of concerns
 * yang jelas antara UI components dan business logic.
 *
 * @author Senior Developer
 * @version 2.0.0
 */

// Export individual hooks
export { useDebounceThrottle } from './hooks/useDebounceThrottle';
export { useScrollPerformance } from './hooks/useScrollPerformance';
export { useIntersectionOptimization } from './hooks/useIntersectionOptimization';
export { useResponsiveOptimization } from './hooks/useResponsiveOptimization';

// Export types
export * from './types';

// Export utilities
export * from './utils/performanceUtils';
export * from './utils/mediaQueryUtils';

// Backward compatibility - export combined hook
export { usePerformanceOptimization } from './hooks/usePerformanceOptimization';

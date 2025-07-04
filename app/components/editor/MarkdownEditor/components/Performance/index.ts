/**
 * @fileoverview Performance optimization components export file
 * @author Axel Modra
 */

// Re-export types
export type { ErrorBoundaryState, PerformanceMetrics } from '../../types';
// Export error boundary
export {
  EditorErrorBoundary,
  useErrorHandler,
  withErrorBoundary,
} from '../ErrorBoundary/EditorErrorBoundary';
// Export memoized components
export {
  MemoizedEditorFooter,
  MemoizedEditorHeader,
  MemoizedEditorMainContent,
  MemoizedEditorSidebar,
  useDebouncedValue,
  useStableArray,
  useStableCallback,
  useStableObject,
  useStableValue,
  useThrottledValue,
  withPerformanceOptimization,
} from './MemoizedComponents';
// Export performance monitoring
export {
  PerformanceMonitor,
  performanceUtils,
  useMemoryUsage,
  usePerformanceMeasure,
  useRenderTime,
} from './PerformanceMonitor';

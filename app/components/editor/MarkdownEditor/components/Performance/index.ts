/**
 * @fileoverview Performance optimization components export file
 * @author Axel Modra
 */

// Export performance monitoring
export { PerformanceMonitor, usePerformanceMeasure, useRenderTime, useMemoryUsage, performanceUtils } from './PerformanceMonitor';

// Export memoized components
export {
  MemoizedEditorHeader,
  MemoizedEditorSidebar,
  MemoizedEditorMainContent,
  MemoizedEditorFooter,
  useStableCallback,
  useStableValue,
  useStableObject,
  useStableArray,
  useDebouncedValue,
  useThrottledValue,
  withPerformanceOptimization
} from './MemoizedComponents';

// Export error boundary
export { EditorErrorBoundary, useErrorHandler, withErrorBoundary } from '../ErrorBoundary/EditorErrorBoundary';

// Re-export types
export type { PerformanceMetrics, ErrorBoundaryState } from '../../types';

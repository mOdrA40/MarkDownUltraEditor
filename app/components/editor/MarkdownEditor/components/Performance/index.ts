/**
 * @fileoverview Performance optimization components export file
 * @author Axel Modra
 */

export type { ErrorBoundaryState, PerformanceMetrics } from "../../types";
export {
  EditorErrorBoundary,
  useErrorHandler,
  withErrorBoundary,
} from "../ErrorBoundary/EditorErrorBoundary";
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
  VirtualizedEditorSidebar,
  withPerformanceOptimization,
} from "./MemoizedComponents";
export {
  PerformanceMonitor,
  performanceUtils,
  useMemoryUsage,
  usePerformanceMeasure,
  useRenderTime,
} from "./PerformanceMonitor";

/**
 * @fileoverview Core hooks exports
 * @author Axel Modra
 */

export { usePerformanceOptimization } from './usePerformanceOptimization';
// Re-export types
export type {
  ToasterToast,
  ToastInput,
  ToastReturn,
  UseToastOptions,
  UseToastReturn,
} from './useToast';
// Core functionality hooks
export { toast, useToast } from './useToast';
export { useUndoRedo } from './useUndoRedo';

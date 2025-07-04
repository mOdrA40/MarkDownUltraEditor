/**
 * @fileoverview Core hooks exports
 * @author Axel Modra
 */

// Core functionality hooks
export { useToast, toast } from './useToast';
export { useUndoRedo } from './useUndoRedo';
export { usePerformanceOptimization } from './usePerformanceOptimization';
export { useStorageMonitor, useStorageStatus } from './useStorageMonitor';

// Re-export types
export type {
  ToasterToast,
  ToastInput,
  ToastReturn,
  UseToastOptions,
  UseToastReturn,
} from './useToast';

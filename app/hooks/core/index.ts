/**
 * @fileoverview Core hooks exports
 * @author Senior Developer
 * @version 1.0.0
 */

// Core functionality hooks
export { useToast, toast } from './useToast';
export { useUndoRedo } from './useUndoRedo';
export { usePerformanceOptimization } from './usePerformanceOptimization';

// Re-export types
export type { 
  ToasterToast, 
  ToastInput, 
  ToastReturn, 
  UseToastOptions, 
  UseToastReturn 
} from './useToast';

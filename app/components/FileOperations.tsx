
/**
 * @fileoverview FileOperations component - Backward compatibility wrapper
 * @author Senior Developer
 * @version 2.0.0
 * @deprecated Use ./FileOperations/index.tsx for new implementations
 */

// Re-export the refactored FileOperations component for backward compatibility
export { FileOperations } from './FileOperations/index';

// Re-export types for external usage
export type { FileOperationsProps } from './FileOperations/types/fileOperations.types';

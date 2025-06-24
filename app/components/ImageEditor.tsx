/**
 * @fileoverview ImageEditor component - Backward compatibility wrapper
 * @author Senior Developer
 * @version 2.0.0
 * @deprecated Use ./ImageEditor/index.tsx for new implementations
 */

// Re-export the refactored ImageEditor component for backward compatibility
export { ImageEditor } from './ImageEditor/index';

// Re-export types for external usage
export type {
  ImageEditorProps,
  AnnotationTool,
  ImageFilters,
  ImageTransform
} from './ImageEditor/types/imageEditor.types';






/**
 * @fileoverview EditorPane component - Backward compatibility wrapper
 * @author Senior Developer
 * @version 2.0.0
 * @deprecated Use ./EditorPane/index.tsx for new implementations
 */

// Re-export the refactored EditorPane component for backward compatibility
export { EditorPane } from './EditorPane/index';

// Re-export types for external usage
export type { EditorPaneProps } from './EditorPane/types/editorPane.types';

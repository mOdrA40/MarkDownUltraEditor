/**
 * @fileoverview Navigation-related hooks exports
 * @author Senior Developer
 * @version 1.0.0
 */

// Navigation hooks
export { useKeyboardNavigation } from './useKeyboardNavigation';
export { useOutlineNavigation } from './useOutlineNavigation';
export { useScrollSpy } from './useScrollSpy';
export { useFocusManagement } from './useFocusManagement';

// Re-export types
export type {
  KeyboardNavigationOptions,
  UseKeyboardNavigationReturn
} from './useKeyboardNavigation';

/**
 * @fileoverview Navigation-related hooks exports
 * @author Axel Modra
 */

export { useFocusManagement } from './useFocusManagement';
// Re-export types
export type {
  KeyboardNavigationOptions,
  UseKeyboardNavigationReturn,
} from './useKeyboardNavigation';
// Navigation hooks
export { useKeyboardNavigation } from './useKeyboardNavigation';
export { useOutlineNavigation } from './useOutlineNavigation';
export { useScrollSpy } from './useScrollSpy';

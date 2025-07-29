/**
 * Main keyboard navigation hook dengan refactored architecture
 * Menggunakan separated concerns dan reusable utilities
 */

import { useCallback, useEffect, useMemo } from 'react';
import { scrollToHeading } from '@/utils/headingUtils';
import { calculateTargetIndex, type NavigationDirection } from '@/utils/keyboardNavigationUtils';

/**
 * Enhanced keyboard navigation options
 */
export interface KeyboardNavigationOptions {
  /**
   * Array of heading IDs untuk navigation
   */
  headingIds: string[];

  /**
   * Current active heading ID
   */
  activeId: string;

  /**
   * Callback ketika active heading berubah
   */
  onActiveChange?: (headingId: string) => void;

  /**
   * Enable/disable keyboard navigation
   */
  enabled?: boolean;

  /**
   * Container element untuk scroll
   */
  container?: Element | null;

  /**
   * Scroll offset
   */
  offset?: number;

  /**
   * Throttle delay untuk keyboard events (ms)
   */
  throttleDelay?: number;

  /**
   * Auto-focus pada active item
   */
  autoFocus?: boolean;

  /**
   * Custom key bindings
   */
  keyBindings?: {
    next?: string[];
    previous?: string[];
    first?: string[];
    last?: string[];
    activate?: string[];
    escape?: string[];
  };
}

/**
 * Enhanced keyboard navigation return type
 */
export interface UseKeyboardNavigationReturn {
  navigateToHeading: (direction: NavigationDirection) => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  focusActiveItem: () => boolean;
  getCurrentIndex: () => number;
}

/**
 * Default key bindings
 */
const DEFAULT_KEY_BINDINGS = {
  next: ['ArrowDown', 'j'],
  previous: ['ArrowUp', 'k'],
  first: ['Home', 'g'],
  last: ['End', 'G'],
  activate: ['Enter', ' '],
  escape: ['Escape'],
};

/**
 * Enhanced keyboard navigation hook dengan comprehensive features
 */
export const useKeyboardNavigation = (
  options: KeyboardNavigationOptions
): UseKeyboardNavigationReturn => {
  const {
    headingIds,
    activeId,
    onActiveChange,
    enabled = true,
    container = null,
    offset = 100,
    autoFocus = false,
    keyBindings = DEFAULT_KEY_BINDINGS,
  } = options;

  // Merge key bindings dengan defaults - memoized untuk stability
  const mergedKeyBindings = useMemo(
    () => ({
      ...DEFAULT_KEY_BINDINGS,
      ...keyBindings,
    }),
    [keyBindings]
  );

  /**
   * Navigate ke heading berdasarkan direction dengan enhanced logic
   */
  const navigateToHeading = useCallback(
    (direction: NavigationDirection) => {
      if (headingIds.length === 0) return;

      const currentIndex = headingIds.indexOf(activeId);
      const targetIndex = calculateTargetIndex(currentIndex, headingIds.length, direction);

      if (targetIndex === -1 || targetIndex === currentIndex) return;

      const targetId = headingIds[targetIndex];
      if (targetId) {
        onActiveChange?.(targetId);

        // Scroll ke heading
        scrollToHeading(targetId, {
          offset,
          behavior: 'smooth',
          container,
        });

        // Auto-focus jika enabled
        if (autoFocus) {
          const element = document.querySelector(`[data-heading-id="${targetId}"]`);
          if (element && element instanceof HTMLElement) {
            element.focus();
          }
        }
      }
    },
    [headingIds, activeId, onActiveChange, container, offset, autoFocus]
  );

  /**
   * Get current heading index
   */
  const getCurrentIndex = useCallback((): number => {
    return headingIds.indexOf(activeId);
  }, [headingIds, activeId]);

  /**
   * Focus active item
   */
  const focusActiveItem = useCallback((): boolean => {
    if (!activeId) return false;

    const element = document.querySelector(`[data-heading-id="${activeId}"]`);
    if (element && element instanceof HTMLElement) {
      try {
        element.focus();
        return document.activeElement === element;
      } catch (error) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.warn('Failed to focus active item:', error);
        });
        return false;
      }
    }
    return false;
  }, [activeId]);

  /**
   * Enhanced keyboard event handler dengan throttling
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || headingIds.length === 0) return;

      // Check if focus is on TOC/Outline element
      const activeElement = document.activeElement;
      const isTocElement =
        activeElement?.closest('[data-toc-container]') ||
        activeElement?.closest('[data-outline-container]');

      if (!isTocElement) return;

      // Check key bindings
      const { next, previous, first, last, activate, escape: escapeKey } = mergedKeyBindings;

      if (next.includes(event.key)) {
        event.preventDefault();
        navigateToHeading('next');
      } else if (previous.includes(event.key)) {
        event.preventDefault();
        navigateToHeading('previous');
      } else if (first.includes(event.key)) {
        event.preventDefault();
        navigateToHeading('first');
      } else if (last.includes(event.key)) {
        event.preventDefault();
        navigateToHeading('last');
      } else if (activate.includes(event.key)) {
        event.preventDefault();
        if (activeId) {
          scrollToHeading(activeId, {
            offset,
            behavior: 'smooth',
            container,
          });
        }
      } else if (escapeKey.includes(event.key)) {
        event.preventDefault();
        // Remove focus from TOC/Outline
        (activeElement as HTMLElement)?.blur();
      }
    },
    [enabled, headingIds, activeId, navigateToHeading, container, offset, mergedKeyBindings]
  );

  /**
   * Setup keyboard event listeners
   */
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    navigateToHeading,
    handleKeyDown,
    focusActiveItem,
    getCurrentIndex,
  };
};

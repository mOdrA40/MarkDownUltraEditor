/**
 * Focus management hook
 * Specialized hook untuk managing focus state dan focus operations
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  focusElement,
  getElementByDataAttribute,
  getFocusableElements,
  isElementInViewport,
  type ScrollOptions,
  scrollElementIntoView,
} from '@/utils/keyboardNavigationUtils';

/**
 * Focus management options
 */
export interface UseFocusManagementOptions {
  /**
   * Container element untuk focus management
   */
  container?: Element | null;

  /**
   * Auto-scroll ketika focus berubah
   */
  autoScroll?: boolean;

  /**
   * Scroll options
   */
  scrollOptions?: ScrollOptions;

  /**
   * Focus trap dalam container
   */
  trapFocus?: boolean;

  /**
   * Restore focus on unmount
   */
  restoreFocus?: boolean;
}

/**
 * Focus management return type
 */
export interface UseFocusManagementReturn {
  /**
   * Focus element by data attribute
   */
  focusElementByData: (attribute: string, value: string) => boolean;

  /**
   * Focus element by index dalam focusable elements
   */
  focusElementByIndex: (index: number) => boolean;

  /**
   * Get all focusable elements dalam container
   */
  getFocusableItems: () => HTMLElement[];

  /**
   * Get current focused element index
   */
  getCurrentFocusIndex: () => number;

  /**
   * Focus first focusable element
   */
  focusFirst: () => boolean;

  /**
   * Focus last focusable element
   */
  focusLast: () => boolean;

  /**
   * Focus next focusable element
   */
  focusNext: () => boolean;

  /**
   * Focus previous focusable element
   */
  focusPrevious: () => boolean;

  /**
   * Check if element is currently focused
   */
  isFocused: (element: HTMLElement) => boolean;

  /**
   * Save current focus untuk restore later
   */
  saveFocus: () => void;

  /**
   * Restore saved focus
   */
  restoreSavedFocus: () => boolean;
}

/**
 * Custom hook untuk comprehensive focus management
 */
export const useFocusManagement = (
  options: UseFocusManagementOptions = {}
): UseFocusManagementReturn => {
  const {
    container = null,
    autoScroll = true,
    scrollOptions = {},
    trapFocus = false,
    restoreFocus = false,
  } = options;

  const savedFocusRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<Element | null>(container);

  // Update container ref when container changes
  useEffect(() => {
    containerRef.current = container;
  }, [container]);

  /**
   * Get search container
   */
  const getSearchContainer = useCallback((): Element => {
    return containerRef.current || document.body;
  }, []);

  /**
   * Get all focusable elements dalam container
   */
  const getFocusableItems = useCallback((): HTMLElement[] => {
    const searchContainer = getSearchContainer();
    return getFocusableElements(searchContainer);
  }, [getSearchContainer]);

  /**
   * Focus element dengan auto-scroll
   */
  const focusWithScroll = useCallback(
    (element: HTMLElement): boolean => {
      const success = focusElement(element);

      if (success && autoScroll) {
        // Check if element is in viewport
        if (!isElementInViewport(element, containerRef.current || undefined)) {
          scrollElementIntoView(element, {
            ...scrollOptions,
            container: containerRef.current,
          });
        }
      }

      return success;
    },
    [autoScroll, scrollOptions]
  );

  /**
   * Focus element by data attribute
   */
  const focusElementByData = useCallback(
    (attribute: string, value: string): boolean => {
      const element = getElementByDataAttribute(attribute, value, getSearchContainer());
      return element ? focusWithScroll(element) : false;
    },
    [getSearchContainer, focusWithScroll]
  );

  /**
   * Focus element by index
   */
  const focusElementByIndex = useCallback(
    (index: number): boolean => {
      const focusableItems = getFocusableItems();

      if (index < 0 || index >= focusableItems.length) return false;

      return focusWithScroll(focusableItems[index]);
    },
    [getFocusableItems, focusWithScroll]
  );

  /**
   * Get current focused element index
   */
  const getCurrentFocusIndex = useCallback((): number => {
    const focusableItems = getFocusableItems();
    const activeElement = document.activeElement;

    if (!activeElement) return -1;

    return activeElement instanceof HTMLElement ? focusableItems.indexOf(activeElement) : -1;
  }, [getFocusableItems]);

  /**
   * Focus first focusable element
   */
  const focusFirst = useCallback((): boolean => {
    return focusElementByIndex(0);
  }, [focusElementByIndex]);

  /**
   * Focus last focusable element
   */
  const focusLast = useCallback((): boolean => {
    const focusableItems = getFocusableItems();
    return focusElementByIndex(focusableItems.length - 1);
  }, [getFocusableItems, focusElementByIndex]);

  /**
   * Focus next focusable element
   */
  const focusNext = useCallback((): boolean => {
    const currentIndex = getCurrentFocusIndex();
    const focusableItems = getFocusableItems();

    if (currentIndex === -1) return focusFirst();

    const nextIndex = trapFocus
      ? (currentIndex + 1) % focusableItems.length
      : Math.min(currentIndex + 1, focusableItems.length - 1);

    return focusElementByIndex(nextIndex);
  }, [getCurrentFocusIndex, getFocusableItems, focusFirst, focusElementByIndex, trapFocus]);

  /**
   * Focus previous focusable element
   */
  const focusPrevious = useCallback((): boolean => {
    const currentIndex = getCurrentFocusIndex();
    const focusableItems = getFocusableItems();

    if (currentIndex === -1) return focusLast();

    const prevIndex = trapFocus
      ? currentIndex === 0
        ? focusableItems.length - 1
        : currentIndex - 1
      : Math.max(currentIndex - 1, 0);

    return focusElementByIndex(prevIndex);
  }, [getCurrentFocusIndex, getFocusableItems, focusLast, focusElementByIndex, trapFocus]);

  /**
   * Check if element is currently focused
   */
  const isFocused = useCallback((element: HTMLElement): boolean => {
    return document.activeElement === element;
  }, []);

  /**
   * Save current focus
   */
  const saveFocus = useCallback((): void => {
    savedFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  /**
   * Restore saved focus
   */
  const restoreSavedFocus = useCallback((): boolean => {
    if (savedFocusRef.current) {
      return focusWithScroll(savedFocusRef.current);
    }
    return false;
  }, [focusWithScroll]);

  // Save focus on mount if restoreFocus is enabled
  useEffect(() => {
    if (restoreFocus) {
      saveFocus();
    }
  }, [restoreFocus, saveFocus]);

  // Restore focus on unmount if restoreFocus is enabled
  useEffect(() => {
    return () => {
      if (restoreFocus && savedFocusRef.current) {
        try {
          savedFocusRef.current.focus();
        } catch (error) {
          import('@/utils/console').then(({ safeConsole }) => {
            safeConsole.warn('Failed to restore focus on unmount:', error);
          });
        }
      }
    };
  }, [restoreFocus]);

  return {
    focusElementByData,
    focusElementByIndex,
    getFocusableItems,
    getCurrentFocusIndex,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    isFocused,
    saveFocus,
    restoreSavedFocus,
  };
};

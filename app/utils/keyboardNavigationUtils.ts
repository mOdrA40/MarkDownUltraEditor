/**
 * Keyboard navigation utility functions
 * Helper functions untuk navigation dan focus management
 */

/**
 * Navigation direction types
 */
export type NavigationDirection = 'next' | 'previous' | 'first' | 'last';

/**
 * Scroll options untuk navigation
 */
export interface ScrollOptions {
  offset?: number;
  behavior?: ScrollBehavior;
  container?: Element | null;
}

/**
 * Calculate target index berdasarkan direction
 */
export const calculateTargetIndex = (
  currentIndex: number,
  totalItems: number,
  direction: NavigationDirection
): number => {
  if (totalItems === 0) return -1;

  switch (direction) {
    case 'next':
      return currentIndex < totalItems - 1 ? currentIndex + 1 : currentIndex;
    case 'previous':
      return currentIndex > 0 ? currentIndex - 1 : currentIndex;
    case 'first':
      return 0;
    case 'last':
      return totalItems - 1;
    default:
      return currentIndex;
  }
};

/**
 * Check if element is focusable
 */
export const isFocusable = (element: Element): element is HTMLElement => {
  if (!(element instanceof HTMLElement)) return false;

  // Check if element is disabled
  if (element.hasAttribute('disabled')) return false;

  // Check if element is hidden
  if (element.style.display === 'none' || element.style.visibility === 'hidden') return false;

  // Check if element has tabindex
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex !== null && Number.parseInt(tabIndex, 10) < 0) return false;

  // Check if element is naturally focusable
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  if (focusableTags.includes(element.tagName)) return true;

  // Check if element has tabindex >= 0
  return tabIndex !== null && Number.parseInt(tabIndex, 10) >= 0;
};

/**
 * Get all focusable elements within container
 * Uses centralized implementation from accessibility utils
 */
export const getFocusableElements = (container: Element): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)).filter((element) => {
    const htmlElement = element as HTMLElement;
    return (
      htmlElement.offsetParent !== null && // Element is visible
      !htmlElement.hasAttribute('disabled') &&
      htmlElement.tabIndex >= 0
    );
  }) as HTMLElement[];
};

/**
 * Focus element dengan error handling
 */
export const focusElement = (element: HTMLElement): boolean => {
  try {
    element.focus();
    return document.activeElement === element;
  } catch (error) {
    console.warn('Failed to focus element:', error);
    return false;
  }
};

/**
 * Scroll element into view dengan options
 */
export const scrollElementIntoView = (element: Element, options: ScrollOptions = {}): void => {
  const { offset = 0, behavior = 'smooth', container } = options;

  try {
    if (container) {
      // Scroll within container
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const scrollTop = container.scrollTop + (elementRect.top - containerRect.top) - offset;

      container.scrollTo({
        top: scrollTop,
        behavior,
      });
    } else {
      // Scroll in viewport
      const elementRect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset + elementRect.top - offset;

      window.scrollTo({
        top: scrollTop,
        behavior,
      });
    }
  } catch (error) {
    console.warn('Failed to scroll element into view:', error);
  }
};

/**
 * Check if element is in viewport
 */
export const isElementInViewport = (element: Element, container?: Element): boolean => {
  const rect = element.getBoundingClientRect();

  if (container) {
    const containerRect = container.getBoundingClientRect();
    return (
      rect.top >= containerRect.top &&
      rect.left >= containerRect.left &&
      rect.bottom <= containerRect.bottom &&
      rect.right <= containerRect.right
    );
  }

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Get element by data attribute
 */
export const getElementByDataAttribute = (
  attribute: string,
  value: string,
  container?: Element
): HTMLElement | null => {
  const selector = `[${attribute}="${value}"]`;
  const element = safeQuerySelector<HTMLElement>(selector, container);
  return element;
};

// Import common utilities to avoid duplication
import { debounce, safeQuerySelector, throttle } from './common';

/**
 * Debounce function untuk keyboard events
 * Using centralized implementation
 */
export const debounceKeyboard = debounce;

/**
 * Throttle function untuk keyboard events
 * Using centralized implementation
 */
export const throttleKeyboard = throttle;

/**
 * Check if key combination matches
 */
export const isKeyMatch = (
  event: KeyboardEvent,
  key: string,
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  }
): boolean => {
  if (event.key !== key) return false;

  if (modifiers) {
    if (modifiers.ctrl !== undefined && event.ctrlKey !== modifiers.ctrl) return false;
    if (modifiers.alt !== undefined && event.altKey !== modifiers.alt) return false;
    if (modifiers.shift !== undefined && event.shiftKey !== modifiers.shift) return false;
    if (modifiers.meta !== undefined && event.metaKey !== modifiers.meta) return false;
  }

  return true;
};

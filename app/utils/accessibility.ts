/**
 * Accessibility utilities untuk navigation dan UI components
 * Memastikan compliance dengan WCAG 2.1 AA standards
 */

/**
 * Announce changes to screen readers
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';

  document.body.appendChild(announcement);
  announcement.textContent = message;

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if element is focusable
 */
export const isFocusable = (element: Element): boolean => {
  if (!(element instanceof HTMLElement)) return false;

  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  return (
    focusableSelectors.some((selector) => element.matches(selector)) ||
    (element.tabIndex >= 0 && !element.hasAttribute('disabled'))
  );
};

/**
 * Get all focusable elements within a container
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
 * Trap focus within a container (untuk modal, dropdown, dll)
 */
export const trapFocus = (container: Element): (() => void) => {
  const focusableElements = getFocusableElements(container);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key !== 'Tab') return;

    if (keyboardEvent.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        keyboardEvent.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        keyboardEvent.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Generate unique ID untuk accessibility
 */
export const generateAccessibleId = (prefix = 'accessible'): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
};

// Import common utilities to avoid duplication
import { calculateContrastRatio, meetsContrastRequirement } from './common';

// Re-export with original function name for backward compatibility
export const getContrastRatio = calculateContrastRatio;
export { meetsContrastRequirement };

/**
 * Add skip link untuk keyboard navigation
 */
export const addSkipLink = (targetId: string, text = 'Skip to main content'): HTMLElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 9999;
    transition: top 0.3s;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  document.body.insertBefore(skipLink, document.body.firstChild);
  return skipLink;
};

/**
 * Manage focus restoration
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null;

  saveFocus(): void {
    this.previousFocus = document.activeElement as HTMLElement;
  }

  restoreFocus(): void {
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }
  }

  setFocus(element: HTMLElement): void {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }
}

/**
 * Keyboard navigation utilities
 */
export const KeyboardNavigation = {
  /**
   * Handle arrow key navigation dalam list
   */
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    onIndexChange(newIndex);
    items[newIndex]?.focus();
  },

  /**
   * Handle typeahead search dalam list
   */
  handleTypeahead: (
    event: KeyboardEvent,
    items: HTMLElement[],
    getText: (item: HTMLElement) => string,
    onMatch: (index: number) => void
  ) => {
    const char = event.key.toLowerCase();
    if (char.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const currentIndex = items.findIndex((item) => item === document.activeElement);
    const startIndex = currentIndex + 1;

    // Search from current position forward
    for (let i = 0; i < items.length; i++) {
      const index = (startIndex + i) % items.length;
      const text = getText(items[index]).toLowerCase();

      if (text.startsWith(char)) {
        event.preventDefault();
        onMatch(index);
        items[index].focus();
        break;
      }
    }
  },
};

/**
 * Screen reader utilities
 */
export const ScreenReader = {
  /**
   * Check if screen reader is active
   */
  isActive: (): boolean => {
    return (
      window.navigator.userAgent.includes('NVDA') ||
      window.navigator.userAgent.includes('JAWS') ||
      window.speechSynthesis?.speaking ||
      false
    );
  },

  /**
   * Speak text using speech synthesis
   */
  speak: (text: string, options: SpeechSynthesisUtteranceOptions = {}) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      Object.assign(utterance, options);
      speechSynthesis.speak(utterance);
    }
  },

  /**
   * Stop speech synthesis
   */
  stop: () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  },
};

interface SpeechSynthesisUtteranceOptions {
  voice?: SpeechSynthesisVoice;
  volume?: number;
  rate?: number;
  pitch?: number;
  lang?: string;
}

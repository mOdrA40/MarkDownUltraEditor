/**
 * @fileoverview Enhanced Accessibility Utilities
 * @author Axel Modra
 */

import { isHTMLElement, isString } from '@/types/guards';

/**
 * ARIA live region types
 */
export type AriaLiveType = 'polite' | 'assertive' | 'off';

/**
 * Screen reader announcement options
 */
export interface AnnouncementOptions {
  priority?: AriaLiveType;
  delay?: number;
  clear?: boolean;
}

/**
 * Focus management options
 */
export interface FocusOptions {
  preventScroll?: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
}

/**
 * Keyboard navigation configuration
 */
export interface KeyboardNavConfig {
  enableArrowKeys?: boolean;
  enableTabNavigation?: boolean;
  enableEnterActivation?: boolean;
  enableEscapeClose?: boolean;
  wrapNavigation?: boolean;
}

/**
 * Enhanced screen reader announcements
 */
export class ScreenReaderAnnouncer {
  private static instance: ScreenReaderAnnouncer;
  private liveRegions: Map<AriaLiveType, HTMLElement> = new Map();
  private announcementQueue: Array<{ message: string; priority: AriaLiveType }> = [];
  private isProcessing = false;

  private constructor() {
    this.createLiveRegions();
  }

  public static getInstance(): ScreenReaderAnnouncer {
    if (!ScreenReaderAnnouncer.instance) {
      ScreenReaderAnnouncer.instance = new ScreenReaderAnnouncer();
    }
    return ScreenReaderAnnouncer.instance;
  }

  private createLiveRegions(): void {
    if (typeof document === 'undefined') return;

    const priorities: AriaLiveType[] = ['polite', 'assertive'];

    priorities.forEach((priority) => {
      const region = document.createElement('div');
      region.setAttribute('aria-live', priority);
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      region.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;

      document.body.appendChild(region);
      this.liveRegions.set(priority, region);
    });
  }

  public announce(message: string, options: AnnouncementOptions = {}): void {
    const { priority = 'polite', delay = 100, clear = false } = options;

    if (!isString(message) || message.trim() === '') return;

    if (clear) {
      this.clearAnnouncements();
    }

    this.announcementQueue.push({ message: message.trim(), priority });

    if (!this.isProcessing) {
      setTimeout(() => this.processQueue(), delay);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.announcementQueue.length === 0) return;

    this.isProcessing = true;

    while (this.announcementQueue.length > 0) {
      const announcement = this.announcementQueue.shift();
      if (!announcement) continue;

      const region = this.liveRegions.get(announcement.priority);
      if (region) {
        region.textContent = announcement.message;
        await new Promise((resolve) => setTimeout(resolve, 50));
        region.textContent = '';
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    this.isProcessing = false;
  }

  public clearAnnouncements(): void {
    this.announcementQueue.length = 0;
    this.liveRegions.forEach((region) => {
      region.textContent = '';
    });
  }
}

/**
 * Enhanced focus management
 */
export class FocusManager {
  private focusHistory: HTMLElement[] = [];
  private trapContainer: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  /**
   * Focus an element with enhanced options
   */
  public focusElement(element: HTMLElement, options: FocusOptions = {}): boolean {
    if (!isHTMLElement(element)) return false;

    const { preventScroll = false, restoreFocus = false } = options;

    if (restoreFocus) {
      const currentFocus = document.activeElement as HTMLElement;
      if (currentFocus && isHTMLElement(currentFocus)) {
        this.focusHistory.push(currentFocus);
      }
    }

    try {
      element.focus({ preventScroll });
      return document.activeElement === element;
    } catch (error) {
      console.warn('Failed to focus element:', error);
      return false;
    }
  }

  /**
   * Restore previous focus
   */
  public restoreFocus(): boolean {
    const previousElement = this.focusHistory.pop();
    if (previousElement && isHTMLElement(previousElement)) {
      return this.focusElement(previousElement);
    }
    return false;
  }

  /**
   * Setup focus trap
   */
  public setupFocusTrap(container: HTMLElement): () => void {
    if (!isHTMLElement(container)) {
      return () => {
        // No-op cleanup function for invalid container
      };
    }

    this.trapContainer = container;
    this.updateFocusableElements();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        this.handleTabNavigation(event);
      } else if (event.key === 'Escape') {
        this.releaseFocusTrap();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element
    if (this.focusableElements.length > 0) {
      this.focusElement(this.focusableElements[0]);
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      this.releaseFocusTrap();
    };
  }

  private updateFocusableElements(): void {
    if (!this.trapContainer) return;

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    this.focusableElements = Array.from(this.trapContainer.querySelectorAll(selector)).filter(
      (el) => {
        const element = el as HTMLElement;
        return element.offsetParent !== null && !element.hasAttribute('disabled');
      }
    ) as HTMLElement[];
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    if (this.focusableElements.length === 0) return;

    const currentIndex = this.focusableElements.indexOf(document.activeElement as HTMLElement);

    let nextIndex: number;

    if (event.shiftKey) {
      nextIndex = currentIndex <= 0 ? this.focusableElements.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex >= this.focusableElements.length - 1 ? 0 : currentIndex + 1;
    }

    event.preventDefault();
    this.focusElement(this.focusableElements[nextIndex]);
  }

  private releaseFocusTrap(): void {
    this.trapContainer = null;
    this.focusableElements = [];
  }
}

/**
 * Enhanced keyboard navigation
 */
export class KeyboardNavigationManager {
  private config: KeyboardNavConfig;
  private elements: HTMLElement[] = [];
  private currentIndex = -1;

  constructor(config: KeyboardNavConfig = {}) {
    this.config = {
      enableArrowKeys: true,
      enableTabNavigation: true,
      enableEnterActivation: true,
      enableEscapeClose: true,
      wrapNavigation: true,
      ...config,
    };
  }

  public setElements(elements: HTMLElement[]): void {
    this.elements = elements.filter(isHTMLElement);
    this.currentIndex = -1;
  }

  public handleKeyDown(event: KeyboardEvent): boolean {
    const { key } = event;

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        if (this.config.enableArrowKeys) {
          event.preventDefault();
          this.navigateNext();
          return true;
        }
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        if (this.config.enableArrowKeys) {
          event.preventDefault();
          this.navigatePrevious();
          return true;
        }
        break;

      case 'Home':
        event.preventDefault();
        this.navigateToFirst();
        return true;

      case 'End':
        event.preventDefault();
        this.navigateToLast();
        return true;

      case 'Enter':
      case ' ':
        if (this.config.enableEnterActivation && this.currentIndex >= 0) {
          event.preventDefault();
          this.activateCurrent();
          return true;
        }
        break;

      case 'Escape':
        if (this.config.enableEscapeClose) {
          event.preventDefault();
          this.handleEscape();
          return true;
        }
        break;
    }

    return false;
  }

  private navigateNext(): void {
    if (this.elements.length === 0) return;

    this.currentIndex++;

    if (this.currentIndex >= this.elements.length) {
      this.currentIndex = this.config.wrapNavigation ? 0 : this.elements.length - 1;
    }

    this.focusCurrent();
  }

  private navigatePrevious(): void {
    if (this.elements.length === 0) return;

    this.currentIndex--;

    if (this.currentIndex < 0) {
      this.currentIndex = this.config.wrapNavigation ? this.elements.length - 1 : 0;
    }

    this.focusCurrent();
  }

  private navigateToFirst(): void {
    if (this.elements.length === 0) return;
    this.currentIndex = 0;
    this.focusCurrent();
  }

  private navigateToLast(): void {
    if (this.elements.length === 0) return;
    this.currentIndex = this.elements.length - 1;
    this.focusCurrent();
  }

  private focusCurrent(): void {
    const element = this.elements[this.currentIndex];
    if (element) {
      const focusManager = new FocusManager();
      focusManager.focusElement(element);
    }
  }

  private activateCurrent(): void {
    const element = this.elements[this.currentIndex];
    if (element) {
      element.click();
    }
  }

  private handleEscape(): void {
    // Override in subclasses for specific escape behavior
    const focusManager = new FocusManager();
    focusManager.restoreFocus();
  }
}

/**
 * Accessibility utilities
 */
export const a11yUtils = {
  announcer: ScreenReaderAnnouncer.getInstance(),
  focusManager: new FocusManager(),

  /**
   * Create keyboard navigation manager
   */
  createKeyboardNav: (config?: KeyboardNavConfig) => new KeyboardNavigationManager(config),

  /**
   * Check if reduced motion is preferred
   */
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Check if high contrast is preferred
   */
  prefersHighContrast: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  /**
   * Generate unique ID for accessibility
   */
  generateId: (prefix = 'a11y'): string => {
    return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
  },

  /**
   * Add skip link to page
   */
  addSkipLink: (targetId: string, text = 'Skip to main content'): void => {
    if (typeof document === 'undefined') return;

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
      z-index: 1000;
      border-radius: 4px;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  },
};

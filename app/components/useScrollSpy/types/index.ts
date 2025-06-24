/**
 * Type definitions untuk useScrollSpy module
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

/**
 * Interface untuk scroll spy options
 */
export interface ScrollSpyOptions {
  /** Offset dari top untuk menentukan kapan heading dianggap aktif */
  offset?: number;
  /** Threshold untuk intersection observer (0-1) */
  threshold?: number;
  /** Root margin untuk intersection observer */
  rootMargin?: string;
  /** Container element untuk scroll spy (default: window) */
  container?: Element | null;
  /** Throttle delay untuk scroll events (ms) */
  throttleDelay?: number;
}

/**
 * Interface untuk scroll detection options
 */
export interface ScrollDetectionOptions {
  /** Offset dari top untuk scroll detection */
  offset?: number;
  /** Container element untuk scroll detection */
  container?: Element | null;
  /** Throttle delay untuk scroll events */
  throttleDelay?: number;
  /** Callback ketika active heading berubah */
  onActiveChange?: (activeId: string) => void;
}

/**
 * Interface untuk intersection spy options
 */
export interface IntersectionSpyOptions {
  /** Threshold untuk intersection observer */
  threshold?: number | number[];
  /** Root margin untuk intersection observer */
  rootMargin?: string;
  /** Root element untuk intersection observer */
  root?: Element | null;
  /** Callback ketika intersection berubah */
  onIntersectionChange?: (entries: IntersectionObserverEntry[]) => void;
}

/**
 * Interface untuk scroll spy return values
 */
export interface UseScrollSpyReturn {
  /** ID dari heading yang sedang aktif */
  activeId: string;
  /** Function untuk check apakah heading aktif */
  isActive: (id: string) => boolean;
  /** Function untuk set active heading secara manual */
  setActiveHeading: (id: string) => void;
}

/**
 * Interface untuk scroll detection return values
 */
export interface UseScrollDetectionReturn {
  /** ID dari heading yang sedang aktif berdasarkan scroll position */
  activeId: string;
  /** Function untuk update active heading */
  updateActiveHeading: () => void;
  /** Function untuk set active heading secara manual */
  setActiveId: (id: string) => void;
}

/**
 * Interface untuk intersection spy return values
 */
export interface UseIntersectionSpyReturn {
  /** Set dari heading IDs yang sedang visible */
  visibleIds: Set<string>;
  /** Function untuk setup intersection observer */
  setupObserver: (headingIds: string[]) => void;
  /** Function untuk cleanup intersection observer */
  cleanup: () => void;
}

/**
 * Interface untuk heading element data
 */
export interface HeadingElement {
  /** Element ID */
  id: string;
  /** DOM element */
  element: Element;
  /** Bounding client rect */
  rect: DOMRect;
  /** Distance dari scroll position */
  distance: number;
}

/**
 * Type untuk scroll direction
 */
export type ScrollDirection = 'up' | 'down' | 'none';

/**
 * Interface untuk scroll state
 */
export interface ScrollState {
  /** Current scroll position */
  scrollTop: number;
  /** Previous scroll position */
  previousScrollTop: number;
  /** Scroll direction */
  direction: ScrollDirection;
  /** Timestamp dari last scroll */
  timestamp: number;
}

/**
 * ScrollSpy utility functions
 * 
 * Kumpulan utility functions untuk scroll spy functionality
 * yang dapat digunakan secara independen.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { HeadingElement, ScrollState, ScrollDirection } from '../types';

/**
 * Konstanta untuk scroll spy configuration
 */
export const SCROLL_SPY_CONSTANTS = {
  /** Default offset dari top */
  DEFAULT_OFFSET: 100,
  /** Default threshold untuk intersection observer */
  DEFAULT_THRESHOLD: 0.6,
  /** Default root margin */
  DEFAULT_ROOT_MARGIN: '-20% 0px -35% 0px',
  /** Default throttle delay */
  DEFAULT_THROTTLE_DELAY: 100,
  /** Tolerance untuk distance calculation */
  DISTANCE_TOLERANCE: 50,
} as const;

/**
 * Mendapatkan scroll container element
 * 
 * @param container - Container element atau null untuk window
 * @returns Scroll container element
 */
export const getScrollContainer = (container: Element | null): Element | Window => {
  return container || window;
};

/**
 * Mendapatkan scroll position dari container
 * 
 * @param container - Container element
 * @returns Scroll position
 */
export const getScrollPosition = (container: Element | Window): number => {
  if (container === window) {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }
  
  return (container as Element).scrollTop;
};

/**
 * Mendapatkan container rect untuk calculation
 * 
 * @param container - Container element
 * @returns Container bounding rect
 */
export const getContainerRect = (container: Element | Window): DOMRect => {
  if (container === window) {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      right: window.innerWidth,
      bottom: window.innerHeight,
      x: 0,
      y: 0,
      toJSON: () => ({})
    } as DOMRect;
  }
  
  return (container as Element).getBoundingClientRect();
};

/**
 * Menghitung distance dari element ke scroll position
 * 
 * @param element - DOM element
 * @param scrollTop - Current scroll position
 * @param containerRect - Container bounding rect
 * @param offset - Offset untuk calculation
 * @returns Distance value
 */
export const calculateElementDistance = (
  element: Element,
  scrollTop: number,
  containerRect: DOMRect,
  offset: number
): number => {
  const rect = element.getBoundingClientRect();
  const elementTop = rect.top - containerRect.top + scrollTop;
  return Math.abs(elementTop - scrollTop - offset);
};

/**
 * Mencari heading yang paling dekat dengan scroll position
 * 
 * @param headingIds - Array of heading IDs
 * @param scrollTop - Current scroll position
 * @param containerRect - Container bounding rect
 * @param offset - Offset untuk calculation
 * @returns ID dari heading yang paling dekat
 */
export const findClosestHeading = (
  headingIds: string[],
  scrollTop: number,
  containerRect: DOMRect,
  offset: number
): string => {
  let minDistance = Infinity;
  let activeHeading = '';

  headingIds.forEach(id => {
    const element = document.getElementById(id);
    if (!element) return;

    const distance = calculateElementDistance(element, scrollTop, containerRect, offset);
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top - containerRect.top + scrollTop;

    // Element harus berada di atas atau dekat dengan scroll position
    if (distance < minDistance && elementTop <= scrollTop + offset + SCROLL_SPY_CONSTANTS.DISTANCE_TOLERANCE) {
      minDistance = distance;
      activeHeading = id;
    }
  });

  return activeHeading;
};

/**
 * Membuat heading elements map dengan data lengkap
 * 
 * @param headingIds - Array of heading IDs
 * @param scrollTop - Current scroll position
 * @param containerRect - Container bounding rect
 * @param offset - Offset untuk calculation
 * @returns Map dari heading elements dengan data
 */
export const createHeadingElementsMap = (
  headingIds: string[],
  scrollTop: number,
  containerRect: DOMRect,
  offset: number
): Map<string, HeadingElement> => {
  const headingElementsMap = new Map<string, HeadingElement>();

  headingIds.forEach(id => {
    const element = document.getElementById(id);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const distance = calculateElementDistance(element, scrollTop, containerRect, offset);

    headingElementsMap.set(id, {
      id,
      element,
      rect,
      distance
    });
  });

  return headingElementsMap;
};

/**
 * Mendeteksi scroll direction
 * 
 * @param currentScrollTop - Current scroll position
 * @param previousScrollTop - Previous scroll position
 * @returns Scroll direction
 */
export const detectScrollDirection = (
  currentScrollTop: number,
  previousScrollTop: number
): ScrollDirection => {
  if (currentScrollTop > previousScrollTop) {
    return 'down';
  } else if (currentScrollTop < previousScrollTop) {
    return 'up';
  } else {
    return 'none';
  }
};

/**
 * Membuat scroll state object
 * 
 * @param scrollTop - Current scroll position
 * @param previousScrollTop - Previous scroll position
 * @returns Scroll state object
 */
export const createScrollState = (
  scrollTop: number,
  previousScrollTop: number = 0
): ScrollState => {
  return {
    scrollTop,
    previousScrollTop,
    direction: detectScrollDirection(scrollTop, previousScrollTop),
    timestamp: performance.now()
  };
};

/**
 * Check apakah element visible dalam viewport
 * 
 * @param element - DOM element
 * @param container - Container element
 * @param threshold - Visibility threshold (0-1)
 * @returns Boolean indicating visibility
 */
export const isElementVisible = (
  element: Element,
  container: Element | Window = window,
  threshold: number = 0
): boolean => {
  const rect = element.getBoundingClientRect();
  const containerRect = getContainerRect(container);

  const visibleHeight = Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top);
  const visibleWidth = Math.min(rect.right, containerRect.right) - Math.max(rect.left, containerRect.left);

  if (visibleHeight <= 0 || visibleWidth <= 0) {
    return false;
  }

  if (threshold > 0) {
    const elementArea = rect.width * rect.height;
    const visibleArea = visibleHeight * visibleWidth;
    const visibilityRatio = elementArea > 0 ? visibleArea / elementArea : 0;
    
    return visibilityRatio >= threshold;
  }

  return true;
};

/**
 * Throttle function khusus untuk scroll events
 * 
 * @param func - Function yang akan di-throttle
 * @param limit - Throttle limit dalam milliseconds
 * @returns Throttled function
 */
export const throttleScrollEvent = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

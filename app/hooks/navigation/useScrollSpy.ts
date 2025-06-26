/**
 * useScrollSpy Hook (Legacy)
 *
 * @deprecated Use hooks from @/components/useScrollSpy instead
 * This file is kept for backward compatibility only.
 *
 * @author Senior Developer
 * @version 2.0.0
 */

// Legacy implementation untuk backward compatibility
import { useState, useEffect, useCallback } from 'react';

export interface ScrollSpyOptions {
  offset?: number;
  throttleDelay?: number;
  container?: Element | null;
  threshold?: number;
  rootMargin?: string;
}

export const useScrollSpy = (headingIds: string[], options: ScrollSpyOptions = {}) => {
  const { offset = 100, container } = options;
  const [activeId, setActiveId] = useState<string>('');

  const handleScroll = useCallback(() => {
    if (headingIds.length === 0) return;

    const scrollContainer = container || document.documentElement;
    const scrollTop = scrollContainer.scrollTop;

    let activeHeading = headingIds[0];

    headingIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;

        if (elementTop <= scrollTop + offset) {
          activeHeading = id;
        }
      }
    });

    if (activeHeading !== activeId) {
      setActiveId(activeHeading);
    }
  }, [headingIds, activeId, offset, container]);

  useEffect(() => {
    const scrollContainer = container || window;
    scrollContainer.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, container]);

  return {
    activeId,
    setActiveId,
    setActiveHeading: setActiveId,
    isActive: (id: string) => activeId === id
  };
};

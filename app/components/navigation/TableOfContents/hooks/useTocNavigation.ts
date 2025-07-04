/**
 * @fileoverview Custom hook untuk TOC navigation functionality
 * @author Axel Modra
 */

import { useCallback } from 'react';
import { scrollToHeadingGlobal, type HeadingItem } from '@/utils/headingUtils';
import { announceToScreenReader } from '@/utils/accessibility';
import { useScrollSpy, useKeyboardNavigation } from '@/hooks/navigation';
import type {
  TocNavigationOptions,
  TocScrollSpyOptions,
  TocKeyboardOptions,
} from '../types/toc.types';

/**
 * Custom hook untuk TOC navigation dengan scroll spy dan keyboard support
 * @param tocItems - Array of TOC items
 * @param options - Navigation options
 */
export const useTocNavigation = (
  tocItems: HeadingItem[],
  scrollSpyOptions: TocScrollSpyOptions = {},
  keyboardOptions: TocKeyboardOptions = {}
) => {
  // Extract heading IDs untuk scroll spy
  const headingIds = tocItems.map((item) => item.id);

  // Setup scroll spy untuk mendeteksi active heading
  const { activeId, isActive, setActiveHeading } = useScrollSpy(headingIds, {
    offset: scrollSpyOptions.offset || 100,
    threshold: scrollSpyOptions.threshold || 0.6,
    rootMargin: scrollSpyOptions.rootMargin || '-20% 0px -35% 0px',
  });

  // Setup keyboard navigation
  useKeyboardNavigation({
    headingIds,
    activeId,
    onActiveChange: setActiveHeading,
    enabled: keyboardOptions.enabled !== false,
    offset: keyboardOptions.offset || 100,
  });

  /**
   * Handle click pada TOC item dengan error handling dan accessibility
   * @param headingId - ID heading yang diklik
   * @param options - Navigation options
   */
  const handleHeadingClick = useCallback(
    async (headingId: string, options: TocNavigationOptions = {}) => {
      // Find heading item untuk announcement
      const headingItem = tocItems.find((item) => item.id === headingId);

      try {
        // Use global scroll function yang mencari di editor DAN preview
        const success = await scrollToHeadingGlobal(headingId, {
          offset: options.offset || 120,
          behavior: options.behavior || 'smooth',
          preferEditor: options.preferEditor || false, // Prefer preview for TOC
        });

        // Announce navigation untuk screen readers only if successful
        if (success && headingItem) {
          announceToScreenReader(
            `Navigated to ${headingItem.text}, heading level ${headingItem.level}`,
            'polite'
          );
        } else if (!success) {
          console.warn(`Failed to scroll to heading: ${headingId}`);

          // Fallback: try to find element and scroll manually
          const element = document.getElementById(headingId);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest',
            });

            // Announce fallback navigation
            if (headingItem) {
              announceToScreenReader(
                `Navigated to ${headingItem.text} using fallback method`,
                'polite'
              );
            }
          }
        }
      } catch (error) {
        console.error('Error scrolling to heading:', error);

        // Final fallback
        const element = document.getElementById(headingId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
          });
        }
      }
    },
    [tocItems]
  );

  /**
   * Navigate to specific heading by index
   * @param index - Index dalam tocItems array
   * @param options - Navigation options
   */
  const navigateToIndex = useCallback(
    (index: number, options: TocNavigationOptions = {}) => {
      if (index >= 0 && index < tocItems.length) {
        const headingId = tocItems[index].id;
        handleHeadingClick(headingId, options);
      }
    },
    [tocItems, handleHeadingClick]
  );

  /**
   * Navigate to next heading
   * @param options - Navigation options
   */
  const navigateToNext = useCallback(
    (options: TocNavigationOptions = {}) => {
      const currentIndex = tocItems.findIndex((item) => item.id === activeId);
      const nextIndex = currentIndex + 1;

      if (nextIndex < tocItems.length) {
        navigateToIndex(nextIndex, options);
      }
    },
    [tocItems, activeId, navigateToIndex]
  );

  /**
   * Navigate to previous heading
   * @param options - Navigation options
   */
  const navigateToPrevious = useCallback(
    (options: TocNavigationOptions = {}) => {
      const currentIndex = tocItems.findIndex((item) => item.id === activeId);
      const prevIndex = currentIndex - 1;

      if (prevIndex >= 0) {
        navigateToIndex(prevIndex, options);
      }
    },
    [tocItems, activeId, navigateToIndex]
  );

  /**
   * Navigate to first heading
   * @param options - Navigation options
   */
  const navigateToFirst = useCallback(
    (options: TocNavigationOptions = {}) => {
      if (tocItems.length > 0) {
        navigateToIndex(0, options);
      }
    },
    [tocItems, navigateToIndex]
  );

  /**
   * Navigate to last heading
   * @param options - Navigation options
   */
  const navigateToLast = useCallback(
    (options: TocNavigationOptions = {}) => {
      if (tocItems.length > 0) {
        navigateToIndex(tocItems.length - 1, options);
      }
    },
    [tocItems, navigateToIndex]
  );

  /**
   * Get current navigation state
   */
  const getNavigationState = useCallback(() => {
    const currentIndex = tocItems.findIndex((item) => item.id === activeId);
    return {
      activeId,
      headingIds,
      currentIndex,
      totalItems: tocItems.length,
      hasNext: currentIndex < tocItems.length - 1,
      hasPrevious: currentIndex > 0,
    };
  }, [activeId, headingIds, tocItems]);

  return {
    // State
    activeId,
    headingIds,

    // Functions
    isActive,
    setActiveHeading,
    handleHeadingClick,
    navigateToIndex,
    navigateToNext,
    navigateToPrevious,
    navigateToFirst,
    navigateToLast,
    getNavigationState,

    // Computed
    currentIndex: tocItems.findIndex((item) => item.id === activeId),
    hasActiveHeading: activeId !== '',
    totalItems: tocItems.length,
  };
};

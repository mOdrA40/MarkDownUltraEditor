/**
 * useScrollDetection Hook
 * 
 * Custom hook untuk mendeteksi scroll position dan menentukan
 * heading mana yang sedang aktif berdasarkan scroll position.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useState, useCallback, useRef } from 'react';
import { UseScrollDetectionReturn, ScrollDetectionOptions } from '../types';
import { 
  getScrollContainer, 
  getScrollPosition, 
  getContainerRect, 
  findClosestHeading,
  SCROLL_SPY_CONSTANTS 
} from '../utils/scrollSpyUtils';

/**
 * Hook untuk scroll detection dan active heading calculation
 * 
 * @param headingIds - Array of heading IDs untuk tracking
 * @param options - Scroll detection options
 * @returns Object dengan scroll detection functions
 */
export const useScrollDetection = (
  headingIds: string[],
  options: ScrollDetectionOptions = {}
): UseScrollDetectionReturn => {
  const {
    offset = SCROLL_SPY_CONSTANTS.DEFAULT_OFFSET,
    container = null,
    onActiveChange
  } = options;

  const [activeId, setActiveId] = useState<string>('');
  const previousActiveId = useRef<string>('');

  /**
   * Update active heading berdasarkan current scroll position
   * Menggunakan requestAnimationFrame untuk smooth performance
   */
  const updateActiveHeading = useCallback(() => {
    if (headingIds.length === 0) return;

    // Use requestAnimationFrame untuk smooth performance
    requestAnimationFrame(() => {
      try {
        const scrollContainer = getScrollContainer(container);
        const scrollTop = getScrollPosition(scrollContainer);
        const containerRect = getContainerRect(scrollContainer);

        // Find closest heading berdasarkan scroll position
        const closestHeading = findClosestHeading(headingIds, scrollTop, containerRect, offset);

        // Update active heading jika berubah
        if (closestHeading && closestHeading !== previousActiveId.current) {
          setActiveId(closestHeading);
          previousActiveId.current = closestHeading;
          
          // Call callback jika ada
          if (onActiveChange) {
            onActiveChange(closestHeading);
          }
        }
      } catch (error) {
        console.error('Error updating active heading:', error);
      }
    });
  }, [headingIds, offset, container, onActiveChange]);

  /**
   * Set active heading secara manual
   * Berguna untuk programmatic control
   * 
   * @param id - Heading ID yang akan di-set sebagai aktif
   */
  const setActiveHeadingManual = useCallback((id: string) => {
    if (headingIds.includes(id)) {
      setActiveId(id);
      previousActiveId.current = id;
      
      // Call callback jika ada
      if (onActiveChange) {
        onActiveChange(id);
      }
    } else {
      console.warn(`Heading ID "${id}" not found in headingIds array`);
    }
  }, [headingIds, onActiveChange]);

  return {
    activeId,
    updateActiveHeading,
    setActiveId: setActiveHeadingManual
  };
};

/**
 * Custom hook untuk outline navigation logic
 */

import { useCallback } from 'react';
import { HeadingItem, UseOutlineNavigationOptions, UseOutlineNavigationReturn } from '@/types/outline';
import { handleOutlineItemClick } from '@/utils/outlineUtils';

/**
 * Hook untuk mengelola navigation logic pada outline
 */
export const useOutlineNavigation = (
  outline: HeadingItem[],
  options: UseOutlineNavigationOptions
): UseOutlineNavigationReturn => {
  const { enabled, offset, onActiveChange } = options;

  /**
   * Handle click pada heading dengan error handling
   */
  const handleHeadingClick = useCallback(async (headingId: string) => {
    if (!enabled) return;

    await handleOutlineItemClick(headingId, outline, {
      offset,
      behavior: 'smooth',
      preferEditor: false
    });

    // Update active heading jika berhasil
    onActiveChange(headingId);
  }, [outline, enabled, offset, onActiveChange]);

  return {
    handleHeadingClick
  };
};

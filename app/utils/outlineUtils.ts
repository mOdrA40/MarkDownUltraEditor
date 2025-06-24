/**
 * Utility functions untuk DocumentOutline components
 */

import { HeadingItem, ThemeConfig, ScrollOptions } from '@/types/outline';
import { scrollToHeadingGlobal, getActiveHeadingClasses } from '@/utils/headingUtils';
import { announceToScreenReader } from '@/utils/accessibility';

/**
 * Generate styles untuk outline item berdasarkan level dan active state
 */
export const getOutlineItemStyles = (
  item: HeadingItem,
  isActive: boolean,
  theme?: ThemeConfig
) => {
  const baseClasses = `
    flex items-start px-3 py-2 rounded text-sm cursor-pointer transition-all duration-200
    hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50
    whitespace-normal min-h-[2.5rem]
  `;

  const levelClasses: Record<number, string> = {
    1: 'font-semibold',
    2: 'font-medium',
    3: 'text-muted-foreground'
  };

  const activeClasses = getActiveHeadingClasses(isActive);

  return {
    className: `${baseClasses} ${levelClasses[item.level] || levelClasses[3]} ${activeClasses}`,
    style: {
      paddingLeft: `${0.5 + (item.level - 1) * 0.75}rem`,
      backgroundColor: isActive ? `${theme?.primary || '#3b82f6'}10` : 'transparent',
      color: isActive ? theme?.primary || '#3b82f6' : theme?.text || 'inherit',
      borderLeft: isActive ? `2px solid ${theme?.primary || '#3b82f6'}` : '2px solid transparent'
    }
  };
};

/**
 * Generate styles untuk header berdasarkan theme
 */
export const getHeaderStyles = (theme?: ThemeConfig) => ({
  backgroundColor: theme?.surface ? `${theme.surface}80` : 'rgba(0,0,0,0.05)',
  borderColor: theme?.accent,
  color: theme?.text || 'inherit'
});

/**
 * Generate styles untuk badge berdasarkan theme
 */
export const getBadgeStyles = (theme?: ThemeConfig) => ({
  backgroundColor: theme?.primary ? `${theme.primary}20` : undefined,
  color: theme?.primary || undefined
});

/**
 * Handle click pada outline item dengan error handling dan accessibility
 */
export const handleOutlineItemClick = async (
  headingId: string,
  outline: HeadingItem[],
  options: ScrollOptions = {}
): Promise<void> => {
  const headingItem = outline.find(item => item.id === headingId);

  try {
    const success = await scrollToHeadingGlobal(headingId, {
      offset: 120,
      behavior: 'smooth',
      preferEditor: false,
      ...options
    });

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
          inline: 'nearest'
        });
      }
    }
  } catch (error) {
    console.error('Error scrolling to heading:', error);
  }
};

/**
 * Generate accessibility attributes untuk outline item
 */
export const getOutlineItemA11yProps = (item: HeadingItem, isActive: boolean) => ({
  'aria-label': `Navigate to ${item.text} heading, level ${item.level}`,
  'aria-current': isActive ? 'location' as const : undefined,
  'title': `Navigate to: ${item.text}`,
  'tabIndex': isActive ? 0 : -1,
  'data-heading-id': item.id
});

/**
 * Handle keyboard navigation untuk outline item
 */
export const handleOutlineItemKeyDown = (
  event: React.KeyboardEvent,
  headingId: string,
  outline: HeadingItem[]
) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleOutlineItemClick(headingId, outline);
  }
};

/**
 * Format heading count untuk display
 */
export const formatHeadingCount = (count: number): string => {
  return count.toString();
};

/**
 * Check apakah outline kosong
 */
export const isOutlineEmpty = (outline: HeadingItem[]): boolean => {
  return outline.length === 0;
};

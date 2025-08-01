/**
 * Utility functions untuk DocumentOutline components
 */

import type { HeadingItem, ScrollOptions, ThemeConfig } from '@/types/outline';
import { a11yUtils } from '@/utils/accessibilityEnhanced';
import { getActiveHeadingClasses, scrollToHeadingGlobal } from '@/utils/headingUtils';

/**
 * Generate styles untuk outline item berdasarkan level dan active state
 */
export const getOutlineItemStyles = (item: HeadingItem, isActive: boolean, theme?: ThemeConfig) => {
  const baseClasses = `
    flex items-start px-3 py-2 rounded text-sm cursor-pointer transition-all duration-200
    hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50
    whitespace-normal min-h-[2.5rem]
  `;

  const levelClasses: Record<number, string> = {
    1: 'font-semibold',
    2: 'font-medium',
    3: 'text-muted-foreground',
  };

  const activeClasses = getActiveHeadingClasses(isActive);

  return {
    className: `${baseClasses} ${levelClasses[item.level] || levelClasses[3]} ${activeClasses}`,
    style: {
      paddingLeft: `${0.5 + (item.level - 1) * 0.75}rem`,
      backgroundColor: isActive ? `${theme?.primary || '#3b82f6'}10` : 'transparent',
      color: isActive ? theme?.primary || '#3b82f6' : theme?.text || 'inherit',
      borderLeft: isActive ? `2px solid ${theme?.primary || '#3b82f6'}` : '2px solid transparent',
    },
  };
};

/**
 * Generate styles untuk header berdasarkan theme
 */
export const getHeaderStyles = (theme?: ThemeConfig) => {
  // Use theme surface color with proper opacity, fallback to light gray
  const backgroundColor = theme?.surface
    ? `rgba(${Number.parseInt(theme.surface.slice(1, 3), 16)}, ${Number.parseInt(theme.surface.slice(3, 5), 16)}, ${Number.parseInt(theme.surface.slice(5, 7), 16)}, 0.8)`
    : 'rgba(248, 250, 252, 0.8)'; // bg-slate-50 with opacity

  return {
    backgroundColor,
    borderColor: theme?.accent || 'rgba(226, 232, 240, 1)', // border-slate-200
    color: theme?.text || 'inherit',
  };
};

/**
 * Generate styles untuk badge berdasarkan theme
 */
export const getBadgeStyles = (theme?: ThemeConfig) => ({
  backgroundColor: theme?.primary ? `${theme.primary}20` : undefined,
  color: theme?.primary || undefined,
});

/**
 * Handle click pada outline item dengan error handling dan accessibility
 */
export const handleOutlineItemClick = async (
  headingId: string,
  outline: HeadingItem[],
  options: ScrollOptions = {}
): Promise<void> => {
  const headingItem = outline.find((item) => item.id === headingId);

  try {
    const success = await scrollToHeadingGlobal(headingId, {
      offset: 120,
      behavior: 'smooth',
      preferEditor: false,
      ...options,
    });

    if (success && headingItem) {
      a11yUtils.announcer.announce(
        `Navigated to ${headingItem.text}, heading level ${headingItem.level}`,
        { priority: 'polite' }
      );
    } else if (!success) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.warn(`Failed to scroll to heading: ${headingId}`);
      });
      // Fallback: try to find element and scroll manually
      const element = document.getElementById(headingId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }
    }
  } catch (error) {
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.error('Error scrolling to heading:', error);
    });
  }
};

/**
 * Generate accessibility attributes untuk outline item
 */
export const getOutlineItemA11yProps = (item: HeadingItem, isActive: boolean) => ({
  'aria-label': `Navigate to ${item.text} heading, level ${item.level}`,
  'aria-current': isActive ? ('location' as const) : undefined,
  title: `Navigate to: ${item.text}`,
  tabIndex: isActive ? 0 : -1,
  'data-heading-id': item.id,
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

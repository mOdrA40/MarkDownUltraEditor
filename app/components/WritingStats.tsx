
/**
 * WritingStats Module - Main Export
 * Entry point untuk semua exports dari WritingStats module
 *
 * @author Senior Developer
 * @version 2.0.0
 */

// Export komponen utama
export { WritingStats } from './WritingStats/components/WritingStats';
export { StatItem } from './WritingStats/components/StatItem';
export { StatBadge } from './WritingStats/components/StatBadge';
export { ResponsiveStatsLayout } from './WritingStats/components/ResponsiveStatsLayout';

// Export types
export type {
  WritingStatsProps,
  StatItemProps,
  StatBadgeProps,
  ResponsiveStatsLayoutProps,
  TextStatistics,
  StatType,
  BadgeVariant,
  ScreenSize,
  UseWritingStatsReturn,
  UseResponsiveDetectionReturn
} from './WritingStats/types/stats.types';

// Export constants
export {
  STAT_TYPES,
  READING_SPEED,
  BREAKPOINTS_STATS,
  STAT_ICONS,
  BADGE_VARIANTS,
  DEFAULT_STATS
} from './WritingStats/constants/stats.constants';

// Export utilities
export {
  calculateTextStats,
  formatStatValue,
  getReadingTime,
  cleanMarkdownText,
  countWords,
  countSentences,
  countParagraphs,
  validateMarkdown
} from './WritingStats/utils/stats.utils';

// Export hooks
export {
  useWritingStats,
  useResponsiveDetection
} from './WritingStats/hooks/useWritingStats';

// Default export untuk backward compatibility
export { WritingStats as default } from './WritingStats/components/WritingStats';

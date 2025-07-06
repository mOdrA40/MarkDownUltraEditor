/**
 * WritingStats Module - Main Export
 * Entry point untuk semua exports dari WritingStats module
 *
 * @author Axel Modra
 */

// Export shared useMediaQuery hook
export { useMediaQuery } from '~/hooks/useMediaQuery';
export { ResponsiveStatsLayout } from './components/ResponsiveStatsLayout';
export { StatBadge } from './components/StatBadge';
export { StatItem } from './components/StatItem';
// Export komponen utama
// Default export untuk backward compatibility
export { WritingStats, WritingStats as default } from './components/WritingStats';
// Export constants
export {
  A11Y,
  ANIMATIONS,
  BADGE_SIZES,
  BADGE_VARIANTS,
  BREAKPOINTS_STATS,
  DEFAULT_STATS,
  DEFAULT_STATS_CONFIG,
  FORMAT_PATTERNS,
  ICON_SIZES,
  READING_SPEED,
  STAT_ICONS,
  STAT_TYPES,
  THRESHOLDS,
} from './constants/stats.constants';
// Export responsive hooks
export {
  useIsDesktop,
  useIsMobile,
  useIsTablet,
  useOrientation,
  useResponsiveDetection,
  useWindowDimensions,
} from './hooks/useResponsiveDetection';

// Export hooks
export {
  useCustomReadingSpeedStats,
  useDebouncedWritingStats,
  useWritingStats,
  useWritingStatsComparison,
} from './hooks/useWritingStats';
// Export types
export type {
  BadgeVariant,
  BreakpointConfig,
  LayoutConfig,
  ResponsiveStatsLayoutProps,
  ScreenSize,
  StatBadgeProps,
  StatDisplayConfig,
  StatItemProps,
  StatsConfig,
  StatType,
  TextStatistics,
  UseResponsiveDetectionReturn,
  UseWritingStatsReturn,
  WritingStatsProps,
} from './types/stats.types';
// Export utilities
export {
  calculateTextStats,
  cleanMarkdownText,
  compareStats,
  countParagraphs,
  countSentences,
  countWords,
  formatStatValue,
  getDocumentStatus,
  getReadingTime,
  getStatLabel,
  getStatsConfig,
  isEmptyDocument,
  isLongDocument,
  isShortDocument,
  validateMarkdown,
} from './utils/stats.utils';

/**
 * WritingStats Module - Main Export
 * Entry point untuk semua exports dari WritingStats module
 * 
 * @author Axel Modra
 */

// Export komponen utama
export { WritingStats } from './components/WritingStats';
export { StatItem } from './components/StatItem';
export { StatBadge } from './components/StatBadge';
export { ResponsiveStatsLayout } from './components/ResponsiveStatsLayout';

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
  UseResponsiveDetectionReturn,
  StatsConfig,
  BreakpointConfig,
  StatDisplayConfig,
  LayoutConfig
} from './types/stats.types';

// Export constants
export {
  STAT_TYPES,
  READING_SPEED,
  BREAKPOINTS_STATS,
  STAT_ICONS,
  BADGE_VARIANTS,
  DEFAULT_STATS,
  DEFAULT_STATS_CONFIG,
  ICON_SIZES,
  BADGE_SIZES,
  ANIMATIONS,
  A11Y,
  FORMAT_PATTERNS,
  THRESHOLDS
} from './constants/stats.constants';

// Export utilities
export {
  calculateTextStats,
  formatStatValue,
  getReadingTime,
  cleanMarkdownText,
  countWords,
  countSentences,
  countParagraphs,
  validateMarkdown,
  getStatLabel,
  getStatsConfig,
  isEmptyDocument,
  isShortDocument,
  isLongDocument,
  getDocumentStatus,
  compareStats
} from './utils/stats.utils';

// Export hooks
export {
  useWritingStats,
  useDebouncedWritingStats,
  useWritingStatsComparison,
  useCustomReadingSpeedStats
} from './hooks/useWritingStats';

// Export responsive hooks
export {
  useResponsiveDetection,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useWindowDimensions,
  useMediaQuery,
  useOrientation
} from './hooks/useResponsiveDetection';

// Default export untuk backward compatibility
export { WritingStats as default } from './components/WritingStats';

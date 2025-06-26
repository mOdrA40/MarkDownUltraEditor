/**
 * WritingStats Hooks - Custom React Hooks
 * Custom hooks untuk WritingStats functionality
 *
 * @author Axel Modra
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  calculateTextStats,
  formatStatValue,
  getStatLabel,
  getStatsConfig,
  compareStats
} from '../utils/stats.utils';
import { READING_SPEED } from '../constants/stats.constants';
import type {
  TextStatistics,
  StatsConfig,
  StatType,
  ScreenSize,
  UseWritingStatsReturn
} from '../types/stats.types';

// Re-export responsive hooks untuk convenience
export {
  useResponsiveDetection,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useWindowDimensions,
  useMediaQuery,
  useOrientation
} from './useResponsiveDetection';

/**
 * Hook untuk menghitung dan mengelola writing statistics
 * @param markdown - Markdown text untuk dianalisis
 * @param config - Konfigurasi untuk perhitungan (optional)
 * @returns Object dengan statistik dan utility functions
 */
export const useWritingStats = (
  markdown: string,
  config: Partial<StatsConfig> = {}
): UseWritingStatsReturn => {
  // Merge config dengan defaults
  const statsConfig = useMemo(() => getStatsConfig(config), [config]);

  // Hitung statistik dengan memoization
  const stats = useMemo(() => {
    return calculateTextStats(markdown, statsConfig);
  }, [markdown, statsConfig]);

  // Memoized format function
  const formatStat = useCallback(
    (type: StatType, value: number, screenSize: ScreenSize = 'desktop') =>
      formatStatValue(type, value, screenSize),
    []
  );

  // Memoized label function
  const getStatLabelMemo = useCallback(
    (type: StatType, format: 'short' | 'long' = 'long') =>
      getStatLabel(type, format),
    []
  );

  return {
    stats,
    formatStat,
    getStatLabel: getStatLabelMemo,
    isCalculating: false // Always false for simple stats calculation
  };
};

/**
 * Hook untuk optimized stats calculation dengan debouncing
 * @param markdown - Markdown text untuk dianalisis
 * @param debounceMs - Delay untuk debounce (default: 300ms)
 * @param config - Konfigurasi untuk perhitungan (optional)
 * @returns Object dengan statistik dan utility functions
 */
export const useDebouncedWritingStats = (
  markdown: string,
  debounceMs: number = 300,
  config: Partial<StatsConfig> = {}
): UseWritingStatsReturn => {
  const [debouncedMarkdown, setDebouncedMarkdown] = useState(markdown);
  const [isCalculating, setIsCalculating] = useState(false);

  // Debounce markdown changes
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      setDebouncedMarkdown(markdown);
      setIsCalculating(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [markdown, debounceMs]);

  // Use regular hook with debounced markdown
  const result = useWritingStats(debouncedMarkdown, config);

  return {
    ...result,
    isCalculating: isCalculating || result.isCalculating
  };
};

/**
 * Hook untuk membandingkan statistik dengan versi sebelumnya
 * @param markdown - Markdown text untuk dianalisis
 * @param config - Konfigurasi untuk perhitungan (optional)
 * @returns Object dengan statistik, perbandingan, dan utility functions
 */
export const useWritingStatsComparison = (
  markdown: string,
  config: Partial<StatsConfig> = {}
) => {
  const [previousStats, setPreviousStats] = useState<TextStatistics | null>(null);
  
  const { stats, formatStat, getStatLabel, isCalculating } = useWritingStats(markdown, config);

  // Update previous stats when current stats change
  useEffect(() => {
    if (previousStats && !compareStats(stats, previousStats)) {
      setPreviousStats(stats);
    } else if (!previousStats) {
      setPreviousStats(stats);
    }
  }, [stats, previousStats]);

  // Calculate differences
  const statsDiff = useMemo(() => {
    if (!previousStats) return null;

    return {
      words: stats.words - previousStats.words,
      characters: stats.characters - previousStats.characters,
      charactersNoSpaces: stats.charactersNoSpaces - previousStats.charactersNoSpaces,
      paragraphs: stats.paragraphs - previousStats.paragraphs,
      sentences: stats.sentences - previousStats.sentences,
      lines: stats.lines - previousStats.lines,
      readingTime: stats.readingTime - previousStats.readingTime
    };
  }, [stats, previousStats]);

  return {
    stats,
    previousStats,
    statsDiff,
    formatStat,
    getStatLabel,
    isCalculating,
    hasChanges: statsDiff !== null && Object.values(statsDiff).some(diff => diff !== 0)
  };
};

/**
 * Hook untuk real-time stats dengan custom reading speed
 * @param markdown - Markdown text untuk dianalisis
 * @param readingSpeed - Custom reading speed (words per minute)
 * @returns Object dengan statistik dan utility functions
 */
export const useCustomReadingSpeedStats = (
  markdown: string,
  readingSpeed: number = READING_SPEED.DEFAULT
): UseWritingStatsReturn => {
  const config = useMemo(() => ({ readingSpeed }), [readingSpeed]);
  return useWritingStats(markdown, config);
};

/**
 * WritingStats Component - Komponen Utama Writing Statistics
 * Komponen orchestrator yang menggabungkan semua sub-komponen
 *
 * @author Axel Modra
 */

import type React from 'react';
import { memo, useMemo } from 'react';
import { useWritingStats } from '../hooks/useWritingStats';
import { useResponsiveDetection } from '../hooks/useResponsiveDetection';
import { ResponsiveStatsLayout } from './ResponsiveStatsLayout';
import { A11Y } from '../constants/stats.constants';
import type { WritingStatsProps } from '../types/stats.types';

/**
 * Komponen WritingStats utama
 * Menggabungkan semua statistik dalam layout responsif
 */
export const WritingStats: React.FC<WritingStatsProps> = memo(
  ({ markdown, className = '', children, readingSpeed, screenSizeOverride }) => {
    // Memoize config object untuk mencegah infinite re-render
    const config = useMemo(
      () => ({
        readingSpeed,
      }),
      [readingSpeed]
    );

    // Hooks untuk statistik dan responsive detection
    const { stats, isCalculating } = useWritingStats(markdown, config);

    const { screenSize: detectedScreenSize } = useResponsiveDetection();

    // Gunakan override jika ada, otherwise gunakan detected
    const screenSize = screenSizeOverride || detectedScreenSize;

    // Loading state
    if (isCalculating) {
      return (
        <div
          className={`bg-muted/20 border-t p-4 ${className}`}
          role="status"
          aria-label="Calculating statistics..."
        >
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-xs text-muted-foreground">Calculating...</div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="writing-stats"
        role="region"
        aria-label={A11Y.labels.statsContainer}
        aria-live={A11Y.liveRegion}
      >
        <ResponsiveStatsLayout screenSize={screenSize} stats={stats} className={className}>
          {children}
        </ResponsiveStatsLayout>
      </div>
    );
  }
);

WritingStats.displayName = 'WritingStats';

export default WritingStats;

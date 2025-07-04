/**
 * WritingStats Types - TypeScript Type Definitions
 * Definisi types untuk semua komponen WritingStats
 *
 * @author Axel Modra
 */

import type { ReactNode } from 'react';

/**
 * Tipe untuk screen size detection
 */
export type ScreenSize = 'mobile' | 'small-tablet' | 'tablet' | 'desktop';

/**
 * Tipe untuk jenis statistik
 */
export type StatType =
  | 'words'
  | 'characters'
  | 'charactersNoSpaces'
  | 'paragraphs'
  | 'sentences'
  | 'lines'
  | 'readingTime';

/**
 * Tipe untuk variant badge
 */
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

/**
 * Interface untuk statistik teks
 */
export interface TextStatistics {
  /** Jumlah kata */
  words: number;
  /** Jumlah karakter (dengan spasi) */
  characters: number;
  /** Jumlah karakter (tanpa spasi) */
  charactersNoSpaces: number;
  /** Jumlah paragraf */
  paragraphs: number;
  /** Jumlah kalimat */
  sentences: number;
  /** Jumlah baris */
  lines: number;
  /** Estimasi waktu baca (dalam menit) */
  readingTime: number;
}

/**
 * Props untuk komponen WritingStats utama
 */
export interface WritingStatsProps {
  /** Markdown text untuk dianalisis */
  markdown: string;
  /** Custom className untuk styling */
  className?: string;
  /** Custom children untuk extensibility */
  children?: ReactNode;
  /** Custom reading speed (words per minute) */
  readingSpeed?: number;
  /** Apakah menampilkan detailed stats */
  showDetailedStats?: boolean;
  /** Custom screen size override */
  screenSizeOverride?: ScreenSize;
}

/**
 * Props untuk komponen StatItem
 */
export interface StatItemProps {
  /** Tipe statistik */
  type: StatType;
  /** Nilai statistik */
  value: number;
  /** Label untuk display */
  label?: string;
  /** Icon component */
  icon?: ReactNode;
  /** Ukuran icon */
  iconSize?: 'sm' | 'md' | 'lg';
  /** Format untuk display value */
  format?: 'short' | 'long' | 'custom';
  /** Custom formatter function */
  formatter?: (value: number) => string;
  /** Custom className */
  className?: string;
  /** Apakah item clickable */
  clickable?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Props untuk komponen StatBadge
 */
export interface StatBadgeProps {
  /** Variant badge */
  variant: BadgeVariant;
  /** Icon component */
  icon?: ReactNode;
  /** Text content */
  children: ReactNode;
  /** Custom className */
  className?: string;
  /** Apakah badge clickable */
  clickable?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Props untuk komponen ResponsiveStatsLayout
 */
export interface ResponsiveStatsLayoutProps {
  /** Children components */
  children: ReactNode;
  /** Screen size saat ini */
  screenSize: ScreenSize;
  /** Statistik untuk ditampilkan */
  stats: TextStatistics;
  /** Custom className */
  className?: string;
  /** Custom layout styles untuk setiap screen size */
  layoutStyles?: Partial<Record<ScreenSize, string>>;
}

/**
 * Return type untuk hook useWritingStats
 */
export interface UseWritingStatsReturn {
  /** Statistik yang dihitung */
  stats: TextStatistics;
  /** Fungsi untuk format nilai statistik */
  formatStat: (type: StatType, value: number) => string;
  /** Fungsi untuk mendapatkan label statistik */
  getStatLabel: (type: StatType, format?: 'short' | 'long') => string;
  /** Apakah sedang menghitung */
  isCalculating: boolean;
}

/**
 * Return type untuk hook useResponsiveDetection
 */
export interface UseResponsiveDetectionReturn {
  /** Screen size saat ini */
  screenSize: ScreenSize;
  /** Apakah sedang di mobile */
  isMobile: boolean;
  /** Apakah sedang di tablet */
  isTablet: boolean;
  /** Apakah sedang di desktop */
  isDesktop: boolean;
  /** Width window saat ini */
  windowWidth: number;
  /** Height window saat ini */
  windowHeight: number;
}

/**
 * Interface untuk konfigurasi statistik
 */
export interface StatsConfig {
  /** Kecepatan baca (words per minute) */
  readingSpeed: number;
  /** Regex untuk membersihkan markdown */
  markdownCleanRegex: RegExp;
  /** Regex untuk split kata */
  wordSplitRegex: RegExp;
  /** Regex untuk split kalimat */
  sentenceSplitRegex: RegExp;
  /** Regex untuk split paragraf */
  paragraphSplitRegex: RegExp;
}

/**
 * Interface untuk breakpoint configuration
 */
export interface BreakpointConfig {
  /** Minimum width */
  min: number;
  /** Maximum width */
  max: number;
  /** Screen size type */
  type: ScreenSize;
  /** CSS classes untuk layout */
  classes: {
    container: string;
    statsLeft: string;
    statsRight: string;
    statItem: string;
    separator: string;
  };
}

/**
 * Interface untuk stat display configuration
 */
export interface StatDisplayConfig {
  /** ID statistik */
  id: StatType;
  /** Label pendek */
  shortLabel: string;
  /** Label panjang */
  longLabel: string;
  /** Icon name */
  iconName: string;
  /** Format default */
  defaultFormat: 'short' | 'long';
  /** Custom formatter */
  formatter?: (value: number) => string;
  /** Apakah ditampilkan di mobile */
  showOnMobile: boolean;
  /** Apakah ditampilkan di tablet */
  showOnTablet: boolean;
  /** Apakah ditampilkan di desktop */
  showOnDesktop: boolean;
}

/**
 * Interface untuk layout configuration
 */
export interface LayoutConfig {
  /** Screen size */
  screenSize: ScreenSize;
  /** Container classes */
  containerClasses: string;
  /** Item classes */
  itemClasses: string;
  /** Separator classes */
  separatorClasses: string;
  /** Badge classes */
  badgeClasses: string;
  /** Apakah menggunakan inline styles */
  useInlineStyles: boolean;
  /** Custom inline styles */
  inlineStyles?: {
    container?: React.CSSProperties;
    statsLeft?: React.CSSProperties;
    statsRight?: React.CSSProperties;
    statItem?: React.CSSProperties;
    separator?: React.CSSProperties;
  };
}

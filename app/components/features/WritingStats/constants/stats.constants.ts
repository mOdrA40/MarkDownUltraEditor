/**
 * WritingStats Constants - Konfigurasi dan Konstanta
 * Definisi konstanta untuk WritingStats module
 * 
 * @author Axel Modra
 */

import type {
  StatsConfig,
  BreakpointConfig,
  StatDisplayConfig,
  StatType,
  BadgeVariant,
  TextStatistics
} from '../types/stats.types';

/**
 * Kecepatan baca default (words per minute)
 */
export const READING_SPEED = {
  /** Kecepatan baca rata-rata */
  AVERAGE: 200,
  /** Kecepatan baca lambat */
  SLOW: 150,
  /** Kecepatan baca cepat */
  FAST: 250,
  /** Default yang digunakan */
  DEFAULT: 200
} as const;

/**
 * Konfigurasi default untuk statistik
 */
export const DEFAULT_STATS_CONFIG: StatsConfig = {
  readingSpeed: READING_SPEED.DEFAULT,
  markdownCleanRegex: /[#*`_~[\]()]/g,
  wordSplitRegex: /\s+/,
  sentenceSplitRegex: /[.!?]+/,
  paragraphSplitRegex: /\n\s*\n/
};

/**
 * Statistik default/kosong
 */
export const DEFAULT_STATS: TextStatistics = {
  words: 0,
  characters: 0,
  charactersNoSpaces: 0,
  paragraphs: 0,
  sentences: 0,
  lines: 0,
  readingTime: 0
};

/**
 * Breakpoints untuk responsive design
 */
export const BREAKPOINTS_STATS: Record<string, BreakpointConfig> = {
  mobile: {
    min: 320,
    max: 499,
    type: 'mobile',
    classes: {
      container: 'writing-stats-container bg-muted/20 border-t',
      statsLeft: 'writing-stats-mobile',
      statsRight: 'badge-container',
      statItem: 'stat-item',
      separator: 'separator-vertical bg-current opacity-30 w-px h-3'
    }
  },
  smallTablet: {
    min: 500,
    max: 767,
    type: 'small-tablet',
    classes: {
      container: 'writing-stats-container writing-stats-tablet bg-muted/20 border-t text-xs',
      statsLeft: 'stats-left flex items-center gap-3 flex-nowrap overflow-x-auto',
      statsRight: 'stats-right flex items-center gap-2 flex-shrink-0 ml-3',
      statItem: 'stat-item flex items-center gap-1 whitespace-nowrap',
      separator: 'separator-vertical w-px h-3 bg-current opacity-30 flex-shrink-0'
    }
  },
  tablet: {
    min: 768,
    max: 1023,
    type: 'tablet',
    classes: {
      container: 'writing-stats-container writing-stats-tablet bg-muted/20 border-t text-xs',
      statsLeft: 'stats-left flex items-center gap-4 flex-nowrap',
      statsRight: 'stats-right flex items-center gap-3 flex-shrink-0 ml-4',
      statItem: 'stat-item flex items-center gap-1 whitespace-nowrap',
      separator: 'separator-vertical w-px h-3 bg-current opacity-30 flex-shrink-0'
    }
  },
  desktop: {
    min: 1024,
    max: Infinity,
    type: 'desktop',
    classes: {
      container: 'bg-muted/20 border-t',
      statsLeft: '',
      statsRight: '',
      statItem: '',
      separator: ''
    }
  }
} as const;

/**
 * Konfigurasi display untuk setiap jenis statistik
 */
export const STAT_TYPES: Record<StatType, StatDisplayConfig> = {
  words: {
    id: 'words',
    shortLabel: 'w',
    longLabel: 'words',
    iconName: 'Type',
    defaultFormat: 'long',
    showOnMobile: true,
    showOnTablet: true,
    showOnDesktop: true
  },
  characters: {
    id: 'characters',
    shortLabel: 'c',
    longLabel: 'chars',
    iconName: 'Hash',
    defaultFormat: 'long',
    showOnMobile: true,
    showOnTablet: true,
    showOnDesktop: true
  },
  charactersNoSpaces: {
    id: 'charactersNoSpaces',
    shortLabel: 'c (no spaces)',
    longLabel: 'chars (no spaces)',
    iconName: 'Hash',
    defaultFormat: 'long',
    showOnMobile: true,
    showOnTablet: true,
    showOnDesktop: true
  },
  paragraphs: {
    id: 'paragraphs',
    shortLabel: '¶',
    longLabel: '¶',
    iconName: 'AlignLeft',
    defaultFormat: 'short',
    showOnMobile: true,
    showOnTablet: true,
    showOnDesktop: true
  },
  sentences: {
    id: 'sentences',
    shortLabel: 's',
    longLabel: 'sent',
    iconName: 'BarChart3',
    defaultFormat: 'long',
    showOnMobile: true,
    showOnTablet: true,
    showOnDesktop: true
  },
  lines: {
    id: 'lines',
    shortLabel: 'l',
    longLabel: 'lines',
    iconName: 'FileText',
    defaultFormat: 'long',
    showOnMobile: true,
    showOnTablet: true,
    showOnDesktop: true
  },
  readingTime: {
    id: 'readingTime',
    shortLabel: 'min',
    longLabel: 'min read',
    iconName: 'Clock',
    defaultFormat: 'long',
    formatter: (value: number) => `${value} min${value === 1 ? '' : 's'}`,
    showOnMobile: true,
    showOnTablet: true,
    showOnDesktop: true
  }
} as const;

/**
 * Icon mapping untuk statistik (icon names)
 */
export const STAT_ICONS = {
  words: 'Type',
  characters: 'Hash',
  charactersNoSpaces: 'Hash',
  paragraphs: 'AlignLeft',
  sentences: 'BarChart3',
  lines: 'FileText',
  readingTime: 'Clock'
} as const;

/**
 * Badge variants yang tersedia
 */
export const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-input bg-background',
  destructive: 'bg-destructive text-destructive-foreground'
} as const;

/**
 * CSS classes untuk ukuran icon
 */
export const ICON_SIZES = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4'
} as const;

/**
 * CSS classes untuk badge sizes
 */
export const BADGE_SIZES = {
  mobile: 'badge-mobile h-5 text-xs',
  tablet: 'badge-tablet h-5 text-xs',
  desktop: 'badge-desktop h-5 text-xs'
} as const;

/**
 * Animasi dan transisi
 */
export const ANIMATIONS = {
  /** Durasi transisi default */
  duration: '0.2s',
  /** Easing function */
  easing: 'ease-in-out',
  /** Hover effects */
  hover: 'hover:bg-muted/50 transition-colors',
  /** Loading animation */
  loading: 'animate-pulse'
} as const;

/**
 * Accessibility constants
 */
export const A11Y = {
  /** ARIA labels */
  labels: {
    statsContainer: 'Writing statistics',
    wordCount: 'Word count',
    characterCount: 'Character count',
    paragraphCount: 'Paragraph count',
    sentenceCount: 'Sentence count',
    lineCount: 'Line count',
    readingTime: 'Estimated reading time',
    documentStatus: 'Document status'
  },
  /** Live region untuk screen readers */
  liveRegion: 'polite'
} as const;

/**
 * Format patterns untuk display
 */
export const FORMAT_PATTERNS = {
  /** Format untuk mobile (singkat) */
  mobile: {
    words: (value: number) => `${value}w`,
    characters: (value: number) => `${value}c`,
    charactersNoSpaces: (value: number) => `${value} chars (no spaces)`,
    paragraphs: (value: number) => `${value}¶`,
    sentences: (value: number) => `${value}s`,
    lines: (value: number) => `${value}l`,
    readingTime: (value: number) => `${value}min`
  },
  /** Format untuk tablet/desktop (lengkap) */
  desktop: {
    words: (value: number) => `${value} words`,
    characters: (value: number) => `${value} chars`,
    charactersNoSpaces: (value: number) => `${value} chars (no spaces)`,
    paragraphs: (value: number) => `${value} ¶`,
    sentences: (value: number) => `${value} sent`,
    lines: (value: number) => `${value} lines`,
    readingTime: (value: number) => `${value} min read`
  }
} as const;

/**
 * Threshold values untuk styling
 */
export const THRESHOLDS = {
  /** Threshold untuk word count styling */
  words: {
    low: 100,
    medium: 500,
    high: 1000
  },
  /** Threshold untuk reading time styling */
  readingTime: {
    short: 2,
    medium: 5,
    long: 10
  }
} as const;

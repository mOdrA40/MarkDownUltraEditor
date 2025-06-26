/**
 * WritingStats Utilities - Helper Functions
 * Utility functions untuk WritingStats module
 * 
 * @author Axel Modra
 */

import { 
  DEFAULT_STATS_CONFIG, 
  READING_SPEED, 
  FORMAT_PATTERNS,
  STAT_TYPES
} from '../constants/stats.constants';
import type { 
  TextStatistics, 
  StatsConfig, 
  StatType,
  ScreenSize
} from '../types/stats.types';

/**
 * Membersihkan teks markdown dari markup characters
 * @param markdown - Raw markdown text
 * @param config - Konfigurasi untuk cleaning (optional)
 * @returns Clean text tanpa markdown markup
 */
export const cleanMarkdownText = (
  markdown: string, 
  config: Partial<StatsConfig> = {}
): string => {
  const { markdownCleanRegex = DEFAULT_STATS_CONFIG.markdownCleanRegex } = config;
  
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }
  
  return markdown.replace(markdownCleanRegex, '').trim();
};

/**
 * Menghitung jumlah kata dalam teks
 * @param text - Teks yang akan dihitung
 * @param config - Konfigurasi untuk word splitting (optional)
 * @returns Jumlah kata
 */
export const countWords = (
  text: string, 
  config: Partial<StatsConfig> = {}
): number => {
  const { wordSplitRegex = DEFAULT_STATS_CONFIG.wordSplitRegex } = config;
  
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  const words = text.split(wordSplitRegex).filter(word => word.length > 0);
  return words.length;
};

/**
 * Menghitung jumlah kalimat dalam teks
 * @param text - Teks yang akan dihitung
 * @param config - Konfigurasi untuk sentence splitting (optional)
 * @returns Jumlah kalimat
 */
export const countSentences = (
  text: string, 
  config: Partial<StatsConfig> = {}
): number => {
  const { sentenceSplitRegex = DEFAULT_STATS_CONFIG.sentenceSplitRegex } = config;
  
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  const sentences = text.split(sentenceSplitRegex).filter(s => s.trim().length > 0);
  return sentences.length;
};

/**
 * Menghitung jumlah paragraf dalam markdown
 * @param markdown - Raw markdown text
 * @param config - Konfigurasi untuk paragraph splitting (optional)
 * @returns Jumlah paragraf
 */
export const countParagraphs = (
  markdown: string, 
  config: Partial<StatsConfig> = {}
): number => {
  const { paragraphSplitRegex = DEFAULT_STATS_CONFIG.paragraphSplitRegex } = config;
  
  if (!markdown || typeof markdown !== 'string') {
    return 0;
  }
  
  const paragraphs = markdown.split(paragraphSplitRegex).filter(p => p.trim().length > 0);
  return paragraphs.length;
};

/**
 * Menghitung estimasi waktu baca
 * @param wordCount - Jumlah kata
 * @param readingSpeed - Kecepatan baca (words per minute)
 * @returns Estimasi waktu baca dalam menit
 */
export const getReadingTime = (
  wordCount: number, 
  readingSpeed: number = READING_SPEED.DEFAULT
): number => {
  if (wordCount <= 0 || readingSpeed <= 0) {
    return 0;
  }
  
  return Math.ceil(wordCount / readingSpeed);
};

/**
 * Menghitung semua statistik teks dari markdown
 * @param markdown - Raw markdown text
 * @param config - Konfigurasi untuk perhitungan (optional)
 * @returns Object dengan semua statistik
 */
export const calculateTextStats = (
  markdown: string, 
  config: Partial<StatsConfig> = {}
): TextStatistics => {
  if (!markdown || typeof markdown !== 'string') {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      paragraphs: 0,
      sentences: 0,
      lines: 0,
      readingTime: 0
    };
  }
  
  const { readingSpeed = READING_SPEED.DEFAULT } = config;
  
  // Clean text untuk word/sentence counting
  const cleanText = cleanMarkdownText(markdown, config);
  
  // Hitung statistik
  const words = countWords(cleanText, config);
  const characters = cleanText.length;
  const charactersNoSpaces = cleanText.replace(/\s/g, '').length;
  const paragraphs = countParagraphs(markdown, config);
  const sentences = countSentences(cleanText, config);
  const lines = markdown.split('\n').length;
  const readingTime = getReadingTime(words, readingSpeed);
  
  return {
    words,
    characters,
    charactersNoSpaces,
    paragraphs,
    sentences,
    lines,
    readingTime
  };
};

/**
 * Format nilai statistik untuk display
 * @param type - Jenis statistik
 * @param value - Nilai statistik
 * @param screenSize - Ukuran layar untuk format yang sesuai
 * @returns String yang diformat
 */
export const formatStatValue = (
  type: StatType, 
  value: number, 
  screenSize: ScreenSize = 'desktop'
): string => {
  const statConfig = STAT_TYPES[type];
  
  // Gunakan custom formatter jika ada
  if (statConfig.formatter) {
    return statConfig.formatter(value);
  }
  
  // Gunakan format pattern berdasarkan screen size
  const formatPattern = screenSize === 'mobile' 
    ? FORMAT_PATTERNS.mobile 
    : FORMAT_PATTERNS.desktop;
  
  const formatter = formatPattern[type];
  if (formatter) {
    return formatter(value);
  }
  
  // Fallback ke format default
  return `${value}`;
};

/**
 * Mendapatkan label untuk statistik
 * @param type - Jenis statistik
 * @param format - Format label ('short' atau 'long')
 * @returns Label string
 */
export const getStatLabel = (
  type: StatType, 
  format: 'short' | 'long' = 'long'
): string => {
  const statConfig = STAT_TYPES[type];
  return format === 'short' ? statConfig.shortLabel : statConfig.longLabel;
};

/**
 * Validasi markdown input
 * @param markdown - Markdown text untuk divalidasi
 * @returns True jika valid
 */
export const validateMarkdown = (markdown: string): boolean => {
  return typeof markdown === 'string';
};

/**
 * Mendapatkan konfigurasi stats yang merged dengan default
 * @param config - Partial configuration
 * @returns Complete stats configuration
 */
export const getStatsConfig = (config: Partial<StatsConfig> = {}): StatsConfig => {
  return {
    ...DEFAULT_STATS_CONFIG,
    ...config
  };
};

/**
 * Cek apakah statistik menunjukkan dokumen kosong
 * @param stats - Statistik untuk dicek
 * @returns True jika dokumen kosong
 */
export const isEmptyDocument = (stats: TextStatistics): boolean => {
  return stats.words === 0 && stats.characters === 0;
};

/**
 * Cek apakah statistik menunjukkan dokumen pendek
 * @param stats - Statistik untuk dicek
 * @param threshold - Threshold untuk kata (default: 100)
 * @returns True jika dokumen pendek
 */
export const isShortDocument = (stats: TextStatistics, threshold: number = 100): boolean => {
  return stats.words > 0 && stats.words < threshold;
};

/**
 * Cek apakah statistik menunjukkan dokumen panjang
 * @param stats - Statistik untuk dicek
 * @param threshold - Threshold untuk kata (default: 1000)
 * @returns True jika dokumen panjang
 */
export const isLongDocument = (stats: TextStatistics, threshold: number = 1000): boolean => {
  return stats.words >= threshold;
};

/**
 * Mendapatkan status dokumen berdasarkan statistik
 * @param stats - Statistik untuk dianalisis
 * @returns Status string
 */
export const getDocumentStatus = (stats: TextStatistics): string => {
  if (isEmptyDocument(stats)) {
    return 'Empty';
  } else if (isShortDocument(stats)) {
    return 'Draft';
  } else if (isLongDocument(stats)) {
    return 'Complete';
  } else {
    return 'Ready';
  }
};

/**
 * Membandingkan dua set statistik
 * @param stats1 - Statistik pertama
 * @param stats2 - Statistik kedua
 * @returns True jika sama
 */
export const compareStats = (stats1: TextStatistics, stats2: TextStatistics): boolean => {
  return (
    stats1.words === stats2.words &&
    stats1.characters === stats2.characters &&
    stats1.charactersNoSpaces === stats2.charactersNoSpaces &&
    stats1.paragraphs === stats2.paragraphs &&
    stats1.sentences === stats2.sentences &&
    stats1.lines === stats2.lines &&
    stats1.readingTime === stats2.readingTime
  );
};

/**
 * WritingSettings Utilities - Helper Functions
 * Utility functions untuk WritingSettings module
 *
 * @author Axel Modra
 */

import {
  DEFAULT_SETTINGS,
  FONT_SIZE_CONSTRAINTS,
  LINE_HEIGHT_CONSTRAINTS,
} from '../constants/settings.constants';
import type { SettingsConfig } from '../types/settings.types';

/**
 * Validasi dan normalisasi font size
 * @param size - Font size yang akan divalidasi
 * @param config - Konfigurasi constraints (optional)
 * @returns Font size yang valid
 */
export const validateFontSize = (size: number, config: Partial<SettingsConfig> = {}): number => {
  const { minFontSize = DEFAULT_SETTINGS.minFontSize, maxFontSize = DEFAULT_SETTINGS.maxFontSize } =
    config;

  // Pastikan size adalah number yang valid
  if (typeof size !== 'number' || Number.isNaN(size)) {
    return FONT_SIZE_CONSTRAINTS.DEFAULT;
  }

  // Clamp nilai antara min dan max
  return Math.max(minFontSize, Math.min(maxFontSize, Math.round(size)));
};

/**
 * Validasi dan normalisasi line height
 * @param height - Line height yang akan divalidasi
 * @param config - Konfigurasi constraints (optional)
 * @returns Line height yang valid
 */
export const validateLineHeight = (
  height: number,
  config: Partial<SettingsConfig> = {}
): number => {
  const {
    minLineHeight = DEFAULT_SETTINGS.minLineHeight,
    maxLineHeight = DEFAULT_SETTINGS.maxLineHeight,
  } = config;

  // Pastikan height adalah number yang valid
  if (typeof height !== 'number' || Number.isNaN(height)) {
    return LINE_HEIGHT_CONSTRAINTS.DEFAULT;
  }

  // Clamp nilai antara min dan max, round ke 1 decimal place
  const clampedHeight = Math.max(minLineHeight, Math.min(maxLineHeight, height));
  return Math.round(clampedHeight * 10) / 10;
};

/**
 * Mendapatkan font size berikutnya (increment)
 * @param currentSize - Font size saat ini
 * @param config - Konfigurasi constraints (optional)
 * @returns Font size berikutnya
 */
export const getNextFontSize = (
  currentSize: number,
  config: Partial<SettingsConfig> = {}
): number => {
  const {
    maxFontSize = DEFAULT_SETTINGS.maxFontSize,
    fontSizeStep = DEFAULT_SETTINGS.fontSizeStep,
  } = config;

  const nextSize = currentSize + fontSizeStep;
  return validateFontSize(Math.min(maxFontSize, nextSize), config);
};

/**
 * Mendapatkan font size sebelumnya (decrement)
 * @param currentSize - Font size saat ini
 * @param config - Konfigurasi constraints (optional)
 * @returns Font size sebelumnya
 */
export const getPreviousFontSize = (
  currentSize: number,
  config: Partial<SettingsConfig> = {}
): number => {
  const {
    minFontSize = DEFAULT_SETTINGS.minFontSize,
    fontSizeStep = DEFAULT_SETTINGS.fontSizeStep,
  } = config;

  const prevSize = currentSize - fontSizeStep;
  return validateFontSize(Math.max(minFontSize, prevSize), config);
};

/**
 * Mendapatkan line height berikutnya (increment)
 * @param currentHeight - Line height saat ini
 * @param config - Konfigurasi constraints (optional)
 * @returns Line height berikutnya
 */
export const getNextLineHeight = (
  currentHeight: number,
  config: Partial<SettingsConfig> = {}
): number => {
  const {
    maxLineHeight = DEFAULT_SETTINGS.maxLineHeight,
    lineHeightStep = DEFAULT_SETTINGS.lineHeightStep,
  } = config;

  const nextHeight = currentHeight + lineHeightStep;
  return validateLineHeight(Math.min(maxLineHeight, nextHeight), config);
};

/**
 * Mendapatkan line height sebelumnya (decrement)
 * @param currentHeight - Line height saat ini
 * @param config - Konfigurasi constraints (optional)
 * @returns Line height sebelumnya
 */
export const getPreviousLineHeight = (
  currentHeight: number,
  config: Partial<SettingsConfig> = {}
): number => {
  const {
    minLineHeight = DEFAULT_SETTINGS.minLineHeight,
    lineHeightStep = DEFAULT_SETTINGS.lineHeightStep,
  } = config;

  const prevHeight = currentHeight - lineHeightStep;
  return validateLineHeight(Math.max(minLineHeight, prevHeight), config);
};

/**
 * Format font size untuk display
 * @param size - Font size yang akan diformat
 * @param showUnit - Apakah menampilkan unit 'px'
 * @returns String yang diformat
 */
export const formatFontSize = (size: number, showUnit = true): string => {
  const validSize = validateFontSize(size);
  return showUnit ? `${validSize}px` : validSize.toString();
};

/**
 * Format line height untuk display
 * @param height - Line height yang akan diformat
 * @param precision - Jumlah decimal places
 * @returns String yang diformat
 */
export const formatLineHeight = (height: number, precision = 1): string => {
  const validHeight = validateLineHeight(height);
  return validHeight.toFixed(precision);
};

/**
 * Cek apakah font size berada di batas minimum
 * @param size - Font size yang akan dicek
 * @param config - Konfigurasi constraints (optional)
 * @returns True jika di batas minimum
 */
export const isMinFontSize = (size: number, config: Partial<SettingsConfig> = {}): boolean => {
  const { minFontSize = DEFAULT_SETTINGS.minFontSize } = config;
  return size <= minFontSize;
};

/**
 * Cek apakah font size berada di batas maksimum
 * @param size - Font size yang akan dicek
 * @param config - Konfigurasi constraints (optional)
 * @returns True jika di batas maksimum
 */
export const isMaxFontSize = (size: number, config: Partial<SettingsConfig> = {}): boolean => {
  const { maxFontSize = DEFAULT_SETTINGS.maxFontSize } = config;
  return size >= maxFontSize;
};

/**
 * Cek apakah line height berada di batas minimum
 * @param height - Line height yang akan dicek
 * @param config - Konfigurasi constraints (optional)
 * @returns True jika di batas minimum
 */
export const isMinLineHeight = (height: number, config: Partial<SettingsConfig> = {}): boolean => {
  const { minLineHeight = DEFAULT_SETTINGS.minLineHeight } = config;
  return height <= minLineHeight;
};

/**
 * Cek apakah line height berada di batas maksimum
 * @param height - Line height yang akan dicek
 * @param config - Konfigurasi constraints (optional)
 * @returns True jika di batas maksimum
 */
export const isMaxLineHeight = (height: number, config: Partial<SettingsConfig> = {}): boolean => {
  const { maxLineHeight = DEFAULT_SETTINGS.maxLineHeight } = config;
  return height >= maxLineHeight;
};

/**
 * Mendapatkan konfigurasi settings yang merged dengan default
 * @param config - Partial configuration
 * @returns Complete settings configuration
 */
export const getSettingsConfig = (config: Partial<SettingsConfig> = {}): SettingsConfig => {
  return {
    ...DEFAULT_SETTINGS,
    ...config,
  };
};

/**
 * Validasi konfigurasi settings
 * @param config - Konfigurasi yang akan divalidasi
 * @returns True jika konfigurasi valid
 */
export const validateSettingsConfig = (config: Partial<SettingsConfig>): boolean => {
  const { minFontSize, maxFontSize, minLineHeight, maxLineHeight, fontSizeStep, lineHeightStep } =
    config;

  // Validasi font size constraints
  if (minFontSize !== undefined && maxFontSize !== undefined) {
    if (minFontSize >= maxFontSize) return false;
  }

  // Validasi line height constraints
  if (minLineHeight !== undefined && maxLineHeight !== undefined) {
    if (minLineHeight >= maxLineHeight) return false;
  }

  // Validasi steps
  if (fontSizeStep !== undefined && fontSizeStep <= 0) return false;
  if (lineHeightStep !== undefined && lineHeightStep <= 0) return false;

  return true;
};

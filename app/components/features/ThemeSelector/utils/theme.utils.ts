/**
 * Theme Utilities
 * Fungsi-fungsi utility untuk operasi tema
 *
 * @author Axel Modra
 */

import type { Theme, ThemeId, ThemeColorCategory } from '../types/theme.types';
import { themes, themeMap } from '../constants/themes.constants';

/**
 * Mencari tema berdasarkan ID
 * @param themeId - ID tema yang dicari
 * @returns Tema yang ditemukan atau null
 */
export const findThemeById = (themeId: string): Theme | null => {
  return themeMap.get(themeId as ThemeId) || null;
};

/**
 * Mendapatkan tema berdasarkan ID dengan fallback
 * @param themeId - ID tema yang dicari
 * @param fallback - Tema fallback jika tidak ditemukan
 * @returns Tema yang ditemukan atau fallback
 */
export const getThemeWithFallback = (themeId: string, fallback: Theme): Theme => {
  return findThemeById(themeId) || fallback;
};

/**
 * Mengecek apakah tema ID valid
 * @param themeId - ID tema yang akan dicek
 * @returns True jika valid, false jika tidak
 */
export const isValidThemeId = (themeId: string): themeId is ThemeId => {
  return themeMap.has(themeId as ThemeId);
};

/**
 * Mendapatkan warna dari tema berdasarkan kategori
 * @param theme - Objek tema
 * @param category - Kategori warna yang diinginkan
 * @returns Nilai warna dalam format hex
 */
export const getThemeColor = (theme: Theme, category: ThemeColorCategory): string => {
  return theme[category];
};

/**
 * Membuat gradient CSS dari tema
 * @param theme - Objek tema
 * @param direction - Arah gradient (default: 135deg)
 * @returns String CSS gradient
 */
export const createThemeGradient = (theme: Theme, direction = '135deg'): string => {
  return `linear-gradient(${direction}, ${theme.primary}, ${theme.secondary})`;
};

/**
 * Mengecek apakah tema adalah tema gelap
 * @param theme - Objek tema
 * @returns True jika tema gelap, false jika terang
 */
export const isDarkTheme = (theme: Theme): boolean => {
  return theme.id === 'dark';
};

/**
 * Mendapatkan kontras warna teks untuk background tema
 * @param theme - Objek tema
 * @returns Warna teks yang kontras (putih atau hitam)
 */
export const getContrastTextColor = (theme: Theme): string => {
  return isDarkTheme(theme) ? '#ffffff' : '#000000';
};

/**
 * Mengkonversi hex ke RGB
 * @param hex - Warna dalam format hex
 * @returns Objek RGB atau null jika invalid
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
};

/**
 * Menghitung luminance warna untuk accessibility
 * @param hex - Warna dalam format hex
 * @returns Nilai luminance (0-1)
 */
export const calculateLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Menghitung contrast ratio antara dua warna
 * @param color1 - Warna pertama (hex)
 * @param color2 - Warna kedua (hex)
 * @returns Contrast ratio (1-21)
 */
export const calculateContrastRatio = (color1: string, color2: string): number => {
  const lum1 = calculateLuminance(color1);
  const lum2 = calculateLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Mengecek apakah kombinasi warna memenuhi standar WCAG AA
 * @param foreground - Warna foreground (hex)
 * @param background - Warna background (hex)
 * @returns True jika memenuhi standar WCAG AA
 */
export const meetsWCAGAA = (foreground: string, background: string): boolean => {
  return calculateContrastRatio(foreground, background) >= 4.5;
};

/**
 * Mendapatkan tema berikutnya dalam urutan
 * @param currentTheme - Tema saat ini
 * @returns Tema berikutnya
 */
export const getNextTheme = (currentTheme: Theme): Theme => {
  const currentIndex = themes.findIndex((theme) => theme.id === currentTheme.id);
  const nextIndex = (currentIndex + 1) % themes.length;
  return themes[nextIndex];
};

/**
 * Mendapatkan tema sebelumnya dalam urutan
 * @param currentTheme - Tema saat ini
 * @returns Tema sebelumnya
 */
export const getPreviousTheme = (currentTheme: Theme): Theme => {
  const currentIndex = themes.findIndex((theme) => theme.id === currentTheme.id);
  const prevIndex = currentIndex === 0 ? themes.length - 1 : currentIndex - 1;
  return themes[prevIndex];
};

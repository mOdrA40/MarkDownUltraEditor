/**
 * Theme Constants
 * Konstanta data tema yang tersedia dalam aplikasi
 * 
 * @author Axel Modra
 */

import type { Theme, ThemeId } from '../types/theme.types';

/**
 * Daftar lengkap tema yang tersedia
 * Setiap tema memiliki palet warna yang konsisten dan harmonis
 */
export const themes: Theme[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    primary: '#0891b2',
    secondary: '#0e7490',
    background: '#f0f9ff',
    surface: '#e0f2fe',
    text: '#0c4a6e',
    accent: '#0284c7',
    gradient: 'from-cyan-50 to-blue-100'
  },
  {
    id: 'forest',
    name: 'Forest',
    primary: '#059669',
    secondary: '#047857',
    background: '#f0fdf4',
    surface: '#dcfce7',
    text: '#14532d',
    accent: '#10b981',
    gradient: 'from-green-50 to-emerald-100'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    primary: '#ea580c',
    secondary: '#c2410c',
    background: '#fff7ed',
    surface: '#fed7aa',
    text: '#9a3412',
    accent: '#f97316',
    gradient: 'from-orange-50 to-red-100'
  },
  {
    id: 'purple',
    name: 'Purple',
    primary: '#9333ea',
    secondary: '#7c3aed',
    background: '#faf5ff',
    surface: '#e9d5ff',
    text: '#581c87',
    accent: '#a855f7',
    gradient: 'from-purple-50 to-violet-100'
  },
  {
    id: 'rose',
    name: 'Rose',
    primary: '#e11d48',
    secondary: '#be123c',
    background: '#fff1f2',
    surface: '#fecdd3',
    text: '#881337',
    accent: '#f43f5e',
    gradient: 'from-rose-50 to-pink-100'
  },
  {
    id: 'dark',
    name: 'Dark',
    primary: '#6366f1',
    secondary: '#4f46e5',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    accent: '#8b5cf6',
    gradient: 'from-slate-900 to-gray-900'
  }
];

/**
 * Map tema berdasarkan ID untuk akses cepat
 */
export const themeMap = new Map<ThemeId, Theme>(
  themes.map(theme => [theme.id as ThemeId, theme])
);

/**
 * Daftar ID tema yang tersedia
 */
export const availableThemeIds: ThemeId[] = themes.map(theme => theme.id as ThemeId);

/**
 * Tema default aplikasi
 */
export const DEFAULT_THEME_ID: ThemeId = 'ocean';

/**
 * Tema default object
 */
export const DEFAULT_THEME: Theme = themes.find(theme => theme.id === DEFAULT_THEME_ID) || themes[0];

/**
 * Konstanta untuk ukuran button tema
 */
export const THEME_BUTTON_SIZES = {
  compact: {
    width: 'w-6',
    height: 'h-6',
    iconSize: 'h-2 w-2'
  },
  normal: {
    width: 'w-8',
    height: 'h-8',
    iconSize: 'h-3 w-3'
  },
  large: {
    width: 'w-10',
    height: 'h-10',
    iconSize: 'h-4 w-4'
  }
} as const;

/**
 * Konstanta untuk animasi tema
 */
export const THEME_ANIMATIONS = {
  transition: 'transition-all duration-200',
  hover: 'hover:scale-105',
  active: 'active:scale-95'
} as const;

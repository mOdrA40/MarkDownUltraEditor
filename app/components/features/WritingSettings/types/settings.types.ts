/**
 * WritingSettings Types - TypeScript Type Definitions
 * Definisi types untuk semua komponen WritingSettings
 *
 * @author Axel Modra
 */

import type { ReactNode } from 'react';

/**
 * Tipe untuk mode writing yang tersedia
 */
export type WritingMode = 'focus' | 'typewriter' | 'wordWrap' | 'vim' | 'zen';

/**
 * Tipe untuk breakpoint responsif
 */
export type BreakpointType = 'mobile' | 'small-tablet' | 'tablet' | 'desktop';

/**
 * Tipe untuk ukuran control
 */
export type ControlSize = 'sm' | 'md' | 'lg';

/**
 * Interface untuk konfigurasi settings
 */
export interface SettingsConfig {
  /** Ukuran font minimum yang diizinkan */
  minFontSize: number;
  /** Ukuran font maksimum yang diizinkan */
  maxFontSize: number;
  /** Line height minimum yang diizinkan */
  minLineHeight: number;
  /** Line height maksimum yang diizinkan */
  maxLineHeight: number;
  /** Step untuk perubahan font size */
  fontSizeStep: number;
  /** Step untuk perubahan line height */
  lineHeightStep: number;
}

/**
 * Props untuk komponen WritingSettings utama
 */
export interface WritingSettingsProps {
  /** Ukuran font saat ini */
  fontSize: number;
  /** Callback untuk perubahan font size */
  onFontSizeChange: (size: number) => void;
  /** Line height saat ini */
  lineHeight: number;
  /** Callback untuk perubahan line height */
  onLineHeightChange: (height: number) => void;
  /** Status focus mode */
  focusMode: boolean;
  /** Callback untuk toggle focus mode */
  onFocusModeToggle: () => void;
  /** Status typewriter mode */
  typewriterMode: boolean;
  /** Callback untuk toggle typewriter mode */
  onTypewriterModeToggle: () => void;
  /** Status word wrap */
  wordWrap: boolean;
  /** Callback untuk toggle word wrap */
  onWordWrapToggle: () => void;
  /** Status vim mode */
  vimMode: boolean;
  /** Callback untuk toggle vim mode */
  onVimModeToggle: () => void;
  /** Status zen mode */
  zenMode: boolean;
  /** Callback untuk toggle zen mode */
  onZenModeToggle: () => void;
  /** Custom className untuk styling */
  className?: string;
  /** Custom children untuk extensibility */
  children?: ReactNode;
  /** Force mobile layout regardless of screen size */
  forceMobileLayout?: boolean;
}

/**
 * Props untuk komponen FontSizeControl
 */
export interface FontSizeControlProps {
  /** Ukuran font saat ini */
  fontSize: number;
  /** Callback untuk perubahan font size */
  onFontSizeChange: (size: number) => void;
  /** Ukuran control (sm, md, lg) */
  size?: ControlSize;
  /** Apakah control disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Konfigurasi constraints */
  config?: Partial<SettingsConfig>;
}

/**
 * Props untuk komponen LineHeightControl
 */
export interface LineHeightControlProps {
  /** Line height saat ini */
  lineHeight: number;
  /** Callback untuk perubahan line height */
  onLineHeightChange: (height: number) => void;
  /** Ukuran control (sm, md, lg) */
  size?: ControlSize;
  /** Apakah control disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Konfigurasi constraints */
  config?: Partial<SettingsConfig>;
}

/**
 * Props untuk komponen WritingModeButtons
 */
export interface WritingModeButtonsProps {
  /** Status focus mode */
  focusMode: boolean;
  /** Callback untuk toggle focus mode */
  onFocusModeToggle: () => void;
  /** Status typewriter mode */
  typewriterMode: boolean;
  /** Callback untuk toggle typewriter mode */
  onTypewriterModeToggle: () => void;
  /** Status word wrap */
  wordWrap: boolean;
  /** Callback untuk toggle word wrap */
  onWordWrapToggle: () => void;
  /** Status vim mode */
  vimMode: boolean;
  /** Callback untuk toggle vim mode */
  onVimModeToggle: () => void;
  /** Status zen mode */
  zenMode: boolean;
  /** Callback untuk toggle zen mode */
  onZenModeToggle: () => void;
  /** Ukuran buttons */
  size?: ControlSize;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical' | 'grid';
  /** Custom className */
  className?: string;
}

/**
 * Props untuk komponen ResponsiveLayout
 */
export interface ResponsiveLayoutProps {
  /** Children components */
  children: ReactNode;
  /** Breakpoint saat ini */
  breakpoint: BreakpointType;
  /** Custom className */
  className?: string;
  /** Custom styles untuk setiap breakpoint */
  breakpointStyles?: Partial<Record<BreakpointType, string>>;
}

/**
 * Return type untuk hook useWritingSettings
 */
export interface UseWritingSettingsReturn {
  /** Konfigurasi settings saat ini */
  config: SettingsConfig;
  /** Fungsi untuk validasi font size */
  validateFontSize: (size: number) => number;
  /** Fungsi untuk validasi line height */
  validateLineHeight: (height: number) => number;
  /** Fungsi untuk format font size display */
  formatFontSize: (size: number) => string;
  /** Fungsi untuk format line height display */
  formatLineHeight: (height: number) => string;
}

/**
 * Return type untuk hook useResponsiveLayout
 */
export interface UseResponsiveLayoutReturn {
  /** Breakpoint saat ini */
  breakpoint: BreakpointType;
  /** Apakah sedang di mobile */
  isMobile: boolean;
  /** Apakah sedang di tablet */
  isTablet: boolean;
  /** Apakah sedang di desktop */
  isDesktop: boolean;
  /** Width window saat ini */
  windowWidth: number;
}

/**
 * Interface untuk konfigurasi writing mode
 */
export interface WritingModeConfig {
  /** ID mode */
  id: WritingMode;
  /** Label untuk display */
  label: string;
  /** Icon name */
  iconName: string;
  /** Deskripsi mode */
  description: string;
  /** Apakah mode aktif secara default */
  defaultActive: boolean;
}

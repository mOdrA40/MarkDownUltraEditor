/**
 * Theme Selector Hooks
 * Custom hooks untuk mengelola state dan logic theme selector
 * 
 * @author Axel Modra
 */
import { useCallback, useMemo } from 'react';
import type { Theme } from '../types/theme.types';
import {
  getNextTheme,
  getPreviousTheme,
  createThemeGradient,
  getContrastTextColor
} from '../utils/theme.utils';
import { themes } from '../constants/themes.constants';
/**
 * Props untuk useThemeSelector hook
 */
interface UseThemeSelectorProps {
  /** Tema yang sedang aktif */
  currentTheme: Theme;
  /** Callback ketika tema berubah */
  onThemeChange: (theme: Theme) => void;
}
/**
 * Return type untuk useThemeSelector hook
 */
interface UseThemeSelectorReturn {
  /** Daftar semua tema yang tersedia */
  availableThemes: Theme[];
  /** Tema yang sedang aktif */
  currentTheme: Theme;
  /** Fungsi untuk mengubah tema */
  changeTheme: (theme: Theme) => void;
  /** Fungsi untuk beralih ke tema berikutnya */
  nextTheme: () => void;
  /** Fungsi untuk beralih ke tema sebelumnya */
  previousTheme: () => void;
  /** Fungsi untuk mengecek apakah tema sedang aktif */
  isThemeActive: (theme: Theme) => boolean;
  /** Fungsi untuk mendapatkan gradient CSS tema */
  getThemeGradient: (theme: Theme) => string;
  /** Fungsi untuk mendapatkan warna teks kontras */
  getTextColor: (theme: Theme) => string;
}
/**
 * Custom hook untuk mengelola theme selector
 * Menyediakan semua functionality yang dibutuhkan untuk theme selection
 * 
 * @param props - Props untuk hook
 * @returns Object dengan state dan functions untuk theme management
 */
export const useThemeSelector = ({
  currentTheme,
  onThemeChange
}: UseThemeSelectorProps): UseThemeSelectorReturn => {
  
  /**
   * Memoized list of available themes
   * Mencegah re-render yang tidak perlu
   */
  const availableThemes = useMemo(() => themes, []);
  /**
   * Fungsi untuk mengubah tema
   * Menggunakan useCallback untuk optimasi performa
   */
  const changeTheme = useCallback((theme: Theme) => {
    if (theme.id !== currentTheme.id) {
      onThemeChange(theme);
    }
  }, [currentTheme.id, onThemeChange]);
  /**
   * Fungsi untuk beralih ke tema berikutnya
   */
  const nextTheme = useCallback(() => {
    const next = getNextTheme(currentTheme);
    changeTheme(next);
  }, [currentTheme, changeTheme]);
  /**
   * Fungsi untuk beralih ke tema sebelumnya
   */
  const previousTheme = useCallback(() => {
    const previous = getPreviousTheme(currentTheme);
    changeTheme(previous);
  }, [currentTheme, changeTheme]);
  /**
   * Fungsi untuk mengecek apakah tema sedang aktif
   */
  const isThemeActive = useCallback((theme: Theme) => {
    return theme.id === currentTheme.id;
  }, [currentTheme.id]);
  /**
   * Fungsi untuk mendapatkan gradient CSS tema
   */
  const getThemeGradient = useCallback((theme: Theme) => {
    return createThemeGradient(theme);
  }, []);
  /**
   * Fungsi untuk mendapatkan warna teks kontras
   */
  const getTextColor = useCallback((theme: Theme) => {
    return getContrastTextColor(theme);
  }, []);
  return {
    availableThemes,
    currentTheme,
    changeTheme,
    nextTheme,
    previousTheme,
    isThemeActive,
    getThemeGradient,
    getTextColor
  };
};
/**
 * Props untuk useThemeButton hook
 */
interface UseThemeButtonProps {
  /** Data tema untuk button */
  theme: Theme;
  /** Tema yang sedang aktif */
  currentTheme: Theme;
  /** Callback ketika button diklik */
  onClick: (theme: Theme) => void;
  /** Mode kompak (opsional) */
  compact?: boolean;
}
/**
 * Return type untuk useThemeButton hook
 */
interface UseThemeButtonReturn {
  /** Apakah button ini aktif */
  isActive: boolean;
  /** Style CSS untuk button */
  buttonStyle: React.CSSProperties;
  /** Class CSS untuk button */
  buttonClassName: string;
  /** Handler untuk click event */
  handleClick: () => void;
  /** Aria label untuk accessibility */
  ariaLabel: string;
}
/**
 * Custom hook untuk individual theme button
 * Mengelola state dan behavior untuk satu theme button
 * 
 * @param props - Props untuk hook
 * @returns Object dengan state dan functions untuk theme button
 */
export const useThemeButton = ({
  theme,
  currentTheme,
  onClick,
  compact = false
}: UseThemeButtonProps): UseThemeButtonReturn => {
  
  /**
   * Mengecek apakah button ini aktif
   */
  const isActive = useMemo(() => {
    return theme.id === currentTheme.id;
  }, [theme.id, currentTheme.id]);
  /**
   * Style CSS untuk button background
   */
  const buttonStyle = useMemo((): React.CSSProperties => ({
    background: createThemeGradient(theme)
  }), [theme]);
  /**
   * Class CSS untuk button
   * Clean styling tanpa border circle, hanya checkmark sebagai indikator
   */
  const buttonClassName = useMemo(() => {
    const baseClasses = [
      'relative',
      'p-0',
      'rounded-full',
      'border-none', // Hilangkan border
      'theme-button-fix', // Menggunakan CSS fix untuk mencegah scroll
      'focus:outline-none', // Hilangkan outline
      'focus:ring-0', // Hilangkan ring
      'focus-fix' // Tambahan fix untuk focus state
    ];
    // Tambahkan ukuran berdasarkan mode compact
    if (compact) {
      baseClasses.push('h-6', 'w-6');
    } else {
      baseClasses.push('h-8', 'w-8');
    }
    return baseClasses.join(' ');
  }, [compact]);
  /**
   * Handler untuk click event
   */
  const handleClick = useCallback(() => {
    onClick(theme);
  }, [theme, onClick]);
  /**
   * Aria label untuk accessibility
   */
  const ariaLabel = useMemo(() => {
    return `Select ${theme.name} theme${isActive ? ' (currently active)' : ''}`;
  }, [theme.name, isActive]);
  return {
    isActive,
    buttonStyle,
    buttonClassName,
    handleClick,
    ariaLabel
  };
};

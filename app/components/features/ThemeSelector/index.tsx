/**
 * ThemeSelector Module - Main Export
 * Entry point untuk semua exports dari ThemeSelector module
 * 
 * @author Axel Modra
 */

// Export komponen utama
export { ThemeSelector } from './components/ThemeSelector';
export { ThemeButton } from './components/ThemeButton';

// Export types
export type {
  Theme,
  ThemeSelectorProps,
  ThemeButtonProps,
  ThemeId,
  ThemeColorCategory,
  ThemeConfig
} from './types/theme.types';

// Export constants
export {
  themes,
  themeMap,
  availableThemeIds,
  DEFAULT_THEME_ID,
  DEFAULT_THEME,
  THEME_BUTTON_SIZES,
  THEME_ANIMATIONS
} from './constants/themes.constants';

// Export utilities
export {
  findThemeById,
  getThemeWithFallback,
  isValidThemeId,
  getThemeColor,
  createThemeGradient,
  isDarkTheme,
  getContrastTextColor,
  hexToRgb,
  calculateLuminance,
  calculateContrastRatio,
  meetsWCAGAA,
  getNextTheme,
  getPreviousTheme
} from './utils/theme.utils';

// Export hooks
export {
  useThemeSelector,
  useThemeButton
} from './hooks/useThemeSelector';

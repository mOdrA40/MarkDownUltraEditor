/**
 * WritingSettings Module - Main Export
 * Entry point untuk semua exports dari WritingSettings module
 *
 * @author Axel Modra
 */

// Export shared useMediaQuery hook
export { useMediaQuery } from '~/hooks/useMediaQuery';
export { FontSizeControl } from './components/FontSizeControl';
export { LineHeightControl } from './components/LineHeightControl';
export { ResponsiveLayout } from './components/ResponsiveLayout';
export { WritingModeButtons } from './components/WritingModeButtons';
// Export komponen utama
// Default export untuk backward compatibility
export { WritingSettings, WritingSettings as default } from './components/WritingSettings';
// Export constants
export {
  A11Y,
  ANIMATIONS,
  BREAKPOINTS,
  CONTROL_SIZES,
  DEFAULT_SETTINGS,
  FONT_SIZE_CONSTRAINTS,
  KEYBOARD_SHORTCUTS,
  LINE_HEIGHT_CONSTRAINTS,
  RESPONSIVE_CLASSES,
  WRITING_MODES,
} from './constants/settings.constants';
// Export hooks
export {
  useIsDesktop,
  useIsMobile,
  useIsTablet,
  useResponsiveLayout,
  useWindowDimensions,
  useWritingSettings,
} from './hooks/useWritingSettings';
// Export types
export type {
  BreakpointType,
  ControlSize,
  FontSizeControlProps,
  LineHeightControlProps,
  ResponsiveLayoutProps,
  SettingsConfig,
  UseResponsiveLayoutReturn,
  UseWritingSettingsReturn,
  WritingMode,
  WritingModeButtonsProps,
  WritingModeConfig,
  WritingSettingsProps,
} from './types/settings.types';
// Export responsive utilities
export {
  debounce,
  getBreakpointFromWidth,
  getCurrentBreakpoint,
  getMediaQuery,
  getOrientation,
  getPreferredColorScheme,
  getSafeAreaInsets,
  getViewportDimensions,
  isDesktopWidth,
  isLandscape,
  isMobileWidth,
  isPortrait,
  isSmallTabletWidth,
  isTabletWidth,
  isTouchDevice,
  matchesMediaQuery,
  throttle,
} from './utils/responsive.utils';
// Export utilities
export {
  formatFontSize,
  formatLineHeight,
  getNextFontSize,
  getNextLineHeight,
  getPreviousFontSize,
  getPreviousLineHeight,
  getSettingsConfig,
  isMaxFontSize,
  isMaxLineHeight,
  isMinFontSize,
  isMinLineHeight,
  validateFontSize,
  validateLineHeight,
  validateSettingsConfig,
} from './utils/settings.utils';

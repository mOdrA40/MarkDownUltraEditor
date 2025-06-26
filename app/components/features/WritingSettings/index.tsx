/**
 * WritingSettings Module - Main Export
 * Entry point untuk semua exports dari WritingSettings module
 * 
 * @author Axel Modra
 */

// Export komponen utama
export { WritingSettings } from './components/WritingSettings';
export { FontSizeControl } from './components/FontSizeControl';
export { LineHeightControl } from './components/LineHeightControl';
export { WritingModeButtons } from './components/WritingModeButtons';
export { ResponsiveLayout } from './components/ResponsiveLayout';

// Export types
export type {
  WritingSettingsProps,
  FontSizeControlProps,
  LineHeightControlProps,
  WritingModeButtonsProps,
  ResponsiveLayoutProps,
  WritingMode,
  SettingsConfig,
  BreakpointType,
  ControlSize,
  WritingModeConfig,
  UseWritingSettingsReturn,
  UseResponsiveLayoutReturn
} from './types/settings.types';

// Export constants
export {
  FONT_SIZE_CONSTRAINTS,
  LINE_HEIGHT_CONSTRAINTS,
  WRITING_MODES,
  BREAKPOINTS,
  CONTROL_SIZES,
  DEFAULT_SETTINGS,
  RESPONSIVE_CLASSES,
  ANIMATIONS,
  A11Y,
  KEYBOARD_SHORTCUTS
} from './constants/settings.constants';

// Export utilities
export {
  validateFontSize,
  validateLineHeight,
  getNextFontSize,
  getPreviousFontSize,
  getNextLineHeight,
  getPreviousLineHeight,
  formatFontSize,
  formatLineHeight,
  isMinFontSize,
  isMaxFontSize,
  isMinLineHeight,
  isMaxLineHeight,
  getSettingsConfig,
  validateSettingsConfig
} from './utils/settings.utils';

// Export responsive utilities
export {
  getBreakpointFromWidth,
  isMobileWidth,
  isSmallTabletWidth,
  isTabletWidth,
  isDesktopWidth,
  getMediaQuery,
  matchesMediaQuery,
  getCurrentBreakpoint,
  debounce,
  throttle,
  getViewportDimensions,
  isTouchDevice,
  getOrientation,
  isLandscape,
  isPortrait,
  getSafeAreaInsets,
  getPreferredColorScheme
} from './utils/responsive.utils';

// Export hooks
export {
  useWritingSettings,
  useResponsiveLayout,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useWindowDimensions,
  useMediaQuery
} from './hooks/useWritingSettings';

// Default export untuk backward compatibility
export { WritingSettings as default } from './components/WritingSettings';

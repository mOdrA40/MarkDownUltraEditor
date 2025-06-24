
/**
 * WritingSettings Module - Main Export
 * Entry point untuk semua exports dari WritingSettings module
 *
 * @author Senior Developer
 * @version 2.0.0
 */

// Export komponen utama
export { WritingSettings } from './WritingSettings/components/WritingSettings';
export { FontSizeControl } from './WritingSettings/components/FontSizeControl';
export { LineHeightControl } from './WritingSettings/components/LineHeightControl';
export { WritingModeButtons } from './WritingSettings/components/WritingModeButtons';
export { ResponsiveLayout } from './WritingSettings/components/ResponsiveLayout';

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
  ControlSize
} from './WritingSettings/types/settings.types';

// Export constants
export {
  FONT_SIZE_CONSTRAINTS,
  LINE_HEIGHT_CONSTRAINTS,
  WRITING_MODES,
  BREAKPOINTS,
  CONTROL_SIZES,
  DEFAULT_SETTINGS
} from './WritingSettings/constants/settings.constants';

// Export utilities
export {
  validateFontSize,
  validateLineHeight,
  getNextFontSize,
  getPreviousFontSize,
  getNextLineHeight,
  getPreviousLineHeight,
  formatFontSize,
  formatLineHeight
} from './WritingSettings/utils/settings.utils';

// Export hooks
export {
  useWritingSettings,
  useResponsiveLayout
} from './WritingSettings/hooks/useWritingSettings';

// Default export untuk backward compatibility
export { WritingSettings as default } from './WritingSettings/components/WritingSettings';

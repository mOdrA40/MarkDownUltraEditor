/**
 * Toolbar Module - Main Export
 * Entry point untuk semua exports dari Toolbar module
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

// Export komponen utama
export { Toolbar } from './components/Toolbar';
export { ToolbarButton } from './components/ToolbarButton';
export { MobileToolbar } from './components/MobileToolbar';
export { TabletToolbar } from './components/TabletToolbar';
export { DesktopToolbar } from './components/DesktopToolbar';

// Export types
export type {
  FormatButton,
  ButtonCategory,
  ToolbarProps,
  ToolbarButtonProps,
  ResponsiveToolbarProps,
  MobileToolbarProps,
  TabletToolbarProps,
  DesktopToolbarProps,
  ToolbarConfig,
  MarkdownTemplate,
  ButtonGroup,
  ButtonGroupProps
} from './types/toolbar.types';

// Export constants
export {
  MARKDOWN_TEMPLATES,
  FORMAT_BUTTON_CONFIGS,
  BUTTON_GROUPS,
  RESPONSIVE_BREAKPOINTS,
  BUTTON_SIZES,
  TOOLBAR_ANIMATIONS,
  type FormatButtonConfig
} from './constants/formatButtons.constants';

// Export utilities
export {
  createFormatButton,
  createFormatButtons,
  createCodeBlockAction,
  filterButtonsByCategory,
  groupButtonsByCategory,
  getBreakpoint,
  getBreakpointConfig,
  chunkButtons,
  getButtonClasses,
  getContainerClasses,
  isValidMarkdownTemplate,
  escapeMarkdown,
  parseShortcut,
  matchesShortcut
} from './utils/toolbar.utils';

// Export hooks
export {
  useToolbar,
  useKeyboardShortcuts,
  useResponsiveLayout
} from './hooks/useToolbar';

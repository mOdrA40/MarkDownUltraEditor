/**
 * @fileoverview Main utilities exports - Centralized utility management
 * @author Axel Modra
 */

// Specific exports to avoid conflicts
export {
  addSkipLink,
  announceToScreenReader,
  generateAccessibleId,
  getContrastRatio,
  getFocusableElements as getAccessibilityFocusableElements,
  isFocusable as isAccessibilityFocusable,
  KeyboardNavigation,
  meetsContrastRequirement,
  ScreenReader,
  trapFocus,
} from '../utils/accessibility';
export {
  codeTemplates,
  getTemplatesByCategory as getCodeTemplatesByCategory,
} from '../utils/codeTemplates';
export {
  documentTemplates,
  getTemplatesByCategory as getDocumentTemplatesByCategory,
} from '../utils/documentTemplates';
export {
  debounce as headingDebounce,
  generateHeadingId,
  isElementInViewport as isHeadingElementInViewport,
  parseMarkdownHeadings,
  scrollToHeading,
  throttle as headingThrottle,
} from '../utils/headingUtils';
export {
  calculateTargetIndex,
  getFocusableElements as getNavigationFocusableElements,
  isFocusable as isNavigationFocusable,
} from '../utils/keyboardNavigationUtils';
export { handleOutlineItemClick } from '../utils/outlineUtils';
export {
  BREAKPOINTS,
  debounce as responsiveDebounce,
  getDeviceType,
  MEDIA_QUERIES,
  throttle as responsiveThrottle,
} from '../utils/responsive';
export {
  formatCategoryName,
  formatDifficultyName,
  generateTemplateFileName,
  getCardClasses,
  getDialogClasses,
  getGridClasses,
  getResponsiveButtonSize,
  getResponsiveIconSize,
  getResponsivePadding,
  getResponsiveTextSize,
  getTruncatedTags,
  isValidTemplate,
  sortTemplates,
} from '../utils/templateUtils';
export * from '../utils/testing';
export * from '../utils/toastUtils';
export * from '../utils/vimUtils';
export {
  areSettingsEqual,
  debounce as writingSettingsDebounce,
  exportWritingSettings,
  getSettingsDiff,
  importWritingSettings,
  loadSettingsFromStorage,
  sanitizeWritingSettings,
  saveSettingsToStorage,
  validateFontSize,
  validateLineHeight,
  validateWritingSettings,
} from '../utils/writingSettingsUtils';
// Re-export utils with consistent naming
export * from './utils';

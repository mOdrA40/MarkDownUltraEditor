/**
 * @fileoverview Main utilities exports - Centralized utility management
 * @author Senior Developer
 * @version 1.0.0
 */

// Re-export utils with consistent naming
export * from './utils';

// Specific exports to avoid conflicts
export {
  announceToScreenReader,
  getFocusableElements as getAccessibilityFocusableElements,
  isFocusable as isAccessibilityFocusable,
  trapFocus,
  generateAccessibleId,
  getContrastRatio,
  meetsContrastRequirement,
  addSkipLink,
  KeyboardNavigation,
  ScreenReader
} from '../utils/accessibility';

export {
  codeTemplates,
  getTemplatesByCategory as getCodeTemplatesByCategory
} from '../utils/codeTemplates';

export {
  documentTemplates,
  getTemplatesByCategory as getDocumentTemplatesByCategory
} from '../utils/documentTemplates';

export {
  parseMarkdownHeadings,
  generateHeadingId,
  scrollToHeading,
  debounce as headingDebounce,
  throttle as headingThrottle,
  isElementInViewport as isHeadingElementInViewport
} from '../utils/headingUtils';

export {
  calculateTargetIndex,
  getFocusableElements as getNavigationFocusableElements,
  isFocusable as isNavigationFocusable
} from '../utils/keyboardNavigationUtils';

export { handleOutlineItemClick } from '../utils/outlineUtils';

export {
  BREAKPOINTS,
  MEDIA_QUERIES,
  getDeviceType,
  debounce as responsiveDebounce,
  throttle as responsiveThrottle
} from '../utils/responsive';

export {
  generateTemplateFileName,
  formatCategoryName,
  formatDifficultyName,
  getGridClasses,
  getDialogClasses,
  getResponsivePadding,
  getResponsiveTextSize,
  getResponsiveIconSize,
  getResponsiveButtonSize,
  getTruncatedTags,
  getCardClasses,
  isValidTemplate,
  sortTemplates
} from '../utils/templateUtils';
export * from '../utils/testing';
export * from '../utils/toastUtils';
export * from '../utils/vimUtils';
export {
  validateFontSize,
  validateLineHeight,
  validateWritingSettings,
  sanitizeWritingSettings,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  exportWritingSettings,
  importWritingSettings,
  debounce as writingSettingsDebounce,
  areSettingsEqual,
  getSettingsDiff
} from '../utils/writingSettingsUtils';

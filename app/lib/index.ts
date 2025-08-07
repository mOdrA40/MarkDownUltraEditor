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
} from "../utils/accessibility";
export {
  codeTemplates,
  getTemplatesByCategory as getCodeTemplatesByCategory,
} from "../utils/codeTemplates";
// Import performance utilities from common (avoid duplication)
export {
  debounce as headingDebounce,
  debounce as responsiveDebounce,
  debounce as writingSettingsDebounce,
  throttle as headingThrottle,
  throttle as responsiveThrottle,
} from "../utils/common";
export {
  documentTemplates,
  getTemplatesByCategory as getDocumentTemplatesByCategory,
} from "../utils/documentTemplates";
export {
  generateHeadingId,
  isElementInViewport as isHeadingElementInViewport,
  parseMarkdownHeadings,
  scrollToHeading,
} from "../utils/headingUtils";
export {
  calculateTargetIndex,
  getFocusableElements as getNavigationFocusableElements,
  isFocusable as isNavigationFocusable,
} from "../utils/keyboardNavigationUtils";
export { handleOutlineItemClick } from "../utils/outlineUtils";
export { BREAKPOINTS, getDeviceType, MEDIA_QUERIES } from "../utils/responsive";
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
} from "../utils/templateUtils";
export * from "../utils/vimUtils";
export {
  areSettingsEqual,
  exportWritingSettings,
  getSettingsDiff,
  importWritingSettings,
  loadSettingsFromStorage,
  sanitizeWritingSettings,
  saveSettingsToStorage,
  validateFontSize,
  validateLineHeight,
  validateWritingSettings,
} from "../utils/writingSettingsUtils";
// Re-export utils with consistent naming
export * from "./utils";

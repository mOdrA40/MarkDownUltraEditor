/**
 * @fileoverview Application constants and configuration
 * @author Senior Developer
 * @version 1.0.0
 */

import { EditorConfig } from '../types';
import { Breakpoints, MediaQueries } from '../types/responsive.types';

/**
 * Application metadata
 */
export const APP_INFO = {
  NAME: 'Advanced Markdown Editor',
  VERSION: '1.0.0',
  AUTHOR: 'Senior Developer',
  DESCRIPTION: 'A beautiful markdown editor with live preview and amazing features'
} as const;

/**
 * Default editor configuration
 */
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  defaultSettings: {
    fontSize: 14,
    lineHeight: 1.6,
    focusMode: false,
    typewriterMode: false,
    wordWrap: true,
    vimMode: false,
    zenMode: false
  },
  breakpoints: {
    mobile: 499,
    tablet: 1023,
    desktop: 1440
  },
  autoSave: {
    enabled: true,
    debounceMs: 2000
  },
  undoRedo: {
    maxHistorySize: 50,
    debounceMs: 500
  }
};

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS: Breakpoints = {
  mobile: 499,
  smallTablet: 767,
  tablet: 1023,
  desktop: 1439,
  largeDesktop: 1440
};

/**
 * Media queries
 */
export const MEDIA_QUERIES: MediaQueries = {
  mobile: '(max-width: 499px)',
  smallTablet: '(min-width: 500px) and (max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px) and (max-width: 1439px)',
  largeDesktop: '(min-width: 1440px)',
  touchDevice: '(pointer: coarse)',
  hoverDevice: '(hover: hover)',
  highDensity: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  CONTENT: 'markdownEditor_content',
  FILE_NAME: 'markdownEditor_fileName',
  THEME: 'markdownEditor_theme',
  SETTINGS: 'markdownEditor_settings',
  UI_STATE: 'markdownEditor_uiState',
  WINDOW_STATE: 'markdownEditor_windowState'
} as const;

/**
 * Default file names and content
 */
export const DEFAULT_FILE = {
  NAME: 'untitled.md',
  CONTENT: `# Welcome to Advanced Markdown Editor

This is a **beautiful** markdown editor with live preview and amazing features!

## 🎨 New Colorful Themes

Choose from multiple beautiful themes:
- 🌊 Ocean - Cool blues and cyans
- 🌲 Forest - Natural greens
- 🌅 Sunset - Warm oranges and reds
- 💜 Purple - Rich purples and violets
- 🌹 Rose - Elegant pinks and roses
- 🌙 Dark - Classic dark mode

## ✨ Enhanced Features

- 📝 Advanced typography controls
- 🎯 Focus mode for distraction-free writing
- ⌨️ Typewriter mode (centers current line)
- 📊 Detailed writing statistics
- 🗺️ Document outline and minimap
- 🧘 Zen mode for minimal interface
- ⚙️ Vim key bindings support
- 📏 Adjustable font size and line height
- 📱 Fully responsive design
- ⌨️ Keyboard shortcuts support
- ⏪ **Undo/Redo**: Full undo/redo support with keyboard shortcuts

## Keyboard Shortcuts

- \`Ctrl/Cmd + B\` - Bold text
- \`Ctrl/Cmd + I\` - Italic text
- \`Ctrl/Cmd + K\` - Insert link
- \`Ctrl/Cmd + Z\` - Undo
- \`Ctrl/Cmd + Y\` - Redo (or Ctrl/Cmd + Shift + Z)
- \`Ctrl/Cmd + /\` - Toggle preview
- \`Ctrl/Cmd + .\` - Toggle zen mode
- \`F11\` - Fullscreen

Happy writing with style! 🚀✨`
} as const;

/**
 * Keyboard shortcuts configuration
 */
export const KEYBOARD_SHORTCUTS = {
  BOLD: { key: 'b', ctrlKey: true, text: '**Bold Text**' },
  ITALIC: { key: 'i', ctrlKey: true, text: '*Italic Text*' },
  LINK: { key: 'k', ctrlKey: true, text: '[Link Text](https://example.com)' },
  CODE: { key: '`', ctrlKey: true, text: '`code`' },
  UNDO: { key: 'z', ctrlKey: true },
  REDO: { key: 'y', ctrlKey: true },
  REDO_ALT: { key: 'z', ctrlKey: true, shiftKey: true },
  TOGGLE_PREVIEW: { key: '/', ctrlKey: true },
  TOGGLE_ZEN: { key: '.', ctrlKey: true },
  SHOW_SHORTCUTS: { key: '?', ctrlKey: true },
  FULLSCREEN: { key: 'F11' },
  SAVE: { key: 's', ctrlKey: true },
  NEW_FILE: { key: 'n', ctrlKey: true },
  OPEN_FILE: { key: 'o', ctrlKey: true }
} as const;

/**
 * UI element IDs and classes
 */
export const UI_ELEMENTS = {
  EDITOR_CONTAINER: 'markdown-editor-container',
  EDITOR_TEXTAREA: 'markdown-editor-textarea',
  PREVIEW_CONTAINER: 'markdown-preview-container',
  TOOLBAR: 'markdown-toolbar',
  SIDEBAR: 'markdown-sidebar',
  HEADER: 'markdown-header',
  FOOTER: 'markdown-footer'
} as const;

/**
 * CSS class names
 */
export const CSS_CLASSES = {
  MOBILE: 'mobile-device',
  TABLET: 'tablet-device',
  DESKTOP: 'desktop-device',
  TOUCH_DEVICE: 'touch-device',
  FOCUS_MODE: 'focus-mode',
  ZEN_MODE: 'zen-mode',
  TYPEWRITER_MODE: 'typewriter-mode',
  VIM_MODE: 'vim-mode',
  DARK_THEME: 'dark-theme',
  LIGHT_THEME: 'light-theme',
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
  PREVIEW_HIDDEN: 'preview-hidden'
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
} as const;

/**
 * Debounce delays (in milliseconds)
 */
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  AUTO_SAVE: 2000,
  RESIZE: 100,
  SCROLL: 50,
  INPUT: 500
} as const;

/**
 * File size limits (in bytes)
 */
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,  // 5MB
  MAX_HISTORY_SIZE: 50,
  MAX_UNDO_STEPS: 100
} as const;

/**
 * Supported file types
 */
export const SUPPORTED_FILE_TYPES = {
  MARKDOWN: ['.md', '.markdown', '.mdown', '.mkd'],
  TEXT: ['.txt'],
  ALL: ['.md', '.markdown', '.mdown', '.mkd', '.txt']
} as const;

/**
 * Export formats
 */
export const EXPORT_FORMATS = {
  HTML: 'html',
  PDF: 'pdf',
  DOCX: 'docx',
  MARKDOWN: 'md',
  TEXT: 'txt'
} as const;

/**
 * Theme configuration
 */
export const THEME_CONFIG = {
  DEFAULT_THEME_ID: 'ocean',
  THEME_TRANSITION_DURATION: 300,
  CSS_VARIABLE_PREFIX: '--theme-'
} as const;

/**
 * Performance monitoring
 */
export const PERFORMANCE_CONFIG = {
  ENABLE_MONITORING: process.env.NODE_ENV === 'development',
  SAMPLE_RATE: 0.1,
  MAX_METRICS_HISTORY: 100
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a markdown file',
  LOAD_ERROR: 'Failed to load the file',
  SAVE_ERROR: 'Failed to save the file',
  THEME_ERROR: 'Failed to apply theme',
  NETWORK_ERROR: 'Network connection error',
  UNKNOWN_ERROR: 'An unknown error occurred'
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  FILE_LOADED: 'File loaded successfully',
  FILE_SAVED: 'File saved successfully',
  AUTO_SAVED: 'Auto-saved',
  THEME_APPLIED: 'Theme applied successfully',
  TEMPLATE_LOADED: 'Template loaded successfully',
  IMAGE_INSERTED: 'Image inserted successfully'
} as const;

/**
 * Accessibility configuration
 */
export const A11Y_CONFIG = {
  MIN_TOUCH_TARGET: 44, // pixels
  MIN_CONTRAST_RATIO: 4.5,
  FOCUS_OUTLINE_WIDTH: 2, // pixels
  SCREEN_READER_DELAY: 100 // milliseconds
} as const;

/**
 * Development configuration
 */
export const DEV_CONFIG = {
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_DEBUG_MODE: process.env.NODE_ENV === 'development',
  SHOW_PERFORMANCE_METRICS: process.env.NODE_ENV === 'development'
} as const;

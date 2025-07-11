/*
Constants
@author Axel Modra
 */

import type { EditorConfig } from '../types';
import type { Breakpoints } from '../types/responsive.types';

/**
 * Application metadata
 */
export const APP_INFO = {
  NAME: 'Advanced Markdown Editor',
  VERSION: '1.0.0',
  AUTHOR: 'Axel Modra',
  DESCRIPTION: 'A beautiful markdown editor with live preview and amazing features',
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
    zenMode: false,
  },
  breakpoints: {
    mobile: 499,
    tablet: 1023,
    desktop: 1440,
  },
  autoSave: {
    enabled: true,
    debounceMs: 2000,
  },
  undoRedo: {
    maxHistorySize: 50,
    debounceMs: 500,
  },
};

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS: Breakpoints = {
  mobile: 499,
  smallTablet: 767,
  tablet: 1023,
  desktop: 1439,
  largeDesktop: 1440,
};

/**
 * Media queries
 */
export { MEDIA_QUERIES } from '@/utils/responsive';

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  CONTENT: 'markdownEditor_content',
  FILE_NAME: 'markdownEditor_fileName',
  THEME: 'markdownEditor_theme',
  SETTINGS: 'markdownEditor_settings',
  UI_STATE: 'markdownEditor_uiState',
  WINDOW_STATE: 'markdownEditor_windowState',
} as const;

/**
 * Welcome template content for advanced editor
 */
const WELCOME_TEMPLATE = `# Welcome to Advanced Markdown Editor

Welcome to the most powerful markdown editor with advanced features and beautiful themes! 🚀

## ✨ Key Features

### 📝 **Advanced Writing Experience**
- **Live Preview**: See your markdown rendered in real-time
- **Multiple Themes**: Choose from Ocean, Forest, Sunset, Purple, Rose, and Dark themes
- **Focus Mode**: Distraction-free writing environment
- **Typewriter Mode**: Keep your current line centered
- **Vim Mode**: For power users who love vim keybindings

### 🎨 **Beautiful Themes**
- **Ocean**: Cool blue tones for a calm writing experience
- **Forest**: Natural green colors for organic feel
- **Sunset**: Warm orange and red hues for creativity
- **Purple**: Elegant purple shades for sophistication
- **Rose**: Soft pink tones for gentle writing
- **Dark**: Professional dark theme for night writing

### 📊 **Smart Analytics**
- **Real-time Statistics**: Word count, character count, reading time
- **Document Structure**: Automatic heading analysis
- **Writing Progress**: Track your productivity

### 🔧 **Powerful Tools**
- **Export+**: Advanced export to PDF, DOCX, HTML, and Slides
- **Template Library**: Pre-built templates for various document types
- **File Operations**: Import, export, and manage your documents
- **Keyboard Shortcuts**: Efficient workflow with customizable shortcuts

## 🚀 Getting Started

1. **Start Writing**: Simply click in this editor and start typing
2. **Choose Your Theme**: Use the theme selector in the top bar
3. **Customize Settings**: Adjust font size, line height, and writing modes
4. **Export Your Work**: Use Export+ for professional document output

## 💡 Pro Tips

- Use \`Ctrl/Cmd + K\` to open the command palette
- Try different themes to find your perfect writing environment
- Enable Focus Mode for distraction-free writing
- Use the template library for quick document creation
- Export to different formats for various use cases

## 📚 Markdown Syntax Quick Reference

### Headers
\`\`\`markdown
# H1 Header
## H2 Header
### H3 Header
\`\`\`

### Text Formatting
\`\`\`markdown
**Bold text**
*Italic text*
~~Strikethrough~~
\`inline code\`
\`\`\`

### Lists
\`\`\`markdown
- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Another item
\`\`\`

### Links and Images
\`\`\`markdown
[Link text](https://example.com)
![Image alt text](image-url.jpg)
\`\`\`

### Code Blocks
\`\`\`markdown
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`



### Tables

| Column 1 | Column 2 | Column 3 |
|---|---|---|
| Row 1    | Data     | More     |
| Row 2    | Data     | More     |


### Blockquotes
\`\`\`markdown
> This is a blockquote
> It can span multiple lines
\`\`\`

---

**Happy Writing!** 🎉

*Start creating amazing documents with our advanced markdown editor. Replace this welcome content with your own text and begin your writing journey.*`;

/**
 * Default file names and content
 */
export const DEFAULT_FILE = {
  NAME: 'welcome-to-advanced-editor.md',
  CONTENT: WELCOME_TEMPLATE,
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
  OPEN_FILE: { key: 'o', ctrlKey: true },
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
  FOOTER: 'markdown-footer',
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
  PREVIEW_HIDDEN: 'preview-hidden',
} as const;

import { ANIMATION_DURATIONS, DEBOUNCE_DELAYS } from '@/utils/common';

export const ANIMATION_DURATION = ANIMATION_DURATIONS;
export const DEBOUNCE_DELAY = DEBOUNCE_DELAYS;

/**
 * File size limits (in bytes)
 */
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  MAX_HISTORY_SIZE: 50,
  MAX_UNDO_STEPS: 100,
} as const;

/**
 * Supported file types
 */
export const SUPPORTED_FILE_TYPES = {
  MARKDOWN: ['.md', '.markdown', '.mdown', '.mkd'],
  TEXT: ['.txt'],
  ALL: ['.md', '.markdown', '.mdown', '.mkd', '.txt'],
} as const;

/**
 * Export formats
 */
export const EXPORT_FORMATS = {
  HTML: 'html',
  PDF: 'pdf',
  DOCX: 'docx',
  MARKDOWN: 'md',
  TEXT: 'txt',
} as const;

/**
 * Theme configuration
 */
export const THEME_CONFIG = {
  DEFAULT_THEME_ID: 'ocean',
  THEME_TRANSITION_DURATION: 300,
  CSS_VARIABLE_PREFIX: '--theme-',
} as const;

/**
 * Performance monitoring
 */
export const PERFORMANCE_CONFIG = {
  ENABLE_MONITORING: process.env.NODE_ENV === 'development',
  SAMPLE_RATE: 0.1,
  MAX_METRICS_HISTORY: 100,
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
  UNKNOWN_ERROR: 'An unknown error occurred',
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
  IMAGE_INSERTED: 'Image inserted successfully',
} as const;

/**
 * Accessibility configuration
 */
export const A11Y_CONFIG = {
  MIN_TOUCH_TARGET: 44,
  MIN_CONTRAST_RATIO: 4.5,
  FOCUS_OUTLINE_WIDTH: 2,
  SCREEN_READER_DELAY: 100,
} as const;

/**
 * Development configuration
 */
export const DEV_CONFIG = {
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_DEBUG_MODE: process.env.NODE_ENV === 'development',
  SHOW_PERFORMANCE_METRICS: process.env.NODE_ENV === 'development',
} as const;

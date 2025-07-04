/**
 * Konstanta data keyboard shortcuts
 * Berisi definisi semua shortcuts yang tersedia dalam aplikasi
 */

import type { ShortcutCategory } from '../types/shortcutTypes';

/**
 * Default keyboard shortcuts for the application
 */
export const DEFAULT_SHORTCUTS: ShortcutCategory[] = [
  {
    category: 'Text Formatting',
    icon: 'Type',
    order: 1,
    items: [
      {
        keys: ['Ctrl', 'B'],
        macKeys: ['⌘', 'B'],
        description: 'Bold text',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'I'],
        macKeys: ['⌘', 'I'],
        description: 'Italic text',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'U'],
        macKeys: ['⌘', 'U'],
        description: 'Underline text',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'K'],
        macKeys: ['⌘', 'K'],
        description: 'Insert link',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'Shift', 'K'],
        macKeys: ['⌘', '⇧', 'K'],
        description: 'Insert code block',
        enabled: true,
      },
      {
        keys: ['Ctrl', '`'],
        macKeys: ['⌘', '`'],
        description: 'Inline code',
        enabled: true,
      },
    ],
  },
  {
    category: 'View & Navigation',
    icon: 'Eye',
    order: 2,
    items: [
      {
        keys: ['Ctrl', '/'],
        macKeys: ['⌘', '/'],
        description: 'Toggle preview',
        enabled: true,
      },
      {
        keys: ['Ctrl', '.'],
        macKeys: ['⌘', '.'],
        description: 'Toggle zen mode',
        enabled: true,
      },
      {
        keys: ['F11'],
        macKeys: ['F11'],
        description: 'Fullscreen mode',
        enabled: true,
      },
      {
        keys: ['Ctrl', '\\'],
        macKeys: ['⌘', '\\'],
        description: 'Toggle sidebar',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'Shift', 'P'],
        macKeys: ['⌘', '⇧', 'P'],
        description: 'Command palette',
        enabled: true,
      },
    ],
  },
  {
    category: 'Search & Navigation',
    icon: 'Search',
    order: 3,
    items: [
      {
        keys: ['Ctrl', 'F'],
        macKeys: ['⌘', 'F'],
        description: 'Find in document',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'G'],
        macKeys: ['⌘', 'G'],
        description: 'Find next',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'Shift', 'G'],
        macKeys: ['⌘', '⇧', 'G'],
        description: 'Find previous',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'H'],
        macKeys: ['⌘', 'H'],
        description: 'Find and replace',
        enabled: true,
      },
      {
        keys: ['Ctrl', '?'],
        macKeys: ['⌘', '?'],
        description: 'Show shortcuts',
        enabled: true,
      },
      {
        keys: ['Esc'],
        macKeys: ['Esc'],
        description: 'Close dialogs',
        enabled: true,
      },
    ],
  },
  {
    category: 'File Operations',
    icon: 'FileText',
    order: 4,
    items: [
      {
        keys: ['Ctrl', 'N'],
        macKeys: ['⌘', 'N'],
        description: 'New file',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'O'],
        macKeys: ['⌘', 'O'],
        description: 'Open file',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'S'],
        macKeys: ['⌘', 'S'],
        description: 'Save file',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'Shift', 'S'],
        macKeys: ['⌘', '⇧', 'S'],
        description: 'Save as',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'Shift', 'E'],
        macKeys: ['⌘', '⇧', 'E'],
        description: 'Export document',
        enabled: true,
      },
    ],
  },
  {
    category: 'Editing',
    icon: 'Edit3',
    order: 5,
    items: [
      {
        keys: ['Ctrl', 'Z'],
        macKeys: ['⌘', 'Z'],
        description: 'Undo',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'Y'],
        macKeys: ['⌘', '⇧', 'Z'],
        description: 'Redo',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'A'],
        macKeys: ['⌘', 'A'],
        description: 'Select all',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'C'],
        macKeys: ['⌘', 'C'],
        description: 'Copy',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'V'],
        macKeys: ['⌘', 'V'],
        description: 'Paste',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'X'],
        macKeys: ['⌘', 'X'],
        description: 'Cut',
        enabled: true,
      },
      {
        keys: ['Tab'],
        macKeys: ['Tab'],
        description: 'Indent',
        enabled: true,
      },
      {
        keys: ['Shift', 'Tab'],
        macKeys: ['⇧', 'Tab'],
        description: 'Outdent',
        enabled: true,
      },
    ],
  },
  {
    category: 'Advanced Features',
    icon: 'Settings',
    order: 6,
    items: [
      {
        keys: ['Ctrl', 'Shift', 'I'],
        macKeys: ['⌘', '⇧', 'I'],
        description: 'Image manager',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'Shift', 'T'],
        macKeys: ['⌘', '⇧', 'T'],
        description: 'Document templates',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'Shift', 'O'],
        macKeys: ['⌘', '⇧', 'O'],
        description: 'Document outline',
        enabled: true,
      },
      {
        keys: ['Ctrl', 'Shift', 'W'],
        macKeys: ['⌘', '⇧', 'W'],
        description: 'Writing statistics',
        enabled: true,
      },
      {
        keys: ['Ctrl', ','],
        macKeys: ['⌘', ','],
        description: 'Preferences',
        enabled: true,
      },
    ],
  },
];

/**
 * Platform-specific key mappings
 */
export const PLATFORM_KEYS = {
  windows: {
    ctrl: 'Ctrl',
    alt: 'Alt',
    shift: 'Shift',
    meta: 'Win',
  },
  mac: {
    ctrl: '⌃',
    alt: '⌥',
    shift: '⇧',
    meta: '⌘',
  },
  linux: {
    ctrl: 'Ctrl',
    alt: 'Alt',
    shift: 'Shift',
    meta: 'Super',
  },
};

/**
 * Special key symbols
 */
export const SPECIAL_KEYS = {
  enter: '↵',
  tab: '⇥',
  space: 'Space',
  backspace: '⌫',
  delete: '⌦',
  escape: '⎋',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

/**
 * Get shortcuts by category
 */
export const getShortcutsByCategory = (category: string): ShortcutCategory | undefined => {
  return DEFAULT_SHORTCUTS.find((cat) => cat.category === category);
};

/**
 * Get all available categories
 */
export const getAllCategories = (): string[] => {
  return DEFAULT_SHORTCUTS.map((cat) => cat.category);
};

/**
 * Filter shortcuts by platform
 */
export const getShortcutsForPlatform = (
  platform: 'windows' | 'mac' | 'linux'
): ShortcutCategory[] => {
  return DEFAULT_SHORTCUTS.map((category) => ({
    ...category,
    items: category.items.map((item) => ({
      ...item,
      keys: platform === 'mac' && item.macKeys ? item.macKeys : item.keys,
    })),
  }));
};

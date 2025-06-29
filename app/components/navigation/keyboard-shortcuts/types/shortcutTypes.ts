/**
 * TypeScript interfaces for Keyboard Shortcuts
 * Defines data structure for shortcuts and categories
 */

import type { Theme } from '@/components/features/ThemeSelector';

export interface ShortcutItem {
  /** Array key combinations (e.g., ["Ctrl", "B"]) */
  keys: string[];
  /** Description of shortcut function */
  description: string;
  /** Platform-specific keys (optional) */
  macKeys?: string[];
  /** Whether shortcut is active/available */
  enabled?: boolean;
}

export interface ShortcutCategory {
  /** Category name */
  category: string;
  /** Icon for category (optional) */
  icon?: string;
  /** Array of shortcut items in category */
  items: ShortcutItem[];
  /** Display order of category */
  order?: number;
}

export interface KeyboardShortcutsProps {
  /** Callback to close dialog */
  onClose: () => void;
  /** Custom shortcuts (optional) */
  customShortcuts?: ShortcutCategory[];
  /** Whether to display Mac-specific keys */
  showMacKeys?: boolean;
  /** Filter categories to display */
  visibleCategories?: string[];
  /** Current theme for styling */
  currentTheme?: Theme;
}

export interface ShortcutCategoryProps {
  /** Shortcut category data */
  category: ShortcutCategory;
  /** Whether to display Mac keys */
  showMacKeys?: boolean;
  /** Category index for styling */
  index: number;
  /** Total categories for separator logic */
  totalCategories: number;
}

export interface ShortcutItemProps {
  /** Shortcut item data */
  item: ShortcutItem;
  /** Whether to display Mac keys */
  showMacKeys?: boolean;
  /** Item index in category */
  index: number;
}

export interface ShortcutKeyProps {
  /** Key to be displayed */
  keyName: string;
  /** Whether this is the last key in combination */
  isLast?: boolean;
  /** Styling variant */
  variant?: 'default' | 'mac' | 'special';
}

export type Platform = 'windows' | 'mac' | 'linux';
export type ShortcutType = 'text' | 'view' | 'navigation' | 'file' | 'custom';

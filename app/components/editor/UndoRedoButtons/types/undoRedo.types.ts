/**
 * UndoRedo Types & Interfaces
 * Definisi TypeScript untuk sistem undo/redo
 *
 * @author Axel Modra
 */

import type { Theme } from '@/components/features/ThemeSelector';

/**
 * Props untuk komponen UndoRedoButtons utama
 */
export interface UndoRedoButtonsProps {
  /** Callback untuk undo action */
  onUndo: () => void;
  /** Callback untuk redo action */
  onRedo: () => void;
  /** Apakah undo tersedia */
  canUndo: boolean;
  /** Apakah redo tersedia */
  canRedo: boolean;
  /** Apakah dalam mode mobile (opsional) */
  isMobile?: boolean;
  /** Apakah dalam mode tablet (opsional) */
  isTablet?: boolean;
  /** Kelas CSS tambahan (opsional) */
  className?: string;
  /** Disabled state (opsional) */
  disabled?: boolean;
  /** Show tooltips (opsional) */
  showTooltips?: boolean;
  /** Compact mode (opsional) */
  compact?: boolean;
  /** Current theme (opsional) */
  currentTheme?: Theme;
}

/**
 * Props untuk komponen UndoRedoButton individual
 */
export interface UndoRedoButtonProps {
  /** Type action (undo atau redo) */
  type: 'undo' | 'redo';
  /** Callback untuk action */
  onClick: () => void;
  /** Apakah button dapat diklik */
  canPerform: boolean;
  /** Kelas CSS tambahan (opsional) */
  className?: string;
  /** Disabled state (opsional) */
  disabled?: boolean;
  /** Show tooltip (opsional) */
  showTooltip?: boolean;
  /** Compact mode (opsional) */
  compact?: boolean;
  /** Keyboard shortcut text (opsional) */
  shortcut?: string;
  /** Current theme (opsional) */
  currentTheme?: Theme;
}

/**
 * Props untuk responsive layout components
 */
export interface ResponsiveUndoRedoProps extends UndoRedoButtonsProps {
  /** Breakpoint saat ini */
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Props untuk mobile layout
 */
export interface MobileUndoRedoProps {
  /** Callback untuk undo */
  onUndo: () => void;
  /** Callback untuk redo */
  onRedo: () => void;
  /** Apakah undo tersedia */
  canUndo: boolean;
  /** Apakah redo tersedia */
  canRedo: boolean;
  /** Kelas CSS tambahan */
  className?: string;
  /** Current theme (opsional) */
  currentTheme?: Theme;
}

/**
 * Props untuk tablet layout
 */
export interface TabletUndoRedoProps {
  /** Callback untuk undo */
  onUndo: () => void;
  /** Callback untuk redo */
  onRedo: () => void;
  /** Apakah undo tersedia */
  canUndo: boolean;
  /** Apakah redo tersedia */
  canRedo: boolean;
  /** Kelas CSS tambahan */
  className?: string;
  /** Current theme (opsional) */
  currentTheme?: Theme;
}

/**
 * Props untuk desktop layout
 */
export interface DesktopUndoRedoProps {
  /** Callback untuk undo */
  onUndo: () => void;
  /** Callback untuk redo */
  onRedo: () => void;
  /** Apakah undo tersedia */
  canUndo: boolean;
  /** Apakah redo tersedia */
  canRedo: boolean;
  /** Kelas CSS tambahan */
  className?: string;
  /** Current theme (opsional) */
  currentTheme?: Theme;
}

/**
 * Interface untuk keyboard shortcut configuration
 */
export interface KeyboardShortcutConfig {
  /** Undo shortcut */
  undo: {
    key: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    description: string;
  };
  /** Redo shortcut */
  redo: {
    key: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    description: string;
  };
}

/**
 * Type untuk action types
 */
export type UndoRedoAction = 'undo' | 'redo';

/**
 * Interface untuk button configuration
 */
export interface ButtonConfig {
  /** Icon component */
  icon: React.ComponentType<{ className?: string }>;
  /** Aria label */
  ariaLabel: string;
  /** Tooltip text */
  tooltip: string;
  /** Keyboard shortcut */
  shortcut: string;
}

/**
 * Type untuk button size variants
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Type untuk button variants
 */
export type ButtonVariant = 'ghost' | 'outline' | 'default';

/**
 * Interface untuk styling configuration
 */
export interface UndoRedoStyling {
  /** Container classes */
  container: string;
  /** Button base classes */
  button: string;
  /** Icon size classes */
  icon: string;
  /** Spacing classes */
  spacing: string;
  /** Animation classes */
  animation: string;
}

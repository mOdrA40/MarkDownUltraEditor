/**
 * Toolbar Types & Interfaces
 * Definisi TypeScript untuk sistem toolbar markdown
 *
 * @author Axel Modra
 */

import type { Theme } from '@/components/features/ThemeSelector';

/**
 * Interface untuk button format markdown
 */
export interface FormatButton {
  /** Label yang ditampilkan pada button */
  label: string;
  /** Fungsi yang dipanggil ketika button diklik */
  action: () => void;
  /** Tooltip text untuk button */
  tooltip: string;
  /** CSS class tambahan untuk styling (opsional) */
  style?: string;
  /** Icon component (opsional) */
  icon?: React.ComponentType<{ className?: string }>;
  /** Kategori button untuk grouping */
  category?: ButtonCategory;
  /** Shortcut keyboard (opsional) */
  shortcut?: string;
}

/**
 * Kategori button untuk grouping
 */
export type ButtonCategory = 'heading' | 'formatting' | 'code' | 'content' | 'list' | 'media';

/**
 * Props untuk komponen Toolbar utama
 */
export interface ToolbarProps {
  /** Callback untuk insert text ke editor */
  onInsertText: (text: string) => void;
  /** Kelas CSS tambahan (opsional) */
  className?: string;
  /** Mode kompak untuk space terbatas (opsional) */
  compact?: boolean;
  /** Disable semua buttons (opsional) */
  disabled?: boolean;
  /** Custom format buttons (opsional) */
  customButtons?: FormatButton[];
  /** Current theme (opsional) */
  currentTheme?: Theme;
}

/**
 * Props untuk komponen ToolbarButton individual
 */
export interface ToolbarButtonProps {
  /** Data button */
  button: FormatButton;
  /** Kelas CSS tambahan (opsional) */
  className?: string;
  /** Ukuran button */
  size?: 'sm' | 'lg' | 'default' | 'icon';
  /** Variant button */
  variant?: 'ghost' | 'outline' | 'default';
  /** Disabled state */
  disabled?: boolean;
  /** Current theme (opsional) */
  currentTheme?: Theme;
}

/**
 * Props untuk layout responsive toolbar
 */
export interface ResponsiveToolbarProps extends ToolbarProps {
  /** Breakpoint saat ini */
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  /** Apakah dalam mode mobile */
  isMobile?: boolean;
  /** Apakah dalam mode tablet */
  isTablet?: boolean;
}

/**
 * Props untuk mobile toolbar layout
 */
export interface MobileToolbarProps {
  /** Daftar format buttons */
  formatButtons: FormatButton[];
  /** Callback untuk insert text */
  onInsertText: (text: string) => void;
  /** Kelas CSS tambahan */
  className?: string;
  /** Current theme (opsional) */
  currentTheme?: Theme;
}

/**
 * Props untuk tablet toolbar layout
 */
export interface TabletToolbarProps {
  /** Daftar format buttons */
  formatButtons: FormatButton[];
  /** Callback untuk insert text */
  onInsertText: (text: string) => void;
  /** Kelas CSS tambahan */
  className?: string;
  /** Mode kompak */
  compact?: boolean;
  /** Current theme (opsional) */
  currentTheme?: Theme;
}

/**
 * Props untuk desktop toolbar layout
 */
export interface DesktopToolbarProps {
  /** Daftar format buttons */
  formatButtons: FormatButton[];
  /** Callback untuk insert text */
  onInsertText: (text: string) => void;
  /** Kelas CSS tambahan */
  className?: string;
  /** Current theme (opsional) */
  currentTheme?: Theme;
}

/**
 * Interface untuk konfigurasi toolbar
 */
export interface ToolbarConfig {
  /** Buttons yang akan ditampilkan */
  enabledButtons: ButtonCategory[];
  /** Layout yang digunakan */
  layout: 'auto' | 'mobile' | 'tablet' | 'desktop';
  /** Tema toolbar */
  theme: 'light' | 'dark' | 'auto';
  /** Animasi enabled */
  animations: boolean;
}

/**
 * Type untuk markdown templates
 */
export type MarkdownTemplate = {
  /** Nama template */
  name: string;
  /** Template text */
  template: string;
  /** Deskripsi template */
  description: string;
  /** Kategori template */
  category: ButtonCategory;
};

/**
 * Interface untuk button group
 */
export interface ButtonGroup {
  /** Nama group */
  name: string;
  /** Kategori group */
  category: ButtonCategory;
  /** Buttons dalam group */
  buttons: FormatButton[];
  /** Apakah group dapat di-collapse */
  collapsible?: boolean;
}

/**
 * Props untuk button group component
 */
export interface ButtonGroupProps {
  /** Data group */
  group: ButtonGroup;
  /** Kelas CSS tambahan */
  className?: string;
  /** Orientasi layout */
  orientation?: 'horizontal' | 'vertical';
  /** Spacing antar buttons */
  spacing?: 'tight' | 'normal' | 'loose';
}

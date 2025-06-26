/**
 * TypeScript interfaces untuk Keyboard Shortcuts
 * Mendefinisikan struktur data untuk shortcuts dan kategori
 */

export interface ShortcutItem {
  /** Array key combinations (e.g., ["Ctrl", "B"]) */
  keys: string[];
  /** Deskripsi fungsi shortcut */
  description: string;
  /** Platform-specific keys (optional) */
  macKeys?: string[];
  /** Apakah shortcut aktif/tersedia */
  enabled?: boolean;
}

export interface ShortcutCategory {
  /** Nama kategori */
  category: string;
  /** Icon untuk kategori (optional) */
  icon?: string;
  /** Array shortcut items dalam kategori */
  items: ShortcutItem[];
  /** Urutan tampilan kategori */
  order?: number;
}

export interface KeyboardShortcutsProps {
  /** Callback untuk menutup dialog */
  onClose: () => void;
  /** Custom shortcuts (optional) */
  customShortcuts?: ShortcutCategory[];
  /** Apakah menampilkan Mac-specific keys */
  showMacKeys?: boolean;
  /** Filter kategori yang ditampilkan */
  visibleCategories?: string[];
}

export interface ShortcutCategoryProps {
  /** Data kategori shortcut */
  category: ShortcutCategory;
  /** Apakah menampilkan Mac keys */
  showMacKeys?: boolean;
  /** Index kategori untuk styling */
  index: number;
  /** Total kategori untuk separator logic */
  totalCategories: number;
}

export interface ShortcutItemProps {
  /** Data shortcut item */
  item: ShortcutItem;
  /** Apakah menampilkan Mac keys */
  showMacKeys?: boolean;
  /** Index item dalam kategori */
  index: number;
}

export interface ShortcutKeyProps {
  /** Key yang akan ditampilkan */
  keyName: string;
  /** Apakah ini key terakhir dalam kombinasi */
  isLast?: boolean;
  /** Variant styling */
  variant?: 'default' | 'mac' | 'special';
}

export type Platform = 'windows' | 'mac' | 'linux';
export type ShortcutType = 'text' | 'view' | 'navigation' | 'file' | 'custom';

/**
 * Theme Types & Interfaces
 * Definisi TypeScript untuk sistem tema aplikasi
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

/**
 * Interface untuk objek tema
 * Mendefinisikan struktur lengkap sebuah tema aplikasi
 */
export interface Theme {
  /** ID unik untuk tema */
  id: string;
  /** Nama tampilan tema */
  name: string;
  /** Warna primer tema */
  primary: string;
  /** Warna sekunder tema */
  secondary: string;
  /** Warna background utama */
  background: string;
  /** Warna surface/permukaan */
  surface: string;
  /** Warna teks utama */
  text: string;
  /** Warna aksen/highlight */
  accent: string;
  /** Gradient CSS class untuk Tailwind */
  gradient: string;
}

/**
 * Props untuk komponen ThemeSelector
 */
export interface ThemeSelectorProps {
  /** Tema yang sedang aktif */
  currentTheme: Theme;
  /** Callback ketika tema berubah */
  onThemeChange: (theme: Theme) => void;
  /** Kelas CSS tambahan (opsional) */
  className?: string;
  /** Mode tampilan kompak (opsional) */
  compact?: boolean;
}

/**
 * Props untuk komponen ThemeButton individual
 */
export interface ThemeButtonProps {
  /** Data tema untuk button ini */
  theme: Theme;
  /** Apakah tema ini sedang aktif */
  isActive: boolean;
  /** Callback ketika button diklik */
  onClick: (theme: Theme) => void;
  /** Kelas CSS tambahan (opsional) */
  className?: string;
  /** Mode tampilan kompak (opsional) */
  compact?: boolean;
}

/**
 * Type untuk ID tema yang valid
 */
export type ThemeId = 'ocean' | 'forest' | 'sunset' | 'purple' | 'rose' | 'dark';

/**
 * Type untuk kategori warna tema
 */
export type ThemeColorCategory = 'primary' | 'secondary' | 'background' | 'surface' | 'text' | 'accent';

/**
 * Interface untuk konfigurasi tema
 */
export interface ThemeConfig {
  /** Tema default yang akan digunakan */
  defaultTheme: ThemeId;
  /** Daftar tema yang tersedia */
  availableThemes: ThemeId[];
  /** Apakah menggunakan sistem tema otomatis */
  useSystemTheme?: boolean;
}

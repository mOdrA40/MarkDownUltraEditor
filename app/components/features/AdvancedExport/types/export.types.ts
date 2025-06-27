import { LucideIcon } from 'lucide-react';
import type { Theme } from '@/components/features/ThemeSelector';

/**
 * Props untuk komponen AdvancedExport utama
 */
export interface AdvancedExportProps {
  /** Konten markdown yang akan di-export */
  markdown: string;
  /** Nama file default */
  fileName: string;
  /** Status dialog terbuka/tertutup */
  isOpen: boolean;
  /** Callback ketika dialog ditutup */
  onClose: () => void;
  /** Theme aplikasi saat ini */
  currentTheme?: Theme;
}

/**
 * Format export yang didukung
 */
export type ExportFormat = 'pdf' | 'docx' | 'epub' | 'presentation';

/**
 * Ukuran halaman yang didukung
 */
export type PageSize = 'A4' | 'Letter' | 'Legal';

/**
 * Orientasi halaman
 */
export type PageOrientation = 'portrait' | 'landscape';

/**
 * Theme yang tersedia
 */
export type ThemeType = 'default' | 'professional' | 'modern' | 'academic' | 'dark';

/**
 * Mode preview responsif
 */
export type PreviewMode = 'desktop' | 'tablet' | 'mobile';

/**
 * Font family yang didukung
 */
export type FontFamily =
  | 'Arial'
  | 'Times New Roman'
  | 'Helvetica'
  | 'Georgia'
  | 'Verdana'
  | 'Roboto'
  | 'Open Sans';

/**
 * Konfigurasi lengkap untuk export options
 */
export interface ExportOptions {
  /** Format export yang dipilih */
  format: ExportFormat;
  /** Judul dokumen */
  title: string;
  /** Nama penulis */
  author: string;
  /** Deskripsi dokumen */
  description: string;
  /** Apakah menyertakan table of contents */
  includeTableOfContents: boolean;
  /** Apakah menyertakan nomor halaman */
  includePageNumbers: boolean;
  /** Ukuran halaman */
  pageSize: PageSize;
  /** Orientasi halaman */
  orientation: PageOrientation;
  /** Ukuran font dalam pixel */
  fontSize: number;
  /** Font family */
  fontFamily: FontFamily;
  /** Theme yang dipilih */
  theme: ThemeType;
  /** Apakah menyertakan header dan footer */
  headerFooter: boolean;
  /** Teks watermark (opsional) */
  watermark: string;
  /** Custom CSS tambahan */
  customCSS: string;
}

/**
 * Konfigurasi theme dengan warna-warna
 */
export interface ThemeConfig {
  /** Nama theme yang ditampilkan */
  name: string;
  /** Warna utama untuk teks */
  primaryColor: string;
  /** Warna background */
  backgroundColor: string;
  /** Warna aksen untuk heading dan elemen penting */
  accentColor: string;
}

/**
 * Data untuk format export yang tersedia
 */
export interface ExportFormatOption {
  /** Value untuk format */
  value: ExportFormat;
  /** Icon component */
  icon: LucideIcon;
  /** Label yang ditampilkan */
  label: string;
  /** Deskripsi singkat */
  desc: string;
}

/**
 * State untuk proses export
 */
export interface ExportState {
  /** Apakah sedang dalam proses export */
  isExporting: boolean;
  /** Progress export dalam persen (0-100) */
  exportProgress: number;
}

/**
 * Data slide untuk presentation export
 */
export interface SlideData {
  /** Judul slide */
  title: string;
  /** Konten slide */
  content: string[];
}

/**
 * Hook return type untuk export functionality
 */
export interface UseExportReturn extends ExportState {
  /** Function untuk memulai export */
  startExport: (options: ExportOptions) => Promise<void>;
  /** Function untuk reset state */
  resetExport: () => void;
}

/**
 * Props untuk komponen format selector
 */
export interface FormatSelectorProps {
  /** Format yang sedang dipilih */
  selectedFormat: ExportFormat;
  /** Callback ketika format berubah */
  onFormatChange: (format: ExportFormat) => void;
  /** Apakah dalam mode mobile */
  isMobile?: boolean;
  /** Apakah dalam mode tablet */
  isTablet?: boolean;
}

/**
 * Props untuk komponen style options
 */
export interface StyleOptionsProps {
  /** Options yang sedang aktif */
  options: ExportOptions;
  /** Callback untuk update options */
  onOptionsChange: <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => void;
  /** Apakah dalam mode mobile */
  isMobile?: boolean;
  /** Apakah dalam mode tablet */
  isTablet?: boolean;
}

/**
 * Props untuk komponen advanced options
 */
export interface AdvancedOptionsProps {
  /** Options yang sedang aktif */
  options: ExportOptions;
  /** Callback untuk update options */
  onOptionsChange: <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => void;
  /** Apakah dalam mode mobile */
  isMobile?: boolean;
  /** Apakah dalam mode tablet */
  isTablet?: boolean;
}

/**
 * Props untuk komponen preview panel
 */
export interface PreviewPanelProps {
  /** Konten markdown */
  markdown: string;
  /** Export options */
  options: ExportOptions;
  /** Mode preview */
  previewMode: PreviewMode;
  /** Callback untuk ubah preview mode */
  onPreviewModeChange: (mode: PreviewMode) => void;
  /** Callback untuk export */
  onExport: () => void;
  /** State export */
  exportState: ExportState;
  /** Apakah dalam mode mobile */
  isMobile?: boolean;
  /** Apakah dalam mode tablet */
  isTablet?: boolean;
  /** Theme aplikasi saat ini */
  currentTheme?: Theme;
}

/**
 * Return type untuk markdown converter utility
 */
export interface MarkdownConverterResult {
  /** HTML yang dihasilkan */
  html: string;
  /** Metadata yang diekstrak */
  metadata?: {
    headings: string[];
    wordCount: number;
    estimatedReadTime: number;
  };
}

/**
 * Options untuk HTML generator
 */
export interface HTMLGeneratorOptions extends ExportOptions {
  /** Konten HTML yang sudah dikonversi */
  htmlContent: string;
  /** Theme config */
  themeConfig: ThemeConfig;
}

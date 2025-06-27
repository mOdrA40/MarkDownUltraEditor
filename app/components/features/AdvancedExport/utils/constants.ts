import {
  ExportOptions,
  ThemeConfig,
  ExportFormatOption,
  FontFamily
} from '../types/export.types';
import {
  FileText,
  BookOpen,
  Presentation
} from "lucide-react";

/**
 * Default export options
 */
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'pdf',
  title: '',
  author: '',
  description: '',
  includeTableOfContents: true,
  includePageNumbers: true,
  pageSize: 'A4',
  orientation: 'portrait',
  fontSize: 12,
  fontFamily: 'Arial',
  theme: 'default',
  headerFooter: true,
  watermark: '',
  customCSS: ''
};

/**
 * Konfigurasi theme yang tersedia
 */
export const THEMES: Record<string, ThemeConfig> = {
  default: {
    name: 'Default',
    primaryColor: '#000000',
    backgroundColor: '#ffffff',
    accentColor: '#0066cc'
  },
  professional: {
    name: 'Professional',
    primaryColor: '#2c3e50',
    backgroundColor: '#ffffff',
    accentColor: '#3498db'
  },
  modern: {
    name: 'Modern',
    primaryColor: '#1a1a1a',
    backgroundColor: '#fafafa',
    accentColor: '#6366f1'
  },
  academic: {
    name: 'Academic',
    primaryColor: '#2d3748',
    backgroundColor: '#ffffff',
    accentColor: '#805ad5'
  },
  dark: {
    name: 'Dark',
    primaryColor: '#e5e7eb',
    backgroundColor: '#1f2937',
    accentColor: '#60a5fa'
  }
};

/**
 * Format export yang tersedia
 */
export const EXPORT_FORMATS: ExportFormatOption[] = [
  {
    value: 'pdf',
    icon: FileText,
    label: 'PDF',
    desc: 'Print to PDF'
  },
  {
    value: 'docx',
    icon: FileText,
    label: 'RTF',
    desc: 'Rich Text Format'
  },
  {
    value: 'epub',
    icon: BookOpen,
    label: 'HTML',
    desc: 'Web Document'
  },
  {
    value: 'presentation',
    icon: Presentation,
    label: 'Slides',
    desc: 'HTML Presentation'
  }
];

/**
 * Font families yang didukung
 */
export const FONT_FAMILIES: FontFamily[] = [
  'Arial',
  'Times New Roman',
  'Helvetica',
  'Georgia',
  'Verdana',
  'Roboto',
  'Open Sans'
];

/**
 * Page sizes yang didukung
 */
export const PAGE_SIZES = [
  { value: 'A4', label: 'A4' },
  { value: 'Letter', label: 'Letter' },
  { value: 'Legal', label: 'Legal' }
] as const;

/**
 * Page orientations yang didukung
 */
export const PAGE_ORIENTATIONS = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' }
] as const;

/**
 * Font size range
 */
export const FONT_SIZE_RANGE = {
  min: 8,
  max: 24,
  default: 12
} as const;

/**
 * Export progress steps untuk feedback user
 */
export const EXPORT_PROGRESS_STEPS = {
  INITIALIZING: 10,
  PROCESSING: 30,
  GENERATING: 50,
  STYLING: 70,
  FINALIZING: 90,
  COMPLETE: 100
} as const;

/**
 * Responsive breakpoints untuk preview
 */
export const PREVIEW_BREAKPOINTS = {
  mobile: {
    maxWidth: '375px',
    label: 'Mobile'
  },
  tablet: {
    maxWidth: '768px',
    label: 'Tablet'
  },
  desktop: {
    maxWidth: '1200px',
    label: 'Desktop'
  }
} as const;

/**
 * Default CSS untuk berbagai komponen
 */
export const DEFAULT_STYLES = {
  body: {
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.6,
    margin: '0 auto',
    maxWidth: '800px',
    padding: '40px 20px'
  },
  heading: {
    marginTop: '1.5em',
    marginBottom: '0.5em',
    fontWeight: 600
  },
  paragraph: {
    margin: '1em 0',
    textAlign: 'justify' as const
  },
  list: {
    margin: '1em 0',
    paddingLeft: '2em'
  },
  blockquote: {
    borderLeft: '4px solid',
    margin: '1.5em 0',
    padding: '1em 1.5em',
    fontStyle: 'italic' as const
  },
  code: {
    padding: '0.2em 0.4em',
    borderRadius: '3px',
    fontFamily: 'Courier New, monospace',
    fontSize: '0.9em'
  },
  pre: {
    padding: '1.5em',
    borderRadius: '8px',
    overflowX: 'auto' as const,
    margin: '1.5em 0'
  }
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  EXPORT_FAILED: 'Export gagal. Silakan coba lagi.',
  INVALID_FORMAT: 'Format export tidak valid.',
  EMPTY_CONTENT: 'Konten tidak boleh kosong.',
  NETWORK_ERROR: 'Terjadi kesalahan jaringan.',
  BROWSER_NOT_SUPPORTED: 'Browser tidak mendukung fitur ini.'
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  PDF_EXPORTED: 'PDF export berhasil dimulai. Pilih "Save as PDF" di dialog print.',
  RTF_EXPORTED: 'Dokumen berhasil di-export sebagai RTF (dapat dibuka di Word).',
  HTML_EXPORTED: 'Dokumen berhasil di-export sebagai HTML (format e-book).',
  PRESENTATION_EXPORTED: 'Dokumen berhasil di-export sebagai HTML presentation.'
} as const;

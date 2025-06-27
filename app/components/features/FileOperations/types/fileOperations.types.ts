/**
 * @fileoverview TypeScript type definitions for FileOperations components
 * @author Axel Modra
 */

import type { Theme } from '@/components/features/ThemeSelector';

/**
 * Main props interface for FileOperations component
 */
export interface FileOperationsProps {
  /** Markdown content to export */
  markdown: string;
  /** Current file name */
  fileName: string;
  /** Callback when file is loaded */
  onLoad: (content: string, fileName: string) => void;
  /** Mobile navigation styling flag */
  isMobileNav?: boolean;
  /** Current theme for styling */
  currentTheme?: Theme;
}

/**
 * File export configuration
 */
export interface ExportConfig {
  /** Content to export */
  content: string;
  /** File name */
  fileName: string;
  /** Export format */
  format: 'markdown' | 'html' | 'json';
}

/**
 * JSON export data structure
 */
export interface JsonExportData {
  /** Original file name */
  fileName: string;
  /** Document title extracted from content */
  title: string;
  /** Markdown content */
  content: string;
  /** Document metadata */
  metadata: {
    /** Word count */
    wordCount: number;
    /** Character count including spaces */
    characterCount: number;
    /** Character count excluding spaces */
    characterCountNoSpaces: number;
    /** Line count */
    lineCount: number;
    /** Number of code blocks */
    codeBlockCount: number;
    /** Number of links */
    linkCount: number;
    /** Number of images */
    imageCount: number;
    /** Number of headings */
    headingCount: number;
    /** Number of tables */
    tableCount: number;
    /** Number of list items */
    listItemCount: number;
    /** Number of blockquotes */
    blockquoteCount: number;
    /** Estimated reading time in minutes */
    readingTimeMinutes: number;
  };
  /** Document structure */
  structure: {
    /** Document headings */
    headings: Array<{
      level: number;
      text: string;
    }>;
  };
  /** Export information */
  exportInfo: {
    /** Creation timestamp */
    createdAt: string;
    /** Export version */
    version: string;
    /** Exported by application */
    exportedBy: string;
    /** Export format description */
    format: string;
  };
}

/**
 * HTML template configuration
 */
export interface HtmlTemplateConfig {
  /** Document title */
  title: string;
  /** Markdown content */
  content: string;
  /** Custom CSS styles */
  customStyles?: string;
}

/**
 * File import result
 */
export interface FileImportResult {
  /** File content */
  content: string;
  /** File name */
  fileName: string;
  /** File size in bytes */
  size: number;
  /** File type */
  type: string;
}

/**
 * Export operation result
 */
export interface ExportResult {
  /** Success status */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Exported file name */
  fileName?: string;
}

/**
 * File operation callbacks
 */
export interface FileOperationCallbacks {
  /** Success callback */
  onSuccess: (message: string) => void;
  /** Error callback */
  onError: (error: string) => void;
}

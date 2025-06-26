/**
 * @fileoverview Hook untuk export ke DOCX (RTF format)
 * @author Senior Developer
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { ExportOptions, UseExportReturn } from '../types/export.types';
import { downloadFile, sanitizeFilename } from '../utils/downloadFile';
import { EXPORT_PROGRESS_STEPS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';

/**
 * Custom hook untuk export ke DOCX (RTF format)
 * 
 * @param markdown - Konten markdown
 * @param fileName - Nama file default
 * @param onSuccess - Callback ketika export berhasil
 * @param onError - Callback ketika export gagal
 * @returns Export state dan functions
 */
export const useExportToDocx = (
  markdown: string,
  fileName: string,
  onSuccess?: (message: string) => void,
  onError?: (error: string) => void
): UseExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const startExport = useCallback(async (options: ExportOptions) => {
    if (!markdown?.trim()) {
      onError?.(ERROR_MESSAGES.EMPTY_CONTENT);
      return;
    }

    setIsExporting(true);
    setExportProgress(EXPORT_PROGRESS_STEPS.INITIALIZING);

    try {
      // Generate RTF content
      let rtfContent = generateRTFHeader();
      setExportProgress(EXPORT_PROGRESS_STEPS.PROCESSING);

      // Process markdown lines
      const lines = markdown.split('\n');
      for (const line of lines) {
        rtfContent += processMarkdownLine(line);
      }

      rtfContent += generateRTFFooter();
      setExportProgress(EXPORT_PROGRESS_STEPS.GENERATING);

      // Create blob dan download
      const blob = new Blob([rtfContent], {
        type: 'application/rtf'
      });

      setExportProgress(EXPORT_PROGRESS_STEPS.FINALIZING);

      const safeFileName = sanitizeFilename(options.title || fileName, '.rtf');
      downloadFile(blob, safeFileName);

      setExportProgress(EXPORT_PROGRESS_STEPS.COMPLETE);
      onSuccess?.(SUCCESS_MESSAGES.RTF_EXPORTED);

    } catch (error) {
      console.error('RTF export error:', error);
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.EXPORT_FAILED;
      onError?.(errorMessage);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [markdown, fileName, onSuccess, onError]);

  const resetExport = useCallback(() => {
    setIsExporting(false);
    setExportProgress(0);
  }, []);

  return {
    isExporting,
    exportProgress,
    startExport,
    resetExport
  };
};

/**
 * Generate RTF header
 */
const generateRTFHeader = (): string => {
  return `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 `;
};

/**
 * Generate RTF footer
 */
const generateRTFFooter = (): string => {
  return `}`;
};

/**
 * Process single markdown line ke RTF
 */
const processMarkdownLine = (line: string): string => {
  const trimmedLine = line.trim();
  
  if (!trimmedLine) {
    return `\\par `;
  }
  
  // Headers
  if (trimmedLine.startsWith('# ')) {
    return `\\fs32\\b ${escapeRTF(trimmedLine.substring(2))}\\b0\\fs24\\par `;
  } else if (trimmedLine.startsWith('## ')) {
    return `\\fs28\\b ${escapeRTF(trimmedLine.substring(3))}\\b0\\fs24\\par `;
  } else if (trimmedLine.startsWith('### ')) {
    return `\\fs26\\b ${escapeRTF(trimmedLine.substring(4))}\\b0\\fs24\\par `;
  } else if (trimmedLine.startsWith('#### ')) {
    return `\\fs24\\b ${escapeRTF(trimmedLine.substring(5))}\\b0\\fs24\\par `;
  }
  
  // Process inline formatting
  let processedLine = trimmedLine;
  
  // Bold text
  processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '\\b $1\\b0 ');
  
  // Italic text
  processedLine = processedLine.replace(/\*(.*?)\*/g, '\\i $1\\i0 ');
  
  // Code (simple monospace)
  processedLine = processedLine.replace(/`(.*?)`/g, '\\f1 $1\\f0 ');
  
  // Lists
  if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
    return `\\bullet ${escapeRTF(processedLine.substring(2))}\\par `;
  }
  
  if (/^\d+\.\s/.test(trimmedLine)) {
    const match = trimmedLine.match(/^\d+\.\s(.*)$/);
    if (match) {
      return `\\bullet ${escapeRTF(match[1])}\\par `;
    }
  }
  
  // Blockquotes
  if (trimmedLine.startsWith('> ')) {
    return `\\i ${escapeRTF(trimmedLine.substring(2))}\\i0\\par `;
  }
  
  // Regular paragraph
  return `${escapeRTF(processedLine)}\\par `;
};

/**
 * Escape special RTF characters
 */
const escapeRTF = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\n/g, '\\par ')
    .replace(/\t/g, '\\tab ');
};

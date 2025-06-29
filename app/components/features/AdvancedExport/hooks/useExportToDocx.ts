/**
 * @fileoverview Hook untuk export ke DOCX (DOCX format)
 * @author Axel Modra
 */

import { useState, useCallback } from 'react';
import { ExportOptions, UseExportReturn } from '../types/export.types';
import { downloadFile, sanitizeFilename } from '../utils/downloadFile';
import { EXPORT_PROGRESS_STEPS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';
import { convertMarkdownToHTML } from '../utils/markdownConverter';
import { generateStyledHTML } from '../utils/htmlGenerator';

/**
 * Custom hook untuk export ke DOCX (DOCX format)
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
      setExportProgress(EXPORT_PROGRESS_STEPS.PROCESSING);

      // Convert markdown to HTML first
      const { html: htmlContent } = convertMarkdownToHTML(markdown);

      // Generate styled HTML for DOCX
      const styledHTML = generateStyledHTML({
        ...options,
        htmlContent,
        themeConfig: { name: 'default', primaryColor: '#000000', backgroundColor: '#ffffff', accentColor: '#3b82f6' }
      });

      setExportProgress(EXPORT_PROGRESS_STEPS.GENERATING);

      // Convert HTML to simple DOCX format (HTML with DOCX headers)
      const docxContent = convertHTMLToDocx(styledHTML, options);

      // Create blob dan download
      const blob = new Blob([docxContent], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      setExportProgress(EXPORT_PROGRESS_STEPS.FINALIZING);

      const safeFileName = sanitizeFilename(options.title || fileName, '.docx');
      downloadFile(blob, safeFileName);

      setExportProgress(EXPORT_PROGRESS_STEPS.COMPLETE);
      onSuccess?.(SUCCESS_MESSAGES.DOCX_EXPORTED);

    } catch (error) {
      console.error('DOCX export error:', error);
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
 * Convert HTML to DOCX format
 * Uses HTML with DOCX MIME type for compatibility with Microsoft Word
 */
const convertHTMLToDocx = (htmlContent: string, options: ExportOptions): string => {
  // Clean HTML content for better DOCX compatibility
  let cleanedHTML = htmlContent
    // Remove problematic CSS that DOCX doesn't support
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Simplify HTML structure
    .replace(/<div[^>]*>/gi, '<p>')
    .replace(/<\/div>/gi, '</p>')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Enhance tables for better Word compatibility
  cleanedHTML = cleanedHTML.replace(/<table[^>]*>/gi, () => {
    return `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; mso-table-layout-alt: fixed;">`;
  });

  // Add Word-specific attributes to table cells
  cleanedHTML = cleanedHTML.replace(/<(th|td)([^>]*)>/gi, (_, tag, attrs) => {
    return `<${tag}${attrs} style="border: 1px solid #000000; padding: 8px; vertical-align: top; mso-border-alt: solid #000000 .5pt;">`;
  });

  // Create basic DOCX-compatible HTML structure
  const docxHTML = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${options.title || 'Document'}</title>
  <style>
    body {
      font-family: '${options.fontFamily}', 'Times New Roman', serif;
      font-size: ${options.fontSize}px;
      line-height: 1.6;
      color: #000000;
      background-color: #ffffff;
      margin: 40px;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #000000;
      font-weight: bold;
      margin: 1.5em 0 0.5em 0;
    }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.3em; }
    h4 { font-size: 1.1em; }
    h5 { font-size: 1em; }
    h6 { font-size: 0.9em; }
    p { margin: 1em 0; }
    strong, b { font-weight: bold; }
    em, i { font-style: italic; }
    code {
      font-family: 'Courier New', monospace;
      background-color: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
    }
    pre {
      font-family: 'Courier New', monospace;
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
    blockquote {
      border-left: 4px solid #ccc;
      margin: 1em 0;
      padding: 0.5em 1em;
      font-style: italic;
    }
    ul, ol { margin: 1em 0; padding-left: 2em; }
    li { margin: 0.5em 0; }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
      border: 1px solid #000000;
      mso-table-layout-alt: fixed;
      mso-table-wrap: around;
      mso-table-lspace: 9.0pt;
      mso-table-rspace: 9.0pt;
    }
    th, td {
      border: 1px solid #000000;
      padding: 8px 12px;
      text-align: left;
      vertical-align: top;
      mso-border-alt: solid #000000 .5pt;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
      mso-shading: #f0f0f0;
    }
    tr { mso-yfti-irow: 0; }
    tr:first-child { mso-yfti-firstrow: yes; }
    tr:last-child { mso-yfti-lastrow: yes; }
  </style>
</head>
<body>
  ${cleanedHTML}
</body>
</html>`;

  return docxHTML;
};



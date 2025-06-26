/**
 * @fileoverview Hook untuk export ke EPUB (HTML format)
 * @author Senior Developer
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { ExportOptions, UseExportReturn } from '../types/export.types';
import { convertMarkdownToHTML } from '../utils/markdownConverter';
import { downloadFile, sanitizeFilename } from '../utils/downloadFile';
import { EXPORT_PROGRESS_STEPS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';

/**
 * Custom hook untuk export ke EPUB (HTML format)
 * 
 * @param markdown - Konten markdown
 * @param fileName - Nama file default
 * @param onSuccess - Callback ketika export berhasil
 * @param onError - Callback ketika export gagal
 * @returns Export state dan functions
 */
export const useExportToEpub = (
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
      // Convert markdown to HTML
      const { html: htmlContent } = convertMarkdownToHTML(markdown);
      setExportProgress(EXPORT_PROGRESS_STEPS.PROCESSING);

      // Generate EPUB-like HTML structure
      const epubContent = generateEpubHTML(options, htmlContent);
      setExportProgress(EXPORT_PROGRESS_STEPS.GENERATING);

      // Create blob dan download
      const blob = new Blob([epubContent], { type: 'text/html' });
      setExportProgress(EXPORT_PROGRESS_STEPS.FINALIZING);

      const safeFileName = sanitizeFilename(options.title || fileName, '.html');
      downloadFile(blob, safeFileName);

      setExportProgress(EXPORT_PROGRESS_STEPS.COMPLETE);
      onSuccess?.(SUCCESS_MESSAGES.HTML_EXPORTED);

    } catch (error) {
      console.error('HTML export error:', error);
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
 * Generate EPUB-like HTML content
 */
const generateEpubHTML = (options: ExportOptions, htmlContent: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(options.title)}</title>
    <meta name="author" content="${escapeHtml(options.author)}">
    <meta name="description" content="${escapeHtml(options.description)}">
    <style>
        ${generateEpubStyles(options)}
    </style>
</head>
<body>
    <div class="book-container">
        ${generateEpubHeader(options)}
        <main class="book-content">
            ${htmlContent}
        </main>
        ${generateEpubFooter(options)}
    </div>
</body>
</html>`;
};

/**
 * Generate EPUB-specific styles
 */
const generateEpubStyles = (options: ExportOptions): string => {
  return `
        body {
            font-family: Georgia, serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background-color: #fff;
            font-size: ${options.fontSize}px;
        }

        .book-container {
            max-width: 100%;
        }

        .book-header {
            text-align: center;
            margin-bottom: 2em;
            padding-bottom: 1em;
            border-bottom: 2px solid #2c3e50;
        }

        .book-title {
            font-size: 2.5em;
            color: #2c3e50;
            margin-bottom: 0.5em;
            font-weight: bold;
        }

        .book-author {
            font-size: 1.2em;
            color: #666;
            font-style: italic;
        }

        .book-description {
            font-size: 1em;
            color: #777;
            margin-top: 0.5em;
        }

        .book-content {
            text-align: justify;
        }

        .book-footer {
            margin-top: 3em;
            padding-top: 1em;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 0.9em;
            color: #666;
        }

        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }

        h1 { 
            font-size: 2.2em; 
            page-break-before: always;
        }
        h2 { font-size: 1.8em; }
        h3 { font-size: 1.5em; }
        h4 { font-size: 1.3em; }
        h5 { font-size: 1.1em; }
        h6 { font-size: 1em; }

        p {
            margin: 1em 0;
            text-indent: 1.5em;
        }

        p:first-child,
        h1 + p,
        h2 + p,
        h3 + p,
        h4 + p,
        h5 + p,
        h6 + p {
            text-indent: 0;
        }

        blockquote {
            border-left: 4px solid #3498db;
            margin: 1.5em 0;
            padding: 1em 1.5em;
            background-color: #f8f9fa;
            font-style: italic;
        }

        code {
            background-color: #f1f3f4;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: monospace;
            font-size: 0.9em;
        }

        pre {
            background-color: #f8f9fa;
            padding: 1.5em;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1.5em 0;
            border-left: 4px solid #3498db;
        }

        pre code {
            background: none;
            padding: 0;
        }

        ul, ol {
            margin: 1em 0;
            padding-left: 2em;
        }

        li {
            margin: 0.5em 0;
        }

        img {
            max-width: 100%;
            height: auto;
            margin: 1em 0;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }

        a {
            color: #3498db;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        @media print {
            body {
                font-size: 12pt;
                line-height: 1.4;
            }

            h1 {
                page-break-before: always;
            }

            h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
            }

            img, pre, blockquote {
                page-break-inside: avoid;
            }
        }

        @media screen and (max-width: 600px) {
            body {
                padding: 10px;
                font-size: 16px;
            }

            .book-title {
                font-size: 2em;
            }

            h1 { font-size: 1.8em; }
            h2 { font-size: 1.5em; }
            h3 { font-size: 1.3em; }
        }
    `;
};

/**
 * Generate EPUB header
 */
const generateEpubHeader = (options: ExportOptions): string => {
  return `
    <header class="book-header">
        <h1 class="book-title">${escapeHtml(options.title)}</h1>
        <p class="book-author">by ${escapeHtml(options.author)}</p>
        ${options.description ? `<p class="book-description">${escapeHtml(options.description)}</p>` : ''}
    </header>
  `;
};

/**
 * Generate EPUB footer
 */
const generateEpubFooter = (options: ExportOptions): string => {
  return `
    <footer class="book-footer">
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>${escapeHtml(options.title)} • ${escapeHtml(options.author)}</p>
    </footer>
  `;
};

/**
 * Escape HTML characters
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

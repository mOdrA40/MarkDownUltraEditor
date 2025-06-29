/**
 * @fileoverview Hook untuk export ke DOCX (RTF format)
 * @author Axel Modra
 */

import { useState, useCallback } from 'react';
import { ExportOptions, UseExportReturn, ThemeConfig } from '../types/export.types';
import { downloadFile, sanitizeFilename } from '../utils/downloadFile';
import { EXPORT_PROGRESS_STEPS, SUCCESS_MESSAGES, ERROR_MESSAGES, THEMES } from '../utils/constants';
import { convertMarkdownToHTML } from '../utils/markdownConverter';
import { generateStyledHTML } from '../utils/htmlGenerator';

/**
 * Get colorful theme configuration for export
 * Maps theme names to colorful theme configs instead of black/white
 */
const getThemeConfigForExport = (themeName: string): ThemeConfig => {
  const colorfulThemes: Record<string, ThemeConfig> = {
    ocean: {
      name: 'Ocean',
      primaryColor: '#0c4a6e', // Ocean dark blue for text
      backgroundColor: '#ffffff', // White background for print
      accentColor: '#0284c7' // Ocean blue for headings and links
    },
    forest: {
      name: 'Forest',
      primaryColor: '#14532d', // Forest dark green for text
      backgroundColor: '#ffffff',
      accentColor: '#10b981' // Forest green for headings and links
    },
    sunset: {
      name: 'Sunset',
      primaryColor: '#9a3412', // Sunset dark orange for text
      backgroundColor: '#ffffff',
      accentColor: '#f97316' // Sunset orange for headings and links
    },
    purple: {
      name: 'Purple',
      primaryColor: '#581c87', // Purple dark for text
      backgroundColor: '#ffffff',
      accentColor: '#a855f7' // Purple for headings and links
    },
    rose: {
      name: 'Rose',
      primaryColor: '#881337', // Rose dark for text
      backgroundColor: '#ffffff',
      accentColor: '#f43f5e' // Rose for headings and links
    },
    dark: {
      name: 'Dark',
      primaryColor: '#1f2937', // Dark gray for text (readable on white)
      backgroundColor: '#ffffff',
      accentColor: '#6366f1' // Indigo for headings and links
    },
    default: {
      name: 'Default',
      primaryColor: '#1f2937', // Dark gray for text
      backgroundColor: '#ffffff',
      accentColor: '#3b82f6' // Blue for headings and links
    }
  };

  return colorfulThemes[themeName] || colorfulThemes.default;
};

/**
 * Get lighter background color for code blocks based on accent color
 */
const getCodeBackgroundColor = (accentColor: string): string => {
  const colorMap: Record<string, string> = {
    '#0284c7': '#f0f9ff', // Ocean - very light blue
    '#10b981': '#f0fdf4', // Forest - very light green
    '#f97316': '#fff7ed', // Sunset - very light orange
    '#a855f7': '#faf5ff', // Purple - very light purple
    '#f43f5e': '#fff1f2', // Rose - very light pink
    '#6366f1': '#f8fafc', // Dark/Indigo - very light gray
    '#3b82f6': '#f8fafc'  // Default - very light gray
  };

  return colorMap[accentColor] || '#f8fafc';
};

/**
 * Get lighter border color based on accent color
 */
const getLighterColor = (accentColor: string): string => {
  const colorMap: Record<string, string> = {
    '#0284c7': '#bae6fd', // Ocean - light blue
    '#10b981': '#bbf7d0', // Forest - light green
    '#f97316': '#fed7aa', // Sunset - light orange
    '#a855f7': '#e9d5ff', // Purple - light purple
    '#f43f5e': '#fecdd3', // Rose - light pink
    '#6366f1': '#e0e7ff', // Dark/Indigo - light indigo
    '#3b82f6': '#dbeafe'  // Default - light blue
  };

  return colorMap[accentColor] || '#e5e7eb';
};

/**
 * Wrap emojis in spans to preserve their original colors
 */
const wrapEmojisInSpans = (html: string): string => {
  // Common emoji Unicode ranges
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]/gu;

  return html.replace(emojiRegex, (emoji) => {
    return `<span class="emoji-preserve" style="color: initial !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;">${emoji}</span>`;
  });
};

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
      setExportProgress(EXPORT_PROGRESS_STEPS.PROCESSING);

      // Convert markdown to HTML first
      const { html: htmlContent } = convertMarkdownToHTML(markdown);

      // Generate styled HTML for DOCX with simple black/white theme
      const styledHTML = generateStyledHTML({
        ...options,
        htmlContent,
        themeConfig: { name: 'default', primaryColor: '#000000', backgroundColor: '#ffffff', accentColor: '#000000' }
      });

      setExportProgress(EXPORT_PROGRESS_STEPS.GENERATING);

      // Convert HTML to simple DOCX format (HTML with DOCX headers)
      const docxContent = convertHTMLToDocx(styledHTML, options);

      // Create blob dan download
      const blob = new Blob([docxContent], {
        type: 'application/msword'
      });

      setExportProgress(EXPORT_PROGRESS_STEPS.FINALIZING);

      const safeFileName = sanitizeFilename(options.title || fileName, '.doc');
      downloadFile(blob, safeFileName);

      setExportProgress(EXPORT_PROGRESS_STEPS.COMPLETE);
      onSuccess?.(SUCCESS_MESSAGES.RTF_EXPORTED);

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
 * Convert HTML to Word-compatible HTML format
 * Creates clean HTML that Word can properly interpret
 */
const convertHTMLToDocx = (htmlContent: string, options: ExportOptions): string => {
  // Extract body content from the styled HTML
  const bodyMatch = htmlContent.match(/<body[^>]*>(.*?)<\/body>/s);
  const bodyContent = bodyMatch ? bodyMatch[1] : htmlContent;

  // Clean HTML content for better Word compatibility
  let cleanedHTML = bodyContent
    // Remove any remaining style tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove script tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove header and footer sections that are already in preview
    .replace(/<div[^>]*class="[^"]*header[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*footer[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*watermark[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Clean up div elements - keep structure but remove classes
    .replace(/<div[^>]*class="content"[^>]*>/gi, '<div>')
    .replace(/<div([^>]*)\sclass="[^"]*"([^>]*)>/gi, '<div$1$2>')
    // Remove problematic attributes that Word doesn't understand
    .replace(/\sdata-[^=]*="[^"]*"/gi, '')
    .replace(/\sstyle="[^"]*"/gi, '')
    // Clean up extra whitespace but preserve structure
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  // Wrap emojis in spans to preserve their original appearance
  cleanedHTML = wrapEmojisInSpans(cleanedHTML);

  // Enhance tables for better Word compatibility
  cleanedHTML = cleanedHTML.replace(/<table[^>]*>/gi, () => {
    return `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; mso-table-layout-alt: fixed;">`;
  });

  // Add Word-specific attributes to table cells
  cleanedHTML = cleanedHTML.replace(/<(th|td)([^>]*)>/gi, (_, tag, attrs) => {
    return `<${tag}${attrs} style="border: 1px solid #000000; padding: 8px; vertical-align: top; mso-border-alt: solid #000000 .5pt;">`;
  });

  // Create Word-compatible HTML structure
  const docxHTML = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <meta name="ProgId" content="Word.Document">
  <meta name="Generator" content="Microsoft Word 15">
  <meta name="Originator" content="Microsoft Word 15">
  <title>${(options.title || 'Document').replace(/[<>&"]/g, (char) => {
    const escapeMap: { [key: string]: string } = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' };
    return escapeMap[char] || char;
  })}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>90</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: ${options.pageSize === 'A4' ? '210mm 297mm' : '216mm 356mm'};
      margin: 25mm;
    }
    body {
      font-family: "${options.fontFamily}", "Times New Roman", serif;
      font-size: ${Math.max(9, Math.min(options.fontSize * 0.75, 14))}pt;
      line-height: 1.6;
      color: #000000;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #000000;
      font-weight: bold;
      margin-top: 18pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }
    h1 { font-size: ${Math.max(16, Math.min(options.fontSize * 1.5, 20))}pt; color: #000000; }
    h2 { font-size: ${Math.max(14, Math.min(options.fontSize * 1.3, 18))}pt; color: #000000; }
    h3 { font-size: ${Math.max(12, Math.min(options.fontSize * 1.1, 16))}pt; color: #000000; }
    h4 { font-size: ${Math.max(11, Math.min(options.fontSize * 1.0, 14))}pt; color: #000000; }
    h5 { font-size: ${Math.max(10, Math.min(options.fontSize * 0.9, 12))}pt; color: #000000; }
    h6 { font-size: ${Math.max(9, Math.min(options.fontSize * 0.8, 11))}pt; color: #000000; }

    /* Preserve emoji colors - override theme colors for emoji spans */
    .emoji-preserve {
      color: initial !important;
      font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;
      font-size: inherit !important;
    }

    /* Ensure emojis don't inherit parent colors */
    h1 .emoji-preserve,
    h2 .emoji-preserve,
    h3 .emoji-preserve,
    h4 .emoji-preserve,
    h5 .emoji-preserve,
    h6 .emoji-preserve,
    p .emoji-preserve,
    li .emoji-preserve,
    strong .emoji-preserve,
    b .emoji-preserve {
      color: initial !important;
    }
    p {
      margin: 6pt 0;
      text-align: left;
      line-height: 1.4;
      color: #000000;
    }
    strong, b {
      font-weight: bold;
      color: #000000;
    }
    em, i {
      font-style: italic;
      color: #000000;
    }
    code {
      font-family: "Courier New", monospace;
      background-color: #f5f5f5;
      color: #000000;
      padding: 1pt 2pt;
      font-size: ${Math.max(8, Math.min(options.fontSize * 0.7, 11))}pt;
      border: 1pt solid #ddd;
    }
    pre {
      font-family: "Courier New", monospace;
      background-color: #f8f8f8;
      color: #000000;
      padding: 8pt;
      border: 1pt solid #ddd;
      margin: 8pt 0;
      white-space: pre-wrap;
      font-size: ${Math.max(8, Math.min(options.fontSize * 0.7, 11))}pt;
    }
    blockquote {
      border-left: 3pt solid #ccc;
      margin: 8pt 0;
      padding: 4pt 8pt;
      font-style: italic;
      background-color: #f9f9f9;
      color: #000000;
    }
    ul, ol {
      margin: 6pt 0;
      padding-left: 18pt;
      color: #000000;
    }
    li {
      margin: 3pt 0;
      color: #000000;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 8pt 0;
      border: 1pt solid #000000;
      font-size: ${Math.max(8, Math.min(options.fontSize * 0.75, 12))}pt;
    }
    th, td {
      border: 1pt solid #666666;
      padding: 4pt 8pt;
      text-align: left;
      vertical-align: top;
      color: #000000;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
      color: #000000;
    }
    a {
      color: #0066cc;
      text-decoration: underline;
    }
    a:hover {
      color: #000000;
    }
  </style>
</head>
<body>
  ${cleanedHTML}
</body>
</html>`;

  return docxHTML;
};



/**
 * @fileoverview Hook untuk export ke DOCX (RTF format)
 * @author Axel Modra
 */

import { useCallback, useState } from 'react';
import type { ExportOptions, UseExportReturn } from '../types/export.types';
import { ERROR_MESSAGES, EXPORT_PROGRESS_STEPS, SUCCESS_MESSAGES } from '../utils/constants';
import { downloadFile, sanitizeFilename } from '../utils/downloadFile';
import { generateStyledHTML } from '../utils/htmlGenerator';
import { convertMarkdownToHTML } from '../utils/markdownConverter';

/**
 * Wrap emojis in spans to preserve their original colors
 * Enhanced version with better Word compatibility
 */
const wrapEmojisInSpans = (html: string): string => {
  // Enhanced emoji regex yang mencakup lebih banyak range emoji
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]|[\u{1F004}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3297}]|[\u{3299}]|[\u{303D}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]|[\u{23F3}]|[\u{24C2}]|[\u{23E9}-\u{23EF}]|[\u{25B6}]|[\u{23F8}-\u{23FA}]|[\u{200D}]|[\u{20E3}]|[\u{FE0F}]/gu;

  return html.replace(emojiRegex, (emoji) => {
    // Menggunakan Word-specific styling untuk mempertahankan warna emoji
    return `<span style="color: auto !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', 'EmojiOne', sans-serif !important; mso-font-charset: 1; mso-generic-font-family: auto; mso-font-pitch: variable; mso-font-signature: 0 0 0 0 0 0;">${emoji}</span>`;
  });
};

/**
 * Additional emoji enhancement for better Word compatibility
 */
const enhanceEmojiForWord = (html: string): string => {
  // Tambahan untuk emoji yang tidak tertangkap regex pertama
  // Pattern untuk emoji yang sering digunakan
  const additionalEmojiPatterns = [
    // Checkmarks dan symbols
    {
      pattern: /✅/g,
      replacement:
        "<span style=\"color: #00AA00 !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;\">✅</span>",
    },
    {
      pattern: /❌/g,
      replacement:
        "<span style=\"color: #FF0000 !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;\">❌</span>",
    },
    {
      pattern: /⭐/g,
      replacement:
        "<span style=\"color: #FFD700 !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;\">⭐</span>",
    },
    {
      pattern: /✨/g,
      replacement:
        "<span style=\"color: #FFD700 !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;\">✨</span>",
    },
    {
      pattern: /🎉/g,
      replacement:
        "<span style=\"color: auto !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;\">🎉</span>",
    },
    {
      pattern: /🚀/g,
      replacement:
        "<span style=\"color: auto !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;\">🚀</span>",
    },
    {
      pattern: /📝/g,
      replacement:
        "<span style=\"color: auto !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;\">📝</span>",
    },
    {
      pattern: /🎨/g,
      replacement:
        "<span style=\"color: auto !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;\">🎨</span>",
    },
    {
      pattern: /📊/g,
      replacement:
        "<span style=\"color: auto !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;\">📊</span>",
    },
    {
      pattern: /🔧/g,
      replacement:
        "<span style=\"color: auto !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;\">🔧</span>",
    },
    {
      pattern: /💡/g,
      replacement:
        "<span style=\"color: auto !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;\">💡</span>",
    },
    {
      pattern: /📚/g,
      replacement:
        "<span style=\"color: auto !important; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;\">📚</span>",
    },
  ];

  let processedHTML = html;

  // Apply specific patterns untuk emoji yang sering digunakan, hanya jika belum di-wrap
  additionalEmojiPatterns.forEach(({ pattern, replacement }) => {
    // Check apakah emoji sudah dalam span dengan styling khusus
    const existingSpanRegex = new RegExp(
      `<span[^>]*style[^>]*>${pattern.source.replace(/\//g, '')}</span>`,
      'g'
    );

    // Hanya replace jika emoji belum di-wrap dalam span
    if (!existingSpanRegex.test(processedHTML)) {
      processedHTML = processedHTML.replace(pattern, replacement);
    }
  });

  return processedHTML;
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

  const startExport = useCallback(
    async (options: ExportOptions) => {
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
          themeConfig: {
            name: 'default',
            primaryColor: '#000000',
            backgroundColor: '#ffffff',
            accentColor: '#000000',
          },
        });

        setExportProgress(EXPORT_PROGRESS_STEPS.GENERATING);

        // Convert HTML to simple DOCX format (HTML with DOCX headers)
        const docxContent = convertHTMLToDocx(styledHTML, options);

        // Create blob dan download
        const blob = new Blob([docxContent], {
          type: 'application/msword',
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
    },
    [markdown, fileName, onSuccess, onError]
  );

  const resetExport = useCallback(() => {
    setIsExporting(false);
    setExportProgress(0);
  }, []);

  return {
    isExporting,
    exportProgress,
    startExport,
    resetExport,
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

  // Additional processing for better emoji rendering in Word
  cleanedHTML = enhanceEmojiForWord(cleanedHTML);

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
  <meta http-equiv="Content-Language" content="id">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${(options.title || 'Document').replace(/[<>&"]/g, (char) => {
    const escapeMap: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
    };
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

    /* Enhanced emoji preservation for Word compatibility */
    span[style*="mso-font-charset"] {
      color: auto !important;
      font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', 'EmojiOne', sans-serif !important;
      font-size: inherit !important;
      mso-font-charset: 1;
      mso-generic-font-family: auto;
      mso-font-pitch: variable;
      mso-font-signature: 0 0 0 0 0 0;
    }

    /* Prevent emoji inheritance from parent elements */
    h1 span[style*="mso-font-charset"],
    h2 span[style*="mso-font-charset"],
    h3 span[style*="mso-font-charset"],
    h4 span[style*="mso-font-charset"],
    h5 span[style*="mso-font-charset"],
    h6 span[style*="mso-font-charset"],
    p span[style*="mso-font-charset"],
    li span[style*="mso-font-charset"],
    strong span[style*="mso-font-charset"],
    b span[style*="mso-font-charset"],
    em span[style*="mso-font-charset"],
    i span[style*="mso-font-charset"] {
      color: auto !important;
      font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', 'EmojiOne', sans-serif !important;
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

    /* Additional emoji-specific styles */
    span[style*="color: #00AA00"] { color: #00AA00 !important; } /* Green checkmarks */
    span[style*="color: #FF0000"] { color: #FF0000 !important; } /* Red X marks */
    span[style*="color: #FFD700"] { color: #FFD700 !important; } /* Gold stars */
    
    /* Force emoji font family everywhere */
    *[style*="Segoe UI Emoji"] {
      font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', 'EmojiOne', sans-serif !important;
    }
  </style>
</head>
<body>
  ${cleanedHTML}
</body>
</html>`;

  return docxHTML;
};

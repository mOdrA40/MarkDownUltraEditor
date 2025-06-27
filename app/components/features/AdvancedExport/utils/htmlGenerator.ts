import { HTMLGeneratorOptions, ThemeConfig } from '../types/export.types';
import { THEMES } from './constants';

/**
 * Get appropriate text color based on current theme context
 */
const getTextColorForTheme = (isDarkTheme: boolean): string => {
    return isDarkTheme ? '#ffffff' : '#000000';
};

/**
 * Detect if current context is dark theme
 */
const isDarkThemeContext = (): boolean => {
    // Check if body has dark theme classes or if user prefers dark mode
    if (typeof window !== 'undefined') {
        const body = document.body;
        const isDarkClass = body.classList.contains('dark') ||
                           body.classList.contains('theme-dark') ||
                           body.getAttribute('data-theme') === 'dark';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isDarkClass || prefersDark;
    }
    return false;
};

/**
 * Generate styled HTML document untuk export
 * 
 * @param options - Konfigurasi untuk generate HTML
 * @returns Complete HTML document string
 */
export const generateStyledHTML = (options: HTMLGeneratorOptions): string => {
    const theme = THEMES[options.theme] || THEMES.default;
    const isDark = isDarkThemeContext();
    const textColor = getTextColorForTheme(isDark);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(options.title)}</title>
    <style>
        ${generateBaseStyles()}
        ${generateThemeStyles(theme, options)}
        ${generateLayoutStyles()}
        ${generateComponentStyles(theme)}
        ${generatePrintStyles()}
        ${options.customCSS}
    </style>
</head>
<body>
    ${generateWatermark(options)}
    ${generateHeader(options, textColor)}
    <div class="content">
        ${options.htmlContent}
    </div>
    ${generateFooter(options)}
</body>
</html>`;
};

/**
 * Generate base CSS styles
 */
const generateBaseStyles = (): string => {
    return `
        @import url('https://fonts.googleapis.com/css2?family=Arial:wght@300;400;600;700&family=Times+New+Roman:wght@300;400;600;700&family=Helvetica:wght@300;400;600;700&family=Georgia:wght@300;400;600;700&family=Verdana:wght@300;400;600;700&family=Roboto:wght@300;400;600;700&family=Open+Sans:wght@300;400;600;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }`;
};

/**
 * Generate theme-specific styles
 */
const generateThemeStyles = (theme: ThemeConfig, options: HTMLGeneratorOptions): string => {
    return `
        body {
            font-family: '${options.fontFamily}', sans-serif;
            font-size: ${options.fontSize}px;
            line-height: 1.6;
            color: ${theme.primaryColor};
            background-color: ${theme.backgroundColor};
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        h1, h2, h3, h4, h5, h6 {
            color: ${theme.accentColor};
            margin: 1.5em 0 0.5em 0;
            font-weight: 600;
        }

        a {
            color: ${theme.accentColor};
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: border-bottom 0.2s;
        }

        a:hover {
            border-bottom: 1px solid ${theme.accentColor};
        }`;
};

/**
 * Generate layout styles
 */
const generateLayoutStyles = (): string => {
    return `
        h1 { 
            font-size: 2.5em; 
            border-bottom: 3px solid currentColor; 
            padding-bottom: 0.3em; 
        }
        h2 { 
            font-size: 2em; 
            border-bottom: 2px solid currentColor; 
            padding-bottom: 0.2em; 
        }
        h3 { font-size: 1.5em; }
        h4 { font-size: 1.25em; }
        h5 { font-size: 1.1em; }
        h6 { font-size: 1em; }

        p {
            margin: 1em 0;
            text-align: justify;
        }

        ul, ol {
            margin: 1em 0;
            padding-left: 2em;
        }

        li {
            margin: 0.5em 0;
        }`;
};

/**
 * Generate component-specific styles
 */
const generateComponentStyles = (theme: ThemeConfig): string => {
    const isDark = theme.backgroundColor !== '#ffffff';

    return `
        blockquote {
            border-left: 4px solid ${theme.accentColor};
            margin: 1.5em 0;
            padding: 1em 1.5em;
            background-color: ${isDark ? '#2a2a2a' : '#f8f9fa'};
            font-style: italic;
        }

        code {
            background-color: ${isDark ? '#1f2937' : '#f8f9fa'};
            color: ${isDark ? '#e5e7eb' : theme.primaryColor};
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            border: 1px solid ${isDark ? '#374151' : '#e9ecef'};
        }

        pre {
            background-color: ${isDark ? '#1f2937' : '#f8f9fa'};
            color: ${isDark ? '#e5e7eb' : theme.primaryColor};
            padding: 1.5em;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1.5em 0;
            border: 1px solid ${isDark ? '#374151' : '#e9ecef'};
        }

        pre code {
            background: none;
            padding: 0;
            border: none;
            color: inherit;
        }

        img {
            max-width: 100%;
            height: auto;
            margin: 1.5em 0;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5em 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        th, td {
            border: 1px solid ${isDark ? '#4a4a4a' : '#e1e5e9'};
            padding: 0.75em;
            text-align: left;
        }

        th {
            background-color: ${theme.accentColor};
            color: white;
            font-weight: 600;
        }

        tr:nth-child(even) {
            background-color: ${isDark ? '#2a2a2a' : '#f8f9fa'};
        }`;
};

/**
 * Generate print-specific styles
 */
const generatePrintStyles = (): string => {
    return `
        @media print {
            body {
                margin: 0;
                padding: 20px;
            }

            .page-break {
                page-break-before: always;
            }

            .no-print {
                display: none;
            }

            a {
                color: inherit;
                text-decoration: none;
            }

            img {
                max-width: 100%;
                page-break-inside: avoid;
            }

            h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
            }

            blockquote, pre {
                page-break-inside: avoid;
            }
        }`;
};

/**
 * Generate watermark element
 */
const generateWatermark = (options: HTMLGeneratorOptions): string => {
    if (!options.watermark) return '';

    return `
    <div class="watermark" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 4em;
        color: ${THEMES[options.theme].accentColor};
        opacity: 0.1;
        z-index: -1;
        pointer-events: none;
    ">${escapeHtml(options.watermark)}</div>`;
};

/**
 * Generate header section with theme-aware colors
 */
const generateHeader = (options: HTMLGeneratorOptions, textColor?: string): string => {
    if (!options.headerFooter) return '';

    // Detect current theme context for better color selection
    const isDark = typeof window !== 'undefined' &&
      (document.body.classList.contains('dark') ||
       document.body.classList.contains('theme-dark') ||
       document.body.getAttribute('data-theme') === 'dark' ||
       window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Smart color selection based on theme and context
    let authorColor = textColor;
    if (!authorColor) {
        // For dark themes or dark context, use light colors
        const themeConfig = THEMES[options.theme];
        const isDarkTheme = options.theme === 'dark' ||
                           (themeConfig && themeConfig.backgroundColor !== '#ffffff' && themeConfig.backgroundColor !== '#fafafa');

        if (isDark || isDarkTheme) {
            authorColor = '#e5e7eb'; // Light gray for dark backgrounds
        } else {
            // For light themes, use dark colors
            authorColor = themeConfig?.primaryColor || '#374151';
        }
    }

    // Ensure good contrast for title
    const titleColor = THEMES[options.theme].accentColor || (isDark ? '#60a5fa' : '#2563eb');

    // Border color with theme awareness
    const borderColor = THEMES[options.theme].accentColor || (isDark ? '#4b5563' : '#d1d5db');

    return `
    <div class="header" style="
        text-align: center;
        margin-bottom: 3em;
        padding-bottom: 2em;
        border-bottom: 2px solid ${borderColor};
    ">
        <div class="title" style="
            font-size: 3em;
            color: ${titleColor};
            margin-bottom: 0.5em;
            font-weight: 700;
        ">${escapeHtml(options.title)}</div>
        <div class="author" style="
            font-size: 1.2em;
            color: ${authorColor};
            opacity: 0.9;
            font-weight: 500;
        ">by ${escapeHtml(options.author)}</div>
        ${options.description ? `
        <div class="description" style="
            font-size: 1em;
            color: ${authorColor};
            opacity: 0.8;
            margin-top: 0.5em;
        ">${escapeHtml(options.description)}</div>
        ` : ''}
    </div>`;
};

/**
 * Generate footer section
 */
const generateFooter = (options: HTMLGeneratorOptions): string => {
    if (!options.headerFooter) return '';

    return `
    <div class="footer" style="
        margin-top: 3em;
        padding-top: 2em;
        border-top: 1px solid ${THEMES[options.theme].accentColor};
        text-align: center;
        font-size: 0.9em;
        opacity: 0.7;
    ">
        Generated on ${new Date().toLocaleDateString()} • ${escapeHtml(options.title)}
    </div>`;
};

/**
 * Escape HTML characters untuk security
 */
const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Generate CSS untuk specific page size
 */
export const generatePageSizeCSS = (pageSize: string, orientation: string): string => {
    const sizes = {
        A4: { width: '210mm', height: '297mm' },
        Letter: { width: '8.5in', height: '11in' },
        Legal: { width: '8.5in', height: '14in' }
    };

    const size = sizes[pageSize as keyof typeof sizes] || sizes.A4;
    const isLandscape = orientation === 'landscape';

    return `
    @page {
        size: ${isLandscape ? `${size.height} ${size.width}` : `${size.width} ${size.height}`};
        margin: 1in;
    }
  `;
};

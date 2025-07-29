import type { HTMLGeneratorOptions, ThemeConfig } from '../types/export.types';
import { THEMES } from './constants';

/**
 * Get appropriate content text color based on current app theme
 * This ensures all text (including content) is visible in all themes
 */
const getContentTextColor = (isDarkTheme: boolean): string => {
  return isDarkTheme ? '#ffffff' : '#000000';
};

/**
 * Force check if current app theme is dark by checking multiple sources
 */
const isCurrentAppThemeDark = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check multiple possible sources for theme information
  const body = document.body;
  const html = document.documentElement;

  // Check data attributes
  const bodyTheme = body.getAttribute('data-theme');
  const htmlTheme = html.getAttribute('data-theme');

  // Check classes
  const hasDarkClass =
    body.classList.contains('dark') ||
    body.classList.contains('theme-dark') ||
    html.classList.contains('dark') ||
    html.classList.contains('theme-dark');

  // Check if theme is explicitly dark
  const isExplicitlyDark = bodyTheme === 'dark' || htmlTheme === 'dark';

  // Check CSS custom properties
  const rootStyles = getComputedStyle(html);
  const bgColor = rootStyles.getPropertyValue('--background') || '';
  const textColor = rootStyles.getPropertyValue('--foreground') || '';

  // Dark theme typically has dark background colors
  const hasDarkBgColor =
    bgColor.includes('0f172a') ||
    bgColor.includes('1e293b') ||
    bgColor.includes('1f2937') ||
    bgColor.includes('111827') ||
    bgColor.includes('1a1a1a');

  // Light text color indicates dark theme
  const hasLightTextColor =
    textColor.includes('f1f5f9') || textColor.includes('ffffff') || textColor.includes('e5e7eb');

  // Additional check for theme selector state
  const themeSelector = document.querySelector('[data-theme-selector]') as HTMLElement;
  const selectedTheme = themeSelector?.getAttribute('data-current-theme') || '';
  const isSelectedDark = selectedTheme === 'dark';

  // Check for dark theme in localStorage
  let storedTheme = '';
  try {
    storedTheme = localStorage.getItem('theme') || localStorage.getItem('selectedTheme') || '';
  } catch {
    // Ignore localStorage errors
  }
  const isStoredDark = storedTheme === 'dark';

  const result =
    isExplicitlyDark ||
    hasDarkClass ||
    hasDarkBgColor ||
    hasLightTextColor ||
    isSelectedDark ||
    isStoredDark;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev('Dark theme detection (PDF):', {
        isExplicitlyDark,
        hasDarkClass,
        hasDarkBgColor,
        hasLightTextColor,
        isSelectedDark,
        isStoredDark,
        result,
        bodyTheme,
        htmlTheme,
        bgColor,
        textColor,
        selectedTheme,
        storedTheme,
      });
    });
  }

  return result;
};

/**
 * Detect if current context is dark theme
 */
const isDarkThemeContext = (): boolean => {
  // Use comprehensive dark theme detection
  if (typeof window !== 'undefined') {
    const isDark = isCurrentAppThemeDark();

    // Additional fallback: check if body background is dark
    if (!isDark) {
      const body = document.body;
      const computedStyle = getComputedStyle(body);
      const backgroundColor = computedStyle.backgroundColor;
      const color = computedStyle.color;

      // If background is dark or text is light, assume dark theme
      const isDarkBg =
        backgroundColor.includes('rgb(15, 23, 42)') || // slate-900
        backgroundColor.includes('rgb(30, 41, 59)') || // slate-800
        backgroundColor.includes('rgb(31, 41, 55)') || // gray-800
        backgroundColor.includes('rgb(17, 24, 39)'); // gray-900

      const isLightText =
        color.includes('rgb(241, 245, 249)') || // slate-100
        color.includes('rgb(255, 255, 255)') || // white
        color.includes('rgb(229, 231, 235)'); // gray-200

      if (isDarkBg || isLightText) {
        return true;
      }
    }

    return isDark;
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
  // Untuk export, selalu gunakan warna hitam untuk teks agar mudah dibaca di kertas putih
  const textColor = '#000000';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(options.title)}</title>
    <style>
        ${generateBaseStyles()}
        ${generateThemeStyles(theme, options, true)} /* true = forExport */
        ${generateLayoutStyles()}
        ${generateComponentStyles(theme, true)} /* true = forExport */
        ${generateEmojiStyles()} /* Emoji preservation styles */
        ${generatePrintStyles()}
        ${generatePageSizeCSS(options.pageSize, options.orientation)}
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
const generateThemeStyles = (
  theme: ThemeConfig,
  options: HTMLGeneratorOptions,
  forExport = false
): string => {
  // Untuk export, selalu gunakan warna hitam untuk teks dan background putih
  const contentTextColor = forExport ? '#000000' : getContentTextColor(isDarkThemeContext());
  const backgroundColor = forExport ? '#ffffff' : theme.backgroundColor;
  const isDark = forExport ? false : isDarkThemeContext();

  return `
        body {
            font-family: '${options.fontFamily}', sans-serif;
            font-size: ${options.fontSize}px;
            line-height: 1.6;
            color: ${contentTextColor} !important;
            background-color: ${backgroundColor};
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        /* Force all text elements to use correct color, except emojis */
        body *:not([style*="mso-font-charset"]):not(span[style*="Segoe UI Emoji"]):not(span[style*="color: #00AA00"]):not(span[style*="color: #FF0000"]):not(span[style*="color: #FFD700"]) {
            color: ${contentTextColor} !important;
        }

        /* Override specific elements that should keep their own colors */
        body a {
            color: ${forExport ? '#3b82f6' : isDark ? '#60a5fa' : '#3b82f6'} !important;
        }

        /* Preserve emoji colors explicitly */
        body span[style*="mso-font-charset"],
        body span[style*="Segoe UI Emoji"],
        body span[style*="color: #00AA00"],
        body span[style*="color: #FF0000"], 
        body span[style*="color: #FFD700"],
        body span[style*="color: auto"] {
            color: inherit !important;
        }

        h1, h2, h3, h4, h5, h6 {
            color: ${contentTextColor} !important;
            margin: 1.5em 0 0.5em 0;
            font-weight: 600;
        }

        a {
            color: ${forExport ? '#3b82f6' : isDark ? contentTextColor : theme.accentColor};
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: border-bottom 0.2s;
        }

        a:hover {
            border-bottom: 1px solid ${forExport ? '#3b82f6' : isDark ? contentTextColor : theme.accentColor};
        }`;
};

/**
 * Generate layout styles
 */
const generateLayoutStyles = (): string => {
  const isDark = isDarkThemeContext();
  const contentTextColor = getContentTextColor(isDark);

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
            color: ${contentTextColor};
        }

        ul, ol {
            margin: 1em 0;
            padding-left: 2em;
            color: ${contentTextColor};
        }

        li {
            margin: 0.5em 0;
            color: ${contentTextColor};
        }`;
};

/**
 * Generate component-specific styles
 */
const generateComponentStyles = (theme: ThemeConfig, forExport = false): string => {
  // Untuk export, selalu gunakan warna hitam untuk teks
  const contentTextColor = forExport ? '#000000' : getContentTextColor(isDarkThemeContext());
  const isDark = forExport ? false : isDarkThemeContext();

  return `
        blockquote {
            border-left: 4px solid ${forExport ? theme.accentColor : isDark ? contentTextColor : theme.accentColor};
            margin: 1.5em 0;
            padding: 1em 1.5em;
            background-color: ${forExport ? '#f8f9fa' : isDark ? '#2a2a2a' : '#f8f9fa'};
            font-style: italic;
            color: ${contentTextColor};
        }

        code {
            background-color: ${forExport ? '#f8f9fa' : isDark ? '#1f2937' : '#f8f9fa'};
            color: ${contentTextColor};
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            border: 1px solid ${forExport ? '#e9ecef' : isDark ? '#374151' : '#e9ecef'};
        }

        pre {
            background-color: ${forExport ? '#f8f9fa' : isDark ? '#1f2937' : '#f8f9fa'};
            color: ${contentTextColor};
            padding: 1.5em;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1.5em 0;
            border: 1px solid ${forExport ? '#e9ecef' : isDark ? '#374151' : '#e9ecef'};
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
            color: ${contentTextColor};
        }

        th {
            background-color: ${forExport ? theme.accentColor : isDark ? '#3b82f6' : theme.accentColor};
            color: #ffffff !important;
            font-weight: 600;
        }

        tr:nth-child(even) {
            background-color: ${isDark ? '#2a2a2a' : '#f8f9fa'};
        }

        tr:nth-child(even) td {
            color: ${contentTextColor};
        }`;
};

/**
 * Generate emoji-specific styles untuk export compatibility
 */
const generateEmojiStyles = (): string => {
  return `
        /* Enhanced emoji preservation for all export formats */
        span[style*="mso-font-charset"],
        span[style*="Segoe UI Emoji"],
        span[style*="Apple Color Emoji"],
        span[style*="Noto Color Emoji"] {
            color: auto !important;
            font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', 'EmojiOne', sans-serif !important;
            font-size: inherit !important;
            text-decoration: none !important;
        }

        /* Specific emoji color preservation */
        span[style*="color: #00AA00"] { color: #00AA00 !important; } /* Green checkmarks ✅ */
        span[style*="color: #FF0000"] { color: #FF0000 !important; } /* Red X marks ❌ */
        span[style*="color: #FFD700"] { color: #FFD700 !important; } /* Gold stars ⭐✨ */
        span[style*="color: auto"] { color: auto !important; } /* Auto color emojis */

        /* Force emoji styling in all contexts */
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
        i span[style*="mso-font-charset"],
        td span[style*="mso-font-charset"],
        th span[style*="mso-font-charset"],
        blockquote span[style*="mso-font-charset"] {
            color: auto !important;
            font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', 'EmojiOne', sans-serif !important;
        }

        /* Additional fallback for emoji preservation */
        [style*="Segoe UI Emoji"],
        [style*="Apple Color Emoji"],
        [style*="Noto Color Emoji"] {
            color: auto !important;
            font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;
        }
    `;
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
  const isDark =
    typeof window !== 'undefined' &&
    (document.body.classList.contains('dark') ||
      document.body.classList.contains('theme-dark') ||
      document.body.getAttribute('data-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Smart color selection based on theme and context
  let authorColor = textColor;
  if (!authorColor) {
    // For dark themes or dark context, use light colors
    const themeConfig = THEMES[options.theme];
    const isDarkTheme =
      options.theme === 'dark' ||
      (themeConfig &&
        themeConfig.backgroundColor !== '#ffffff' &&
        themeConfig.backgroundColor !== '#fafafa');

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
        ${
          options.description
            ? `
        <div class="description" style="
            font-size: 1em;
            color: ${authorColor};
            opacity: 0.8;
            margin-top: 0.5em;
        ">${escapeHtml(options.description)}</div>
        `
            : ''
        }
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
    Legal: { width: '8.5in', height: '14in' },
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

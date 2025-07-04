/**
 * @fileoverview Format-specific preview generators untuk Advanced Export
 * @author Axel Modra
 */

import type { HTMLGeneratorOptions, ThemeConfig } from '../types/export.types';
import { THEMES } from './constants';

/**
 * Get appropriate text color based on current theme context
 */
const getTextColorForTheme = (isDarkTheme: boolean): string => {
  return isDarkTheme ? '#ffffff' : '#1f2937';
};

/**
 * Get description text color with better contrast
 */
const getDescriptionTextColor = (isDarkTheme: boolean): string => {
  return isDarkTheme ? '#d1d5db' : '#6b7280';
};

/**
 * Get content text color for readability
 */
const getContentTextColor = (isDarkTheme: boolean): string => {
  return isDarkTheme ? '#f9fafb' : '#111827';
};

/**
 * Get table header text color for better visibility
 */
const getTableHeaderTextColor = (isDarkTheme: boolean, accentColor: string): string => {
  // Untuk theme dark, gunakan warna yang kontras dengan background dark
  if (isDarkTheme) {
    // Jika accent color adalah warna terang, gunakan warna gelap untuk teks
    if (accentColor === '#60a5fa' || accentColor === '#3b82f6' || accentColor.includes('blue')) {
      return '#1e3a8a'; // Navy blue untuk kontras yang baik
    }
    // Untuk accent color gelap, gunakan putih
    return '#ffffff';
  }
  // Untuk theme light, selalu gunakan putih di atas accent color
  return '#ffffff';
};

/**
 * Get table header background color for better visibility
 */
const getTableHeaderBackgroundColor = (isDarkTheme: boolean, accentColor: string): string => {
  if (isDarkTheme) {
    // Untuk theme dark, pastikan background header terlihat dengan baik
    if (accentColor === '#60a5fa') {
      return '#3b82f6'; // Darker blue untuk kontras
    }
    return accentColor; // Gunakan accent color sebagai background
  }
  return accentColor; // Untuk theme light, gunakan accent color normal
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
    console.log('Dark theme detection:', {
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
  }

  return result;
};

/**
 * Detect if current context is dark theme
 */
const isDarkThemeContext = (options?: HTMLGeneratorOptions): boolean => {
  // Check if theme is explicitly dark
  if (options?.theme === 'dark') {
    return true;
  }

  // Check theme config
  if (options?.themeConfig) {
    const theme = options.themeConfig;
    // Consider dark if background is dark
    const bgColor = theme.backgroundColor.toLowerCase();
    if (
      bgColor.includes('#1') ||
      bgColor.includes('#2') ||
      bgColor.includes('#0') ||
      bgColor.includes('black') ||
      bgColor.includes('dark')
    ) {
      return true;
    }
  }

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
 * Escape HTML characters untuk security
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Get font family with appropriate fallbacks
 */
const getFontFamilyWithFallback = (fontFamily: string): string => {
  const fontMap: Record<string, string> = {
    Arial: '"Arial", "Helvetica Neue", Helvetica, sans-serif',
    'Times New Roman': '"Times New Roman", Times, serif',
    Helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    Georgia: 'Georgia, "Times New Roman", Times, serif',
    Verdana: 'Verdana, Geneva, sans-serif',
    Roboto: '"Roboto", "Segoe UI", Arial, sans-serif',
    'Open Sans': '"Open Sans", "Segoe UI", Arial, sans-serif',
  };

  return fontMap[fontFamily] || `"${fontFamily}", Arial, sans-serif`;
};

/**
 * Generate page size specific styles
 */
const generatePageSizeStyles = (pageSize: string, orientation: string): string => {
  const pageSizes = {
    a4: { width: '210mm', height: '297mm' },
    letter: { width: '8.5in', height: '11in' },
    legal: { width: '8.5in', height: '14in' },
  };

  const size = pageSizes[pageSize as keyof typeof pageSizes] || pageSizes.a4;
  const isLandscape = orientation === 'landscape';

  const width = isLandscape ? size.height : size.width;
  const height = isLandscape ? size.width : size.height;

  // Convert to approximate pixel values for preview
  const widthPx =
    pageSize === 'a4'
      ? isLandscape
        ? '842px'
        : '595px'
      : pageSize === 'letter'
        ? isLandscape
          ? '792px'
          : '612px'
        : pageSize === 'legal'
          ? isLandscape
            ? '1008px'
            : '612px'
          : '595px';

  const heightPx =
    pageSize === 'a4'
      ? isLandscape
        ? '595px'
        : '842px'
      : pageSize === 'letter'
        ? isLandscape
          ? '612px'
          : '792px'
        : pageSize === 'legal'
          ? isLandscape
            ? '612px'
            : '1008px'
          : '842px';

  return `
        .content {
            max-width: ${widthPx} !important;
            min-height: ${heightPx} !important;
            margin: 0 auto !important;
            border: 2px dashed #ccc !important;
            position: relative !important;
        }

        .content::before {
            content: "${pageSize.toUpperCase()} ${orientation}";
            position: absolute;
            bottom: 10px;
            left: 15px;
            background: rgba(0,0,0,0.1);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            font-weight: bold;
            z-index: 10;
            backdrop-filter: blur(4px);
        }

        @media print {
            @page {
                size: ${width} ${height};
                margin: 1in;
            }
        }
    `;
};

/**
 * Generate RTF-style preview HTML
 */
export const generateRTFPreviewHTML = (options: HTMLGeneratorOptions): string => {
  const theme = THEMES[options.theme] || THEMES.default;
  const isDark = isDarkThemeContext(options);
  const textColor = getTextColorForTheme(isDark);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(options.title)}</title>
    <style>
        ${generateRTFStyles(theme, options)}
        ${options.customCSS || ''}
    </style>
</head>
<body>
    ${generateEnhancedWatermark(options)}
    ${generateRTFHeader(options, textColor)}
    <div class="content">
        ${options.htmlContent}
    </div>
    ${generateRTFFooter(options)}
</body>
</html>`;
};

/**
 * Generate EPUB/HTML-style preview HTML
 */
export const generateEpubPreviewHTML = (options: HTMLGeneratorOptions): string => {
  const theme = THEMES[options.theme] || THEMES.default;
  const isDark = isDarkThemeContext(options);
  const textColor = getTextColorForTheme(isDark);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(options.title)}</title>
    <style>
        ${generateEpubStyles(theme, options)}
        ${options.customCSS || ''}
    </style>
</head>
<body>
    ${generateEnhancedWatermark(options)}
    ${generateEpubHeader(options, textColor)}
    <div class="content">
        ${options.htmlContent}
    </div>
    ${generateEpubFooter(options)}
</body>
</html>`;
};

/**
 * Generate Slides/Presentation-style preview HTML
 */
export const generateSlidesPreviewHTML = (options: HTMLGeneratorOptions): string => {
  const theme = THEMES[options.theme] || THEMES.default;
  const isDark = isDarkThemeContext(options);
  const textColor = getTextColorForTheme(isDark);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(options.title)}</title>
    <style>
        ${generateSlidesStyles(theme, options)}
        ${options.customCSS || ''}
    </style>
</head>
<body>
    ${generateEnhancedWatermark(options)}
    ${generateSlidesHeader(options, textColor)}
    <div class="slides-content">
        ${convertContentToSlides(options.htmlContent)}
    </div>
    ${generateSlidesFooter(options)}
</body>
</html>`;
};

/**
 * Generate RTF-specific styles
 */
const generateRTFStyles = (theme: ThemeConfig, options: HTMLGeneratorOptions): string => {
  // Detect dark theme context
  const isDark = isDarkThemeContext(options);
  const contentTextColor = getContentTextColor(isDark);
  const tableHeaderTextColor = getTableHeaderTextColor(isDark, theme.accentColor);
  const tableHeaderBgColor = getTableHeaderBackgroundColor(isDark, theme.accentColor);

  return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ${getFontFamilyWithFallback(options.fontFamily)} !important;
            font-size: ${options.fontSize}px !important;
            line-height: 1.8;
            color: ${contentTextColor};
            background-color: ${isDark ? '#1f2937' : theme.backgroundColor};
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 30px;
        }

        .content {
            font-family: ${getFontFamilyWithFallback(options.fontFamily)} !important;
            color: ${contentTextColor} !important;
        }

        /* Force all text elements to use correct color */
        .content * {
            color: ${contentTextColor} !important;
        }

        /* Override specific elements that should keep their own colors */
        .content a {
            color: ${isDark ? '#60a5fa' : '#3b82f6'} !important;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: ${getFontFamilyWithFallback(options.fontFamily)} !important;
            color: ${contentTextColor} !important;
        }

        p, li, blockquote, td, th {
            font-family: ${getFontFamilyWithFallback(options.fontFamily)} !important;
            color: ${contentTextColor} !important;
        }

        /* Page size specific styling */
        ${generatePageSizeStyles(options.pageSize, options.orientation)}

        h1, h2, h3, h4, h5, h6 {
            color: ${contentTextColor} !important;
            margin: 1.8em 0 0.8em 0;
            font-weight: 600;
            line-height: 1.3;
        }

        h1 {
            font-size: 2.5em;
            border-bottom: 3px solid ${theme.accentColor};
            padding-bottom: 0.3em;
        }
        h2 {
            font-size: 2em;
            border-bottom: 2px solid ${theme.accentColor};
            padding-bottom: 0.2em;
        }
        h3 { font-size: 1.6em; }
        h4 { font-size: 1.3em; }
        h5 { font-size: 1.1em; }
        h6 { font-size: 1em; }

        p {
            margin: 1.2em 0;
            text-align: justify;
            text-indent: 1.5em;
            hyphens: auto;
            color: ${contentTextColor};
        }

        /* RTF-specific formatting */
        .content {
            background-color: ${isDark ? '#1f2937' : '#ffffff'};
            border: 1px solid ${isDark ? '#4b5563' : '#e0e0e0'};
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 4px 12px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
        }

        ul, ol {
            margin: 1.5em 0;
            padding-left: 2.5em;
            color: ${contentTextColor};
        }

        li {
            margin: 0.8em 0;
            line-height: 1.6;
            color: ${contentTextColor};
        }

        blockquote {
            border-left: 4px solid ${theme.accentColor};
            margin: 2em 0;
            padding: 1.5em 2em;
            background-color: ${isDark ? '#374151' : '#f9f9f9'};
            font-style: italic;
            color: ${contentTextColor};
        }

        code {
            background-color: ${isDark ? '#374151' : '#f1f1f1'};
            color: ${contentTextColor};
            padding: 0.3em 0.5em;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }

        pre {
            background-color: ${isDark ? '#374151' : '#f8f8f8'};
            color: ${contentTextColor};
            padding: 1.5em;
            border-radius: 5px;
            overflow-x: auto;
            margin: 2em 0;
            border: 1px solid ${isDark ? '#4b5563' : '#e0e0e0'};
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 2em 0;
            box-shadow: 0 2px 8px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
            border-radius: 8px;
            overflow: hidden;
        }

        th, td {
            border: 1px solid ${isDark ? '#4b5563' : '#ccc'};
            padding: 0.8em;
            text-align: left;
            color: ${contentTextColor};
        }

        th {
            background-color: ${tableHeaderBgColor};
            color: ${tableHeaderTextColor} !important;
            font-weight: bold;
        }

        tr:nth-child(even) {
            background-color: ${isDark ? '#374151' : '#f9f9f9'};
        }

        tr:nth-child(even) td {
            color: ${contentTextColor};
        }

        .rtf-preview-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: ${theme.accentColor};
            color: ${tableHeaderTextColor};
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }
    `;
};

/**
 * Generate EPUB/HTML-specific styles
 */
const generateEpubStyles = (theme: ThemeConfig, options: HTMLGeneratorOptions): string => {
  // Detect dark theme context
  const isDark = isDarkThemeContext(options);
  const contentTextColor = getContentTextColor(isDark);
  const tableHeaderTextColor = getTableHeaderTextColor(isDark, theme.accentColor);
  const tableHeaderBgColor = getTableHeaderBackgroundColor(isDark, theme.accentColor);

  return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ${getFontFamilyWithFallback(options.fontFamily)} !important;
            font-size: ${options.fontSize}px !important;
            line-height: 1.7;
            color: ${contentTextColor};
            background-color: ${isDark ? '#1f2937' : theme.backgroundColor};
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 30px;
        }

        .content {
            font-family: ${getFontFamilyWithFallback(options.fontFamily)} !important;
            color: ${contentTextColor} !important;
        }

        /* Force all text elements to use correct color */
        .content * {
            color: ${contentTextColor} !important;
        }

        /* Override specific elements that should keep their own colors */
        .content a {
            color: ${isDark ? '#60a5fa' : '#3b82f6'} !important;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: ${getFontFamilyWithFallback(options.fontFamily)} !important;
            color: ${contentTextColor} !important;
        }

        p, li, blockquote, td, th {
            font-family: ${getFontFamilyWithFallback(options.fontFamily)} !important;
            color: ${contentTextColor} !important;
        }

        /* Page size specific styling */
        ${generatePageSizeStyles(options.pageSize, options.orientation)}

        h1, h2, h3, h4, h5, h6 {
            color: ${contentTextColor} !important;
            margin: 1.8em 0 0.8em 0;
            font-weight: 600;
            line-height: 1.3;
        }

        h1 {
            font-size: 2.5em;
            border-bottom: 3px solid ${theme.accentColor};
            padding-bottom: 0.3em;
        }
        h2 {
            font-size: 2em;
            border-bottom: 2px solid ${theme.accentColor};
            padding-bottom: 0.2em;
        }
        h3 { font-size: 1.6em; }
        h4 { font-size: 1.3em; }
        h5 { font-size: 1.1em; }
        h6 { font-size: 1em; }

        p {
            margin: 1.2em 0;
            text-align: justify;
            color: ${contentTextColor};
        }

        ul, ol {
            margin: 1.5em 0;
            padding-left: 2em;
            color: ${contentTextColor};
        }

        li {
            margin: 0.6em 0;
            color: ${contentTextColor};
        }

        blockquote {
            border-left: 4px solid ${theme.accentColor};
            margin: 2em 0;
            padding: 1.5em 2em;
            background-color: ${isDark ? '#374151' : '#f8f9fa'};
            font-style: italic;
            border-radius: 0 8px 8px 0;
            color: ${contentTextColor};
        }

        code {
            background-color: ${isDark ? '#374151' : '#f8f9fa'};
            color: ${contentTextColor};
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
        }

        pre {
            background-color: ${isDark ? '#374151' : '#f8f9fa'};
            color: ${contentTextColor};
            padding: 1.5em;
            border-radius: 8px;
            overflow-x: auto;
            margin: 2em 0;
            border: 1px solid ${isDark ? '#4b5563' : '#e9ecef'};
        }

        img {
            max-width: 100%;
            height: auto;
            margin: 2em 0;
            border-radius: 8px;
            box-shadow: 0 4px 12px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 2em 0;
            box-shadow: 0 2px 8px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
            border-radius: 8px;
            overflow: hidden;
        }

        th, td {
            border: 1px solid ${isDark ? '#4b5563' : '#e1e5e9'};
            padding: 1em;
            text-align: left;
            color: ${contentTextColor};
        }

        th {
            background-color: ${tableHeaderBgColor};
            color: ${tableHeaderTextColor} !important;
            font-weight: 600;
        }

        tr:nth-child(even) {
            background-color: ${isDark ? '#374151' : '#f8f9fa'};
        }

        tr:nth-child(even) td {
            color: ${contentTextColor};
        }

        /* HTML/EPUB-specific formatting */
        .content {
            background-color: ${isDark ? '#1f2937' : '#ffffff'};
            border-radius: 12px;
            padding: 50px;
            box-shadow: 0 8px 24px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.12)'};
            border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'};
        }

        /* Enhanced typography for web reading */
        p {
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .html-preview-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: ${theme.accentColor};
            color: ${tableHeaderTextColor};
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }
    `;
};

/**
 * Generate Slides/Presentation-specific styles
 */
const generateSlidesStyles = (theme: ThemeConfig, options: HTMLGeneratorOptions): string => {
  // Detect dark theme context
  const isDark = isDarkThemeContext(options);
  const contentTextColor = getContentTextColor(isDark);
  const tableHeaderTextColor = getTableHeaderTextColor(isDark, theme.accentColor);
  const tableHeaderBgColor = getTableHeaderBackgroundColor(isDark, theme.accentColor);

  return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ${getFontFamilyWithFallback(options.fontFamily)} !important;
            font-size: ${Math.max(options.fontSize + 2, 14)}px !important;
            line-height: 1.5;
            color: ${contentTextColor};
            background-color: ${isDark ? '#1e293b' : theme.backgroundColor};
            padding: 20px;
        }

        .slides-content {
            font-family: ${getFontFamilyWithFallback(options.fontFamily)} !important;
            color: ${contentTextColor} !important;
        }

        /* Force all text elements to use correct color */
        .slides-content * {
            color: ${contentTextColor} !important;
        }

        /* Override specific elements that should keep their own colors */
        .slides-content a {
            color: ${isDark ? '#60a5fa' : '#3b82f6'} !important;
        }

        .slide h1, .slide h2, .slide h3, .slide h4, .slide h5, .slide h6 {
            font-family: ${getFontFamilyWithFallback(options.fontFamily)} !important;
            color: ${contentTextColor} !important;
        }

        .slide p, .slide li, .slide blockquote, .slide td, .slide th {
            font-family: ${getFontFamilyWithFallback(options.fontFamily)} !important;
            color: ${contentTextColor} !important;
        }

        .slides-content {
            max-width: 900px;
            margin: 0 auto;
            background: linear-gradient(135deg, ${isDark ? '#1e293b' : theme.backgroundColor}, ${isDark ? '#0f172a' : `${theme.backgroundColor}dd`});
            border-radius: 16px;
            padding: 20px;
        }

        .slide {
            background-color: ${isDark ? '#1f2937' : '#ffffff'};
            border: 2px solid ${theme.accentColor};
            border-radius: 12px;
            padding: 40px;
            margin: 30px 0;
            min-height: 400px;
            box-shadow: 0 8px 24px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)'};
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            color: ${contentTextColor};
        }

        .slide-number {
            position: absolute;
            top: 15px;
            right: 20px;
            background: ${theme.accentColor};
            color: ${tableHeaderTextColor};
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
        }

        .slide h1, .slide h2, .slide h3, .slide h4, .slide h5, .slide h6 {
            color: ${contentTextColor} !important;
            margin: 0 0 1em 0;
            font-weight: 700;
            text-align: center;
        }

        .slide h1 {
            font-size: 3em;
            border-bottom: 4px solid ${theme.accentColor};
            padding-bottom: 0.3em;
        }
        .slide h2 {
            font-size: 2.5em;
            border-bottom: 3px solid ${theme.accentColor};
            padding-bottom: 0.2em;
        }
        .slide h3 { font-size: 2em; }
        .slide h4 { font-size: 1.7em; }
        .slide h5 { font-size: 1.4em; }
        .slide h6 { font-size: 1.2em; }

        .slide p {
            margin: 1em 0;
            text-align: center;
            font-size: 1.2em;
            color: ${contentTextColor};
        }

        .slide ul, .slide ol {
            margin: 1.5em 0;
            padding-left: 0;
            list-style: none;
            text-align: center;
            color: ${contentTextColor};
        }

        .slide li {
            margin: 1em 0;
            padding: 0.8em 1.5em;
            background-color: ${isDark ? '#374151' : '#f8f9fa'};
            border-radius: 8px;
            border-left: 4px solid ${theme.accentColor};
            font-size: 1.1em;
            position: relative;
            color: ${contentTextColor};
        }

        .slide li::before {
            content: "\\25B6";
            color: ${theme.accentColor};
            font-weight: bold;
            margin-right: 0.5em;
        }

        .slide blockquote {
            border: none;
            margin: 2em 0;
            padding: 2em;
            background: linear-gradient(135deg, ${theme.accentColor}20, ${theme.accentColor}10);
            border-radius: 12px;
            font-style: italic;
            font-size: 1.3em;
            text-align: center;
            position: relative;
            color: ${contentTextColor};
        }

        .slide blockquote::before {
            content: "\\201C";
            font-size: 4em;
            color: ${theme.accentColor};
            position: absolute;
            top: -10px;
            left: 20px;
        }

        .slide code {
            background-color: ${isDark ? '#374151' : '#f1f1f1'};
            color: ${contentTextColor};
            padding: 0.3em 0.6em;
            border-radius: 6px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 1em;
            border: 2px solid ${theme.accentColor};
        }

        .slide pre {
            background-color: ${isDark ? '#374151' : '#f8f8f8'};
            color: ${contentTextColor};
            padding: 2em;
            border-radius: 12px;
            overflow-x: auto;
            margin: 2em 0;
            border: 2px solid ${theme.accentColor};
            font-size: 1.1em;
        }

        .slide img {
            max-width: 80%;
            height: auto;
            margin: 2em auto;
            display: block;
            border-radius: 12px;
            box-shadow: 0 8px 24px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)'};
            border: 3px solid ${theme.accentColor};
        }

        .slide table {
            width: 100%;
            border-collapse: collapse;
            margin: 2em 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 24px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)'};
        }

        .slide th, .slide td {
            border: 2px solid ${theme.accentColor};
            padding: 1.2em;
            text-align: center;
            font-size: 1.1em;
            color: ${contentTextColor};
        }

        .slide th {
            background-color: ${tableHeaderBgColor};
            color: ${tableHeaderTextColor} !important;
            font-weight: bold;
            font-size: 1.2em;
        }

        .slide tr:nth-child(even) {
            background-color: ${isDark ? '#374151' : '#f8f9fa'};
        }

        .slide tr:nth-child(even) td {
            color: ${contentTextColor};
        }

        .slides-preview-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: ${theme.accentColor};
            color: ${tableHeaderTextColor};
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }
    `;
};

/**
 * Generate RTF header section
 */
const generateRTFHeader = (options: HTMLGeneratorOptions, textColor?: string): string => {
  if (!options.headerFooter) return '';

  const isDark = isDarkThemeContext(options);
  const theme = THEMES[options.theme];

  let authorColor = textColor;
  if (!authorColor) {
    const isDarkTheme =
      options.theme === 'dark' ||
      (theme && theme.backgroundColor !== '#ffffff' && theme.backgroundColor !== '#fafafa');

    if (isDark || isDarkTheme) {
      authorColor = '#e5e7eb';
    } else {
      authorColor = theme?.primaryColor || '#374151';
    }
  }

  const titleColor = theme.accentColor || (isDark ? '#60a5fa' : '#2563eb');
  const borderColor = theme.accentColor || (isDark ? '#4b5563' : '#d1d5db');
  const descriptionColor = getDescriptionTextColor(isDark);

  return `
    <div class="rtf-preview-badge">RTF Preview</div>
    <div class="header" style="
        text-align: center;
        margin-bottom: 3em;
        padding-bottom: 2em;
        border-bottom: 2px solid ${borderColor};
    ">
        <div class="title" style="
            font-size: 2.5em;
            color: ${titleColor};
            margin-bottom: 0.5em;
            font-weight: bold;
            font-family: 'Times New Roman', serif;
        ">${escapeHtml(options.title)}</div>
        <div class="author" style="
            font-size: 1.1em;
            color: ${authorColor};
            opacity: 0.9;
            font-weight: normal;
        ">by ${escapeHtml(options.author)}</div>
        ${
          options.description
            ? `
        <div class="description" style="
            font-size: 1em;
            color: ${descriptionColor};
            opacity: 0.8;
            margin-top: 0.5em;
            font-style: italic;
        ">${escapeHtml(options.description)}</div>
        `
            : ''
        }
    </div>`;
};

/**
 * Generate EPUB header section
 */
const generateEpubHeader = (options: HTMLGeneratorOptions, textColor?: string): string => {
  if (!options.headerFooter) return '';

  const isDark = isDarkThemeContext(options);
  const theme = THEMES[options.theme];

  let authorColor = textColor;
  if (!authorColor) {
    const isDarkTheme =
      options.theme === 'dark' ||
      (theme && theme.backgroundColor !== '#ffffff' && theme.backgroundColor !== '#fafafa');

    if (isDark || isDarkTheme) {
      authorColor = '#e5e7eb';
    } else {
      authorColor = theme?.primaryColor || '#374151';
    }
  }

  const titleColor = theme.accentColor || (isDark ? '#60a5fa' : '#2563eb');
  const borderColor = theme.accentColor || (isDark ? '#4b5563' : '#d1d5db');
  const descriptionColor = getDescriptionTextColor(isDark);

  return `
    <div class="html-preview-badge">HTML Preview</div>
    <div class="header" style="
        text-align: center;
        margin-bottom: 3em;
        padding-bottom: 2em;
        border-bottom: 3px solid ${borderColor};
    ">
        <div class="title" style="
            font-size: 3.2em;
            color: ${titleColor};
            margin-bottom: 0.5em;
            font-weight: 600;
            font-family: 'Georgia', serif;
        ">${escapeHtml(options.title)}</div>
        <div class="author" style="
            font-size: 1.3em;
            color: ${authorColor};
            opacity: 0.9;
            font-weight: 500;
        ">by ${escapeHtml(options.author)}</div>
        ${
          options.description
            ? `
        <div class="description" style="
            font-size: 1.1em;
            color: ${descriptionColor};
            opacity: 0.8;
            margin-top: 0.5em;
        ">${escapeHtml(options.description)}</div>
        `
            : ''
        }
    </div>`;
};

/**
 * Generate Slides header section
 */
const generateSlidesHeader = (options: HTMLGeneratorOptions, textColor?: string): string => {
  if (!options.headerFooter) return '';

  const isDark = isDarkThemeContext(options);
  const theme = THEMES[options.theme];

  let authorColor = textColor;
  if (!authorColor) {
    const isDarkTheme =
      options.theme === 'dark' ||
      (theme && theme.backgroundColor !== '#ffffff' && theme.backgroundColor !== '#fafafa');

    if (isDark || isDarkTheme) {
      authorColor = '#e5e7eb';
    } else {
      authorColor = theme?.primaryColor || '#374151';
    }
  }

  const titleColor = theme.accentColor || (isDark ? '#60a5fa' : '#2563eb');
  const descriptionColor = getDescriptionTextColor(isDark);

  return `
    <div class="slides-preview-badge">Slides Preview</div>
    <div class="slide title-slide" style="text-align: center;">
        <div class="slide-number">1</div>
        <div class="title" style="
            font-size: 4em;
            color: ${titleColor};
            margin-bottom: 0.5em;
            font-weight: 700;
            font-family: 'Helvetica', sans-serif;
        ">${escapeHtml(options.title)}</div>
        <div class="author" style="
            font-size: 1.8em;
            color: ${authorColor};
            opacity: 0.9;
            font-weight: 500;
        ">by ${escapeHtml(options.author)}</div>
        ${
          options.description
            ? `
        <div class="description" style="
            font-size: 1.3em;
            color: ${descriptionColor};
            opacity: 0.8;
            margin-top: 1em;
        ">${escapeHtml(options.description)}</div>
        `
            : ''
        }
    </div>`;
};

/**
 * Generate RTF footer section
 */
const generateRTFFooter = (options: HTMLGeneratorOptions): string => {
  if (!options.headerFooter) return '';

  return `
    <div class="footer" style="
        margin-top: 3em;
        padding-top: 2em;
        border-top: 1px solid ${THEMES[options.theme].accentColor};
        text-align: center;
        font-size: 0.9em;
        opacity: 0.7;
        font-family: 'Times New Roman', serif;
    ">
        Generated on ${new Date().toLocaleDateString()} • ${escapeHtml(options.title)} • Word Document Format
    </div>`;
};

/**
 * Generate EPUB footer section
 */
const generateEpubFooter = (options: HTMLGeneratorOptions): string => {
  if (!options.headerFooter) return '';

  return `
    <div class="footer" style="
        margin-top: 3em;
        padding-top: 2em;
        border-top: 2px solid ${THEMES[options.theme].accentColor};
        text-align: center;
        font-size: 1em;
        opacity: 0.7;
        font-family: 'Georgia', serif;
    ">
        Generated on ${new Date().toLocaleDateString()} • ${escapeHtml(options.title)} • HTML Format
    </div>`;
};

/**
 * Generate Slides footer section
 */
const generateSlidesFooter = (options: HTMLGeneratorOptions): string => {
  if (!options.headerFooter) return '';

  return `
    <div class="slide footer-slide" style="text-align: center;">
        <div class="slide-number">End</div>
        <div style="
            font-size: 2.5em;
            color: ${THEMES[options.theme].accentColor};
            margin-bottom: 1em;
            font-weight: 700;
        ">Thank You</div>
        <div style="
            font-size: 1.2em;
            opacity: 0.7;
            font-family: 'Helvetica', sans-serif;
        ">Generated on ${new Date().toLocaleDateString()} • ${escapeHtml(options.title)} • Slides Format</div>
    </div>`;
};

/**
 * Convert HTML content to slides format
 */
const convertContentToSlides = (htmlContent: string): string => {
  // Split content by headings to create slides
  const slides: string[] = [];
  let currentSlide = '';
  let slideNumber = 2; // Start from 2 since title slide is 1

  // Split by h1, h2 tags to create new slides
  const parts = htmlContent.split(/(<h[12][^>]*>.*?<\/h[12]>)/gi);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    // Check if this is a heading
    if (part.match(/^<h[12][^>]*>/i)) {
      // If we have content in current slide, save it
      if (currentSlide.trim()) {
        slides.push(`
                <div class="slide">
                    <div class="slide-number">${slideNumber}</div>
                    ${currentSlide}
                </div>`);
        slideNumber++;
      }
      // Start new slide with this heading
      currentSlide = part;
    } else {
      // Add content to current slide
      currentSlide += part;
    }
  }

  // Add the last slide if there's content
  if (currentSlide.trim()) {
    slides.push(`
        <div class="slide">
            <div class="slide-number">${slideNumber}</div>
            ${currentSlide}
        </div>`);
  }

  // If no slides were created, create one with all content
  if (slides.length === 0) {
    slides.push(`
        <div class="slide">
            <div class="slide-number">2</div>
            ${htmlContent}
        </div>`);
  }

  return slides.join('\n');
};

/**
 * Generate enhanced watermark dengan multiple layers untuk keamanan tinggi
 */
const generateEnhancedWatermark = (options: HTMLGeneratorOptions): string => {
  if (!options.watermark) return '';

  const theme = THEMES[options.theme];
  const watermarkText = escapeHtml(options.watermark);
  const timestamp = new Date().toISOString();
  const uniqueId = Math.random().toString(36).substring(2, 15);
  const checksum = btoa(watermarkText + timestamp).substring(0, 16);

  // Generate multiple watermark positions untuk coverage yang lebih baik
  const positions = [
    { top: '20%', left: '20%', rotation: '-45deg', size: '3em', opacity: '0.06' },
    { top: '50%', left: '50%', rotation: '-45deg', size: '4em', opacity: '0.08' },
    { top: '80%', left: '80%', rotation: '-45deg', size: '2.5em', opacity: '0.05' },
    { top: '30%', left: '70%', rotation: '45deg', size: '2em', opacity: '0.04' },
    { top: '70%', left: '30%', rotation: '30deg', size: '1.8em', opacity: '0.04' },
    { top: '10%', left: '60%', rotation: '-30deg', size: '1.5em', opacity: '0.03' },
    { top: '90%', left: '40%', rotation: '60deg', size: '1.5em', opacity: '0.03' },
  ];

  const watermarkLayers = positions
    .map(
      (pos, index) => `
    <div class="watermark-layer-${index + 1}" style="
        position: fixed;
        top: ${pos.top};
        left: ${pos.left};
        transform: translate(-50%, -50%) rotate(${pos.rotation});
        font-size: ${pos.size};
        color: ${theme.accentColor};
        opacity: ${pos.opacity};
        z-index: -${index + 1};
        pointer-events: none;
        user-select: none;
        font-weight: ${index % 2 === 0 ? 'bold' : '300'};
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        font-family: 'Arial', sans-serif;
        letter-spacing: 2px;
        text-transform: uppercase;
        white-space: nowrap;
        overflow: hidden;
    " data-layer="${index + 1}" data-checksum="${checksum}">${watermarkText}</div>`
    )
    .join('');

  return `
    <!-- Multi-layer security watermark system -->
    ${watermarkLayers}

    <!-- Invisible tracking elements -->
    <div style="position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px; overflow: hidden;"
         data-watermark-hash="${btoa(watermarkText)}"
         data-timestamp="${timestamp}"
         data-id="${uniqueId}"
         data-checksum="${checksum}"
         data-layers="${positions.length}">
        <!-- Hidden watermark text for forensic analysis -->
        <span>${watermarkText}</span>
    </div>

    <!-- Repeated watermark in document metadata -->
    <meta name="watermark" content="${btoa(watermarkText + timestamp)}">
    <meta name="document-id" content="${uniqueId}">
    <meta name="security-level" content="enhanced">

    <!-- Advanced CSS untuk maximum security -->
    <style>
        /* Prevent all forms of text selection and manipulation */
        [class*="watermark-layer"] {
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            -khtml-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
            cursor: default !important;
            outline: none !important;
            border: none !important;
            background: none !important;
            resize: none !important;
            -webkit-text-size-adjust: none !important;
            -moz-text-size-adjust: none !important;
            -ms-text-size-adjust: none !important;
            text-size-adjust: none !important;
        }

        /* Prevent context menu and drag operations */
        [class*="watermark-layer"]::-moz-selection {
            background: transparent !important;
        }

        [class*="watermark-layer"]::selection {
            background: transparent !important;
        }

        /* Enhanced print protection */
        @media print {
            [class*="watermark-layer"] {
                opacity: 0.2 !important;
                display: block !important;
                visibility: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

            /* Add additional print watermarks */
            body::before {
                content: "${watermarkText}";
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 5em;
                color: ${theme.accentColor};
                opacity: 0.1;
                z-index: 9999;
                pointer-events: none;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 3px;
            }
        }

        /* Prevent CSS manipulation via developer tools */
        [class*="watermark-layer"] {
            animation: watermark-protection 0.1s infinite;
        }

        @keyframes watermark-protection {
            0% { opacity: var(--watermark-opacity, 0.08); }
            100% { opacity: var(--watermark-opacity, 0.08); }
        }

        /* Additional security measures */
        body {
            -webkit-user-modify: read-only !important;
            -moz-user-modify: read-only !important;
        }

        /* Prevent screenshot tools from easily removing watermarks */
        html {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }

        /* Forensic CSS - leaves traces if modified */
        [class*="watermark-layer"]:hover::after {
            content: "Protected Content - ${uniqueId}";
            position: absolute;
            top: -20px;
            left: 0;
            font-size: 8px;
            color: transparent;
            pointer-events: none;
        }
    </style>

    <!-- JavaScript protection (if enabled) -->
    <script>
        (function() {
            'use strict';

            // Prevent console access to watermark elements
            const watermarkElements = document.querySelectorAll('[class*="watermark-layer"]');

            // Monitor for tampering attempts
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' || mutation.type === 'childList') {
                        // Log tampering attempt
                        console.warn('Document integrity check failed - ${uniqueId}');
                    }
                });
            });

            // Observe watermark elements
            watermarkElements.forEach(function(element) {
                observer.observe(element, {
                    attributes: true,
                    childList: true,
                    subtree: true
                });

                // Prevent element removal
                Object.defineProperty(element, 'remove', {
                    value: function() {
                        console.warn('Watermark removal attempt detected - ${uniqueId}');
                        return false;
                    },
                    writable: false,
                    configurable: false
                });
            });

            // Prevent right-click context menu
            document.addEventListener('contextmenu', function(e) {
                if (e.target.className && e.target.className.includes('watermark-layer')) {
                    e.preventDefault();
                    return false;
                }
            });

            // Prevent drag and drop
            document.addEventListener('dragstart', function(e) {
                if (e.target.className && e.target.className.includes('watermark-layer')) {
                    e.preventDefault();
                    return false;
                }
            });

            // Add timestamp verification
            const timestamp = '${timestamp}';
            const checksum = '${checksum}';

            // Verify document integrity
            setTimeout(function() {
                const metaWatermark = document.querySelector('meta[name="watermark"]');
                if (!metaWatermark || !metaWatermark.content) {
                    console.warn('Document integrity compromised - ${uniqueId}');
                }
            }, 1000);

        })();
    </script>`;
};

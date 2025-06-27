/**
 * @fileoverview Format-specific preview generators untuk Advanced Export
 * @author Axel Modra
 */

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
 * Escape HTML characters untuk security
 */
const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Generate RTF-style preview HTML
 */
export const generateRTFPreviewHTML = (options: HTMLGeneratorOptions): string => {
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
        ${generateRTFStyles(theme, options)}
    </style>
</head>
<body>
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
    const isDark = isDarkThemeContext();
    const textColor = getTextColorForTheme(isDark);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(options.title)}</title>
    <style>
        ${generateEpubStyles(theme, options)}
    </style>
</head>
<body>
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
    const isDark = isDarkThemeContext();
    const textColor = getTextColorForTheme(isDark);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(options.title)}</title>
    <style>
        ${generateSlidesStyles(theme, options)}
    </style>
</head>
<body>
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
    const isDark = theme.backgroundColor !== '#ffffff';
    
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', serif;
            font-size: ${options.fontSize}px;
            line-height: 1.8;
            color: ${theme.primaryColor};
            background-color: ${theme.backgroundColor};
            max-width: 700px;
            margin: 0 auto;
            padding: 60px 40px;
        }

        h1, h2, h3, h4, h5, h6 {
            color: ${theme.accentColor};
            margin: 2em 0 1em 0;
            font-weight: bold;
            text-align: left;
        }

        h1 { font-size: 2.2em; }
        h2 { font-size: 1.8em; }
        h3 { font-size: 1.5em; }
        h4 { font-size: 1.3em; }
        h5 { font-size: 1.1em; }
        h6 { font-size: 1em; }

        p {
            margin: 1.2em 0;
            text-align: justify;
            text-indent: 1.5em;
            hyphens: auto;
        }

        /* RTF-specific formatting */
        .content {
            background-color: ${isDark ? '#1a1a1a' : '#ffffff'};
            border: 1px solid ${isDark ? '#4a4a4a' : '#e0e0e0'};
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        ul, ol {
            margin: 1.5em 0;
            padding-left: 2.5em;
        }

        li {
            margin: 0.8em 0;
            line-height: 1.6;
        }

        blockquote {
            border-left: 4px solid ${theme.accentColor};
            margin: 2em 0;
            padding: 1.5em 2em;
            background-color: ${isDark ? '#2a2a2a' : '#f9f9f9'};
            font-style: italic;
        }

        code {
            background-color: ${isDark ? '#1f2937' : '#f1f1f1'};
            color: ${isDark ? '#e5e7eb' : theme.primaryColor};
            padding: 0.3em 0.5em;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }

        pre {
            background-color: ${isDark ? '#1f2937' : '#f8f8f8'};
            color: ${isDark ? '#e5e7eb' : theme.primaryColor};
            padding: 1.5em;
            border-radius: 5px;
            overflow-x: auto;
            margin: 2em 0;
            border: 1px solid ${isDark ? '#374151' : '#e0e0e0'};
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 2em 0;
        }

        th, td {
            border: 1px solid ${isDark ? '#4a4a4a' : '#ccc'};
            padding: 0.8em;
            text-align: left;
        }

        th {
            background-color: ${theme.accentColor};
            color: white;
            font-weight: bold;
        }

        tr:nth-child(even) {
            background-color: ${isDark ? '#2a2a2a' : '#f9f9f9'};
        }

        .rtf-preview-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: ${theme.accentColor};
            color: white;
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
    const isDark = theme.backgroundColor !== '#ffffff';
    
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Georgia', serif;
            font-size: ${options.fontSize}px;
            line-height: 1.7;
            color: ${theme.primaryColor};
            background-color: ${theme.backgroundColor};
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 30px;
        }

        h1, h2, h3, h4, h5, h6 {
            color: ${theme.accentColor};
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
        }

        ul, ol {
            margin: 1.5em 0;
            padding-left: 2em;
        }

        li {
            margin: 0.6em 0;
        }

        blockquote {
            border-left: 4px solid ${theme.accentColor};
            margin: 2em 0;
            padding: 1.5em 2em;
            background-color: ${isDark ? '#2a2a2a' : '#f8f9fa'};
            font-style: italic;
            border-radius: 0 8px 8px 0;
        }

        code {
            background-color: ${isDark ? '#1f2937' : '#f8f9fa'};
            color: ${isDark ? '#e5e7eb' : theme.primaryColor};
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
        }

        pre {
            background-color: ${isDark ? '#1f2937' : '#f8f9fa'};
            color: ${isDark ? '#e5e7eb' : theme.primaryColor};
            padding: 1.5em;
            border-radius: 8px;
            overflow-x: auto;
            margin: 2em 0;
            border: 1px solid ${isDark ? '#374151' : '#e9ecef'};
        }

        img {
            max-width: 100%;
            height: auto;
            margin: 2em 0;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 2em 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }

        th, td {
            border: 1px solid ${isDark ? '#4a4a4a' : '#e1e5e9'};
            padding: 1em;
            text-align: left;
        }

        th {
            background-color: ${theme.accentColor};
            color: white;
            font-weight: 600;
        }

        tr:nth-child(even) {
            background-color: ${isDark ? '#2a2a2a' : '#f8f9fa'};
        }

        /* HTML/EPUB-specific formatting */
        .content {
            background-color: ${isDark ? '#1a1a1a' : '#ffffff'};
            border-radius: 12px;
            padding: 50px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            border: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
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
            color: white;
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
    const isDark = theme.backgroundColor !== '#ffffff';

    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: ${Math.max(options.fontSize + 2, 14)}px;
            line-height: 1.5;
            color: ${theme.primaryColor};
            background-color: ${theme.backgroundColor};
            padding: 20px;
        }

        .slides-content {
            max-width: 900px;
            margin: 0 auto;
            background: linear-gradient(135deg, ${theme.backgroundColor}, ${theme.backgroundColor}dd);
            border-radius: 16px;
            padding: 20px;
        }

        .slide {
            background-color: ${isDark ? '#1a1a1a' : '#ffffff'};
            border: 2px solid ${theme.accentColor};
            border-radius: 12px;
            padding: 40px;
            margin: 30px 0;
            min-height: 400px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .slide-number {
            position: absolute;
            top: 15px;
            right: 20px;
            background: ${theme.accentColor};
            color: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
        }

        .slide h1, .slide h2, .slide h3, .slide h4, .slide h5, .slide h6 {
            color: ${theme.accentColor};
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
        }

        .slide ul, .slide ol {
            margin: 1.5em 0;
            padding-left: 0;
            list-style: none;
            text-align: center;
        }

        .slide li {
            margin: 1em 0;
            padding: 0.8em 1.5em;
            background-color: ${isDark ? '#2a2a2a' : '#f8f9fa'};
            border-radius: 8px;
            border-left: 4px solid ${theme.accentColor};
            font-size: 1.1em;
            position: relative;
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
            background-color: ${isDark ? '#1f2937' : '#f1f1f1'};
            color: ${isDark ? '#e5e7eb' : theme.primaryColor};
            padding: 0.3em 0.6em;
            border-radius: 6px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 1em;
            border: 2px solid ${theme.accentColor};
        }

        .slide pre {
            background-color: ${isDark ? '#1f2937' : '#f8f8f8'};
            color: ${isDark ? '#e5e7eb' : theme.primaryColor};
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
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            border: 3px solid ${theme.accentColor};
        }

        .slide table {
            width: 100%;
            border-collapse: collapse;
            margin: 2em 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .slide th, .slide td {
            border: 2px solid ${theme.accentColor};
            padding: 1.2em;
            text-align: center;
            font-size: 1.1em;
        }

        .slide th {
            background-color: ${theme.accentColor};
            color: white;
            font-weight: bold;
            font-size: 1.2em;
        }

        .slide tr:nth-child(even) {
            background-color: ${isDark ? '#2a2a2a' : '#f8f9fa'};
        }

        .slides-preview-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: ${theme.accentColor};
            color: white;
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

    const isDark = isDarkThemeContext();
    const theme = THEMES[options.theme];

    let authorColor = textColor;
    if (!authorColor) {
        const isDarkTheme = options.theme === 'dark' ||
                           (theme && theme.backgroundColor !== '#ffffff' && theme.backgroundColor !== '#fafafa');

        if (isDark || isDarkTheme) {
            authorColor = '#e5e7eb';
        } else {
            authorColor = theme?.primaryColor || '#374151';
        }
    }

    const titleColor = theme.accentColor || (isDark ? '#60a5fa' : '#2563eb');
    const borderColor = theme.accentColor || (isDark ? '#4b5563' : '#d1d5db');

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
        ${options.description ? `
        <div class="description" style="
            font-size: 1em;
            color: ${authorColor};
            opacity: 0.8;
            margin-top: 0.5em;
            font-style: italic;
        ">${escapeHtml(options.description)}</div>
        ` : ''}
    </div>`;
};

/**
 * Generate EPUB header section
 */
const generateEpubHeader = (options: HTMLGeneratorOptions, textColor?: string): string => {
    if (!options.headerFooter) return '';

    const isDark = isDarkThemeContext();
    const theme = THEMES[options.theme];

    let authorColor = textColor;
    if (!authorColor) {
        const isDarkTheme = options.theme === 'dark' ||
                           (theme && theme.backgroundColor !== '#ffffff' && theme.backgroundColor !== '#fafafa');

        if (isDark || isDarkTheme) {
            authorColor = '#e5e7eb';
        } else {
            authorColor = theme?.primaryColor || '#374151';
        }
    }

    const titleColor = theme.accentColor || (isDark ? '#60a5fa' : '#2563eb');
    const borderColor = theme.accentColor || (isDark ? '#4b5563' : '#d1d5db');

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
        ${options.description ? `
        <div class="description" style="
            font-size: 1.1em;
            color: ${authorColor};
            opacity: 0.8;
            margin-top: 0.5em;
        ">${escapeHtml(options.description)}</div>
        ` : ''}
    </div>`;
};

/**
 * Generate Slides header section
 */
const generateSlidesHeader = (options: HTMLGeneratorOptions, textColor?: string): string => {
    if (!options.headerFooter) return '';

    const isDark = isDarkThemeContext();
    const theme = THEMES[options.theme];

    let authorColor = textColor;
    if (!authorColor) {
        const isDarkTheme = options.theme === 'dark' ||
                           (theme && theme.backgroundColor !== '#ffffff' && theme.backgroundColor !== '#fafafa');

        if (isDark || isDarkTheme) {
            authorColor = '#e5e7eb';
        } else {
            authorColor = theme?.primaryColor || '#374151';
        }
    }

    const titleColor = theme.accentColor || (isDark ? '#60a5fa' : '#2563eb');

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
        ${options.description ? `
        <div class="description" style="
            font-size: 1.3em;
            color: ${authorColor};
            opacity: 0.8;
            margin-top: 1em;
        ">${escapeHtml(options.description)}</div>
        ` : ''}
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
        Generated on ${new Date().toLocaleDateString()} • ${escapeHtml(options.title)} • RTF Format
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

import { Download, Eye, Loader2, Monitor, Smartphone, Tablet } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { generateKey } from '@/utils/common';
import { generateHeaderStyles } from '@/utils/themeUtils';
import { createMarkdownComponents } from '../../../editor/PreviewPane/components/MarkdownComponents';
import { useHighlightJs } from '../../../editor/PreviewPane/hooks/useHighlightJs';
import type { PreviewPanelProps } from '../types/export.types';
import { THEMES } from '../utils/constants';
import '../styles/formatPreview.css';

/**
 * Komponen untuk preview panel dengan kontrol responsif dan export
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  markdown,
  options,
  previewMode,
  onPreviewModeChange,
  onExport,
  exportState,
  isMobile = false,
  isTablet = false,
  currentTheme,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // Font family helper untuk preview real-time
  const getFontFamilyForPreview = useCallback((fontFamily: string): string => {
    const fontMap: Record<string, string> = {
      Arial: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
      'Times New Roman': '"Times New Roman", Times, serif',
      Helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      Georgia: 'Georgia, "Times New Roman", Times, serif',
      Verdana: 'Verdana, Geneva, sans-serif',
      Roboto: 'Roboto, "Segoe UI", Arial, sans-serif',
      'Open Sans': '"Open Sans", "Segoe UI", Arial, sans-serif',
    };
    return fontMap[fontFamily] || `${fontFamily}, Arial, sans-serif`;
  }, []);

  // Setup highlight.js dengan theme management
  const isDarkMode =
    currentTheme?.id === 'dark' ||
    options.theme === 'dark' ||
    (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  useHighlightJs(isDarkMode, currentTheme);

  // Inject CSS dinamis untuk font family real-time dan dark theme detection
  useEffect(() => {
    const styleId = 'advanced-export-preview-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const fontFamily = getFontFamilyForPreview(options.fontFamily);

    // Detect if current theme is dark
    const isDarkTheme = () => {
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
        textColor.includes('f1f5f9') ||
        textColor.includes('ffffff') ||
        textColor.includes('e5e7eb');

      return isExplicitlyDark || hasDarkClass || hasDarkBgColor || hasLightTextColor;
    };

    const isCurrentlyDark = isDarkTheme();
    const textColor = isCurrentlyDark ? '#ffffff' : '#000000';
    const linkColor = isCurrentlyDark ? '#60a5fa' : '#3b82f6';

    const css = `
      .preview-content * {
        font-family: ${fontFamily} !important;
        color: ${textColor} !important;
      }
      .preview-content h1,
      .preview-content h2,
      .preview-content h3,
      .preview-content h4,
      .preview-content h5,
      .preview-content h6 {
        font-family: ${fontFamily} !important;
        color: ${textColor} !important;
      }
      .preview-content p,
      .preview-content li,
      .preview-content blockquote,
      .preview-content td,
      .preview-content th,
      .preview-content span,
      .preview-content div {
        font-family: ${fontFamily} !important;
        color: ${textColor} !important;
      }
      .preview-content a {
        color: ${linkColor} !important;
      }
      /* Force override for all text elements */
      .preview-content *:not(a) {
        color: ${textColor} !important;
      }
    `;

    styleElement.textContent = css;

    return () => {
      // Cleanup saat component unmount
      if (styleElement?.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [options.fontFamily, getFontFamilyForPreview]);

  // Watch for theme changes and update styles accordingly
  useEffect(() => {
    const updatePreviewStyles = () => {
      const styleId = 'advanced-export-preview-styles';
      const styleElement = document.getElementById(styleId) as HTMLStyleElement;

      if (styleElement) {
        // Trigger re-render of styles
        const event = new CustomEvent('themeChanged');
        document.dispatchEvent(event);
      }
    };

    // Watch for changes in body attributes and classes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'data-theme' || mutation.attributeName === 'class')
        ) {
          updatePreviewStyles();
        }
      });
    });

    // Observe body and html for theme changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Create markdown components dengan current props dan theme
  const markdownComponents = useMemo(() => {
    const themeConfig = THEMES[options.theme] || THEMES.default;

    // Untuk preview, gunakan warna yang sesuai dengan theme yang dipilih
    // Jika theme dark, gunakan warna putih untuk teks
    const isThemeDark = options.theme === 'dark' || themeConfig.backgroundColor === '#1f2937';

    const previewTheme = {
      id: options.theme,
      name: themeConfig.name,
      text: isThemeDark ? '#ffffff' : themeConfig.primaryColor || '#000000',
      primary: isThemeDark ? '#60a5fa' : themeConfig.primaryColor || '#3b82f6',
      secondary: isThemeDark ? '#9ca3af' : themeConfig.accentColor || '#6b7280',
      accent: isThemeDark ? '#60a5fa' : themeConfig.accentColor || '#ec4899',
      surface: themeConfig.backgroundColor || '#f8fafc',
      background: themeConfig.backgroundColor || '#ffffff',
      gradient: currentTheme?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    };

    return createMarkdownComponents({
      markdown,
      theme: previewTheme,
      isMobile,
      isTablet,
    });
  }, [markdown, options.theme, currentTheme, isMobile, isTablet]);

  // Generate unique key untuk force re-render saat options berubah
  const previewKey = useMemo(() => {
    const keyComponents = [
      options.format,
      options.theme,
      options.fontFamily,
      options.fontSize,
      options.pageSize,
      options.orientation,
      options.customCSS ? btoa(options.customCSS).substring(0, 10) : 'no-css',
      options.watermark ? btoa(options.watermark).substring(0, 10) : 'no-watermark',
      options.title,
      options.author,
      markdown.substring(0, 50), // Include part of markdown for content changes
      currentTheme?.id || 'default',
    ];
    return generateKey(keyComponents);
  }, [
    options.format,
    options.theme,
    options.fontFamily,
    options.fontSize,
    options.pageSize,
    options.orientation,
    options.customCSS,
    options.watermark,
    options.title,
    options.author,
    markdown,
    currentTheme,
  ]);

  // Get header styles for consistent theming
  const headerStyles = generateHeaderStyles(currentTheme);

  // Format-specific styling helpers dengan memoization
  const formatSpecificStyles = useMemo(() => {
    const getFontSize = (format: string): string => {
      // Base font size dari options, dengan adjustment per format
      const baseSize = options.fontSize;
      switch (format) {
        case 'pdf':
          return `${baseSize}px`;
        case 'docx':
          return `${baseSize - 1}px`;
        case 'epub':
          return `${baseSize + 1}px`;
        case 'presentation':
          return `${baseSize + 2}px`;
        default:
          return `${baseSize}px`;
      }
    };

    const getLineHeight = (format: string): string => {
      switch (format) {
        case 'pdf':
          return '1.6';
        case 'docx':
          return '1.8';
        case 'epub':
          return '1.7';
        case 'presentation':
          return '1.5';
        default:
          return '1.6';
      }
    };

    const getMinHeight = (format: string): string => {
      switch (format) {
        case 'pdf':
          return '600px';
        case 'docx':
          return '550px';
        case 'epub':
          return '650px';
        case 'presentation':
          return '700px';
        default:
          return '600px';
      }
    };

    return {
      fontSize: getFontSize(options.format),
      lineHeight: getLineHeight(options.format),
      minHeight: getMinHeight(options.format),
    };
  }, [options.format, options.fontSize]);

  // Page size helpers untuk preview real-time
  const getPageWidthForPreview = (pageSize: string, orientation: string): string => {
    const isLandscape = orientation === 'landscape';
    switch (pageSize.toLowerCase()) {
      case 'a4':
        return isLandscape ? '842px' : '595px';
      case 'letter':
        return isLandscape ? '792px' : '612px';
      case 'legal':
        return isLandscape ? '1008px' : '612px';
      default:
        return isLandscape ? '842px' : '595px';
    }
  };

  const getPageHeightForPreview = (pageSize: string, orientation: string): string => {
    const isLandscape = orientation === 'landscape';
    switch (pageSize.toLowerCase()) {
      case 'a4':
        return isLandscape ? '595px' : '842px';
      case 'letter':
        return isLandscape ? '612px' : '792px';
      case 'legal':
        return isLandscape ? '612px' : '1008px';
      default:
        return isLandscape ? '595px' : '842px';
    }
  };

  return (
    <div className="flex flex-col min-h-0 overflow-hidden flex-1">
      {/* Preview Header */}
      <div
        className={`advanced-export-preview-header ${isMobile ? 'p-2' : 'p-2 sm:p-3'}`}
        style={{
          ...headerStyles,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Format Indicator */}
        <div className="flex items-center justify-between mb-2">
          <Badge
            key={`badge-${options.format}-${options.theme}`}
            variant="secondary"
            className="text-xs font-medium"
            style={{
              backgroundColor: currentTheme?.primary || '#3b82f6',
              color: 'white',
            }}
          >
            {options.format.toUpperCase()} Preview
          </Badge>
          <div className="text-xs opacity-70">
            {options.format === 'pdf' &&
              `Print-ready document (${options.fontFamily}, ${options.fontSize}px)`}
            {options.format === 'docx' &&
              `Rich Text Format (${options.fontFamily}, ${options.fontSize}px)`}
            {options.format === 'epub' &&
              `Web Document (${options.fontFamily}, ${options.fontSize}px)`}
            {options.format === 'presentation' &&
              `HTML Presentation (${options.fontFamily}, ${options.fontSize}px)`}
          </div>
        </div>
        <div
          className={`flex items-center gap-2 ${
            isMobile ? 'flex-col space-y-2' : 'flex-row justify-between'
          }`}
        >
          {/* Preview Title */}
          <div className="flex items-center space-x-2">
            <Eye className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3 sm:h-4 sm:w-4'}`} />
            <span className={`font-medium ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
              Preview
            </span>
            <Badge variant="outline" className="text-xs">
              {options.theme}
            </Badge>
          </div>

          {/* Controls */}
          <div
            className={`flex items-stretch gap-2 ${
              isMobile ? 'w-full flex-col' : 'flex-row items-center'
            }`}
          >
            {isMobile ? (
              // Mobile: Compact layout
              <div className="w-full space-y-1">
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPreviewModeChange('desktop')}
                    className="text-xs h-7 px-1"
                  >
                    <Monitor className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={previewMode === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPreviewModeChange('tablet')}
                    className="text-xs h-7 px-1"
                  >
                    <Tablet className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPreviewModeChange('mobile')}
                    className="text-xs h-7 px-1"
                  >
                    <Smartphone className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  onClick={onExport}
                  disabled={exportState.isExporting}
                  className="advanced-export-button w-full text-xs h-7"
                  size="sm"
                >
                  {exportState.isExporting ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      <span>Exporting... {exportState.exportProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 mr-1" />
                      <span>Export {options.format.toUpperCase()}</span>
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Desktop/Tablet: Horizontal layout
              <>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onPreviewModeChange('desktop')}
                    className="rounded-none flex-1 text-xs h-7"
                  >
                    <Monitor className="h-3 w-3" />
                    <span className="ml-1 hidden sm:inline">Desktop</span>
                  </Button>
                  <Button
                    variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onPreviewModeChange('tablet')}
                    className="rounded-none flex-1 text-xs h-7"
                  >
                    <Tablet className="h-3 w-3" />
                    <span className="ml-1 hidden sm:inline">Tablet</span>
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onPreviewModeChange('mobile')}
                    className="rounded-none flex-1 text-xs h-7"
                  >
                    <Smartphone className="h-3 w-3" />
                    <span className="ml-1 hidden sm:inline">Mobile</span>
                  </Button>
                </div>
                <Button
                  onClick={onExport}
                  disabled={exportState.isExporting}
                  className="advanced-export-button text-xs h-7 px-3"
                  size="sm"
                >
                  {exportState.isExporting ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      <span>Exporting... {exportState.exportProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 mr-1" />
                      <span>Export {options.format.toUpperCase()}</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div
        className={`advanced-export-preview-content flex-1 overflow-y-auto min-h-0 ${
          isMobile ? 'p-2' : isTablet ? 'p-2' : 'p-2 sm:p-3'
        }`}
      >
        <div
          className={`
            advanced-export-preview-document mx-auto transition-all duration-300
            ${previewMode === 'desktop' ? (isMobile ? 'max-w-full' : 'advanced-export-preview-desktop') : ''}
            ${previewMode === 'tablet' ? (isMobile ? 'max-w-full' : 'advanced-export-preview-tablet') : ''}
            ${previewMode === 'mobile' ? (isMobile ? 'max-w-full' : 'advanced-export-preview-mobile') : ''}
          `}
        >
          <div
            key={previewKey}
            ref={previewRef}
            data-theme={options.theme}
            className={`preview-content ${
              isMobile
                ? previewMode === 'mobile'
                  ? 'p-4 text-base leading-relaxed'
                  : 'p-4 text-sm leading-relaxed'
                : 'p-3 sm:p-4 text-xs sm:text-sm'
            } ${options.format}-preview ${options.theme === 'dark' ? 'theme-dark' : ''}`}
            style={{
              fontSize: isMobile ? '15px' : formatSpecificStyles.fontSize,
              lineHeight: isMobile ? '1.7' : formatSpecificStyles.lineHeight,
              position: 'relative',
              fontFamily: getFontFamilyForPreview(options.fontFamily),
              maxWidth: getPageWidthForPreview(options.pageSize, options.orientation),
              minHeight: isMobile
                ? '480px'
                : getPageHeightForPreview(options.pageSize, options.orientation),
              border: '2px dashed #ccc',
              margin: '0 auto',
              // Hanya set background dan color jika bukan theme dark, biarkan CSS handle dark theme
              ...(options.theme !== 'dark'
                ? {
                    backgroundColor: THEMES[options.theme]?.backgroundColor || '#ffffff',
                    color: THEMES[options.theme]?.primaryColor || '#000000',
                  }
                : {}),
            }}
          >
            <div
              className={`
                prose prose-lg max-w-none transition-colors duration-200
                ${isDarkMode ? 'prose-invert' : ''}
                ${isMobile || isTablet ? 'preview-pane-responsive' : ''}
                ${options.format}-content
              `}
              style={
                {
                  '--tw-prose-headings':
                    options.theme === 'dark'
                      ? '#ffffff'
                      : THEMES[options.theme]?.primaryColor || '#000000',
                  '--tw-prose-body':
                    options.theme === 'dark'
                      ? '#ffffff'
                      : THEMES[options.theme]?.primaryColor || '#000000',
                  '--tw-prose-links':
                    options.theme === 'dark'
                      ? '#60a5fa'
                      : THEMES[options.theme]?.accentColor || '#3b82f6',
                  '--tw-prose-bold':
                    options.theme === 'dark'
                      ? '#ffffff'
                      : THEMES[options.theme]?.primaryColor || '#000000',
                  '--tw-prose-code':
                    options.theme === 'dark'
                      ? '#60a5fa'
                      : THEMES[options.theme]?.accentColor || '#ec4899',
                  '--tw-prose-pre-bg':
                    options.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  '--tw-prose-th-borders': options.theme === 'dark' ? '#4b5563' : '#d1d5db',
                  '--tw-prose-td-borders': options.theme === 'dark' ? '#4b5563' : '#d1d5db',
                  '--tw-prose-quotes':
                    options.theme === 'dark'
                      ? '#ffffff'
                      : THEMES[options.theme]?.primaryColor || '#000000',
                  '--tw-prose-quote-borders':
                    options.theme === 'dark'
                      ? '#60a5fa'
                      : THEMES[options.theme]?.accentColor || '#3b82f6',
                  fontSize:
                    getFontFamilyForPreview(options.fontFamily) !== 'inherit'
                      ? `${options.fontSize}px`
                      : 'inherit',
                  fontFamily: getFontFamilyForPreview(options.fontFamily),
                  lineHeight:
                    options.format === 'docx' ? '1.8' : options.format === 'epub' ? '1.7' : '1.6',
                } as React.CSSProperties
              }
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={markdownComponents}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>

          {/* Page Size Indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '15px',
              background: 'rgba(0,0,0,0.1)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              color: '#666',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              zIndex: 10,
              pointerEvents: 'none',
              backdropFilter: 'blur(4px)',
            }}
          >
            {options.pageSize.toUpperCase()} {options.orientation.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {exportState.isExporting && exportState.exportProgress > 0 && (
        <div className="advanced-export-progress">
          <div
            className="advanced-export-progress-bar"
            style={{ width: `${exportState.exportProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};

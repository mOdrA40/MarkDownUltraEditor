/**
 * @fileoverview PreviewPane - Komponen utama untuk preview markdown dengan syntax highlighting
 * @author Axel Modra
 * @refactored Memisahkan concerns dan menggunakan composition pattern
 */

import type React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { generateHeaderStyles } from '@/utils/themeUtils';
import { createMarkdownComponents } from './components/MarkdownComponents';
import { useHeadingCache } from './hooks/useHeadingCache';
// Custom hooks dan utilities
import { useHighlightJs } from './hooks/useHighlightJs';
// Types
import type { PreviewPaneProps } from './types/preview.types';
import { getResponsiveOptions } from './utils/languageUtils';

/**
 * Komponen utama PreviewPane dengan architecture yang bersih
 * Menggunakan composition pattern dan separation of concerns
 */
export const PreviewPane: React.FC<PreviewPaneProps> = ({
  markdown,
  isDarkMode,
  theme,
  isMobile = false,
  isTablet = false,
}) => {
  // Setup highlight.js dengan theme management
  useHighlightJs(isDarkMode, theme);

  // Setup heading cache management
  useHeadingCache(markdown);

  // Create markdown components dengan current props
  const markdownComponents = createMarkdownComponents({
    markdown,
    theme,
    isMobile,
    isTablet,
  });

  // Get responsive options
  const responsiveOptions = getResponsiveOptions(isMobile, isTablet);

  // Get header styles for consistent theming
  const headerStyles = generateHeaderStyles(theme);

  // Ensure proper text color for dark theme
  const getTextColor = () => {
    if (isDarkMode && theme?.id === 'dark') {
      return theme.text || '#f1f5f9'; // Force white text for dark theme
    }
    return theme?.text || (isDarkMode ? '#f1f5f9' : 'inherit');
  };

  const previewStyles = {
    backgroundColor: theme?.background || 'white',
    color: getTextColor(),
    fontSize: responsiveOptions.fontSize,
    lineHeight: responsiveOptions.lineHeight,
  };

  return (
    <div className="h-full flex flex-col">
      <div
        className="px-4 py-2 border-b backdrop-blur-md"
        style={{
          ...headerStyles,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <h3 className="text-sm font-medium">Preview</h3>
      </div>

      <div
        data-preview-pane
        className={`flex-1 overflow-auto transition-colors duration-200 preview-content ${isMobile || isTablet ? 'preview-pane-responsive' : 'p-6'} ${isDarkMode ? 'dark-preview' : ''}`}
        style={{
          ...previewStyles,
          padding: isMobile || isTablet ? responsiveOptions.padding : '1.5rem',
        }}
      >
        <div
          className={`
            prose prose-lg max-w-none transition-colors duration-200
            ${isDarkMode ? 'prose-invert' : ''}
            ${isMobile || isTablet ? 'preview-pane-responsive' : ''}
          `}
          style={
            {
              '--tw-prose-headings': getTextColor(),
              '--tw-prose-body': getTextColor(),
              '--tw-prose-links': theme?.primary || (isDarkMode ? '#60a5fa' : '#3b82f6'),
              '--tw-prose-bold': getTextColor(),
              '--tw-prose-code': theme?.accent || (isDarkMode ? '#60a5fa' : '#ec4899'),
              '--tw-prose-pre-bg':
                theme?.surface || (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8fafc'),
              '--tw-prose-th-borders': theme?.accent || (isDarkMode ? '#4b5563' : '#d1d5db'),
              '--tw-prose-td-borders': theme?.accent || (isDarkMode ? '#4b5563' : '#d1d5db'),
              '--tw-prose-quotes': getTextColor(),
              '--tw-prose-quote-borders': theme?.primary || (isDarkMode ? '#60a5fa' : '#3b82f6'),
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
    </div>
  );
};

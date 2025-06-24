
/**
 * @fileoverview PreviewPane - Komponen utama untuk preview markdown dengan syntax highlighting
 * @author Senior Developer
 * @version 2.0.0
 * @refactored Memisahkan concerns dan menggunakan composition pattern
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

// Custom hooks dan utilities
import { useHighlightJs } from './PreviewPane/hooks/useHighlightJs';
import { useHeadingCache } from './PreviewPane/hooks/useHeadingCache';
import { createMarkdownComponents } from './PreviewPane/components/MarkdownComponents';
import { getResponsiveOptions } from './PreviewPane/utils/languageUtils';

// Types
import { PreviewPaneProps } from './PreviewPane/types/preview.types';

/**
 * Komponen utama PreviewPane dengan architecture yang bersih
 * Menggunakan composition pattern dan separation of concerns
 */
export const PreviewPane: React.FC<PreviewPaneProps> = ({
  markdown,
  isDarkMode,
  theme,
  isMobile = false,
  isTablet = false
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
    isTablet
  });

  // Get responsive options
  const responsiveOptions = getResponsiveOptions(isMobile, isTablet);

  const previewStyles = {
    backgroundColor: theme?.background || 'white',
    color: theme?.text || 'inherit',
    fontSize: responsiveOptions.fontSize,
    lineHeight: responsiveOptions.lineHeight,
  };

  return (
    <div className="h-full flex flex-col">
      <div 
        className="px-4 py-2 border-b backdrop-blur-md"
        style={{ 
          backgroundColor: theme?.surface ? `${theme.surface}80` : 'rgba(0,0,0,0.05)',
          borderColor: theme?.accent
        }}
      >
        <h3 
          className="text-sm font-medium"
          style={{ color: theme?.text || 'inherit' }}
        >
          Preview
        </h3>
      </div>
      
      <div
        data-preview-pane
        className={`flex-1 overflow-auto transition-colors duration-200 ${(isMobile || isTablet) ? 'preview-pane-responsive' : 'p-6'}`}
        style={{
          ...previewStyles,
          padding: (isMobile || isTablet) ? responsiveOptions.padding : '1.5rem'
        }}
      >
        <div
          className={`
            prose prose-lg max-w-none transition-colors duration-200
            ${isDarkMode ? 'prose-invert' : ''}
            ${(isMobile || isTablet) ? 'preview-pane-responsive' : ''}
          `}
          style={{
            '--tw-prose-headings': theme?.text || 'inherit',
            '--tw-prose-body': theme?.text || 'inherit',
            '--tw-prose-links': theme?.primary || '#3b82f6',
            '--tw-prose-bold': theme?.text || 'inherit',
            '--tw-prose-code': theme?.accent || '#ec4899',
            '--tw-prose-pre-bg': theme?.surface || '#f8fafc',
            '--tw-prose-th-borders': theme?.accent || '#d1d5db',
            '--tw-prose-td-borders': theme?.accent || '#d1d5db',
            '--tw-prose-quotes': theme?.text || 'inherit',
            '--tw-prose-quote-borders': theme?.primary || '#3b82f6',
          } as React.CSSProperties}
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

/**
 * @fileoverview Custom markdown components untuk ReactMarkdown
 * @author Axel Modra
 */

import React, { useState } from 'react';
import type { Components } from 'react-markdown';
import { useHeadingCache } from '../hooks/useHeadingCache';
import type { MarkdownComponentsProps } from '../types/preview.types';
import { CodeBlock, InlineCode } from './CodeBlock';

/**
 * Props untuk heading component
 */
interface HeadingComponentProps {
  children: React.ReactNode;
  markdown: string;
  theme?: {
    text?: string;
    accent?: string;
  };
}

/**
 * Props untuk image component
 */
interface ImageComponentProps {
  src?: string;
  alt?: string;
  title?: string;
  theme?: {
    accent?: string;
    surface?: string;
  };
}

/**
 * Custom image component dengan error handling dan responsive design
 */
const ImageComponent: React.FC<ImageComponentProps> = ({ src, alt, title, theme }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!src) {
    return (
      <div
        className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg"
        style={{
          borderColor: theme?.accent || '#d1d5db',
          backgroundColor: theme?.surface || '#f8fafc',
        }}
      >
        <span className="text-sm text-gray-500">No image source provided</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg"
        style={{
          borderColor: theme?.accent || '#ef4444',
          backgroundColor: theme?.surface || '#fef2f2',
        }}
      >
        <div className="text-center">
          <span className="text-sm text-red-500 block">Failed to load image</span>
          <span className="text-xs text-gray-500 mt-1">{alt || 'Image'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 relative">
      {isLoading && (
        <div
          className="flex items-center justify-center p-8 border rounded-lg animate-pulse"
          style={{
            borderColor: theme?.accent || '#d1d5db',
            backgroundColor: theme?.surface || '#f8fafc',
          }}
        >
          <span className="text-sm text-gray-500">Loading image...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt || 'Image'}
        title={title}
        onLoad={handleLoad}
        onError={handleError}
        className={`max-w-full h-auto rounded-lg shadow-sm transition-opacity duration-200 ${
          isLoading ? 'opacity-0 absolute' : 'opacity-100'
        }`}
        style={{
          border: `1px solid ${theme?.accent || '#e5e7eb'}`,
        }}
        loading="lazy"
        crossOrigin="anonymous"
      />
      {alt && !isLoading && !hasError && (
        <p className="text-sm text-gray-600 mt-2 text-center italic">{alt}</p>
      )}
    </div>
  );
};

/**
 * Custom heading component factory
 */
const createHeadingComponent = (level: number) => {
  const HeadingComponent: React.FC<HeadingComponentProps> = ({ children, markdown, theme }) => {
    const { getOrCreateHeadingId } = useHeadingCache(markdown);
    const headingText = React.Children.toArray(children).join('');
    const id = getOrCreateHeadingId(headingText);

    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

    // Styling berdasarkan level
    const getHeadingStyles = (level: number) => {
      const baseStyles = {
        color: theme?.text || 'inherit',
        scrollMarginTop: '6rem',
      };

      switch (level) {
        case 1:
          return {
            ...baseStyles,
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: `1px solid ${theme?.accent || '#e5e7eb'}`,
          };
        case 2:
          return {
            ...baseStyles,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            marginTop: '2rem',
          };
        case 3:
          return {
            ...baseStyles,
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '0.75rem',
            marginTop: '1.5rem',
          };
        case 4:
          return {
            ...baseStyles,
            fontSize: '1.125rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            marginTop: '1.25rem',
          };
        case 5:
          return {
            ...baseStyles,
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            marginTop: '1rem',
          };
        case 6:
          return {
            ...baseStyles,
            fontSize: '0.875rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            marginTop: '0.75rem',
          };
        default:
          return baseStyles;
      }
    };

    return React.createElement(
      HeadingTag,
      {
        id,
        style: getHeadingStyles(level),
        'data-heading-level': level,
        'data-heading-text': headingText,
      },
      children
    );
  };

  HeadingComponent.displayName = `HeadingLevel${level}`;
  return HeadingComponent;
};

/**
 * Factory function untuk membuat markdown components
 * @param props - Props untuk markdown components
 * @returns ReactMarkdown components
 */
export const createMarkdownComponents = ({
  markdown,
  theme,
  isMobile = false,
  isTablet = false,
}: MarkdownComponentsProps): Components => {
  return {
    // Heading components
    h1: ({ children }) => createHeadingComponent(1)({ children, markdown, theme }),
    h2: ({ children }) => createHeadingComponent(2)({ children, markdown, theme }),
    h3: ({ children }) => createHeadingComponent(3)({ children, markdown, theme }),
    h4: ({ children }) => createHeadingComponent(4)({ children, markdown, theme }),
    h5: ({ children }) => createHeadingComponent(5)({ children, markdown, theme }),
    h6: ({ children }) => createHeadingComponent(6)({ children, markdown, theme }),

    // Blockquote component
    blockquote: ({ children }) => (
      <blockquote
        className="border-l-4 pl-4 py-2 my-4 italic rounded-r-lg"
        style={{
          borderColor: theme?.primary || '#3b82f6',
          backgroundColor: theme?.surface ? `${theme.surface}40` : '#eff6ff',
          color: theme?.text || 'inherit',
        }}
      >
        {children}
      </blockquote>
    ),

    // Code components
    code: ({ children, className, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;

      return isInline ? (
        <InlineCode theme={theme}>{children}</InlineCode>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },

    // Pre component (code blocks)
    pre: ({ children }) => {
      // Extract language info dari code element
      const codeElement = React.Children.toArray(children).find(
        (child): child is React.ReactElement =>
          React.isValidElement(child) &&
          typeof child.props === 'object' &&
          child.props !== null &&
          'className' in child.props &&
          typeof child.props.className === 'string' &&
          child.props.className.includes('language-')
      );

      const className = (codeElement?.props?.className as string) || '';
      const match = className.match(/language-(\w+)/);
      const language = match ? match[1] : '';

      return (
        <CodeBlock
          className={className}
          language={language}
          theme={theme}
          isMobile={isMobile}
          isTablet={isTablet}
        >
          {codeElement?.props?.children || children}
        </CodeBlock>
      );
    },

    // Table components
    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table
          className="w-full border-collapse rounded-lg overflow-hidden shadow-sm"
          style={{ borderColor: theme?.accent || '#d1d5db' }}
        >
          {children}
        </table>
      </div>
    ),

    th: ({ children }) => (
      <th
        className="border px-4 py-3 font-semibold text-left"
        style={{
          borderColor: theme?.accent || '#d1d5db',
          backgroundColor: theme?.surface || '#f8fafc',
          color: theme?.text || 'inherit',
        }}
      >
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td
        className="border px-4 py-3"
        style={{
          borderColor: theme?.accent || '#d1d5db',
          color: theme?.text || 'inherit',
        }}
      >
        {children}
      </td>
    ),

    // Link component
    a: ({ children, href, ...props }) => (
      <a
        href={href}
        className="hover:underline transition-colors"
        style={{ color: theme?.primary || '#3b82f6' }}
        {...props}
      >
        {children}
      </a>
    ),

    // List components
    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-4 ml-4">{children}</ul>,

    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1 my-4 ml-4">{children}</ol>
    ),

    li: ({ children }) => (
      <li className="leading-relaxed" style={{ color: theme?.text || 'inherit' }}>
        {children}
      </li>
    ),

    // Image component
    img: ({ src, alt, title }) => (
      <ImageComponent src={src} alt={alt} title={title} theme={theme} />
    ),
  };
};

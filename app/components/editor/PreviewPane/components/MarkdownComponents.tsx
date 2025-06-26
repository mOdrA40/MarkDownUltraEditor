/**
 * @fileoverview Custom markdown components untuk ReactMarkdown
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { Components } from 'react-markdown';
import { CodeBlock, InlineCode } from './CodeBlock';
import { MarkdownComponentsProps } from '../types/preview.types';
import { useHeadingCache } from '../hooks/useHeadingCache';

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
        scrollMarginTop: '6rem' // scroll-mt-24
      };

      switch (level) {
        case 1:
          return {
            ...baseStyles,
            fontSize: '1.875rem', // text-3xl
            fontWeight: 'bold',
            marginBottom: '1.5rem', // mb-6
            paddingBottom: '0.75rem', // pb-3
            borderBottom: `1px solid ${theme?.accent || '#e5e7eb'}`,
          };
        case 2:
          return {
            ...baseStyles,
            fontSize: '1.5rem', // text-2xl
            fontWeight: 'bold',
            marginBottom: '1rem', // mb-4
            marginTop: '2rem', // mt-8
          };
        case 3:
          return {
            ...baseStyles,
            fontSize: '1.25rem', // text-xl
            fontWeight: 'bold',
            marginBottom: '0.75rem', // mb-3
            marginTop: '1.5rem', // mt-6
          };
        case 4:
          return {
            ...baseStyles,
            fontSize: '1.125rem', // text-lg
            fontWeight: 'bold',
            marginBottom: '0.5rem', // mb-2
            marginTop: '1.25rem', // mt-5
          };
        case 5:
          return {
            ...baseStyles,
            fontSize: '1rem', // text-base
            fontWeight: 'bold',
            marginBottom: '0.5rem', // mb-2
            marginTop: '1rem', // mt-4
          };
        case 6:
          return {
            ...baseStyles,
            fontSize: '0.875rem', // text-sm
            fontWeight: 'bold',
            marginBottom: '0.5rem', // mb-2
            marginTop: '0.75rem', // mt-3
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
  isTablet = false
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
          color: theme?.text || 'inherit'
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
        <InlineCode theme={theme}>
          {children}
        </InlineCode>
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
      
      const className = codeElement?.props?.className as string || '';
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
          color: theme?.text || 'inherit'
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
          color: theme?.text || 'inherit'
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
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1 my-4 ml-4">
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1 my-4 ml-4">
        {children}
      </ol>
    ),

    li: ({ children }) => (
      <li 
        className="leading-relaxed"
        style={{ color: theme?.text || 'inherit' }}
      >
        {children}
      </li>
    ),
  };
};

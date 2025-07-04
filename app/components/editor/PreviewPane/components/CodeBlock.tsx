/**
 * @fileoverview Advanced CodeBlock component dengan copy functionality
 * @author Axel Modra
 */

import type React from 'react';
import type { CodeBlockProps } from '../types/preview.types';
import {
  copyToClipboard,
  extractTextContent,
  getLanguageIcon,
  getResponsiveOptions,
} from '../utils/languageUtils';

/**
 * Advanced CodeBlock component dengan styling yang indah dan copy functionality
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className,
  language,
  isMobile = false,
  isTablet = false,
}) => {
  const responsiveOptions = getResponsiveOptions(isMobile, isTablet);

  /**
   * Handle copy button click
   */
  const handleCopyClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const codeText = extractTextContent(children);
    const button = event.target as HTMLButtonElement;
    await copyToClipboard(codeText, button);
  };

  return (
    <div className="relative group my-6">
      {/* 🔥 Super Ultra Indah Code Block Container */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        {/* ✨ Header dengan language info dan copy button */}
        {language && (
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getLanguageIcon(language)}</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {language.toUpperCase()}
              </span>
              <div className="h-1 w-1 rounded-full bg-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Code Block</span>
            </div>

            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopyClick}
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 px-3 py-1 rounded-md text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium"
              title="Copy code to clipboard"
            >
              📋 Copy
            </button>
          </div>
        )}

        {/* 🌟 Gradient overlay untuk efek depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 pointer-events-none" />

        {/* 💎 Main code container */}
        <div className="relative">
          <pre
            className="overflow-x-auto p-6 m-0 bg-transparent text-sm leading-relaxed"
            style={{
              fontSize: responsiveOptions.codeSize,
              lineHeight: 1.6,
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          >
            <code className={className}>{children}</code>
          </pre>

          {/* ✨ Subtle shine effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </div>

        {/* 🎭 Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
      </div>

      {/* 🌈 Glow effect on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
    </div>
  );
};

/**
 * Props untuk InlineCode component
 */
interface InlineCodeProps {
  children: React.ReactNode;
  theme?: {
    surface?: string;
    accent?: string;
  };
}

/**
 * Inline code component dengan styling yang konsisten
 */
export const InlineCode: React.FC<InlineCodeProps> = ({ children, theme }) => {
  return (
    <code
      className="px-2 py-1 rounded-md text-sm font-mono font-medium transition-all duration-200 hover:scale-105"
      style={{
        backgroundColor: theme?.surface || '#f1f5f9',
        color: theme?.accent || '#ec4899',
        border: `1px solid ${theme?.accent || '#ec4899'}20`,
        boxShadow: `0 1px 3px ${theme?.accent || '#ec4899'}15`,
      }}
    >
      {children}
    </code>
  );
};

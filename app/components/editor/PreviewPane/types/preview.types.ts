/**
 * @fileoverview Type definitions untuk PreviewPane components
 * @author Axel Modra
 */

import type { Theme } from '../../../features/ThemeSelector';

/**
 * Props untuk komponen PreviewPane utama
 */
export interface PreviewPaneProps {
  /** Konten markdown yang akan di-render */
  markdown: string;
  /** Mode dark/light */
  isDarkMode: boolean;
  /** Theme configuration */
  theme?: Theme;
  /** Apakah dalam mode mobile */
  isMobile?: boolean;
  /** Apakah dalam mode tablet */
  isTablet?: boolean;
}

/**
 * Props untuk komponen MarkdownComponents
 */
export interface MarkdownComponentsProps {
  /** Konten markdown */
  markdown: string;
  /** Theme configuration */
  theme?: Theme;
  /** Apakah dalam mode mobile */
  isMobile?: boolean;
  /** Apakah dalam mode tablet */
  isTablet?: boolean;
}

/**
 * Props untuk CodeBlock component
 */
export interface CodeBlockProps {
  /** Children elements (code content) */
  children: React.ReactNode;
  /** CSS class name */
  className?: string;
  /** Language untuk syntax highlighting */
  language?: string;
  /** Theme configuration */
  theme?: Theme;
  /** Apakah dalam mode mobile */
  isMobile?: boolean;
  /** Apakah dalam mode tablet */
  isTablet?: boolean;
}

/**
 * Props untuk custom heading components
 */
export interface HeadingProps {
  /** Children elements */
  children: React.ReactNode;
  /** Heading level (1-6) */
  level: number;
  /** Heading text untuk ID generation */
  headingText: string;
  /** Markdown content untuk context */
  markdown: string;
  /** Theme configuration */
  theme?: Theme;
}

/**
 * Configuration untuk highlight.js theme
 */
export interface HighlightThemeConfig {
  /** Theme ID */
  id: string;
  /** CDN URL untuk CSS theme */
  url: string;
  /** Apakah theme untuk dark mode */
  isDark: boolean;
}

/**
 * Cache entry untuk heading mappings
 */
export interface HeadingCacheEntry {
  /** Heading text */
  text: string;
  /** Line number dalam markdown */
  lineNumber: number;
  /** Generated heading ID */
  id: string;
}

/**
 * Options untuk responsive styling
 */
export interface ResponsiveOptions {
  /** Padding untuk responsive */
  padding: string;
  /** Font size untuk responsive */
  fontSize: string;
  /** Line height untuk responsive */
  lineHeight: number;
}

/**
 * Language icon mapping type
 */
export interface LanguageIconMap {
  [key: string]: string;
}

/**
 * Highlight.js language registration entry
 */
export interface LanguageRegistration {
  /** Language name */
  name: string;
  /** Language aliases */
  aliases: string[];
  /** Language module */
  module: unknown;
}

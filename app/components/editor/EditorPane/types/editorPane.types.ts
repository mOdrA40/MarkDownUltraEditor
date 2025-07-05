/**
 * @fileoverview TypeScript type definitions for EditorPane components
 * @author Axel Modra
 */

import type { Theme } from '../../../features/ThemeSelector';

/**
 * Main props interface for EditorPane component
 */
export interface EditorPaneProps {
  /** Markdown content */
  markdown: string;
  /** Callback when content changes */
  onChange: (value: string) => void;
  /** Font size in pixels */
  fontSize?: number;
  /** Line height multiplier */
  lineHeight?: number;
  /** Enable focus mode */
  focusMode?: boolean;
  /** Enable typewriter mode */
  typewriterMode?: boolean;
  /** Enable word wrap */
  wordWrap?: boolean;
  /** Enable vim mode */
  vimMode?: boolean;
  /** Theme configuration */
  theme?: Theme;
  /** Mobile device flag */
  isMobile?: boolean;
  /** Tablet device flag */
  isTablet?: boolean;
  /** Callback to get insertTextAtCursor function */
  onInsertTextAtCursor?: (insertFn: (text: string, selectInserted?: boolean) => void) => void;
}

/**
 * Editor state management interface
 */
export interface EditorState {
  /** Current vim mode state */
  vimModeState: 'normal' | 'insert' | 'visual' | 'command';
  /** Textarea reference */
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

/**
 * Responsive editor configuration
 */
export interface ResponsiveConfig {
  /** Responsive font size */
  fontSize: number;
  /** Responsive line height */
  lineHeight: number;
  /** Is mobile or tablet */
  isMobileOrTablet: boolean;
}

/**
 * Editor styling configuration
 */
export interface EditorStyles extends React.CSSProperties {
  /** Font size in pixels */
  fontSize: string;
  /** Line height */
  lineHeight: number;
  /** Font family */
  fontFamily: string;
  /** White space handling */
  whiteSpace: 'pre' | 'pre-wrap' | 'normal';
  /** Background color */
  backgroundColor: string;
  /** Text color */
  color: string;
  /** Border color */
  borderColor: string;
  /** Word wrap behavior */
  wordWrap: 'break-word' | 'normal';
  /** Overflow wrap behavior */
  overflowWrap: 'break-word' | 'normal';
  /** Horizontal overflow */
  overflowX: 'hidden' | 'auto';
  /** Hyphenation */
  hyphens: 'auto' | 'none';
}

/**
 * Keyboard event handler configuration
 */
export interface KeyboardHandlerConfig {
  /** Vim mode enabled */
  vimMode: boolean;
  /** Vim handler function */
  vimHandler: {
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  };
  /** Current markdown content */
  markdown: string;
  /** Content change callback */
  onChange: (value: string) => void;
}

/**
 * Typewriter mode configuration
 */
export interface TypewriterConfig {
  /** Typewriter mode enabled */
  enabled: boolean;
  /** Textarea reference */
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

/**
 * Line numbers configuration
 */
export interface LineNumbersConfig {
  /** Show line numbers */
  show: boolean;
  /** Markdown content for line counting */
  markdown: string;
  /** Font size */
  fontSize: number;
  /** Line height */
  lineHeight: number;
  /** Theme configuration */
  theme?: Theme;
}

/**
 * Focus mode overlay configuration
 */
export interface FocusModeConfig {
  /** Focus mode enabled */
  enabled: boolean;
  /** Theme configuration */
  theme?: Theme;
}

/**
 * Editor header configuration
 */
export interface EditorHeaderConfig {
  /** Show header */
  show: boolean;
  /** Focus mode enabled */
  focusMode: boolean;
  /** Typewriter mode enabled */
  typewriterMode: boolean;
  /** Vim mode enabled */
  vimMode: boolean;
  /** Current vim mode state */
  vimModeState: string;
  /** Theme configuration */
  theme?: Theme;
}

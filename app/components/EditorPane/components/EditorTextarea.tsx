/**
 * @fileoverview Core editor textarea component
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { EditorStyles } from "../types/editorPane.types";
import { generatePaddingStyles } from "../utils/editorStyles";

interface EditorTextareaProps {
  /** Textarea reference */
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  /** Markdown content */
  markdown: string;
  /** Content change handler */
  onChange: (value: string) => void;
  /** Keyboard event handler */
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Focus mode enabled */
  focusMode: boolean;
  /** Typewriter mode enabled */
  typewriterMode: boolean;
  /** Word wrap enabled */
  wordWrap: boolean;
  /** Editor styles */
  editorStyles: EditorStyles;
}

/**
 * Core editor textarea component
 */
export const EditorTextarea: React.FC<EditorTextareaProps> = ({
  textareaRef,
  markdown,
  onChange,
  onKeyDown,
  focusMode,
  typewriterMode,
  wordWrap,
  editorStyles
}) => {
  const paddingStyles = generatePaddingStyles(focusMode);

  return (
    <Textarea
      ref={textareaRef}
      value={markdown}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder="Start writing your markdown here..."
      className={`
        w-full h-full resize-none border-0 rounded-none focus:ring-0 focus:outline-none pl-14
        ${focusMode ? 'bg-opacity-95' : ''}
        ${typewriterMode ? 'scroll-smooth' : ''}
        transition-all duration-200
      `}
      style={{
        minHeight: '100%',
        padding: paddingStyles,
        ...editorStyles,
        wordWrap: wordWrap ? 'break-word' : 'normal',
        overflowWrap: wordWrap ? 'break-word' : 'normal',
      } as React.CSSProperties}
    />
  );
};

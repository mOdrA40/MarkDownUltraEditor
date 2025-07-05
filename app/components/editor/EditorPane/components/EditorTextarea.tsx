import type React from 'react';
import { useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import type { EditorStyles } from '../types/editorPane.types';
import { generatePaddingStyles } from '../utils/editorStyles';

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
  /** Auto-resize function */
  onAutoResize?: () => void;
}

/**
 * Core editor textarea component - simplified for better performance
 */
export const EditorTextarea: React.FC<EditorTextareaProps> = ({
  textareaRef,
  markdown,
  onChange,
  onKeyDown,
  focusMode,
  typewriterMode,
  wordWrap,
  editorStyles,
  onAutoResize,
}) => {
  // Simple change handler - auto-resize is handled by useSimpleEditor throttling
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      // Auto-resize is already throttled in useSimpleEditor, call directly
      if (onAutoResize) {
        onAutoResize();
      }
    },
    [onChange, onAutoResize]
  );

  const paddingStyles = generatePaddingStyles(focusMode);

  return (
    <Textarea
      ref={textareaRef}
      value={markdown}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      placeholder="Start writing your markdown here..."
      className={`
        w-full h-full resize-none border-0 rounded-none focus:ring-0 focus:outline-none pl-14
        ${focusMode ? 'bg-opacity-95' : ''}
        ${typewriterMode ? 'scroll-smooth' : ''}
        transition-all duration-200
      `}
      style={
        {
          minHeight: '100%',
          padding: paddingStyles,
          ...editorStyles,
          wordWrap: wordWrap ? 'break-word' : 'normal',
          overflowWrap: wordWrap ? 'break-word' : 'normal',
        } as React.CSSProperties
      }
    />
  );
};

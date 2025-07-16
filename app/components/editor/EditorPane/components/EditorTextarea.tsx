import { useAuth } from '@clerk/react-router';
import type React from 'react';
import { useCallback, useState } from 'react';
import { insertImage } from '@/components/editor/MarkdownEditor/utils/keyboardHandlers';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/core/useToast';
import { useImageUpload } from '@/hooks/editor/useImageUpload';
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
 * Core editor textarea component with image upload support
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
  const [isDragOver, setIsDragOver] = useState(false);
  const { isSignedIn } = useAuth();
  const { toast } = useToast();
  const { uploadFromClipboard, uploadFromDrop } = useImageUpload();

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

  // Handle paste events for image upload
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      // Check if clipboard contains image
      const hasImage = Array.from(clipboardData.items).some((item) =>
        item.type.startsWith('image/')
      );
      if (hasImage && !isSignedIn) {
        e.preventDefault();
        toast({
          title: 'Login Required',
          description:
            'Please sign in to upload images. Image upload is available for registered users only.',
          variant: 'destructive',
        });
        return;
      }

      const result = await uploadFromClipboard(clipboardData);
      if (result?.success && result.url && textareaRef.current) {
        e.preventDefault();
        const altText = 'Pasted Image';
        insertImage(textareaRef.current, result.url, altText);
      }
    },
    [uploadFromClipboard, textareaRef, isSignedIn, toast]
  );

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Handle drop events for image upload
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      // Check if dropped files contain images
      const files = Array.from(e.dataTransfer.files);
      const hasImage = files.some((file) => file.type.startsWith('image/'));
      if (hasImage && !isSignedIn) {
        toast({
          title: 'Login Required',
          description:
            'Please sign in to upload images. Image upload is available for registered users only.',
          variant: 'destructive',
        });
        return;
      }

      const result = await uploadFromDrop(e.dataTransfer);
      if (result?.success && result.url && textareaRef.current) {
        const altText = 'Dropped Image';
        insertImage(textareaRef.current, result.url, altText);
      }
    },
    [uploadFromDrop, textareaRef, isSignedIn, toast]
  );

  const paddingStyles = generatePaddingStyles(focusMode);

  return (
    <Textarea
      ref={textareaRef}
      value={markdown}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      onPaste={handlePaste}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      placeholder="Start writing your markdown here... (You can paste or drag & drop images)"
      className={`
        w-full h-full resize-none border-0 rounded-none focus:ring-0 focus:outline-none pl-14
        markdown-editor-textarea
        ${focusMode ? 'bg-opacity-95' : ''}
        ${typewriterMode ? 'scroll-smooth' : ''}
        ${isDragOver ? 'bg-blue-50 border-blue-300 border-2 border-dashed' : ''}
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

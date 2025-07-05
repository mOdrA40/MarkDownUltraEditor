/**
 * @fileoverview Ultra-simple editor hook without complex state management
 * @author Axel Modra
 */

import { useCallback, useRef } from 'react';

interface UseSimpleEditorOptions {
  /** Minimum height for auto-resize */
  minHeight?: number;
  /** Maximum height for auto-resize */
  maxHeight?: number;
}

interface UseSimpleEditorReturn {
  /** Insert text at cursor position */
  insertTextAtCursor: (text: string, selectInserted?: boolean) => void;
  /** Auto-resize textarea */
  autoResize: () => void;
}

/**
 * Ultra-simple editor hook that avoids all race conditions
 * Optimized for smooth typing experience without glitches
 */
export const useSimpleEditor = (
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  options: UseSimpleEditorOptions = {}
): UseSimpleEditorReturn => {
  const { minHeight = 100, maxHeight = 1000 } = options;
  const isOperating = useRef(false);
  const resizeTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Auto-resize textarea without interfering with cursor - throttled for smooth experience
   */
  const autoResize = useCallback(() => {
    if (!textareaRef.current || isOperating.current) return;

    // Clear existing timer to throttle resize operations
    if (resizeTimer.current) {
      clearTimeout(resizeTimer.current);
    }

    resizeTimer.current = setTimeout(() => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;

      // Simple resize without cursor manipulation
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;

      resizeTimer.current = null;
    }, 16); // ~60fps for smooth resizing
  }, [textareaRef, minHeight, maxHeight]);

  /**
   * Insert text at cursor position with minimal interference
   */
  const insertTextAtCursor = useCallback(
    (text: string, selectInserted = false) => {
      if (!textareaRef.current || isOperating.current) return;

      isOperating.current = true;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // Calculate new value and cursor position
      const newValue = value.substring(0, start) + text + value.substring(end);
      const newCursorStart = start + text.length;

      // Update textarea value directly
      textarea.value = newValue;

      // Set cursor position immediately without any async operations
      if (selectInserted) {
        textarea.setSelectionRange(start, newCursorStart);
      } else {
        textarea.setSelectionRange(newCursorStart, newCursorStart);
      }

      // Trigger input event to notify React first
      const inputEvent = new Event('input', { bubbles: true });
      textarea.dispatchEvent(inputEvent);

      // Auto-resize after input event to prevent glitches
      requestAnimationFrame(() => {
        autoResize();
      });

      // Reset flag immediately
      isOperating.current = false;
    },
    [textareaRef, autoResize]
  );

  return {
    insertTextAtCursor,
    autoResize,
  };
};

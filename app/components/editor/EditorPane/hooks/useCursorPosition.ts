/**
 * @fileoverview Custom hook for managing cursor position in textarea
 * @author Axel Modra
 */

import { useCallback, useRef } from 'react';

interface CursorPosition {
  start: number;
  end: number;
}

interface UseCursorPositionOptions {
  /** Preserve cursor position during state updates */
  preservePosition?: boolean;
  /** Debounce time for position updates */
  debounceMs?: number;
}

interface UseCursorPositionReturn {
  /** Get current cursor position */
  getCursorPosition: () => CursorPosition | null;
  /** Set cursor position */
  setCursorPosition: (start: number, end?: number) => void;
  /** Preserve current cursor position */
  preserveCursorPosition: () => void;
  /** Restore preserved cursor position */
  restoreCursorPosition: () => void;
  /** Insert text at cursor position without state conflicts */
}

/**
 * Custom hook for robust cursor position management
 * Handles cursor position preservation during React state updates
 */
export const useCursorPosition = (
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  _onChange: (value: string) => void,
  options: UseCursorPositionOptions = {}
): UseCursorPositionReturn => {
  const { preservePosition = true } = options;

  const preservedPosition = useRef<CursorPosition | null>(null);

  /**
   * Get current cursor position from textarea
   */
  const getCursorPosition = useCallback((): CursorPosition | null => {
    if (!textareaRef.current) return null;

    const textarea = textareaRef.current;
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    };
  }, [textareaRef]);

  /**
   * Set cursor position in textarea
   */
  const setCursorPosition = useCallback(
    (start: number, end?: number) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const endPos = end ?? start;

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        textarea.setSelectionRange(start, endPos);
        textarea.focus();
      });
    },
    [textareaRef]
  );

  /**
   * Preserve current cursor position
   */
  const preserveCursorPosition = useCallback(() => {
    if (!preservePosition) return;

    const position = getCursorPosition();
    if (position) {
      preservedPosition.current = position;
    }
  }, [getCursorPosition, preservePosition]);

  /**
   * Restore preserved cursor position
   */
  const restoreCursorPosition = useCallback(() => {
    if (!preservePosition || !preservedPosition.current) return;

    const { start, end } = preservedPosition.current;
    setCursorPosition(start, end);
    preservedPosition.current = null;
  }, [setCursorPosition, preservePosition]);

  return {
    getCursorPosition,
    setCursorPosition,
    preserveCursorPosition,
    restoreCursorPosition,
  };
};

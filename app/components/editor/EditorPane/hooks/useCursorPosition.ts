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
  insertTextAtCursor: (text: string, selectInserted?: boolean) => void;
}

/**
 * Custom hook for robust cursor position management
 * Handles cursor position preservation during React state updates
 */
export const useCursorPosition = (
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  onChange: (value: string) => void,
  options: UseCursorPositionOptions = {}
): UseCursorPositionReturn => {
  const { preservePosition = true, debounceMs = 0 } = options;
  
  const preservedPosition = useRef<CursorPosition | null>(null);
  const isUpdating = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

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

  /**
   * Insert text at cursor position without causing state conflicts
   */
  const insertTextAtCursor = useCallback(
    (text: string, selectInserted = false) => {
      if (!textareaRef.current || isUpdating.current) return;
      
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      // Mark as updating to prevent race conditions
      isUpdating.current = true;
      
      // Calculate new value and cursor position
      const newValue = value.substring(0, start) + text + value.substring(end);
      const newCursorStart = start + text.length;
      
      // Update textarea value directly first for immediate feedback
      textarea.value = newValue;
      
      // Set cursor position immediately
      if (selectInserted) {
        textarea.setSelectionRange(start, newCursorStart);
      } else {
        textarea.setSelectionRange(newCursorStart, newCursorStart);
      }
      
      // Clear existing debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Debounced state update to prevent excessive re-renders
      const updateState = () => {
        onChange(newValue);
        isUpdating.current = false;
        
        // Ensure cursor position is maintained after state update
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            if (selectInserted) {
              textareaRef.current.setSelectionRange(start, newCursorStart);
            } else {
              textareaRef.current.setSelectionRange(newCursorStart, newCursorStart);
            }
          }
        });
      };
      
      if (debounceMs > 0) {
        debounceTimer.current = setTimeout(updateState, debounceMs);
      } else {
        updateState();
      }
      
      // Trigger input event for other listeners
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    },
    [textareaRef, onChange, debounceMs]
  );

  return {
    getCursorPosition,
    setCursorPosition,
    preserveCursorPosition,
    restoreCursorPosition,
    insertTextAtCursor,
  };
};

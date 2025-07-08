/**
 * Editor utility functions - Centralized to avoid duplication
 * Contains common editor operations used across multiple components
 */

export interface InsertTextOptions {
  selectInserted?: boolean;
  triggerInput?: boolean;
  onChange?: (value: string) => void;
  focus?: boolean;
}

/**
 * Insert text at cursor position in textarea
 * Centralized implementation to avoid duplication
 */
export const insertTextAtCursor = (
  textarea: HTMLTextAreaElement,
  text: string,
  options: InsertTextOptions = {}
): void => {
  const { selectInserted = false, triggerInput = true, onChange, focus = true } = options;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  // Calculate new value
  const newValue = value.substring(0, start) + text + value.substring(end);
  textarea.value = newValue;

  // Calculate new cursor position
  const newCursorPos = start + text.length;

  // Set cursor position
  if (selectInserted) {
    textarea.setSelectionRange(start, newCursorPos);
  } else {
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  }

  // Trigger input event if needed
  if (triggerInput) {
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Call onChange callback if provided
  if (onChange) {
    onChange(newValue);
  }

  // Focus textarea if needed
  if (focus) {
    textarea.focus();
  }
};

/**
 * Auto-resize textarea based on content
 */
export const autoResizeTextarea = (
  textarea: HTMLTextAreaElement,
  minHeight = 100,
  maxHeight = 1000
): void => {
  // Reset height to auto to get actual scroll height
  textarea.style.height = 'auto';

  // Calculate new height
  const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);

  // Set new height
  textarea.style.height = `${newHeight}px`;
};

/**
 * Get current cursor position in textarea
 */
export const getCursorPosition = (
  textarea: HTMLTextAreaElement
): { start: number; end: number } | null => {
  if (!textarea) return null;

  return {
    start: textarea.selectionStart,
    end: textarea.selectionEnd,
  };
};

/**
 * Set cursor position in textarea
 */
export const setCursorPosition = (
  textarea: HTMLTextAreaElement,
  start: number,
  end?: number
): void => {
  const endPos = end ?? start;

  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    textarea.setSelectionRange(start, endPos);
    textarea.focus();
  });
};

/**
 * Wrap selected text with markdown syntax
 */
export const wrapSelectedText = (
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string = prefix,
  placeholder = 'text'
): void => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selectedText = value.substring(start, end);

  let newText: string;
  let cursorStart: number;
  let cursorEnd: number;

  if (selectedText) {
    // Wrap selected text
    newText = prefix + selectedText + suffix;
    cursorStart = cursorEnd = start + newText.length;
  } else {
    // Insert with placeholder
    newText = prefix + placeholder + suffix;
    cursorStart = start + prefix.length;
    cursorEnd = start + prefix.length + placeholder.length;
  }

  // Insert text
  insertTextAtCursor(textarea, newText, {
    selectInserted: false,
    focus: true,
  });

  // Set selection
  textarea.setSelectionRange(cursorStart, cursorEnd);
};

/**
 * Handle tab key for indentation
 */
export const handleTabIndentation = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  _markdown: string,
  onChange: (value: string) => void
): void => {
  e.preventDefault();
  const textarea = e.target as HTMLTextAreaElement;

  insertTextAtCursor(textarea, '  ', {
    selectInserted: false,
    onChange,
    focus: false,
  });
};

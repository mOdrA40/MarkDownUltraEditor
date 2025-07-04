/**
 * Vim utility functions
 * Helper functions untuk vim operations dan text manipulation
 */

import {
  DEFAULT_VIM_CURSOR_CONFIG,
  type VimContext,
  type VimCursorConfig,
  type VimMode,
} from '@/types/vim';

/**
 * Apply cursor style berdasarkan vim mode
 */
export const applyCursorStyle = (
  textarea: HTMLTextAreaElement,
  mode: VimMode,
  config: Partial<VimCursorConfig> = {}
): void => {
  const cursorConfig = { ...DEFAULT_VIM_CURSOR_CONFIG, ...config };
  const modeConfig = cursorConfig[mode];

  if (!modeConfig) return;

  // Apply cursor color
  textarea.style.caretColor = modeConfig.caretColor;

  // Handle focus
  if (modeConfig.focused) {
    textarea.focus();
  } else {
    textarea.blur();
  }
};

/**
 * Get current line dari textarea
 */
export const getCurrentLine = (textarea: HTMLTextAreaElement): string => {
  const value = textarea.value;
  const cursorPos = textarea.selectionStart;

  const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;
  const lineEnd = value.indexOf('\n', cursorPos);

  return value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
};

/**
 * Get line number dari cursor position
 */
export const getLineNumber = (textarea: HTMLTextAreaElement): number => {
  const value = textarea.value;
  const cursorPos = textarea.selectionStart;

  return value.substring(0, cursorPos).split('\n').length;
};

/**
 * Move cursor ke line tertentu
 */
export const moveToLine = (textarea: HTMLTextAreaElement, lineNumber: number): void => {
  const lines = textarea.value.split('\n');

  if (lineNumber < 1 || lineNumber > lines.length) return;

  let position = 0;
  for (let i = 0; i < lineNumber - 1; i++) {
    position += lines[i].length + 1; // +1 untuk newline
  }

  textarea.setSelectionRange(position, position);
};

/**
 * Move cursor ke beginning of line
 */
export const moveToLineStart = (textarea: HTMLTextAreaElement): void => {
  const value = textarea.value;
  const cursorPos = textarea.selectionStart;
  const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;

  textarea.setSelectionRange(lineStart, lineStart);
};

/**
 * Move cursor ke end of line
 */
export const moveToLineEnd = (textarea: HTMLTextAreaElement): void => {
  const value = textarea.value;
  const cursorPos = textarea.selectionStart;
  let lineEnd = value.indexOf('\n', cursorPos);

  if (lineEnd === -1) lineEnd = value.length;

  textarea.setSelectionRange(lineEnd, lineEnd);
};

/**
 * Delete current line
 */
export const deleteCurrentLine = (context: VimContext): void => {
  const { textarea, updateValue } = context;
  const value = textarea.value;
  const cursorPos = textarea.selectionStart;

  const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;
  let lineEnd = value.indexOf('\n', cursorPos);

  if (lineEnd === -1) {
    lineEnd = value.length;
  } else {
    lineEnd += 1; // Include newline
  }

  const newValue = value.substring(0, lineStart) + value.substring(lineEnd);
  updateValue(newValue, lineStart);
};

/**
 * Move cursor by word
 */
export const moveByWord = (
  textarea: HTMLTextAreaElement,
  direction: 'forward' | 'backward'
): void => {
  const value = textarea.value;
  const cursorPos = textarea.selectionStart;

  let newPos = cursorPos;

  if (direction === 'forward') {
    // Find next word boundary
    const match = value.substring(cursorPos).match(/\W*\w+/);
    if (match) {
      newPos = cursorPos + match[0].length;
    }
  } else {
    // Find previous word boundary
    const beforeCursor = value.substring(0, cursorPos);
    const match = beforeCursor.match(/\w+\W*$/);
    if (match) {
      newPos = cursorPos - match[0].length;
    }
  }

  textarea.setSelectionRange(newPos, newPos);
};

/**
 * Insert text at cursor position
 */
export const insertText = (context: VimContext, text: string): void => {
  const { textarea, updateValue } = context;
  const value = textarea.value;
  const cursorPos = textarea.selectionStart;

  const newValue = value.substring(0, cursorPos) + text + value.substring(cursorPos);
  updateValue(newValue, cursorPos + text.length);
};

/**
 * Delete character at cursor
 */
export const deleteCharacter = (
  context: VimContext,
  direction: 'forward' | 'backward' = 'forward'
): void => {
  const { textarea, updateValue } = context;
  const value = textarea.value;
  const cursorPos = textarea.selectionStart;

  let newValue: string;
  let newCursorPos: number;

  if (direction === 'forward') {
    newValue = value.substring(0, cursorPos) + value.substring(cursorPos + 1);
    newCursorPos = cursorPos;
  } else {
    newValue = value.substring(0, cursorPos - 1) + value.substring(cursorPos);
    newCursorPos = cursorPos - 1;
  }

  updateValue(newValue, Math.max(0, newCursorPos));
};

/**
 * Validate vim command
 */
export const isValidVimCommand = (command: string): boolean => {
  // Basic validation untuk vim commands
  if (!command || typeof command !== 'string') return false;

  // Check for valid vim command patterns
  const validPatterns = [
    /^[hjkl]$/, // Movement
    /^[iIaAoO]$/, // Insert modes
    /^[xX]$/, // Delete
    /^[dD]$/, // Delete commands
    /^[yY]$/, // Yank commands
    /^[pP]$/, // Paste commands
    /^[uU]$/, // Undo
    /^\d+$/, // Numbers
    /^[gG]$/, // Go commands
    /^[wWbBeE]$/, // Word movements
    /^[$^0]$/, // Line movements
  ];

  return validPatterns.some((pattern) => pattern.test(command));
};

/**
 * Parse vim command dengan repeat count
 */
export const parseVimCommand = (command: string): { count: number; action: string } => {
  const match = command.match(/^(\d*)(.+)$/);

  if (!match) {
    return { count: 1, action: command };
  }

  const count = match[1] ? Number.parseInt(match[1], 10) : 1;
  const action = match[2];

  return { count, action };
};

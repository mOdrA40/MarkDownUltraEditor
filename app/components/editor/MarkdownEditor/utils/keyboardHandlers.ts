/**
 * @fileoverview Keyboard event handlers and utilities
 * @author Axel Modra
 */

import { KeyboardEventData } from '../types';

/**
 * Extract keyboard event data
 */
export const extractKeyboardEventData = (event: KeyboardEvent): KeyboardEventData => {
  return {
    key: event.key,
    code: event.code,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey
  };
};

/**
 * Check if event matches shortcut configuration
 */
export const matchesShortcut = (
  event: KeyboardEvent,
  shortcut: {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  }
): boolean => {
  const eventKey = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();
  
  // Handle special keys
  if (shortcutKey === 'f11' && eventKey === 'f11') {
    return true;
  }
  
  return (
    eventKey === shortcutKey &&
    !!event.ctrlKey === !!shortcut.ctrlKey &&
    !!event.metaKey === !!shortcut.metaKey &&
    !!event.shiftKey === !!shortcut.shiftKey &&
    !!event.altKey === !!shortcut.altKey
  );
};

/**
 * Check if target element should ignore keyboard shortcuts
 */
export const shouldIgnoreShortcuts = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false;
  
  const element = target as HTMLElement;
  const tagName = element.tagName.toLowerCase();
  
  // Ignore shortcuts in input fields (except markdown editor textarea)
  if (tagName === 'input' || tagName === 'select') return true;
  if (tagName === 'textarea' && !element.classList.contains('markdown-editor-textarea')) return true;
  if (element.contentEditable === 'true') return true;
  
  return false;
};

/**
 * Insert text at cursor position in textarea
 */
export const insertTextAtCursor = (
  textarea: HTMLTextAreaElement,
  text: string,
  selectInserted: boolean = false
): void => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  
  // Insert text
  const newValue = value.substring(0, start) + text + value.substring(end);
  textarea.value = newValue;
  
  // Update cursor position
  if (selectInserted) {
    textarea.setSelectionRange(start, start + text.length);
  } else {
    textarea.setSelectionRange(start + text.length, start + text.length);
  }
  
  // Trigger input event
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.focus();
};

/**
 * Wrap selected text with markdown syntax
 */
export const wrapSelectedText = (
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string = prefix,
  placeholder: string = 'text'
): void => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selectedText = value.substring(start, end);
  
  let newText: string;
  let newCursorPos: number;
  
  if (selectedText) {
    // Wrap selected text
    newText = prefix + selectedText + suffix;
    newCursorPos = start + prefix.length + selectedText.length + suffix.length;
  } else {
    // Insert with placeholder
    newText = prefix + placeholder + suffix;
    newCursorPos = start + prefix.length + placeholder.length;
  }
  
  // Replace text
  const newValue = value.substring(0, start) + newText + value.substring(end);
  textarea.value = newValue;
  
  // Set cursor position
  if (selectedText) {
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  } else {
    // Select placeholder text
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
  }
  
  // Trigger input event
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.focus();
};

/**
 * Insert markdown heading
 */
export const insertHeading = (
  textarea: HTMLTextAreaElement,
  level: number,
  text: string = 'Heading'
): void => {
  const prefix = '#'.repeat(Math.max(1, Math.min(6, level))) + ' ';
  insertTextAtCursor(textarea, prefix + text);
};

/**
 * Insert markdown list item
 */
export const insertListItem = (
  textarea: HTMLTextAreaElement,
  ordered: boolean = false,
  text: string = 'List item'
): void => {
  const prefix = ordered ? '1. ' : '- ';
  insertTextAtCursor(textarea, prefix + text);
};

/**
 * Insert markdown link
 */
export const insertLink = (
  textarea: HTMLTextAreaElement,
  url: string = 'https://example.com',
  text: string = 'Link Text'
): void => {
  const linkText = `[${text}](${url})`;
  insertTextAtCursor(textarea, linkText);
};

/**
 * Insert markdown image
 */
export const insertImage = (
  textarea: HTMLTextAreaElement,
  url: string,
  alt: string = 'Image',
  title?: string
): void => {
  const titlePart = title ? ` "${title}"` : '';
  const imageText = `![${alt}](${url}${titlePart})`;
  insertTextAtCursor(textarea, imageText);
};

/**
 * Insert markdown code block
 */
export const insertCodeBlock = (
  textarea: HTMLTextAreaElement,
  language: string = '',
  code: string = 'code'
): void => {
  const codeBlock = `\`\`\`${language}\n${code}\n\`\`\``;
  insertTextAtCursor(textarea, codeBlock);
};

/**
 * Insert markdown table
 */
export const insertTable = (
  textarea: HTMLTextAreaElement,
  rows: number = 3,
  cols: number = 3
): void => {
  const headers = Array(cols).fill('Header').map((h, i) => `${h} ${i + 1}`);
  const separator = Array(cols).fill('---');
  const rowData = Array(cols).fill('Cell');
  
  let table = `| ${headers.join(' | ')} |\n`;
  table += `| ${separator.join(' | ')} |\n`;
  
  for (let i = 0; i < rows - 1; i++) {
    table += `| ${rowData.join(' | ')} |\n`;
  }
  
  insertTextAtCursor(textarea, table);
};

/**
 * Insert markdown horizontal rule
 */
export const insertHorizontalRule = (textarea: HTMLTextAreaElement): void => {
  insertTextAtCursor(textarea, '\n---\n');
};

/**
 * Insert markdown blockquote
 */
export const insertBlockquote = (
  textarea: HTMLTextAreaElement,
  text: string = 'Quote text'
): void => {
  const lines = text.split('\n');
  const quotedLines = lines.map(line => `> ${line}`);
  insertTextAtCursor(textarea, quotedLines.join('\n'));
};

/**
 * Toggle markdown formatting for selected text
 */
export const toggleMarkdownFormat = (
  textarea: HTMLTextAreaElement,
  format: 'bold' | 'italic' | 'code' | 'strikethrough'
): void => {
  const formatMap = {
    bold: { prefix: '**', suffix: '**', placeholder: 'bold text' },
    italic: { prefix: '*', suffix: '*', placeholder: 'italic text' },
    code: { prefix: '`', suffix: '`', placeholder: 'code' },
    strikethrough: { prefix: '~~', suffix: '~~', placeholder: 'strikethrough text' }
  };
  
  const config = formatMap[format];
  wrapSelectedText(textarea, config.prefix, config.suffix, config.placeholder);
};

/**
 * Handle tab key in textarea for indentation
 */
export const handleTabKey = (
  event: KeyboardEvent,
  textarea: HTMLTextAreaElement
): boolean => {
  if (event.key !== 'Tab') return false;
  
  event.preventDefault();
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  
  if (event.shiftKey) {
    // Unindent (remove tab/spaces at beginning of line)
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineText = value.substring(lineStart, start);
    
    if (lineText.startsWith('\t')) {
      textarea.value = value.substring(0, lineStart) + lineText.substring(1) + value.substring(start);
      textarea.setSelectionRange(start - 1, end - 1);
    } else if (lineText.startsWith('  ')) {
      textarea.value = value.substring(0, lineStart) + lineText.substring(2) + value.substring(start);
      textarea.setSelectionRange(start - 2, end - 2);
    }
  } else {
    // Indent (add tab)
    textarea.value = value.substring(0, start) + '\t' + value.substring(end);
    textarea.setSelectionRange(start + 1, start + 1);
  }
  
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
};

/**
 * Handle enter key for auto-continuation of lists
 */
export const handleEnterKey = (
  event: KeyboardEvent,
  textarea: HTMLTextAreaElement
): boolean => {
  if (event.key !== 'Enter') return false;
  
  const start = textarea.selectionStart;
  const value = textarea.value;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const currentLine = value.substring(lineStart, start);
  
  // Check for list patterns
  const unorderedListMatch = currentLine.match(/^(\s*)([-*+])\s/);
  const orderedListMatch = currentLine.match(/^(\s*)(\d+)\.\s/);
  
  if (unorderedListMatch) {
    event.preventDefault();
    const [, indent, bullet] = unorderedListMatch;
    const newLine = `\n${indent}${bullet} `;
    insertTextAtCursor(textarea, newLine);
    return true;
  }
  
  if (orderedListMatch) {
    event.preventDefault();
    const [, indent, number] = orderedListMatch;
    const nextNumber = parseInt(number) + 1;
    const newLine = `\n${indent}${nextNumber}. `;
    insertTextAtCursor(textarea, newLine);
    return true;
  }
  
  return false;
};

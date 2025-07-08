/**
 * @fileoverview Keyboard event handlers for editor functionality
 * @author Axel Modra
 */

import type { KeyboardHandlerConfig } from '../types/editorPane.types';

/**
 * Handle tab key for indentation
 */
export const handleTabIndentation = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  markdown: string,
  onChange: (value: string) => void
): void => {
  e.preventDefault();
  const textarea = e.target as HTMLTextAreaElement;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const newValue = `${markdown.substring(0, start)}  ${markdown.substring(end)}`;
  onChange(newValue);

  // Set cursor position after indentation
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 2;
  }, 0);
};

/**
 * Main keyboard event handler that coordinates vim mode and other shortcuts
 */
export const handleKeyDown = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  config: KeyboardHandlerConfig
): void => {
  const { vimMode, vimHandler, markdown, onChange } = config;

  // Handle Vim mode first if enabled
  if (vimMode) {
    vimHandler.handleKeyDown(e);
    // If vim handled the event, don't process further
    if (e.defaultPrevented) return;
  }

  // Handle Tab key for indentation
  if (e.key === 'Tab') {
    handleTabIndentation(e, markdown, onChange);
    return;
  }
};

/**
 * Handle common editor shortcuts
 */
export const handleEditorShortcuts = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  callbacks?: {
    onSave?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onFind?: () => void;
  }
): boolean => {
  const { ctrlKey, metaKey, key } = e;
  const isModifierPressed = ctrlKey || metaKey;

  if (!isModifierPressed || !callbacks) return false;

  switch (key.toLowerCase()) {
    case 's':
      if (callbacks.onSave) {
        e.preventDefault();
        callbacks.onSave();
        return true;
      }
      break;
    case 'z':
      if (callbacks.onUndo && !e.shiftKey) {
        e.preventDefault();
        callbacks.onUndo();
        return true;
      }
      if (callbacks.onRedo && e.shiftKey) {
        e.preventDefault();
        callbacks.onRedo();
        return true;
      }
      break;
    case 'y':
      if (callbacks.onRedo) {
        e.preventDefault();
        callbacks.onRedo();
        return true;
      }
      break;
    case 'f':
      if (callbacks.onFind) {
        e.preventDefault();
        callbacks.onFind();
        return true;
      }
      break;
  }

  return false;
};

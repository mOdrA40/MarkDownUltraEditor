/**
 * Main Vim mode hook dengan refactored architecture
 * Menggunakan command pattern dan separated concerns
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  VimMode,
  UseVimModeOptions,
  UseVimModeReturn,
  VimContext
} from '@/types/vim';
import { vimCommandRegistry } from './vim/vimCommands';
import { applyCursorStyle, parseVimCommand, isValidVimCommand } from '@/utils/vimUtils';

export const useVimMode = (
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  value: string,
  onChange: (value: string) => void,
  options: UseVimModeOptions
): UseVimModeReturn => {
  const {
    enabled,
    onModeChange,
    cursorConfig,
    commandTimeout = 1000
  } = options;

  const [mode, setMode] = useState<VimMode>('normal');
  const commandBuffer = useRef<string>('');
  const commandTimeoutRef = useRef<NodeJS.Timeout>();

  // Mode change handler dengan cursor styling
  const changeMode = useCallback((newMode: VimMode) => {
    setMode(newMode);
    onModeChange?.(newMode);

    // Apply cursor style menggunakan utility
    if (textareaRef.current) {
      applyCursorStyle(textareaRef.current, newMode, cursorConfig);
    }
  }, [textareaRef, onModeChange, cursorConfig]);

  /**
   * Create vim context untuk command execution
   */
  const createVimContext = useCallback((): VimContext | null => {
    if (!textareaRef.current) return null;

    const textarea = textareaRef.current;
    return {
      textarea,
      value: textarea.value,
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
      mode,
      changeMode,
      updateValue: (newValue: string, newCursor?: number) => {
        onChange(newValue);
        if (newCursor !== undefined) {
          setTimeout(() => {
            textarea.setSelectionRange(newCursor, newCursor);
          }, 0);
        }
      }
    };
  }, [mode, textareaRef, onChange, changeMode]);

  // Mode entry methods
  const enterInsertMode = useCallback(() => {
    if (enabled) changeMode('insert');
  }, [enabled, changeMode]);

  const enterNormalMode = useCallback(() => {
    if (enabled) changeMode('normal');
  }, [enabled, changeMode]);

  const enterVisualMode = useCallback(() => {
    if (enabled) changeMode('visual');
  }, [enabled, changeMode]);

  const enterCommandMode = useCallback(() => {
    if (enabled) changeMode('command');
  }, [enabled, changeMode]);

  /**
   * Execute vim command menggunakan command registry
   */
  const executeCommand = useCallback((command: string) => {
    if (!enabled) return;

    const context = createVimContext();
    if (!context) return;

    // Parse command dengan repeat count
    const { count, action } = parseVimCommand(command);

    // Get command dari registry
    const vimCommand = vimCommandRegistry.getCommand(action, mode);

    if (vimCommand) {
      // Execute command dengan repeat count
      for (let i = 0; i < count; i++) {
        vimCommand.execute(context);
      }
    } else if (isValidVimCommand(action)) {
      console.warn(`Vim command '${action}' not implemented for mode '${mode}'`);
    }
  }, [enabled, mode, createVimContext]);

  /**
   * Get available commands untuk current mode
   */
  const getAvailableCommands = useCallback(() => {
    return vimCommandRegistry.getCommands(mode);
  }, [mode]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Enhanced key handler menggunakan command registry
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!enabled) return;

    switch (mode) {
      case 'normal':
        e.preventDefault();

        // Handle multi-key commands (seperti dd)
        if (commandBuffer.current === 'd' && e.key === 'd') {
          executeCommand('dd');
          commandBuffer.current = '';

          // Clear timeout
          if (commandTimeoutRef.current) {
            clearTimeout(commandTimeoutRef.current);
            commandTimeoutRef.current = undefined;
          }
        } else if (e.key === 'd') {
          commandBuffer.current = 'd';

          // Set timeout untuk clear command buffer
          commandTimeoutRef.current = setTimeout(() => {
            commandBuffer.current = '';
            commandTimeoutRef.current = undefined;
          }, commandTimeout);
        } else {
          // Clear command buffer dan execute single command
          commandBuffer.current = '';
          if (commandTimeoutRef.current) {
            clearTimeout(commandTimeoutRef.current);
            commandTimeoutRef.current = undefined;
          }
          executeCommand(e.key);
        }
        break;

      case 'insert':
        if (e.key === 'Escape') {
          e.preventDefault();
          executeCommand('Escape');
        }
        // Allow normal typing in insert mode
        break;

      case 'visual':
        e.preventDefault();
        executeCommand(e.key);
        break;

      case 'command':
        if (e.key === 'Escape') {
          e.preventDefault();
          executeCommand('Escape');
        }
        // Handle command mode input
        break;
    }
  }, [enabled, mode, executeCommand, commandTimeout]);

  // Initialize vim mode
  useEffect(() => {
    if (enabled) {
      changeMode('normal');
    } else {
      changeMode('insert');
    }
  }, [enabled, changeMode]);

  return {
    mode,
    isEnabled: enabled,
    handleKeyDown,
    enterInsertMode,
    enterNormalMode,
    enterVisualMode,
    enterCommandMode,
    executeCommand,
    getAvailableCommands,
  };
};

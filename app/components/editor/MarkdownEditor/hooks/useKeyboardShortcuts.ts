/**
 * @fileoverview Keyboard shortcuts management hook
 * @author Axel Modra
 */

import { useCallback, useEffect, useRef } from 'react';
// import { KEYBOARD_SHORTCUTS } from '../utils/constants';

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

/**
 * Keyboard shortcuts context
 */
export interface KeyboardShortcutsContext {
  insertText: (text: string) => void;
  togglePreview: () => void;
  toggleZenMode: () => void;
  showShortcuts: () => void;
  undo: () => void;
  redo: () => void;
  newFile: () => void;
  saveFile: () => void;
  openFile: () => void;
}

/**
 * Hook return type
 */
export interface UseKeyboardShortcutsReturn {
  registerShortcut: (shortcut: KeyboardShortcut) => () => void;
  unregisterShortcut: (key: string) => void;
  isShortcutActive: (key: string) => boolean;
  getActiveShortcuts: () => KeyboardShortcut[];
  enableShortcuts: () => void;
  disableShortcuts: () => void;
}

/**
 * Custom hook for managing keyboard shortcuts
 * Handles registration, execution, and context-aware shortcuts
 */
export const useKeyboardShortcuts = (
  context: KeyboardShortcutsContext,
  enabled = true
): UseKeyboardShortcutsReturn => {
  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map());
  const enabledRef = useRef(enabled);

  /**
   * Generate shortcut key from event
   */
  const getShortcutKey = useCallback((event: KeyboardEvent): string => {
    const parts = [];
    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    parts.push(event.key.toLowerCase());
    return parts.join('+');
  }, []);

  /**
   * Generate shortcut key from configuration
   */
  const getConfigKey = useCallback((config: Partial<KeyboardShortcut>): string => {
    const parts = [];
    if (config.ctrlKey || config.metaKey) parts.push('ctrl');
    if (config.shiftKey) parts.push('shift');
    if (config.altKey) parts.push('alt');
    parts.push(config.key?.toLowerCase() || '');
    return parts.join('+');
  }, []);

  /**
   * Register a keyboard shortcut
   */
  const registerShortcut = useCallback(
    (shortcut: KeyboardShortcut): (() => void) => {
      const key = getConfigKey(shortcut);
      shortcutsRef.current.set(key, shortcut);

      // Return unregister function
      return () => {
        shortcutsRef.current.delete(key);
      };
    },
    [getConfigKey]
  );

  /**
   * Unregister a keyboard shortcut
   */
  const unregisterShortcut = useCallback((key: string) => {
    shortcutsRef.current.delete(key);
  }, []);

  /**
   * Check if shortcut is active
   */
  const isShortcutActive = useCallback((key: string): boolean => {
    return shortcutsRef.current.has(key);
  }, []);

  /**
   * Get all active shortcuts
   */
  const getActiveShortcuts = useCallback((): KeyboardShortcut[] => {
    return Array.from(shortcutsRef.current.values());
  }, []);

  /**
   * Enable shortcuts
   */
  const enableShortcuts = useCallback(() => {
    enabledRef.current = true;
  }, []);

  /**
   * Disable shortcuts
   */
  const disableShortcuts = useCallback(() => {
    enabledRef.current = false;
  }, []);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabledRef.current) return;

      // Don't handle shortcuts when typing in input fields (except textarea for editor)
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        (target.tagName === 'TEXTAREA' && !target.classList.contains('markdown-editor-textarea')) ||
        target.contentEditable === 'true';

      if (isInputField) return;

      const shortcutKey = getShortcutKey(event);
      const shortcut = shortcutsRef.current.get(shortcutKey);

      if (shortcut) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
      }
    },
    [getShortcutKey]
  );

  /**
   * Register default shortcuts
   */
  useEffect(() => {
    const defaultShortcuts: KeyboardShortcut[] = [
      {
        key: 'b',
        ctrlKey: true,
        action: () => context.insertText('**Bold Text**'),
        description: 'Bold text',
        category: 'Formatting',
      },
      {
        key: 'i',
        ctrlKey: true,
        action: () => context.insertText('*Italic Text*'),
        description: 'Italic text',
        category: 'Formatting',
      },
      {
        key: 'k',
        ctrlKey: true,
        action: () => context.insertText('[Link Text](https://example.com)'),
        description: 'Insert link',
        category: 'Formatting',
      },
      {
        key: '`',
        ctrlKey: true,
        action: () => context.insertText('`code`'),
        description: 'Inline code',
        category: 'Formatting',
      },
      {
        key: 'z',
        ctrlKey: true,
        action: context.undo,
        description: 'Undo',
        category: 'Edit',
      },
      {
        key: 'y',
        ctrlKey: true,
        action: context.redo,
        description: 'Redo',
        category: 'Edit',
      },
      {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        action: context.redo,
        description: 'Redo (alternative)',
        category: 'Edit',
      },
      {
        key: '/',
        ctrlKey: true,
        action: context.togglePreview,
        description: 'Toggle preview',
        category: 'View',
      },
      {
        key: '.',
        ctrlKey: true,
        action: context.toggleZenMode,
        description: 'Toggle zen mode',
        category: 'View',
      },
      {
        key: '?',
        ctrlKey: true,
        action: context.showShortcuts,
        description: 'Show keyboard shortcuts',
        category: 'Help',
      },
      {
        key: 'n',
        ctrlKey: true,
        action: context.newFile,
        description: 'New file',
        category: 'File',
      },
      {
        key: 's',
        ctrlKey: true,
        action: context.saveFile,
        description: 'Save file',
        category: 'File',
      },
      {
        key: 'o',
        ctrlKey: true,
        action: context.openFile,
        description: 'Open file',
        category: 'File',
      },
      {
        key: 'f11',
        action: () => {
          if (typeof document === 'undefined') return;

          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        },
        description: 'Toggle fullscreen',
        category: 'View',
      },
    ];

    // Register all default shortcuts
    const unregisterFunctions = defaultShortcuts.map((shortcut) => registerShortcut(shortcut));

    // Cleanup function
    return () => {
      for (const unregister of unregisterFunctions) {
        unregister();
      }
    };
  }, [context, registerShortcut]);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  /**
   * Update enabled state
   */
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  return {
    registerShortcut,
    unregisterShortcut,
    isShortcutActive,
    getActiveShortcuts,
    enableShortcuts,
    disableShortcuts,
  };
};

/**
 * Hook for managing shortcut help display
 */
export const useShortcutHelp = () => {
  const getShortcutsByCategory = useCallback((shortcuts: KeyboardShortcut[]) => {
    const categories: Record<string, KeyboardShortcut[]> = {};

    shortcuts.forEach((shortcut) => {
      const category = shortcut.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(shortcut);
    });

    return categories;
  }, []);

  const formatShortcut = useCallback((shortcut: KeyboardShortcut): string => {
    const parts = [];
    if (shortcut.ctrlKey || shortcut.metaKey) {
      const isMac =
        typeof navigator !== 'undefined' &&
        (navigator.userAgent.includes('Mac') || navigator.userAgent.includes('iPhone'));
      parts.push(isMac ? '⌘' : 'Ctrl');
    }
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());

    return parts.join(' + ');
  }, []);

  return {
    getShortcutsByCategory,
    formatShortcut,
  };
};

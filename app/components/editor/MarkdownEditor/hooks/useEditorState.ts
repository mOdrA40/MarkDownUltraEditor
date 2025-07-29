/**
 * @fileoverview Main editor state management hook
 * @author Axel Modra
 */

import { useCallback, useState } from 'react';
import { useToast, useUndoRedo } from '@/hooks/core';
import type { EditorState, UseEditorStateReturn } from '../types';
import { DEFAULT_FILE, STORAGE_KEYS, SUCCESS_MESSAGES } from '../utils/constants';

/**
 * Custom hook for managing editor state
 * Handles markdown content, file operations, and modification tracking
 */
export const useEditorState = (
  initialMarkdown?: string,
  initialFileName?: string
): UseEditorStateReturn => {
  const { toast } = useToast();

  // Get initial content - prioritize passed initialMarkdown over localStorage
  const getInitialContent = () => {
    if (initialMarkdown !== undefined) return initialMarkdown;

    // Only check localStorage if no initialMarkdown was provided
    if (typeof localStorage !== 'undefined') {
      const savedContent = localStorage.getItem(STORAGE_KEYS.CONTENT);
      if (savedContent !== null) return savedContent;
    }

    return DEFAULT_FILE.CONTENT;
  };

  // Get initial filename - prioritize passed initialFileName over localStorage
  const getInitialFileName = () => {
    if (initialFileName !== undefined) return initialFileName;

    // Only check localStorage if no initialFileName was provided
    if (typeof localStorage !== 'undefined') {
      const savedFileName = localStorage.getItem(STORAGE_KEYS.FILE_NAME);
      if (savedFileName !== null) return savedFileName;
    }

    return DEFAULT_FILE.NAME;
  };

  // Initialize undo/redo functionality with proper initial content
  const {
    value: markdown,
    setValue: setMarkdown,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
  } = useUndoRedo(getInitialContent(), {
    maxHistorySize: 50,
    debounceMs: 300,
  });

  // File state management
  const [fileName, setFileName] = useState(getInitialFileName());
  const [isModified, setIsModified] = useState(false);
  const [autoSave] = useState(true);

  /**
   * Handle markdown content changes
   */
  const handleMarkdownChange = useCallback(
    (value: string) => {
      setMarkdown(value);
      setIsModified(true);
    },
    [setMarkdown]
  );

  /**
   * Handle file name changes
   */
  const handleFileNameChange = useCallback((name: string) => {
    setFileName(name);
    setIsModified(true);
  }, []);

  /**
   * Set modification status
   */
  const handleSetModified = useCallback((modified: boolean) => {
    setIsModified(modified);
  }, []);

  /**
   * Create a new file
   */
  const handleNewFile = useCallback(() => {
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev('handleNewFile called - isModified:', isModified);
    });

    if (isModified) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to create a new file?'
      );
      if (!confirmed) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.dev('User cancelled new file creation');
        });
        return;
      }
    }

    // Create empty file for "New" button
    const newFileContent = '';
    const newFileName = 'untitled.md';

    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev('Creating new file with content:', newFileContent);
    });
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev('Setting filename to:', newFileName);
    });

    // Clear history first with the new content to prevent race conditions
    clearHistory(newFileContent);

    // Update state
    setMarkdown(newFileContent);
    setFileName(newFileName);
    setIsModified(false);

    // Immediately update localStorage to prevent race conditions
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.CONTENT, newFileContent);
        localStorage.setItem(STORAGE_KEYS.FILE_NAME, newFileName);
      } catch (error) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.warn('Failed to save to localStorage:', error);
        });
      }
    }

    toast({
      title: 'New file created',
      description: 'Ready to start writing!',
    });

    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev('New file created successfully');
    });
  }, [isModified, setMarkdown, clearHistory, toast]);

  /**
   * Load file content
   */
  const handleLoadFile = useCallback(
    (content: string, name: string, bypassDialog = false) => {
      if (!bypassDialog && isModified) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to load a new file?'
        );
        if (!confirmed) return;
      }

      // Debug logging (development only)
      if (process.env.NODE_ENV === 'development') {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.dev('Loading file:', name, 'with content length:', content.length);
        });
      }

      // Clear history first with the new content to prevent race conditions
      clearHistory(content);

      // Update state - setMarkdown will handle the content update
      setMarkdown(content);
      setFileName(name);

      const isTemplate =
        name.includes('Template') ||
        name.includes('template') ||
        content.includes('# Template') ||
        content.includes('# API Documentation');
      setIsModified(isTemplate);

      // Only update localStorage for guest users to prevent conflict with Supabase
      // For authenticated users, let auto-save handle the Supabase storage
      if (typeof localStorage !== 'undefined') {
        try {
          // Always update current editor state in localStorage for editor functionality
          localStorage.setItem(STORAGE_KEYS.CONTENT, content);
          localStorage.setItem(STORAGE_KEYS.FILE_NAME, name);
          import('@/utils/console').then(({ safeConsole }) => {
            safeConsole.dev('Updated editor state in localStorage:', name);
          });
        } catch (error) {
          import('@/utils/console').then(({ safeConsole }) => {
            safeConsole.warn('Failed to update localStorage:', error);
          });
        }
      }

      toast({
        title: SUCCESS_MESSAGES.FILE_LOADED,
        description: `${name} has been loaded successfully.`,
      });

      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('File loaded successfully:', name);
      });
    },
    [isModified, setMarkdown, clearHistory, toast]
  );

  // Create state object
  const state: EditorState = {
    markdown,
    fileName,
    isModified,
    autoSave,
  };

  // Create actions object
  const actions = {
    setMarkdown: handleMarkdownChange,
    setFileName: handleFileNameChange,
    setModified: handleSetModified,
    newFile: handleNewFile,
    loadFile: handleLoadFile,
  };

  // Return undo/redo functionality as well
  return {
    state,
    actions,
    undoRedo: {
      undo,
      redo,
      canUndo,
      canRedo,
      clearHistory,
    },
  };
};

/**
 * Extended return type including undo/redo
 */
export interface UseEditorStateExtendedReturn extends UseEditorStateReturn {
  undoRedo: {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clearHistory: (newValue?: string) => void;
  };
}

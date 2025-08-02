/**
 * @fileoverview Main editor state management hook
 * @author Axel Modra
 */

import { useCallback, useEffect, useState } from 'react';
import { useToast, useUndoRedo } from '@/hooks/core';
import { isFirstVisit } from '@/utils/editorPreferences';
import { fileContextManager } from '@/utils/fileContext';
import type { EditorState, UseEditorStateReturn } from '../types';
import { DEFAULT_FILE, STORAGE_KEYS, SUCCESS_MESSAGES } from '../utils/constants';

/**
 * Custom hook for managing editor state
 * Handles markdown content, file operations, and modification tracking
 */
export const useEditorState = (
  initialMarkdown?: string,
  initialFileName?: string
): UseEditorStateReturn & { isRestoring: boolean } => {
  const { toast } = useToast();
  const [isRestoring, setIsRestoring] = useState(true);

  const getInitialValue = useCallback(
    (storageKey: string, fallback: string, contextKey?: 'fileName' | 'fileId') => {
      // Context takes first priority
      const activeFileContext = fileContextManager.getActiveFile();
      if (activeFileContext && contextKey && activeFileContext[contextKey]) {
        return activeFileContext[contextKey] as string;
      }
      // Then check localStorage
      if (typeof localStorage !== 'undefined') {
        const savedValue = localStorage.getItem(storageKey);
        if (savedValue !== null) {
          return savedValue;
        }
      }
      // Finally, use the fallback
      return fallback;
    },
    []
  );

  const {
    value: markdown,
    setValue: setMarkdown,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
  } = useUndoRedo(getInitialValue(STORAGE_KEYS.CONTENT, initialMarkdown ?? DEFAULT_FILE.CONTENT), {
    maxHistorySize: 50,
    debounceMs: 300,
  });

  const [fileName, setFileName] = useState(() =>
    getInitialValue(STORAGE_KEYS.FILE_NAME, initialFileName ?? DEFAULT_FILE.NAME, 'fileName')
  );
  const [isModified, setIsModified] = useState(false);
  const [autoSave] = useState(true);

  useEffect(() => {
    const activeFile = fileContextManager.getActiveFile();
    const isFirstTime = isFirstVisit();
    const hasInitialContent = initialMarkdown !== undefined;

    // Show loader if we are a returning user and there's no overriding initial content
    if (!isFirstTime && !hasInitialContent && activeFile) {
      setIsRestoring(true);
      // Content will be loaded by useAutoFileRestoration, we just show the loader
    } else {
      setIsRestoring(false);
    }

    // On initial load, if there's content from localStorage, set it
    const savedContent = localStorage.getItem(STORAGE_KEYS.CONTENT);
    if (savedContent) {
      setMarkdown(savedContent); // Set without adding to history
    }

    // Set a timeout to prevent infinite loading screen
    const timeoutId = setTimeout(() => {
      setIsRestoring(false);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [initialMarkdown, setMarkdown]);

  const handleMarkdownChange = useCallback(
    (value: string) => {
      setMarkdown(value);
      setIsModified(true);
    },
    [setMarkdown]
  );

  const handleFileNameChange = useCallback((name: string) => {
    setFileName(name);
    setIsModified(true);
  }, []);

  const handleSetModified = useCallback((modified: boolean) => {
    setIsModified(modified);
  }, []);

  const updateFileContext = useCallback(
    (
      fileName: string,
      fileId?: string,
      source: 'url' | 'files-page' | 'manual' | 'auto-save' = 'manual'
    ) => {
      const contextFileId =
        fileId || `file_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      fileContextManager.setActiveFile({
        fileId: contextFileId,
        fileName,
        source,
      });

      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('File context updated:', {
          fileId: contextFileId,
          fileName,
          source,
        });
      });
    },
    []
  );

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

    const newFileContent = '';
    const newFileName = 'untitled.md';

    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev('Creating new file with content:', newFileContent);
      safeConsole.dev('Setting filename to:', newFileName);
    });

    clearHistory(newFileContent);

    setMarkdown(newFileContent);
    setFileName(newFileName);
    setIsModified(false);

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

  const handleLoadFile = useCallback(
    (
      content: string,
      name: string,
      bypassDialog = false,
      fileId?: string,
      source: 'url' | 'files-page' | 'manual' | 'auto-save' = 'manual',
      silent = false
    ) => {
      if (!bypassDialog && isModified) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to load a new file?'
        );
        if (!confirmed) return;
      }
      if (process.env.NODE_ENV === 'development') {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.dev('Loading file:', name, 'with content length:', content.length);
        });
      }

      clearHistory(content);
      setMarkdown(content);
      setFileName(name);
      setIsRestoring(false); // Done restoring

      const isTemplate =
        name.includes('Template') ||
        name.includes('template') ||
        content.includes('# Template') ||
        content.includes('# API Documentation');
      setIsModified(isTemplate);

      updateFileContext(name, fileId, source);

      if (typeof localStorage !== 'undefined') {
        try {
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

      if (!silent && source !== 'auto-save') {
        toast({
          title: SUCCESS_MESSAGES.FILE_LOADED,
          description: `${name} has been loaded successfully.`,
        });
      }

      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('File loaded successfully:', name, silent ? '(silent)' : '');
      });
    },
    [isModified, setMarkdown, clearHistory, toast, updateFileContext]
  );

  const state: EditorState = {
    markdown,
    fileName,
    isModified,
    autoSave,
  };

  const actions = {
    setMarkdown: handleMarkdownChange,
    setFileName: handleFileNameChange,
    setModified: handleSetModified,
    newFile: handleNewFile,
    loadFile: handleLoadFile,
  };

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
    isRestoring,
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

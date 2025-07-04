/**
 * @fileoverview Main editor state management hook
 * @author Axel Modra
 */

import { useState, useCallback, useEffect } from 'react';
import { useUndoRedo, useToast } from '@/hooks/core';
import type { EditorState, UseEditorStateReturn } from '../types';
import { DEFAULT_FILE, STORAGE_KEYS, SUCCESS_MESSAGES } from '../utils/constants';
import { getStorageInfo, cleanupStorage, formatBytes } from '@/utils/storageUtils';

/**
 * Custom hook for managing editor state
 * Handles markdown content, file operations, and modification tracking
 */
export const useEditorState = (
  initialMarkdown?: string,
  initialFileName?: string
): UseEditorStateReturn => {
  const { toast } = useToast();

  // Get initial content from localStorage or use default
  const getInitialContent = () => {
    if (initialMarkdown) return initialMarkdown;

    if (typeof localStorage !== 'undefined') {
      const savedContent = localStorage.getItem(STORAGE_KEYS.CONTENT);
      if (savedContent !== null) return savedContent;
    }

    return DEFAULT_FILE.CONTENT;
  };

  // Get initial filename from localStorage or use default
  const getInitialFileName = () => {
    if (initialFileName) return initialFileName;

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
    debounceMs: 500,
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
    console.log('handleNewFile called - isModified:', isModified);

    if (isModified) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to create a new file?'
      );
      if (!confirmed) {
        console.log('User cancelled new file creation');
        return;
      }
    }

    // Create empty file for "New" button
    const newFileContent = '';
    const newFileName = 'untitled.md';

    console.log('Creating new file with content:', newFileContent);
    console.log('Setting filename to:', newFileName);

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
        console.warn('Failed to save to localStorage:', error);
      }
    }

    toast({
      title: 'New file created',
      description: 'Ready to start writing!',
    });

    console.log('New file created successfully');
  }, [isModified, setMarkdown, clearHistory, toast]);

  /**
   * Load file content
   */
  const handleLoadFile = useCallback(
    (content: string, name: string) => {
      if (isModified) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to load a new file?'
        );
        if (!confirmed) return;
      }

      // Debug logging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('Loading file:', name, 'with content length:', content.length);
      }

      // Clear history first with the new content to prevent conflicts
      clearHistory(content);

      // Update state - setMarkdown will handle the content update
      setMarkdown(content);
      setFileName(name);
      setIsModified(false);

      // Immediately update localStorage to prevent race conditions
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.CONTENT, content);
          localStorage.setItem(STORAGE_KEYS.FILE_NAME, name);
          console.log('Saved to localStorage:', name);
        } catch (error) {
          console.warn('Failed to save to localStorage:', error);
        }
      }

      toast({
        title: SUCCESS_MESSAGES.FILE_LOADED,
        description: `${name} has been loaded successfully.`,
      });

      console.log('File loaded successfully:', name);
    },
    [isModified, setMarkdown, clearHistory, toast]
  );

  /**
   * Auto-save functionality with memory leak prevention
   */
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;

    if (autoSave && isModified) {
      const timer = setTimeout(() => {
        try {
          // Check storage capacity before saving
          const contentSize = new Blob([markdown]).size;
          const fileNameSize = new Blob([fileName]).size;
          const totalSize = contentSize + fileNameSize;

          // Check if we have enough space (leave 1MB buffer)
          const storageInfo = getStorageInfo();
          if (storageInfo.available < totalSize + 1024 * 1024) {
            // Clean up old data if needed
            cleanupStorage([
              STORAGE_KEYS.CONTENT,
              STORAGE_KEYS.FILE_NAME,
              STORAGE_KEYS.THEME,
              STORAGE_KEYS.SETTINGS,
              STORAGE_KEYS.UI_STATE,
            ]);
          }

          // Save with error handling
          localStorage.setItem(STORAGE_KEYS.CONTENT, markdown);
          localStorage.setItem(STORAGE_KEYS.FILE_NAME, fileName);
          setIsModified(false);

          toast({
            title: SUCCESS_MESSAGES.AUTO_SAVED,
            description: `Saved locally (${formatBytes(totalSize)})`,
            duration: 2000,
          });
        } catch (error) {
          console.warn('Auto-save failed:', error);
          toast({
            title: 'Auto-save Warning',
            description: 'Storage limit reached. Consider exporting your work.',
            variant: 'destructive',
            duration: 5000,
          });
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [markdown, fileName, autoSave, isModified, toast]);

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

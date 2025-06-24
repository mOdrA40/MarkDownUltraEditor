/**
 * @fileoverview Main editor state management hook
 * @author Senior Developer
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useUndoRedo } from '@/hooks/use-undo-redo';
import { useToast } from '@/hooks/use-toast';
import { EditorState, UseEditorStateReturn } from '../types';
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
  
  // Initialize undo/redo functionality with default content
  const {
    value: markdown,
    setValue: setMarkdown,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  } = useUndoRedo(initialMarkdown || DEFAULT_FILE.CONTENT, {
    maxHistorySize: 50,
    debounceMs: 500
  });

  // File state management
  const [fileName, setFileName] = useState(initialFileName || DEFAULT_FILE.NAME);
  const [isModified, setIsModified] = useState(false);
  const [autoSave] = useState(true);

  // Track if initial load is complete to prevent loops
  const isInitialLoadRef = useRef(false);

  /**
   * Handle markdown content changes
   */
  const handleMarkdownChange = useCallback((value: string) => {
    setMarkdown(value);
    setIsModified(true);
  }, [setMarkdown]);

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
    if (isModified) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to create a new file?'
      );
      if (!confirmed) return;
    }

    setMarkdown(DEFAULT_FILE.CONTENT);
    setFileName(DEFAULT_FILE.NAME);
    setIsModified(false);
    clearHistory();
    
    toast({
      title: "New file created",
      description: "Ready to start writing!",
    });
  }, [isModified, setMarkdown, clearHistory, toast]);

  /**
   * Load file content
   */
  const handleLoadFile = useCallback((content: string, name: string) => {
    if (isModified) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to load a new file?'
      );
      if (!confirmed) return;
    }

    setMarkdown(content);
    setFileName(name);
    setIsModified(false);
    clearHistory();
    
    toast({
      title: SUCCESS_MESSAGES.FILE_LOADED,
      description: `${name} has been loaded successfully.`,
    });
  }, [isModified, setMarkdown, clearHistory, toast]);

  /**
   * Auto-save functionality
   */
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;

    if (autoSave && isModified && isInitialLoadRef.current) {
      const timer = setTimeout(() => {
        localStorage.setItem(STORAGE_KEYS.CONTENT, markdown);
        localStorage.setItem(STORAGE_KEYS.FILE_NAME, fileName);
        setIsModified(false);

        toast({
          title: SUCCESS_MESSAGES.AUTO_SAVED,
          description: "Your changes have been saved locally.",
          duration: 2000,
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [markdown, fileName, autoSave, isModified, toast]);

  /**
   * Load saved content on mount
   */
  useEffect(() => {
    if (isInitialLoadRef.current || typeof localStorage === 'undefined') return;

    const savedContent = localStorage.getItem(STORAGE_KEYS.CONTENT);
    const savedFileName = localStorage.getItem(STORAGE_KEYS.FILE_NAME);

    if (savedContent && !initialMarkdown) {
      setMarkdown(savedContent);
      clearHistory();
    }

    if (savedFileName && !initialFileName) {
      setFileName(savedFileName);
    }

    isInitialLoadRef.current = true;
  }, [setMarkdown, clearHistory, initialMarkdown, initialFileName]);

  // Create state object
  const state: EditorState = {
    markdown,
    fileName,
    isModified,
    autoSave
  };

  // Create actions object
  const actions = {
    setMarkdown: handleMarkdownChange,
    setFileName: handleFileNameChange,
    setModified: handleSetModified,
    newFile: handleNewFile,
    loadFile: handleLoadFile
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
      clearHistory
    }
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
    clearHistory: () => void;
  };
}

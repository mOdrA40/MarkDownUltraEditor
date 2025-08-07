/**
 * @fileoverview Hook for tracking and loading last opened file
 * @author MarkDownUltraRemix Team
 */

import { useAuth } from '@clerk/react-router';
import { useCallback, useEffect, useState } from 'react';
import { useFileContext } from '@/contexts/FileContextProvider';
import type { FileData } from '@/lib/supabase';

import { safeConsole } from '@/utils/console';
import {
  clearLastOpenedFile,
  getLastOpenedFile,
  saveLastOpenedFile,
} from '@/utils/editorPreferences';

export interface LastOpenedFileState {
  /** Last opened file data */
  fileData: FileData | null;
  /** Whether the file is loading */
  isLoading: boolean;
  /** Whether there was an error loading the file */
  error: string | null;
  /** Save the current file as last opened */
  saveLastOpened: (file: Pick<FileData, 'id' | 'title' | 'content'>) => Promise<boolean>;
  /** Clear the last opened file */
  clearLastOpened: () => Promise<boolean>;
}

/**
 * Hook for tracking and loading the last opened file
 */
export const useLastOpenedFile = (): LastOpenedFileState => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { isSignedIn, isLoaded } = useAuth();
  const { activeFile } = useFileContext();

  /**
   * Load the last opened file (localStorage-only approach)
   */
  const loadLastOpenedFile = useCallback(async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use localStorage for all users (guest and authenticated)
      const lastOpened = getLastOpenedFile();
      if (lastOpened) {
        setFileData({
          id: lastOpened.id,
          title: lastOpened.title,
          content: lastOpened.content,
        });
      } else {
        setFileData(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      safeConsole.error('Error loading last opened file:', err);
      setError(errorMessage);
      setFileData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded]);

  /**
   * Save the current file as last opened (localStorage-only approach)
   */
  const saveLastOpened = useCallback(
    async (file: Pick<FileData, 'id' | 'title' | 'content'>): Promise<boolean> => {
      try {
        // Use localStorage for all users (guest and authenticated)
        saveLastOpenedFile(file);
        return true;
      } catch (err) {
        safeConsole.error('Error saving last opened file:', err);
        return false;
      }
    },
    []
  );

  /**
   * Clear the last opened file (localStorage-only approach)
   */
  const clearLastOpened = useCallback(async (): Promise<boolean> => {
    try {
      // Use localStorage for all users (guest and authenticated)
      clearLastOpenedFile();
      setFileData(null);
      return true;
    } catch (err) {
      safeConsole.error('Error clearing last opened file:', err);
      return false;
    }
  }, []);

  /**
   * Load the last opened file on mount and when authentication state changes
   * Prioritize immediate loading for authenticated users
   */
  useEffect(() => {
    if (isLoaded) {
      // For authenticated users, load immediately to prevent welcome template flash
      if (isSignedIn) {
        loadLastOpenedFile();
      } else {
        // For guest users, also load immediately but from localStorage
        const lastOpened = getLastOpenedFile();
        if (lastOpened) {
          setFileData({
            id: lastOpened.id,
            title: lastOpened.title,
            content: lastOpened.content,
          });
          setIsLoading(false);
        } else {
          setFileData(null);
          setIsLoading(false);
        }
      }
    }
  }, [isLoaded, isSignedIn, loadLastOpenedFile]);

  /**
   * For guest users, load immediately from localStorage without waiting for Clerk
   * This optimizes initial loading performance
   */
  useEffect(() => {
    // Only run if Clerk hasn't loaded yet and we're likely a guest user
    if (!isLoaded && !isSignedIn) {
      const lastOpened = getLastOpenedFile();
      if (lastOpened) {
        setFileData({
          id: lastOpened.id,
          title: lastOpened.title,
          content: lastOpened.content,
        });
        setIsLoading(false);
      } else {
        setFileData(null);
        setIsLoading(false);
      }
    }
  }, [isLoaded, isSignedIn]);

  /**
   * Save active file as last opened when it changes
   */
  useEffect(() => {
    if (activeFile?.fileId && activeFile?.fileName) {
      // Get file content from localStorage or session storage
      const content = localStorage.getItem('markdownEditor_content') || '';

      if (content) {
        saveLastOpened({
          id: activeFile.fileId,
          title: activeFile.fileName,
          content,
        });
      }
    }
  }, [activeFile, saveLastOpened]);

  return {
    fileData,
    isLoading,
    error,
    saveLastOpened,
    clearLastOpened,
  };
};

export default useLastOpenedFile;

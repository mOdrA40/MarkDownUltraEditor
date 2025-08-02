/**
 * @fileoverview Hook for tracking and loading last opened file
 * @author MarkDownUltraRemix Team
 */

import { useAuth } from '@clerk/react-router';
import { useCallback, useEffect, useState } from 'react';
import { useFileContext } from '@/contexts/FileContextProvider';
import type { FileData } from '@/lib/supabase';
import { useSupabase } from '@/lib/supabase';
import { createUserPreferencesService } from '@/services/userPreferencesService';
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

  const { userId, isSignedIn, isLoaded } = useAuth();
  const supabase = useSupabase();
  const { activeFile } = useFileContext();

  /**
   * Load the last opened file with multi-device conflict resolution
   */
  const loadLastOpenedFile = useCallback(async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      // For authenticated users, get from Supabase
      if (isSignedIn && userId && supabase) {
        const preferencesService = createUserPreferencesService(supabase);

        // Initialize or update device session
        await preferencesService.getOrCreateDeviceSession(userId);

        // Clean up old sessions
        await preferencesService.deactivateOldSessions(userId, 24);

        // Get user preferences
        const preferences = await preferencesService.getUserPreferences(userId);

        if (preferences?.last_opened_file_id) {
          // Check for conflicts with other devices
          const mostRecentFile = await preferencesService.getMostRecentFileAcrossDevices(userId);

          let fileIdToLoad = preferences.last_opened_file_id;

          // If there's a more recent file from another device, use that
          if (mostRecentFile && mostRecentFile.fileId !== preferences.last_opened_file_id) {
            const mostRecentTime = new Date(mostRecentFile.lastActivity);
            const preferencesTime = new Date(preferences.last_activity_at);

            if (mostRecentTime > preferencesTime) {
              fileIdToLoad = mostRecentFile.fileId;
            }
          }

          // Get the file data
          const { data: fileData, error: fileError } = await supabase
            .from('user_files')
            .select('*')
            .eq('id', fileIdToLoad)
            .eq('user_id', userId)
            .single();

          if (fileError) {
            safeConsole.error('Error loading last opened file:', fileError);
          } else if (fileData) {
            setFileData({
              id: fileData.id,
              title: fileData.title,
              content: fileData.content,
              fileType: fileData.file_type,
              tags: fileData.tags,
              isTemplate: fileData.is_template,
              createdAt: fileData.created_at,
              updatedAt: fileData.updated_at,
            });

            // Update current device session with this file
            await preferencesService.updateDeviceSessionFile(userId, fileData.id);
            setIsLoading(false);
            return;
          }
        }
      }

      // For guest users or if Supabase failed, get from localStorage
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
  }, [isLoaded, isSignedIn, userId, supabase]);

  /**
   * Save the current file as last opened with device session tracking
   */
  const saveLastOpened = useCallback(
    async (file: Pick<FileData, 'id' | 'title' | 'content'>): Promise<boolean> => {
      try {
        // For authenticated users, save to Supabase
        if (isSignedIn && userId && supabase) {
          if (!file.id) {
            // File ID missing, fallback to localStorage
            saveLastOpenedFile(file);
            return true;
          }

          const preferencesService = createUserPreferencesService(supabase);

          // Update user preferences
          const success = await preferencesService.updateLastOpenedFile(userId, file.id);

          if (success) {
            // Also update device session
            await preferencesService.updateDeviceSessionFile(userId, file.id);
            return true;
          }
        }

        // For guest users or if Supabase failed, save to localStorage
        saveLastOpenedFile(file);
        return true;
      } catch (err) {
        safeConsole.error('Error saving last opened file:', err);
        return false;
      }
    },
    [isSignedIn, userId, supabase]
  );

  /**
   * Clear the last opened file from all devices
   */
  const clearLastOpened = useCallback(async (): Promise<boolean> => {
    try {
      // For authenticated users, clear from Supabase
      if (isSignedIn && userId && supabase) {
        const preferencesService = createUserPreferencesService(supabase);

        // Clear from user preferences
        const success = await preferencesService.upsertUserPreferences(userId, {
          last_opened_file_id: null,
        });

        if (success) {
          // Also clear from current device session
          await preferencesService.updateDeviceSessionFile(userId, '');

          setFileData(null);
          return true;
        }
      }

      // For guest users or if Supabase failed, clear from localStorage
      clearLastOpenedFile();
      setFileData(null);
      return true;
    } catch (err) {
      safeConsole.error('Error clearing last opened file:', err);
      return false;
    }
  }, [isSignedIn, userId, supabase]);

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

/**
 * @fileoverview Hook for immediate file loading for authenticated users
 * @author MarkDownUltraRemix Team
 */

import { useAuth } from '@clerk/react-router';
import { useCallback, useEffect, useState } from 'react';
import type { FileData } from '@/lib/supabase';
import { useSupabase } from '@/lib/supabase';
import { createUserPreferencesService } from '@/services/userPreferencesService';
import { safeConsole } from '@/utils/console';

/**
 * Interface for immediate file loading result
 */
export interface ImmediateFileLoadingResult {
  /** File data if found */
  fileData: Pick<FileData, 'id' | 'title' | 'content'> | null;
  /** Whether the loading is in progress */
  isLoading: boolean;
  /** Whether the check has been completed */
  hasChecked: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether user is authenticated and ready for database check */
  isReady: boolean;
}

/**
 * Hook for immediate file loading for authenticated users
 * This hook performs database check as soon as authentication is confirmed
 * to prevent welcome template flash for returning users
 */
export const useImmediateFileLoading = (): ImmediateFileLoadingResult => {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const supabase = useSupabase();

  const [fileData, setFileData] = useState<Pick<FileData, 'id' | 'title' | 'content'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if user is ready for database check
   */
  const isReady = Boolean(isLoaded && isSignedIn && userId && supabase);

  /**
   * Load last opened file immediately from database
   */
  const loadImmediateFile = useCallback(async () => {
    if (!isReady || hasChecked || !supabase || !userId) return;

    setIsLoading(true);
    setError(null);

    try {
      safeConsole.dev('🚀 Starting immediate file loading for authenticated user');

      const preferencesService = createUserPreferencesService(supabase);

      // Get user preferences with last opened file
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
            safeConsole.dev(
              '📱 Using more recent file from another device:',
              mostRecentFile.fileId
            );
          }
        }

        // Get the file data
        const { data: fileDataResult, error: fileError } = await supabase
          .from('user_files')
          .select('*')
          .eq('id', fileIdToLoad)
          .eq('user_id', userId)
          .single();

        if (fileError) {
          safeConsole.error('❌ Error loading immediate file:', fileError);
          setError('Failed to load last opened file');
        } else if (fileDataResult) {
          const loadedFile = {
            id: fileDataResult.id,
            title: fileDataResult.title,
            content: fileDataResult.content,
          };

          setFileData(loadedFile);

          // Update current device session with this file
          await preferencesService.updateDeviceSessionFile(userId, fileDataResult.id);

          safeConsole.dev('✅ Immediate file loaded successfully:', fileDataResult.title);
        } else {
          safeConsole.dev('📄 No file data found for ID:', fileIdToLoad);
          setFileData(null);
        }
      } else {
        safeConsole.dev('🆕 No last opened file found - new user');
        setFileData(null);
      }
    } catch (err) {
      safeConsole.error('❌ Error in immediate file loading:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setFileData(null);
    } finally {
      setIsLoading(false);
      setHasChecked(true);
    }
  }, [isReady, hasChecked, supabase, userId]);

  /**
   * Trigger immediate loading when user is ready
   */
  useEffect(() => {
    if (isReady && !hasChecked && !isLoading) {
      loadImmediateFile();
    }
  }, [isReady, hasChecked, isLoading, loadImmediateFile]);

  /**
   * Timeout handling to prevent infinite loading
   */
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        safeConsole.warn('⏰ Immediate file loading timeout reached');
        setIsLoading(false);
        setHasChecked(true);
        setError('Loading timeout - please try refreshing the page');
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  /**
   * Reset state when authentication changes
   */
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setFileData(null);
      setIsLoading(false);
      setHasChecked(false);
      setError(null);
    }
  }, [isLoaded, isSignedIn]);

  return {
    fileData,
    isLoading,
    hasChecked,
    error,
    isReady,
  };
};

export default useImmediateFileLoading;

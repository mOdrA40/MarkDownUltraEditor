/**
 * @fileoverview Hook for immediate file loading from localStorage
 * @author MarkDownUltraRemix Team
 */

import { useAuth } from '@clerk/react-router';
import { useCallback, useEffect, useState } from 'react';
import type { FileData } from '@/lib/supabase';
import { safeConsole } from '@/utils/console';
import { getLastOpenedFile } from '@/utils/editorPreferences';

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
  /** Whether user is ready for localStorage check */
  isReady: boolean;
}

/**
 * Hook for immediate file loading from localStorage
 * This hook performs localStorage check as soon as possible
 * to prevent welcome template flash for returning users
 */
export const useImmediateFileLoading = (): ImmediateFileLoadingResult => {
  const { isLoaded } = useAuth();

  const [fileData, setFileData] = useState<Pick<FileData, 'id' | 'title' | 'content'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if ready for localStorage check
   */
  const isReady = Boolean(isLoaded);

  /**
   * Load last opened file immediately from localStorage
   */
  const loadImmediateFile = useCallback(async () => {
    if (!isReady || hasChecked) return;

    // Check if this is a new file request - skip loading if it is
    const urlParams =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    const isNewFileRequest = urlParams.get('new') === 'true';

    if (isNewFileRequest) {
      safeConsole.dev('🆕 New file request detected, skipping immediate file loading');
      setFileData(null);
      setIsLoading(false);
      setHasChecked(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      safeConsole.dev('🚀 Starting immediate file loading from localStorage');

      // Use localStorage for all users (guest and authenticated)
      const lastOpened = getLastOpenedFile();

      if (lastOpened) {
        setFileData({
          id: lastOpened.id,
          title: lastOpened.title,
          content: lastOpened.content,
        });
        safeConsole.dev('✅ Immediate file loaded successfully:', lastOpened.title);
      } else {
        safeConsole.dev('🆕 No last opened file found');
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
  }, [isReady, hasChecked]);

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
    if (!isLoaded) {
      setFileData(null);
      setIsLoading(false);
      setHasChecked(false);
      setError(null);
    }
  }, [isLoaded]);

  return {
    fileData,
    isLoading,
    hasChecked,
    error,
    isReady,
  };
};

export default useImmediateFileLoading;

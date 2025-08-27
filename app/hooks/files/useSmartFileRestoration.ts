/**
 * @fileoverview Smart file restoration hook with loading states
 * @author Axel Modra
 */

import { useAuth } from '@clerk/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { useFileContext } from '@/contexts/FileContextProvider';
import { useFileStorage } from '@/hooks/files/useFileStorage';
import { useImmediateFileLoading } from '@/hooks/files/useImmediateFileLoading';
import { useLastOpenedFile } from '@/hooks/files/useLastOpenedFile';
import { safeConsole } from '@/utils/console';

/**
 * File restoration states
 */
export type RestorationState = 'idle' | 'checking' | 'loading' | 'success' | 'error' | 'no-file';

/**
 * File restoration result
 */
export interface FileRestorationResult {
  /** Current restoration state */
  state: RestorationState;
  /** Whether restoration is in progress */
  isLoading: boolean;
  /** Error message if restoration failed */
  error: string | null;
  /** Restored file data */
  fileData: {
    content: string;
    title: string;
    id: string;
    source: 'url' | 'files-page' | 'manual';
  } | null;
  /** Whether there's an active file to restore */
  hasActiveFile: boolean;
  /** Active file name for display */
  activeFileName: string | null;
}

/**
 * Options for file restoration
 */
export interface FileRestorationOptions {
  /** Whether to skip restoration if URL parameters are present */
  skipIfUrlParams?: boolean;
  /** Whether to restore silently without notifications */
  silent?: boolean;
  /** Delay before starting restoration (ms) */
  delay?: number;
  /** Whether to clear invalid file contexts */
  clearInvalidContext?: boolean;
}

/**
 * Hook for smart file restoration with loading states
 */
export const useSmartFileRestoration = (
  options: FileRestorationOptions = {}
): FileRestorationResult & {
  /** Manually trigger file restoration */
  restoreFile: () => Promise<void>;
  /** Clear current restoration state */
  clearRestoration: () => void;
} => {
  const { skipIfUrlParams = true, clearInvalidContext = true } = options;

  const { activeFile, isLoading: contextLoading } = useFileContext();
  const fileStorage = useFileStorage();
  const location = useLocation();

  const getInitialState = useCallback((): RestorationState => {
    if (typeof window === 'undefined') return 'idle';
    const params = new URLSearchParams(window.location.search);

    if (params.has('file')) {
      return 'idle';
    }

    if (skipIfUrlParams && (params.has('title') || params.has('content') || params.has('new'))) {
      return 'idle';
    }
    try {
      const context = JSON.parse(sessionStorage.getItem('active_file_context') || 'null');
      if (context?.fileId) {
        return 'checking';
      }
    } catch {
      return 'idle';
    }
    return 'idle';
  }, [skipIfUrlParams]);

  const [state, setState] = useState<RestorationState>(getInitialState);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<FileRestorationResult['fileData']>(null);

  // Flag to prevent multiple restoration attempts
  const restorationAttemptedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear restoration state
   */
  const clearRestoration = useCallback(() => {
    setState('idle');
    setError(null);
    setFileData(null);
    restorationAttemptedRef.current = false; // Reset attempt flag
  }, []);

  /**
   * Check if URL parameters are present
   */
  const hasUrlParams = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location.search);
    return params.has('file') || params.has('title') || params.has('content') || params.has('new');
  }, []);

  /**
   * Restore file from active context
   */
  const restoreFile = useCallback(async () => {
    // Skip if URL parameters are present and option is enabled
    if (skipIfUrlParams && hasUrlParams()) {
      safeConsole.dev('Skipping file restoration due to URL parameters');
      setState('idle');
      return;
    }

    // Skip if storage is not ready
    if (!fileStorage.isInitialized || !fileStorage.storageService) {
      safeConsole.dev('Storage not ready for file restoration');
      setState('idle');
      return;
    }

    // Skip if no active file context
    if (!activeFile?.fileId) {
      safeConsole.dev('No active file to restore');
      setState('no-file');
      return;
    }

    setState('checking');
    setError(null);

    // Set timeout to prevent stuck loading
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      safeConsole.warn('File restoration timeout reached');
      setState('error');
      setError('File restoration timeout');
    }, 8000); // 8 second timeout

    try {
      safeConsole.dev('Starting file restoration for:', activeFile.fileName);
      setState('loading');

      // Load file from storage with optimized caching
      const loadedFile = await fileStorage.loadFile(activeFile.fileId);

      if (loadedFile) {
        // Validate source
        const validSource = ['url', 'files-page', 'manual'].includes(activeFile.source)
          ? (activeFile.source as 'url' | 'files-page' | 'manual')
          : 'manual';

        const restoredData = {
          content: loadedFile.content,
          title: loadedFile.title,
          id: loadedFile.id || activeFile.fileId,
          source: validSource,
        };

        setFileData(restoredData);
        setState('success');

        // Clear timeout on success
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        safeConsole.dev('File restoration successful:', loadedFile.title);
      } else {
        // File not found in storage
        safeConsole.warn('Active file not found in storage:', activeFile.fileName);

        if (clearInvalidContext) {
          // Clear invalid file context
          const { fileContextManager } = await import('@/utils/fileContext');
          fileContextManager.clearActiveFile();
          safeConsole.dev('Cleared invalid file context');
        }

        setError('File not found in storage');
        setState('error');

        // Clear timeout on error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      safeConsole.error('File restoration failed:', err);
      setError(errorMessage);
      setState('error');

      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [
    activeFile,
    fileStorage.isInitialized,
    fileStorage.storageService,
    fileStorage.loadFile,
    skipIfUrlParams,
    hasUrlParams,
    clearInvalidContext,
  ]);

  /**
   * Auto-restore file when conditions are met
   */
  useEffect(() => {
    // If the initial state is 'checking', start restoration once the active file is available from the context.
    if (
      state === 'checking' &&
      !restorationAttemptedRef.current &&
      activeFile?.fileId &&
      !contextLoading
    ) {
      restorationAttemptedRef.current = true;
      restoreFile();
    }
  }, [state, restoreFile, activeFile, contextLoading]);

  /**
   * Reset state when navigating away from editor (prevent reset loops)
   */
  useEffect(() => {
    if (location.pathname !== '/') {
      // Only reset when navigating away from editor
      setState('idle');
      setError(null);
      setFileData(null);
      restorationAttemptedRef.current = false;
    }
  }, [location.pathname]);

  /**
   * Reset restoration flag when active file changes or when navigating to editor
   * Only reset when necessary to prevent infinite loops
   */
  useEffect(() => {
    // Only reset if we're not currently loading and there's no active restoration
    if (state === 'idle' && !restorationAttemptedRef.current) {
      restorationAttemptedRef.current = false;
    }
  }, [state]); // Reset only when state changes

  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return {
    state,
    isLoading: state === 'checking' || state === 'loading',
    error,
    fileData,
    hasActiveFile: !!activeFile?.fileId,
    activeFileName: activeFile?.fileName || null,
    restoreFile,
    clearRestoration,
  };
};

/**
 * Hook for file restoration with automatic loading
 */
export const useAutoFileRestoration = (
  onFileRestored?: (fileData: NonNullable<FileRestorationResult['fileData']>) => void,
  options?: FileRestorationOptions
) => {
  const { isSignedIn, isLoaded } = useAuth();
  const immediateLoading = useImmediateFileLoading();
  const lastOpenedFile = useLastOpenedFile();
  const restoration = useSmartFileRestoration(options);
  const [hasRestored, setHasRestored] = useState(false);
  const [hasTriedLastOpened, setHasTriedLastOpened] = useState(false);
  const [hasTriedImmediate, setHasTriedImmediate] = useState(false);

  // For authenticated users, try immediate loading first (highest priority)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('file')) {
        return;
      }
    }

    if (
      isLoaded &&
      isSignedIn &&
      !hasTriedImmediate &&
      immediateLoading.hasChecked &&
      !immediateLoading.isLoading &&
      immediateLoading.fileData &&
      onFileRestored
    ) {
      setHasTriedImmediate(true);
      setHasTriedLastOpened(true); // Skip lastOpenedFile since we got data from immediate loading

      // Use setTimeout to ensure smooth transition and prevent flicker
      setTimeout(() => {
        // Double check fileData is still available
        if (immediateLoading.fileData) {
          // Load the file from immediate loading
          onFileRestored({
            content: immediateLoading.fileData.content,
            title: immediateLoading.fileData.title,
            id: immediateLoading.fileData.id || 'temp-id',
            source: 'manual',
          });

          safeConsole.dev(
            '✅ Loaded file from immediate loading:',
            immediateLoading.fileData.title
          );
        }
      }, 10); // Small delay to ensure UI state is stable
      return;
    }
  }, [
    isLoaded,
    isSignedIn,
    immediateLoading.hasChecked,
    immediateLoading.isLoading,
    immediateLoading.fileData,
    onFileRestored,
    hasTriedImmediate,
  ]);

  // Fallback: Try to load last opened file from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('file')) {
        return;
      }
    }

    if (
      isLoaded &&
      isSignedIn &&
      !hasTriedLastOpened &&
      !hasTriedImmediate &&
      immediateLoading.hasChecked &&
      !immediateLoading.fileData &&
      !lastOpenedFile.isLoading &&
      lastOpenedFile.fileData &&
      onFileRestored
    ) {
      setHasTriedLastOpened(true);

      // Load the last opened file from localStorage
      onFileRestored({
        content: lastOpenedFile.fileData.content,
        title: lastOpenedFile.fileData.title,
        id: lastOpenedFile.fileData.id || 'temp-id',
        source: 'manual',
      });

      safeConsole.dev(
        '📄 Loaded last opened file from localStorage (fallback):',
        lastOpenedFile.fileData.title
      );
      return;
    }
  }, [
    isLoaded,
    isSignedIn,
    hasTriedImmediate,
    immediateLoading.hasChecked,
    immediateLoading.fileData,
    lastOpenedFile.isLoading,
    lastOpenedFile.fileData,
    onFileRestored,
    hasTriedLastOpened,
  ]);

  // Auto-load file when restoration is successful (only once) - fallback for file context restoration
  useEffect(() => {
    if (
      restoration.state === 'success' &&
      restoration.fileData &&
      onFileRestored &&
      !hasRestored &&
      !hasTriedLastOpened // Don't use file context if we already loaded from Supabase
    ) {
      onFileRestored(restoration.fileData);
      setHasRestored(true);

      // Don't clear restoration state immediately - let the UI settle first
      // This prevents the glitch where data appears and disappears
    }
  }, [restoration.state, restoration.fileData, onFileRestored, hasRestored, hasTriedLastOpened]);

  // Reset hasRestored when file context changes
  useEffect(() => {
    if (restoration.state === 'idle') {
      setHasRestored(false);
    }
  }, [restoration.state]);

  // Reset state when authentication state changes
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setHasTriedLastOpened(false);
      setHasTriedImmediate(false);
    }
  }, [isLoaded, isSignedIn]);

  // Clear restoration state after file is successfully loaded and UI has settled
  useEffect(() => {
    if (restoration.state === 'success' && hasRestored) {
      // Wait longer to ensure the editor has fully loaded the content
      const timer = setTimeout(() => {
        restoration.clearRestoration();
      }, 1500); // Increased to 1.5 seconds to prevent glitches

      return () => clearTimeout(timer);
    }
  }, [restoration.state, hasRestored, restoration.clearRestoration]);

  return {
    ...restoration,
    // Add last opened file loading state for authenticated users
    isLoadingLastOpened: isSignedIn && lastOpenedFile.isLoading,
    lastOpenedError: lastOpenedFile.error,
    // Add immediate loading state
    immediateLoading,
    isImmediateLoading: immediateLoading.isLoading,
    hasImmediateFile: !!immediateLoading.fileData,
  };
};

export default useSmartFileRestoration;

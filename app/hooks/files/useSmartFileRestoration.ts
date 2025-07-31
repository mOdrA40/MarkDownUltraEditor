/**
 * @fileoverview Smart file restoration hook with loading states
 * @author Axel Modra
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useFileContext } from "@/contexts/FileContextProvider";
import { useFileStorage } from "@/hooks/files/useFileStorage";
import { safeConsole } from "@/utils/console";

/**
 * File restoration states
 */
export type RestorationState =
  | "idle"
  | "checking"
  | "loading"
  | "success"
  | "error"
  | "no-file";

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
    source: "url" | "files-page" | "manual";
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
  const {
    skipIfUrlParams = true,
    delay = 100,
    clearInvalidContext = true,
  } = options;

  const { activeFile, isLoading: contextLoading } = useFileContext();
  const fileStorage = useFileStorage();
  const location = useLocation();

  const [state, setState] = useState<RestorationState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] =
    useState<FileRestorationResult["fileData"]>(null);

  // Flag to prevent multiple restoration attempts
  const restorationAttemptedRef = useRef(false);

  /**
   * Clear restoration state
   */
  const clearRestoration = useCallback(() => {
    setState("idle");
    setError(null);
    setFileData(null);
  }, []);

  /**
   * Check if URL parameters are present
   */
  const hasUrlParams = useCallback(() => {
    if (typeof window === "undefined") return false;

    const params = new URLSearchParams(window.location.search);
    return (
      params.has("file") ||
      params.has("title") ||
      params.has("content") ||
      params.has("new")
    );
  }, []);

  /**
   * Restore file from active context
   */
  const restoreFile = useCallback(async () => {
    // Skip if URL parameters are present and option is enabled
    if (skipIfUrlParams && hasUrlParams()) {
      safeConsole.dev("Skipping file restoration due to URL parameters");
      setState("idle");
      return;
    }

    // Skip if storage is not ready
    if (!fileStorage.isInitialized || !fileStorage.storageService) {
      safeConsole.dev("Storage not ready for file restoration");
      setState("idle");
      return;
    }

    // Skip if no active file context
    if (!activeFile?.fileId) {
      safeConsole.dev("No active file to restore");
      setState("no-file");
      return;
    }

    setState("checking");
    setError(null);

    try {
      safeConsole.dev("Starting file restoration for:", activeFile.fileName);
      setState("loading");

      // Load file from storage
      const loadedFile = await fileStorage.loadFile(activeFile.fileId);

      if (loadedFile) {
        // Validate source
        const validSource = ["url", "files-page", "manual"].includes(
          activeFile.source
        )
          ? (activeFile.source as "url" | "files-page" | "manual")
          : "manual";

        const restoredData = {
          content: loadedFile.content,
          title: loadedFile.title,
          id: loadedFile.id || activeFile.fileId,
          source: validSource,
        };

        setFileData(restoredData);
        setState("success");

        safeConsole.dev("File restoration successful:", loadedFile.title);
      } else {
        // File not found in storage
        safeConsole.warn(
          "Active file not found in storage:",
          activeFile.fileName
        );

        if (clearInvalidContext) {
          // Clear invalid file context
          const { fileContextManager } = await import("@/utils/fileContext");
          fileContextManager.clearActiveFile();
          safeConsole.dev("Cleared invalid file context");
        }

        setError("File not found in storage");
        setState("error");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      safeConsole.error("File restoration failed:", err);
      setError(errorMessage);
      setState("error");
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
   * Auto-restore file when conditions are met (prevent multiple triggers)
   */
  useEffect(() => {
    if (contextLoading) {
      // Wait for context to load
      return;
    }

    if (state !== "idle") {
      // Already processing or completed
      return;
    }

    // Only restore if we're on the editor page
    if (location.pathname !== "/") {
      return;
    }

    // Only restore if we have an active file
    if (!activeFile?.fileId) {
      return;
    }

    // Prevent multiple restoration attempts for the same file
    if (restorationAttemptedRef.current) {
      return;
    }

    // Start restoration with delay
    const timer = setTimeout(() => {
      restorationAttemptedRef.current = true;
      restoreFile();
    }, delay);

    return () => clearTimeout(timer);
  }, [
    contextLoading,
    state,
    location.pathname,
    activeFile?.fileId,
    delay,
    restoreFile,
  ]);

  /**
   * Reset state when navigating away from editor (prevent reset loops)
   */
  useEffect(() => {
    if (location.pathname !== "/") {
      // Only reset when navigating away from editor
      setState("idle");
      setError(null);
      setFileData(null);
      restorationAttemptedRef.current = false;
    }
  }, [location.pathname]);

  /**
   * Reset restoration flag when active file changes or when navigating to editor
   */
  useEffect(() => {
    restorationAttemptedRef.current = false;
  });

  return {
    state,
    isLoading: state === "checking" || state === "loading",
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
  onFileRestored?: (
    fileData: NonNullable<FileRestorationResult["fileData"]>
  ) => void,
  options?: FileRestorationOptions
) => {
  const restoration = useSmartFileRestoration(options);
  const [hasRestored, setHasRestored] = useState(false);

  // Auto-load file when restoration is successful (only once)
  useEffect(() => {
    if (
      restoration.state === "success" &&
      restoration.fileData &&
      onFileRestored &&
      !hasRestored
    ) {
      onFileRestored(restoration.fileData);
      setHasRestored(true);
    }
  }, [restoration.state, restoration.fileData, onFileRestored, hasRestored]);

  // Reset hasRestored when file context changes
  useEffect(() => {
    if (restoration.state === "idle") {
      setHasRestored(false);
    }
  }, [restoration.state]);

  return restoration;
};

export default useSmartFileRestoration;

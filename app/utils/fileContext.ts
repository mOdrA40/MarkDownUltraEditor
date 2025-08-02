/**
 * @fileoverview File context management utilities
 * @author Axel Modra
 */

import { safeConsole } from '@/utils/console';

/**
 * File context interface
 */
export interface FileContext {
  /** File ID or identifier */
  fileId: string;
  /** File name/title */
  fileName: string;
  /** Timestamp when file was opened */
  openedAt: number;
  /** Source of file opening (url, files-page, etc) */
  source: 'url' | 'files-page' | 'manual' | 'auto-save';
  /** Whether this is an active file session */
  isActive: boolean;
}

/**
 * Session storage keys for file context
 */
const SESSION_KEYS = {
  ACTIVE_FILE: 'markdownEditor_activeFile',
  FILE_HISTORY: 'markdownEditor_fileHistory',
} as const;

/**
 * File context manager class
 */
class FileContextManager {
  /**
   * Check if sessionStorage is available
   */
  private isSessionStorageAvailable(): boolean {
    try {
      if (typeof sessionStorage === 'undefined') return false;
      const test = '__session_test__';
      sessionStorage.setItem(test, 'test');
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Set active file context
   */
  setActiveFile(context: Omit<FileContext, 'openedAt' | 'isActive'>): boolean {
    if (!this.isSessionStorageAvailable()) {
      safeConsole.warn('SessionStorage not available for file context');
      return false;
    }

    try {
      const fileContext: FileContext = {
        ...context,
        openedAt: Date.now(),
        isActive: true,
      };

      sessionStorage.setItem(SESSION_KEYS.ACTIVE_FILE, JSON.stringify(fileContext));

      safeConsole.dev('Active file context set:', fileContext.fileName);
      return true;
    } catch (error) {
      safeConsole.error('Failed to set active file context:', error);
      return false;
    }
  }

  /**
   * Get active file context
   */
  getActiveFile(): FileContext | null {
    if (!this.isSessionStorageAvailable()) return null;

    try {
      const stored = sessionStorage.getItem(SESSION_KEYS.ACTIVE_FILE);
      if (!stored) return null;

      const context = JSON.parse(stored) as FileContext;

      // Validate context structure
      if (!context.fileId || !context.fileName) {
        safeConsole.warn('Invalid file context structure, clearing');
        this.clearActiveFile();
        return null;
      }

      return context;
    } catch (error) {
      safeConsole.error('Failed to get active file context:', error);
      this.clearActiveFile();
      return null;
    }
  }

  /**
   * Clear active file context
   */
  clearActiveFile(): boolean {
    if (!this.isSessionStorageAvailable()) return false;

    try {
      sessionStorage.removeItem(SESSION_KEYS.ACTIVE_FILE);
      safeConsole.dev('Active file context cleared');
      return true;
    } catch (error) {
      safeConsole.error('Failed to clear active file context:', error);
      return false;
    }
  }

  /**
   * Check if there's an active file
   */
  hasActiveFile(): boolean {
    return this.getActiveFile() !== null;
  }

  /**
   * Update active file context
   */
  updateActiveFile(updates: Partial<Omit<FileContext, 'openedAt'>>): boolean {
    const current = this.getActiveFile();
    if (!current) return false;

    return this.setActiveFile({
      ...current,
      ...updates,
    });
  }

  /**
   * Add file to history (for future features)
   */
  addToHistory(context: FileContext): boolean {
    if (!this.isSessionStorageAvailable()) return false;

    try {
      const stored = sessionStorage.getItem(SESSION_KEYS.FILE_HISTORY);
      let history: FileContext[] = stored ? JSON.parse(stored) : [];

      // Remove existing entry for same file
      history = history.filter((item) => item.fileId !== context.fileId);

      // Add new entry at beginning
      history.unshift(context);

      // Keep only last 10 files
      history = history.slice(0, 10);

      sessionStorage.setItem(SESSION_KEYS.FILE_HISTORY, JSON.stringify(history));
      return true;
    } catch (error) {
      safeConsole.error('Failed to add file to history:', error);
      return false;
    }
  }

  /**
   * Get file history
   */
  getHistory(): FileContext[] {
    if (!this.isSessionStorageAvailable()) return [];

    try {
      const stored = sessionStorage.getItem(SESSION_KEYS.FILE_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      safeConsole.error('Failed to get file history:', error);
      return [];
    }
  }

  /**
   * Clear all file context data
   */
  clearAll(): boolean {
    if (!this.isSessionStorageAvailable()) return false;

    try {
      sessionStorage.removeItem(SESSION_KEYS.ACTIVE_FILE);
      sessionStorage.removeItem(SESSION_KEYS.FILE_HISTORY);
      return true;
    } catch (error) {
      safeConsole.error('Failed to clear file context data:', error);
      return false;
    }
  }

  /**
   * Debug: Get all file context data
   */
  debug(): {
    activeFile: FileContext | null;
    history: FileContext[];
    sessionStorageAvailable: boolean;
  } {
    return {
      activeFile: this.getActiveFile(),
      history: this.getHistory(),
      sessionStorageAvailable: this.isSessionStorageAvailable(),
    };
  }
}

/**
 * Global file context manager instance
 */
export const fileContextManager = new FileContextManager();

/**
 * Global flag for immediate loading detection
 * This is set during navigation and checked synchronously
 * Using window object for immediate global access
 */
declare global {
  interface Window {
    __markdownEditor_shouldShowLoading?: boolean;
  }
}

/**
 * Set global loading flag (called during navigation)
 */
export const setGlobalLoadingFlag = (shouldLoad: boolean) => {
  if (typeof window !== 'undefined') {
    window.__markdownEditor_shouldShowLoading = shouldLoad;
  }
};

/**
 * Get global loading flag (immediate synchronous check)
 */
export const getGlobalLoadingFlag = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.__markdownEditor_shouldShowLoading === true;
  }
  return false;
};

/**
 * Check if should show loading immediately (combines window flag + sessionStorage)
 */
export const shouldShowImmediateLoading = (): boolean => {
  // First check window flag (immediate, zero delay)
  if (typeof window !== 'undefined' && window.__markdownEditor_shouldShowLoading === true) {
    return true;
  }

  // Then check sessionStorage (may have delay)
  try {
    const activeFile = fileContextManager.getActiveFile();
    return !!activeFile?.fileId;
  } catch (_error) {
    return false;
  }
};

/**
 * Convenience hooks and utilities
 */

/**
 * Check if a file is currently active
 */
export const isFileActive = (fileId: string): boolean => {
  const activeFile = fileContextManager.getActiveFile();
  return activeFile?.fileId === fileId && activeFile?.isActive === true;
};

/**
 * Get current active file ID
 */
export const getActiveFileId = (): string | null => {
  const activeFile = fileContextManager.getActiveFile();
  return activeFile?.fileId || null;
};

/**
 * Get current active file name
 */
export const getActiveFileName = (): string | null => {
  const activeFile = fileContextManager.getActiveFile();
  return activeFile?.fileName || null;
};

/**
 * Set file as active with minimal info
 */
export const setActiveFile = (
  fileId: string,
  fileName: string,
  source: FileContext['source'] = 'manual'
): boolean => {
  return fileContextManager.setActiveFile({
    fileId,
    fileName,
    source,
  });
};

/**
 * Clear active file
 */
export const clearActiveFile = (): boolean => {
  return fileContextManager.clearActiveFile();
};

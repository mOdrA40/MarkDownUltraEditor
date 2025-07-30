/**
 * @fileoverview File Context Provider for managing active file state across navigation
 * @author Axel Modra
 */

import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { safeConsole } from '@/utils/console';
import { type FileContext, fileContextManager } from '@/utils/fileContext';

/**
 * File Context interface for React Context
 */
interface FileContextState {
  /** Current active file context */
  activeFile: FileContext | null;
  /** Whether file context is loading */
  isLoading: boolean;
  /** Set active file */
  setActiveFile: (fileId: string, fileName: string, source?: FileContext['source']) => void;
  /** Clear active file */
  clearActiveFile: () => void;
  /** Check if a file is active */
  isFileActive: (fileId: string) => boolean;
  /** Get active file ID */
  getActiveFileId: () => string | null;
  /** Get active file name */
  getActiveFileName: () => string | null;
  /** Update active file context */
  updateActiveFile: (updates: Partial<Omit<FileContext, 'openedAt'>>) => void;
}

/**
 * File Context
 */
const FileContextReact = createContext<FileContextState | undefined>(undefined);

/**
 * File Context Provider Props
 */
interface FileContextProviderProps {
  children: ReactNode;
}

/**
 * File Context Provider Component
 */
export const FileContextProvider: React.FC<FileContextProviderProps> = ({ children }) => {
  const [activeFile, setActiveFileState] = useState<FileContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load initial file context from session storage
   */
  useEffect(() => {
    const loadInitialContext = () => {
      try {
        const savedContext = fileContextManager.getActiveFile();
        if (savedContext) {
          setActiveFileState(savedContext);
          safeConsole.dev('Loaded initial file context:', savedContext.fileName);
        }
      } catch (error) {
        safeConsole.error('Failed to load initial file context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialContext();
  }, []);

  /**
   * Set active file
   */
  const setActiveFile = useCallback(
    (fileId: string, fileName: string, source: FileContext['source'] = 'manual') => {
      try {
        const success = fileContextManager.setActiveFile({
          fileId,
          fileName,
          source,
        });

        if (success) {
          const newContext = fileContextManager.getActiveFile();
          setActiveFileState(newContext);
          safeConsole.dev('Active file set via context:', fileName);
        }
      } catch (error) {
        safeConsole.error('Failed to set active file via context:', error);
      }
    },
    []
  );

  /**
   * Clear active file
   */
  const clearActiveFile = useCallback(() => {
    try {
      const success = fileContextManager.clearActiveFile();
      if (success) {
        setActiveFileState(null);
        safeConsole.dev('Active file cleared via context');
      }
    } catch (error) {
      safeConsole.error('Failed to clear active file via context:', error);
    }
  }, []);

  /**
   * Check if a file is active
   */
  const isFileActive = useCallback(
    (fileId: string): boolean => {
      return activeFile?.fileId === fileId && activeFile?.isActive === true;
    },
    [activeFile]
  );

  /**
   * Get active file ID
   */
  const getActiveFileId = useCallback((): string | null => {
    return activeFile?.fileId || null;
  }, [activeFile]);

  /**
   * Get active file name
   */
  const getActiveFileName = useCallback((): string | null => {
    return activeFile?.fileName || null;
  }, [activeFile]);

  /**
   * Update active file context
   */
  const updateActiveFile = useCallback((updates: Partial<Omit<FileContext, 'openedAt'>>) => {
    try {
      const success = fileContextManager.updateActiveFile(updates);
      if (success) {
        const updatedContext = fileContextManager.getActiveFile();
        setActiveFileState(updatedContext);
        safeConsole.dev('Active file updated via context:', updates);
      }
    } catch (error) {
      safeConsole.error('Failed to update active file via context:', error);
    }
  }, []);

  /**
   * Context value
   */
  const contextValue: FileContextState = {
    activeFile,
    isLoading,
    setActiveFile,
    clearActiveFile,
    isFileActive,
    getActiveFileId,
    getActiveFileName,
    updateActiveFile,
  };

  return <FileContextReact.Provider value={contextValue}>{children}</FileContextReact.Provider>;
};

/**
 * Hook to use File Context
 */
export const useFileContext = (): FileContextState => {
  const context = useContext(FileContextReact);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileContextProvider');
  }
  return context;
};

/**
 * Hook to get active file info (convenience hook)
 */
export const useActiveFile = () => {
  const { activeFile, isLoading } = useFileContext();

  return {
    activeFile,
    isLoading,
    hasActiveFile: activeFile !== null,
    activeFileId: activeFile?.fileId || null,
    activeFileName: activeFile?.fileName || null,
    activeFileSource: activeFile?.source || null,
    isActiveFileFromUrl: activeFile?.source === 'url',
    isActiveFileFromFilesPage: activeFile?.source === 'files-page',
  };
};

/**
 * Hook for file context actions (convenience hook)
 */
export const useFileContextActions = () => {
  const { setActiveFile, clearActiveFile, updateActiveFile, isFileActive } = useFileContext();

  return {
    setActiveFile,
    clearActiveFile,
    updateActiveFile,
    isFileActive,
    setActiveFileFromUrl: (fileId: string, fileName: string) =>
      setActiveFile(fileId, fileName, 'url'),
    setActiveFileFromFilesPage: (fileId: string, fileName: string) =>
      setActiveFile(fileId, fileName, 'files-page'),
    setActiveFileManual: (fileId: string, fileName: string) =>
      setActiveFile(fileId, fileName, 'manual'),
  };
};

/**
 * HOC to provide file context to components
 */
export const withFileContext = <P extends object>(Component: React.ComponentType<P>) => {
  const WrappedComponent = React.forwardRef<unknown, P>((props, ref) => {
    return (
      <FileContextProvider>
        <Component {...(props as P)} ref={ref} />
      </FileContextProvider>
    );
  });

  WrappedComponent.displayName = `withFileContext(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

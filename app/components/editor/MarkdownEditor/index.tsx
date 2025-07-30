/*
MarkdownEditor
@author Axel Modra
 */

import React from 'react';
import { useSearchParams } from 'react-router';

import { usePerformanceDebug, useRenderPerformance } from '@/hooks/core/usePerformance';
import { useFileStorage } from '@/hooks/files';

import { useWelcomeDialog, WelcomeDialog } from '../../auth/WelcomeDialog';
import { type Theme, useTheme } from '../../features/ThemeSelector';
import { MobileNav } from '../../layout/MobileNav';
import { DialogContainer, EditorContainer } from './components';
import {
  EditorErrorBoundary,
  MemoizedEditorFooter,
  MemoizedEditorHeader,
  MemoizedEditorMainContent,
  MemoizedEditorSidebar,
  PerformanceMonitor,
} from './components/Performance';
import {
  useDialogManager,
  useEditorSettings,
  useEditorState,
  useKeyboardShortcuts,
  useResponsiveLayout,
} from './hooks';
import type { MarkdownEditorProps } from './types';
import { DEFAULT_FILE } from './utils/constants';

/**
 * Main MarkdownEditor component
 */
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialMarkdown = DEFAULT_FILE.CONTENT,
  initialFileName = DEFAULT_FILE.NAME,
  initialTheme: _initialTheme,
  eventHandlers = {},
  className = '',
  style = {},
}) => {
  // Direct URL parameters handling to avoid race conditions
  const [searchParams, setSearchParams] = useSearchParams();

  // Process URL parameters immediately
  const urlTitle = searchParams.get('title');
  const urlContent = searchParams.get('content');
  const urlFile = searchParams.get('file');
  const isNewFileRequest = searchParams.get('new') === 'true';

  // Determine initial content based on URL parameters
  const getInitialContent = () => {
    if (isNewFileRequest) {
      return ''; // Empty content for new files from /files
    }
    if (urlContent) {
      return urlContent; // Content from URL parameters
    }
    // If there's a file parameter, don't use initial content - let useEffect handle it
    if (urlFile) {
      return undefined; // Let useEditorState check localStorage first
    }
    return initialMarkdown; // Default or passed initial content
  };

  const getInitialFileName = () => {
    if (isNewFileRequest) {
      return 'untitled.md'; // Default name for new files
    }
    if (urlTitle) {
      return urlTitle; // Title from URL parameters
    }
    // If there's a file parameter, don't use initial filename - let useEffect handle it
    if (urlFile) {
      return undefined; // Let useEditorState check localStorage first
    }
    return initialFileName; // Default or passed initial filename
  };

  // Clear URL parameters after processing - but only after file loading is complete
  React.useEffect(() => {
    // Only clear URL parameters if we're not currently loading a file from URL
    if ((urlTitle || urlContent || isNewFileRequest) && !urlFile) {
      setSearchParams({}, { replace: true });
    }
    // For urlFile, we'll clear it after the file loading is complete
  }, [urlTitle, urlContent, isNewFileRequest, setSearchParams, urlFile]);

  // State management hooks
  const editorState = useEditorState(getInitialContent(), getInitialFileName());
  const responsiveLayout = useResponsiveLayout();
  const globalTheme = useTheme();
  const dialogManager = useDialogManager();
  const editorSettings = useEditorSettings();
  const welcomeDialog = useWelcomeDialog();
  const fileStorage = useFileStorage();

  // Performance monitoring
  useRenderPerformance('MarkdownEditor');
  usePerformanceDebug();

  // Test Supabase connection on mount
  React.useEffect(() => {
    const testConnection = async () => {
      try {
        const { testSupabaseConnection } = await import('@/lib/supabase');
        const isConnected = await testSupabaseConnection();
        if (isConnected) {
          import('@/utils/console').then(({ safeConsole }) => {
            safeConsole.dev('✓ Supabase connection test successful');
          });
        } else {
          import('@/utils/console').then(({ safeConsole }) => {
            safeConsole.warn('⚠️ Supabase connection test failed');
          });
        }
      } catch (error) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.error('Error testing Supabase connection:', error);
        });
      }
    };

    testConnection();
  }, []);

  // Destructure state and actions
  const { state: editor, actions: editorActions, undoRedo } = editorState;
  const { state: responsive } = responsiveLayout;
  const { currentTheme, setTheme } = globalTheme;
  const { state: dialogs, actions: dialogActions } = dialogManager;
  const { settings, actions: settingsActions } = editorSettings;

  // UI state management
  const [showPreview, setShowPreview] = React.useState(true);
  const [showToc, setShowToc] = React.useState(false);
  const [showOutline, setShowOutline] = React.useState(false);

  // Ref to track last saved content hash to prevent duplicate saves
  const lastSavedContentRef = React.useRef<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Auto-collapse sidebars based on responsive state
  React.useEffect(() => {
    if (responsive.isMobile) {
      setShowToc(false);
      setShowOutline(false);
      setSidebarCollapsed(true);
    } else if (responsive.isTablet) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [responsive.isMobile, responsive.isTablet]);

  // Text insertion helper - now uses the robust cursor position management
  const [insertTextAtCursor, setInsertTextAtCursor] = React.useState<
    ((text: string, selectInserted?: boolean) => void) | null
  >(null);

  const insertText = React.useCallback(
    (text: string) => {
      if (insertTextAtCursor) {
        // Use the robust insertTextAtCursor from EditorPane
        insertTextAtCursor(text, false);
      } else {
        // Fallback to direct textarea manipulation
        const textarea = document.querySelector('.markdown-editor-textarea') as HTMLTextAreaElement;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentValue = textarea.value;
          const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);

          // Update both textarea value and editor state
          textarea.value = newValue;
          editorActions.setMarkdown(newValue);

          // Set cursor position after inserted text and focus
          const newCursorPos = start + text.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();

          // Trigger input event to ensure all handlers are called
          const inputEvent = new Event('input', { bubbles: true });
          textarea.dispatchEvent(inputEvent);
        } else {
          // Last resort: append to end of content
          editorActions.setMarkdown(`${editor.markdown}\n\n${text}`);
        }
      }
    },
    [insertTextAtCursor, editor.markdown, editorActions]
  );

  // Callback to receive insertTextAtCursor from EditorPane
  const handleInsertTextAtCursor = React.useCallback(
    (insertFn: (text: string, selectInserted?: boolean) => void) => {
      setInsertTextAtCursor(() => insertFn);
    },
    []
  );

  // Template loading helper
  const loadTemplate = React.useCallback(
    (content: string, fileName: string) => {
      editorActions.loadFile(content, fileName);
    },
    [editorActions]
  );

  // Manual save function with duplicate prevention
  const handleManualSave = React.useCallback(async () => {
    if (!editor.markdown || !editor.fileName || !fileStorage.saveFile) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.warn('Cannot save: missing content, filename, or save function');
      });
      return;
    }

    // Create content hash to prevent duplicate saves
    const currentContentHash = `${editor.fileName}:${
      editor.markdown.length
    }:${editor.markdown.slice(0, 100)}`;

    // Skip save if content hasn't actually changed
    if (lastSavedContentRef.current === currentContentHash) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('Content unchanged, skipping save');
      });
      return;
    }

    try {
      const storageType = fileStorage.isAuthenticated ? 'cloud' : 'local';
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev(`Manual saving file to ${storageType}:`, editor.fileName);
      });

      await fileStorage.saveFile({
        title: editor.fileName,
        content: editor.markdown,
        fileType: 'markdown',
        tags: [],
      });

      // Update last saved content hash to prevent duplicates
      lastSavedContentRef.current = currentContentHash;
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev(`Manual save to ${storageType} successful`);
      });

      // Mark as saved in editor state
      editorActions.setModified(false);
    } catch (error) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.error('Manual save failed:', error);
      });
    }
  }, [editor.markdown, editor.fileName, fileStorage, editorActions]);

  // Keyboard shortcuts context
  const keyboardContext = React.useMemo(
    () => ({
      insertText,
      togglePreview: () => setShowPreview(!showPreview),
      toggleZenMode: () => settingsActions.toggleZenMode(),
      showShortcuts: () => dialogActions.showDialog('showShortcuts'),
      undo: undoRedo.undo,
      redo: undoRedo.redo,
      newFile: editorActions.newFile,
      saveFile: handleManualSave,
      openFile: () => {
        // TODO: Implement open functionality
      },
    }),
    [
      insertText,
      showPreview,
      settingsActions,
      dialogActions,
      undoRedo,
      editorActions,
      handleManualSave,
    ]
  );

  // Initialize keyboard shortcuts
  useKeyboardShortcuts(keyboardContext, !settings.zenMode);

  // UI state object for components
  const uiState = React.useMemo(
    () => ({
      showPreview,
      showToc,
      showOutline,
      showNavigation: showToc || showOutline,
      sidebarCollapsed,
    }),
    [showPreview, showToc, showOutline, sidebarCollapsed]
  );

  // Event handlers with custom overrides
  const handleMarkdownChange = React.useCallback(
    (value: string) => {
      editorActions.setMarkdown(value);
      eventHandlers.onMarkdownChange?.(value);
    },
    [editorActions, eventHandlers]
  );

  const handleThemeChange = React.useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme);
      eventHandlers.onThemeChange?.(newTheme);
    },
    [setTheme, eventHandlers]
  );

  // Toggle handlers for sidebar
  const handleToggleToc = React.useCallback(() => {
    setShowToc((prev) => !prev);
  }, []);

  const handleToggleOutline = React.useCallback(() => {
    setShowOutline((prev) => !prev);
  }, []);

  // Use ref to store latest functions to avoid dependency issues
  const loadFileRef = React.useRef(editorActions.loadFile);
  const fileStorageRef = React.useRef(fileStorage.loadFile);

  // Track if we're loading a file from URL parameter
  const [isLoadingFromUrl, setIsLoadingFromUrl] = React.useState(!!urlFile);

  // Update refs when functions change
  React.useEffect(() => {
    loadFileRef.current = editorActions.loadFile;
    fileStorageRef.current = fileStorage.loadFile;
  });

  // Handle file loading from URL parameter OR active file context - wait for storage service to be ready
  React.useEffect(() => {
    if (urlFile && fileStorage.isInitialized && fileStorage.storageService) {
      const loadFileFromStorage = async () => {
        try {
          import('@/utils/console').then(({ safeConsole }) => {
            safeConsole.dev('Loading file from storage:', urlFile);
            safeConsole.dev('Storage service initialized:', fileStorage.isInitialized);
            safeConsole.dev('Storage service authenticated:', fileStorage.isAuthenticated);
          });

          // Minimal wait to ensure service is ready
          await new Promise((resolve) => setTimeout(resolve, 50));

          const fileData = await fileStorage.loadFile(urlFile);
          if (fileData) {
            import('@/utils/console').then(({ safeConsole }) => {
              safeConsole.dev('File loaded from storage successfully');
            });
            (
              loadFileRef.current as (
                content: string,
                name: string,
                bypassDialog?: boolean,
                fileId?: string,
                source?: 'url' | 'files-page' | 'manual'
              ) => void
            )(fileData.content, fileData.title, true, fileData.id, 'url');

            // Clear URL parameter after successful file loading with delay to ensure file context is saved
            import('@/utils/console').then(({ safeConsole }) => {
              safeConsole.dev('File loaded successfully, clearing URL parameter after delay');
            });
            // Minimal delay to ensure file context is saved
            setTimeout(() => {
              setSearchParams({}, { replace: true });
            }, 50);
          } else {
            import('@/utils/console').then(({ safeConsole }) => {
              safeConsole.warn('File not found in storage');
            });
            // If file not found and user is authenticated, show error
            if (fileStorage.isAuthenticated) {
              import('@/utils/console').then(({ safeConsole }) => {
                safeConsole.error('File not found in cloud storage');
              });
            }
            // Clear URL parameter even if file not found
            setSearchParams({}, { replace: true });
          }
        } catch (error) {
          import('@/utils/console').then(({ safeConsole }) => {
            safeConsole.error('Error loading file from storage:', error);
          });
          // Clear URL parameter on error
          setSearchParams({}, { replace: true });
        } finally {
          setIsLoadingFromUrl(false);
        }
      };
      loadFileFromStorage();
    } else if (!urlFile) {
      setIsLoadingFromUrl(false);
    } else if (urlFile && !fileStorage.isInitialized) {
      // Keep loading state if we have a file to load but service isn't ready
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('Waiting for storage service to initialize...');
      });
    }
  }, [
    urlFile,
    fileStorage.isInitialized,
    fileStorage.storageService,
    fileStorage.isAuthenticated,
    fileStorage.loadFile,
    setSearchParams,
  ]);

  // Handle file restoration from active context when no URL parameter
  React.useEffect(() => {
    // Only try to restore if there's no URL file parameter and storage is ready
    if (!urlFile && !isLoadingFromUrl && fileStorage.isInitialized) {
      const restoreActiveFile = async () => {
        try {
          // Import file context manager dynamically to avoid SSR issues
          const { fileContextManager } = await import('@/utils/fileContext');
          const activeFileContext = fileContextManager.getActiveFile();

          if (activeFileContext?.fileId) {
            import('@/utils/console').then(({ safeConsole }) => {
              safeConsole.dev('Attempting to restore active file:', activeFileContext.fileName);
            });

            // Load the file from storage (with caching optimization)
            const fileData = await fileStorage.loadFile(activeFileContext.fileId);
            if (fileData) {
              import('@/utils/console').then(({ safeConsole }) => {
                safeConsole.dev('Active file restored successfully:', fileData.title);
              });

              // Load the file content
              const validSource = ['url', 'files-page', 'manual'].includes(activeFileContext.source)
                ? (activeFileContext.source as 'url' | 'files-page' | 'manual')
                : 'manual';

              (
                loadFileRef.current as (
                  content: string,
                  name: string,
                  bypassDialog?: boolean,
                  fileId?: string,
                  source?: 'url' | 'files-page' | 'manual',
                  silent?: boolean
                ) => void
              )(
                fileData.content,
                fileData.title,
                true,
                fileData.id,
                validSource,
                true // Silent loading for restoration
              );
            } else {
              import('@/utils/console').then(({ safeConsole }) => {
                safeConsole.warn('Active file not found in storage, clearing context');
              });
              // Clear invalid file context
              fileContextManager.clearActiveFile();
            }
          }
        } catch (error) {
          import('@/utils/console').then(({ safeConsole }) => {
            safeConsole.error('Error restoring active file:', error);
          });
        }
      };

      // Minimal delay to ensure editor is initialized
      const timer = setTimeout(restoreActiveFile, 100);
      return () => clearTimeout(timer);
    }
  }, [urlFile, isLoadingFromUrl, fileStorage.isInitialized, fileStorage.loadFile]);

  // Show loading state while loading file from URL
  if (isLoadingFromUrl) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading file...</p>
        </div>
      </div>
    );
  }

  return (
    <EditorErrorBoundary enableReporting={process.env.NODE_ENV === 'production'}>
      <PerformanceMonitor enabled={process.env.NODE_ENV === 'development'}>
        <EditorContainer
          theme={currentTheme}
          responsive={responsive}
          zenMode={settings.zenMode}
          onToggleZenMode={settingsActions.toggleZenMode}
          className={className}
          style={style}
        >
          {/* Mobile Navigation */}
          {responsive.isMobile && !settings.zenMode && (
            <MobileNav
              currentTheme={currentTheme}
              onThemeChange={handleThemeChange}
              showPreview={showPreview}
              onTogglePreview={() => setShowPreview(!showPreview)}
              onToggleZen={settingsActions.toggleZenMode}
              onSearch={() => dialogActions.showDialog('showSearch')}
              onNewFile={editorActions.newFile}
              markdown={editor.markdown}
              fileName={editor.fileName}
              onLoad={editorActions.loadFile}
              onFileNameChange={editorActions.setFileName}
              onInsertText={insertText}
              fontSize={settings.fontSize}
              onFontSizeChange={(size) => settingsActions.updateSettings({ fontSize: size })}
              lineHeight={settings.lineHeight}
              onLineHeightChange={(height) =>
                settingsActions.updateSettings({ lineHeight: height })
              }
              focusMode={settings.focusMode}
              onFocusModeToggle={settingsActions.toggleFocusMode}
              typewriterMode={settings.typewriterMode}
              onTypewriterModeToggle={settingsActions.toggleTypewriterMode}
              wordWrap={settings.wordWrap}
              onWordWrapToggle={settingsActions.toggleWordWrap}
              vimMode={settings.vimMode}
              onVimModeToggle={settingsActions.toggleVimMode}
              zenMode={settings.zenMode}
              onZenModeToggle={settingsActions.toggleZenMode}
              onUndo={undoRedo.undo}
              onRedo={undoRedo.redo}
              canUndo={undoRedo.canUndo}
              canRedo={undoRedo.canRedo}
              onShowAdvancedExport={() => dialogActions.showDialog('showAdvancedExport')}
              onShowTemplates={() => dialogActions.showDialog('showTemplates')}
            />
          )}

          {/* Desktop/Tablet Header */}
          {!responsive.isMobile && (
            <MemoizedEditorHeader
              fileName={editor.fileName}
              isModified={editor.isModified}
              onFileNameChange={editorActions.setFileName}
              currentTheme={currentTheme}
              onThemeChange={handleThemeChange}
              markdown={editor.markdown}
              onLoad={editorActions.loadFile}
              onNewFile={editorActions.newFile}
              showPreview={showPreview}
              onTogglePreview={() => setShowPreview(!showPreview)}
              onShowSearch={() => dialogActions.showDialog('showSearch')}
              onShowTemplates={() => dialogActions.showDialog('showTemplates')}
              onShowAdvancedExport={() => dialogActions.showDialog('showAdvancedExport')}
              onShowShortcuts={() => dialogActions.showDialog('showShortcuts')}
              onInsertText={insertText}
              settings={settings}
              onSettingsChange={settingsActions.updateSettings}
              onUndo={undoRedo.undo}
              onRedo={undoRedo.redo}
              canUndo={undoRedo.canUndo}
              canRedo={undoRedo.canRedo}
              responsive={responsive}
              zenMode={settings.zenMode}
              showToc={showToc}
              showOutline={showOutline}
              onToggleToc={handleToggleToc}
              onToggleOutline={handleToggleOutline}
            />
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <MemoizedEditorSidebar
              markdown={editor.markdown}
              theme={currentTheme}
              uiState={uiState}
              onToggleToc={handleToggleToc}
              onToggleOutline={handleToggleOutline}
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              responsive={responsive}
              zenMode={settings.zenMode}
            />

            {/* Editor and Preview */}
            <MemoizedEditorMainContent
              markdown={editor.markdown}
              onChange={handleMarkdownChange}
              theme={currentTheme}
              settings={settings}
              showPreview={showPreview}
              responsive={responsive}
              onInsertTextAtCursor={handleInsertTextAtCursor}
            />
          </div>

          {/* Footer */}
          <MemoizedEditorFooter
            markdown={editor.markdown}
            responsive={responsive}
            zenMode={settings.zenMode}
          />

          {/* Dialog Container */}
          <DialogContainer
            dialogState={dialogs}
            onCloseDialog={dialogActions.hideDialog}
            onCloseAllDialogs={dialogActions.hideAllDialogs}
            markdown={editor.markdown}
            fileName={editor.fileName}
            onMarkdownChange={handleMarkdownChange}
            onLoadTemplate={loadTemplate}
            currentTheme={currentTheme}
          />

          {/* Welcome Dialog */}
          <WelcomeDialog
            isOpen={welcomeDialog.isOpen}
            onClose={welcomeDialog.handleClose}
            onSignUp={welcomeDialog.handleSignUp}
            onContinueAsGuest={welcomeDialog.handleContinueAsGuest}
          />
        </EditorContainer>
      </PerformanceMonitor>
    </EditorErrorBoundary>
  );
};

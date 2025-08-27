/*
MarkdownEditor
@author Axel Modra
 */

import { useAuth } from '@clerk/react-router';
import React from 'react';
import { useSearchParams } from 'react-router';

import { usePerformanceDebug, useRenderPerformance } from '@/hooks/core/usePerformance';
import { useAutoFileRestoration, useFileStorage, useImmediateFileLoading } from '@/hooks/files';

import { useWelcomeDialog, WelcomeDialog } from '../../auth/WelcomeDialog';
import { type Theme, useTheme } from '../../features/ThemeSelector';
import { MobileNav } from '../../layout/MobileNav';
import { ContentRestorationLoader } from '../../shared/ThemeAwareLoader';
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
  initialMarkdown: _initialMarkdown = DEFAULT_FILE.CONTENT,
  initialFileName: _initialFileName = DEFAULT_FILE.NAME,
  initialTheme: _initialTheme,
  eventHandlers = {},
  className = '',
  style = {},
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFile = searchParams.get('file');
  const urlTitle = searchParams.get('title');
  const urlContent = searchParams.get('content');
  const isNewFileRequest = searchParams.get('new') === 'true';

  // Force complete reset when navigating from files page
  const isFromFilesPage = !!urlFile;
  const [_isManualLoading, setIsManualLoading] = React.useState(isFromFilesPage);
  const [_isContentReady, setIsContentReady] = React.useState(!isFromFilesPage);

  const { isSignedIn, isLoaded } = useAuth();
  const immediateLoading = useImmediateFileLoading();
  const [isFileRestored, setIsFileRestored] = React.useState(false);
  const [isNewFileMode] = React.useState(isNewFileRequest);

  const getInitialContent = () => {
    // NEW FILE REQUEST: Always return empty content, no exceptions
    if (isNewFileRequest || isNewFileMode) return '';
    if (urlContent) return urlContent;

    // CRITICAL: For files page navigation - preserve current content during loading
    if (isFromFilesPage) {
      // If file has been restored, don't interfere
      if (isFileRestored) {
        return undefined; // Let restored content show
      }

      // If not authenticated, return empty content (fallback to guest mode)
      if (isLoaded && !isSignedIn) {
        return '';
      }

      // Stay in loading state until file fully loaded
      return undefined;
    }

    // For authenticated users, wait for immediate loading to complete
    if (isLoaded && isSignedIn) {
      // If immediate loading is still in progress, return undefined to show loading
      if (immediateLoading.isLoading || !immediateLoading.hasChecked) {
        return undefined;
      }

      // If immediate loading found a file, return undefined to let restoration handle it
      if (immediateLoading.fileData) {
        return undefined;
      }

      // If no file found and user is authenticated, return empty content (new user)
      return '';
    }

    // For guest users, DON'T mark visited here - let welcome dialog handle it
    // Just return undefined to let welcome dialog show first, then load template
    return undefined;
  };

  const getInitialFileName = () => {
    // NEW FILE REQUEST: Always return default name
    if (isNewFileRequest || isNewFileMode) return 'untitled.md';
    if (urlTitle) return urlTitle;

    // CRITICAL: For files page navigation, return target filename immediately
    if (isFromFilesPage && urlFile) {
      // Extract filename from file ID or use a loading placeholder
      return urlFile.includes('.') ? urlFile : `${urlFile}.md`;
    }

    // For authenticated users, wait for immediate loading to complete
    if (isLoaded && isSignedIn) {
      // If immediate loading is still in progress, return undefined
      if (immediateLoading.isLoading || !immediateLoading.hasChecked) {
        return undefined;
      }

      // If immediate loading found a file, return undefined to let restoration handle it
      if (immediateLoading.fileData) {
        return undefined;
      }

      // If no file found and user is authenticated, return default name for new user
      return 'untitled.md';
    }

    // For guest users, DON'T check first visit here - let welcome dialog handle it
    // Just return undefined to let welcome dialog show first, then load filename
    return undefined;
  };

  React.useEffect(() => {
    // CRITICAL: Don't clear URL params if loading from files page
    if (isFromFilesPage) {
      return;
    }

    if (urlTitle || urlContent || isNewFileRequest) {
      setSearchParams({}, { replace: true });

      // Clear all storage when creating new file to prevent old content loading
      if (isNewFileRequest) {
        sessionStorage.removeItem('active_file_context');
        localStorage.removeItem('markdownEditor_content');
        localStorage.removeItem('markdownEditor_fileName');
        localStorage.removeItem('markdownEditor_lastOpenedFile');
      }
    }
  }, [urlTitle, urlContent, isNewFileRequest, setSearchParams, isFromFilesPage]);

  // Reset file restored state when authentication changes
  React.useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setIsFileRestored(false);
    }
  }, [isLoaded, isSignedIn]);

  // Handle case when no file is found (new user) - mark as restored to prevent infinite loading
  React.useEffect(() => {
    if (
      isLoaded &&
      isSignedIn &&
      immediateLoading.hasChecked &&
      !immediateLoading.isLoading &&
      !immediateLoading.fileData &&
      !isFileRestored
    ) {
      setIsFileRestored(true);
    }
  }, [
    isLoaded,
    isSignedIn,
    immediateLoading.hasChecked,
    immediateLoading.isLoading,
    immediateLoading.fileData,
    isFileRestored,
  ]);

  // Force fresh editor state for files page navigation
  const editorState = useEditorState(getInitialContent(), getInitialFileName());
  const responsiveLayout = useResponsiveLayout();
  const globalTheme = useTheme();
  const dialogManager = useDialogManager();
  const editorSettings = useEditorSettings();
  const welcomeDialog = useWelcomeDialog();
  const fileStorage = useFileStorage();

  // Handle welcome dialog close for guest users - load template
  const handleWelcomeDialogClose = React.useCallback(() => {
    if (!isSignedIn && welcomeDialog.isOpen && !isNewFileRequest) {
      // Load welcome template after dialog closes ONLY if not a new file request
      setTimeout(() => {
        editorState.actions.loadFile(
          DEFAULT_FILE.CONTENT,
          DEFAULT_FILE.NAME,
          true, // bypass dialog
          undefined, // no file ID
          'manual', // source
          true // silent
        );
      }, 100); // Small delay to ensure dialog is closed
    }
    welcomeDialog.hideWelcomeDialog();
  }, [
    isSignedIn,
    welcomeDialog.isOpen,
    welcomeDialog.hideWelcomeDialog,
    editorState.actions,
    isNewFileRequest,
  ]);

  // Manual file loading for files page navigation - bypass all restoration mechanisms
  React.useEffect(() => {
    if (!urlFile || !isSignedIn || !isLoaded || !fileStorage.isInitialized) {
      return;
    }

    const loadTargetFile = async () => {
      try {
        // Try loading file from Supabase
        const loadedFile = await fileStorage.loadFile(urlFile);

        if (loadedFile?.content && loadedFile.content.trim() !== '') {
          // CRITICAL: Load content directly without any flash
          editorState.actions.loadFile(
            loadedFile.content,
            loadedFile.title,
            true,
            loadedFile.id,
            'files-page',
            true
          );
          // Immediately mark as complete - no delays
          setIsFileRestored(true);
          setIsManualLoading(false);
          setIsContentReady(true);
        } else {
          editorState.actions.loadFile(
            `# File Content Empty\n\nFile ID: ${urlFile}\nFile found: ${!!loadedFile}\nContent: ${loadedFile?.content || 'null'}\n\nThis file exists in Supabase but has no content.`,
            'Content Missing',
            true,
            undefined,
            'manual',
            true
          );
          setIsFileRestored(true);
          setIsManualLoading(false);
        }
      } catch (error) {
        console.error('Error loading file:', error);
      }
    };

    // Load immediately, no delay to prevent flicker
    loadTargetFile();
  }, [
    urlFile,
    fileStorage.isInitialized,
    editorState.actions,
    isLoaded,
    isSignedIn,
    fileStorage.loadFile,
  ]);

  const fileRestoration = useAutoFileRestoration(
    isFromFilesPage
      ? undefined
      : (fileData) => {
          editorState.actions.loadFile(
            fileData.content,
            fileData.title,
            true,
            fileData.id,
            fileData.source,
            true
          );
          // Mark file as restored to prevent flicker
          setIsFileRestored(true);
        },
    {
      skipIfUrlParams: true,
      silent: true,
      delay: 50,
      clearInvalidContext: true,
    }
  );

  useRenderPerformance('MarkdownEditor');
  usePerformanceDebug();

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

  const { state: editor, actions: editorActions, undoRedo } = editorState;
  const { state: responsive } = responsiveLayout;
  const { currentTheme, setTheme } = globalTheme;

  const [showPreview, setShowPreview] = React.useState(true);
  const [showToc, setShowToc] = React.useState(false);
  const [showOutline, setShowOutline] = React.useState(false);
  const { state: dialogs, actions: dialogActions } = dialogManager;
  const { settings, actions: settingsActions } = editorSettings;

  const lastSavedContentRef = React.useRef<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

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

  const [insertTextAtCursor, setInsertTextAtCursor] = React.useState<
    ((text: string, selectInserted?: boolean) => void) | null
  >(null);

  const insertText = React.useCallback(
    (text: string) => {
      if (insertTextAtCursor) {
        insertTextAtCursor(text, false);
      } else {
        const textarea = document.querySelector('.markdown-editor-textarea') as HTMLTextAreaElement;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentValue = textarea.value;
          const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);

          textarea.value = newValue;
          editorActions.setMarkdown(newValue);

          const newCursorPos = start + text.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();

          const inputEvent = new Event('input', { bubbles: true });
          textarea.dispatchEvent(inputEvent);
        } else {
          editorActions.setMarkdown(`${editor.markdown}\n\n${text}`);
        }
      }
    },
    [insertTextAtCursor, editor.markdown, editorActions]
  );

  const handleInsertTextAtCursor = React.useCallback(
    (insertFn: (text: string, selectInserted?: boolean) => void) => {
      setInsertTextAtCursor(() => insertFn);
    },
    []
  );

  const loadTemplate = React.useCallback(
    (content: string, fileName: string) => {
      editorActions.loadFile(content, fileName);
    },
    [editorActions]
  );

  const handleManualSave = React.useCallback(async () => {
    if (!editor.markdown || !editor.fileName || !fileStorage.saveFile) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.warn('Cannot save: missing content, filename, or save function');
      });
      return;
    }

    const currentContentHash = `${editor.fileName}:${
      editor.markdown.length
    }:${editor.markdown.slice(0, 100)}`;

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

      lastSavedContentRef.current = currentContentHash;
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev(`Manual save to ${storageType} successful`);
      });

      editorActions.setModified(false);
    } catch (error) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.error('Manual save failed:', error);
      });
    }
  }, [editor.markdown, editor.fileName, fileStorage, editorActions]);

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
        // TODO: Implement open file functionality
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

  useKeyboardShortcuts(keyboardContext, !settings.zenMode);

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

  const handleToggleToc = React.useCallback(() => {
    setShowToc((prev) => !prev);
  }, []);

  const handleToggleOutline = React.useCallback(() => {
    setShowOutline((prev) => !prev);
  }, []);

  const loadFileRef = React.useRef(editorActions.loadFile);

  React.useEffect(() => {
    loadFileRef.current = editorActions.loadFile;
  }, [editorActions.loadFile]);

  React.useEffect(() => {
    if (urlFile && fileStorage.isInitialized && fileStorage.storageService) {
      const loadFileFromStorage = async () => {
        try {
          const fileData = await fileStorage.loadFile(urlFile);
          if (fileData) {
            (
              loadFileRef.current as (
                content: string,
                name: string,
                bypassDialog?: boolean,
                fileId?: string,
                source?: 'url' | 'files-page' | 'manual'
              ) => void
            )(fileData.content, fileData.title, true, fileData.id, 'url');

            setTimeout(() => {
              setSearchParams({}, { replace: true });
            }, 50);
          } else {
            if (fileStorage.isAuthenticated) {
              import('@/utils/console').then(({ safeConsole }) => {
                safeConsole.error('File not found in cloud storage');
              });
            }
            setSearchParams({}, { replace: true });
          }
        } catch (error) {
          import('@/utils/console').then(({ safeConsole }) => {
            safeConsole.error('Error loading file from storage:', error);
          });
          setSearchParams({}, { replace: true });
        }
      };
      loadFileFromStorage();
    }
  }, [
    urlFile,
    fileStorage.isInitialized,
    fileStorage.storageService,
    fileStorage.isAuthenticated,
    fileStorage.loadFile,
    setSearchParams,
  ]);

  // Show loading for authenticated users during immediate file loading
  // Keep loading until file is actually restored to prevent flicker
  if (
    isLoaded &&
    isSignedIn &&
    (immediateLoading.isLoading ||
      !immediateLoading.hasChecked ||
      (immediateLoading.hasChecked && immediateLoading.fileData && !isFileRestored))
  ) {
    return (
      <ContentRestorationLoader fileName={immediateLoading.fileData?.title || 'your last file'} />
    );
  }

  // Show loading for file restoration
  if (editorState.isRestoring) {
    return <ContentRestorationLoader fileName={fileRestoration.activeFileName || undefined} />;
  }

  if (welcomeDialog.isCheckingFirstVisit && !isSignedIn) {
    return <ContentRestorationLoader fileName="checking user status" />;
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

          <div className="flex-1 flex overflow-hidden">
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

          <MemoizedEditorFooter
            markdown={editor.markdown}
            responsive={responsive}
            zenMode={settings.zenMode}
          />

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

          <WelcomeDialog
            isOpen={welcomeDialog.isOpen}
            onClose={handleWelcomeDialogClose}
            onSignUp={welcomeDialog.handleSignUp}
            onContinueAsGuest={handleWelcomeDialogClose}
          />
        </EditorContainer>
      </PerformanceMonitor>
    </EditorErrorBoundary>
  );
};

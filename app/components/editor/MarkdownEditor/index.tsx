/*
MarkdownEditor
@author Axel Modra
 */


import React from 'react';
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
  // State management hooks
  const editorState = useEditorState(initialMarkdown, initialFileName);
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
          console.log('✓ Supabase connection test successful');
        } else {
          console.warn('⚠️ Supabase connection test failed');
        }
      } catch (error) {
        console.error('Error testing Supabase connection:', error);
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
        // Fallback to old method if insertTextAtCursor is not available yet
        const textarea = document.querySelector('textarea');
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newText =
            editor.markdown.substring(0, start) + text + editor.markdown.substring(end);
          editorActions.setMarkdown(newText);

          // Set cursor position after inserted text
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + text.length, start + text.length);
          }, 0);
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
      saveFile: () => {
        // TODO: Implement save functionality
      },
      openFile: () => {
        // TODO: Implement open functionality
      },
    }),
    [insertText, showPreview, settingsActions, dialogActions, undoRedo, editorActions]
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

  // Auto-save functionality
  React.useEffect(() => {
    if (!editor.markdown || !editor.fileName || !editor.isModified) return;

    const autoSaveTimer = setTimeout(async () => {
      if (fileStorage.isAuthenticated && fileStorage.saveFile) {
        try {
          console.log('Auto-saving file to cloud:', editor.fileName);
          await fileStorage.saveFile({
            title: editor.fileName,
            content: editor.markdown,
            fileType: 'markdown',
            tags: [],
          });
          console.log('Auto-save successful');
        } catch (error) {
          console.warn('Auto-save failed:', error);
        }
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [editor.markdown, editor.fileName, editor.isModified, fileStorage]);

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

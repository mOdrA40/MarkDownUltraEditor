/**
 * @fileoverview Refactored MarkdownEditor main component
 * @author Axel Modra
 */

import React from 'react';
import { MobileNav } from '../../layout/MobileNav';
import { MarkdownEditorProps } from './types';
import { Theme } from '../../features/ThemeSelector';
import {
  useEditorState,
  useResponsiveLayout,
  useThemeManager,
  useDialogManager,
  useEditorSettings,
  useKeyboardShortcuts
} from './hooks';
import {
  EditorContainer,
  DialogContainer
} from './components';
import {
  PerformanceMonitor,
  EditorErrorBoundary,
  MemoizedEditorHeader,
  MemoizedEditorSidebar,
  MemoizedEditorMainContent,
  MemoizedEditorFooter
} from './components/Performance';
import { DEFAULT_FILE } from './utils/constants';

/**
 * Main MarkdownEditor component - Refactored with clean architecture
 * 
 * Features:
 * - Modular architecture with separation of concerns
 * - Custom hooks for state management
 * - Memoized components for performance
 * - Error boundaries for robustness
 * - Performance monitoring
 * - Responsive design
 * - Accessibility support
 */
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialMarkdown = DEFAULT_FILE.CONTENT,
  initialFileName = DEFAULT_FILE.NAME,
  initialTheme,
  eventHandlers = {},
  className = '',
  style = {}
}) => {
  // State management hooks
  const editorState = useEditorState(initialMarkdown, initialFileName);
  const responsiveLayout = useResponsiveLayout();
  const themeManager = useThemeManager(initialTheme);
  const dialogManager = useDialogManager();
  const editorSettings = useEditorSettings();

  // Destructure state and actions
  const { state: editor, actions: editorActions, undoRedo } = editorState;
  const { state: responsive } = responsiveLayout;
  const { state: theme, actions: themeActions } = themeManager;
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

  // Text insertion helper
  const insertText = React.useCallback((text: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = editor.markdown.substring(0, start) + text + editor.markdown.substring(end);
      editorActions.setMarkdown(newText);

      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  }, [editor.markdown, editorActions]);



  // Template loading helper
  const loadTemplate = React.useCallback((content: string, fileName: string) => {
    editorActions.loadFile(content, fileName);
  }, [editorActions]);

  // Keyboard shortcuts context
  const keyboardContext = React.useMemo(() => ({
    insertText,
    togglePreview: () => setShowPreview(!showPreview),
    toggleZenMode: () => settingsActions.toggleZenMode(),
    showShortcuts: () => dialogActions.showDialog('showShortcuts'),
    undo: undoRedo.undo,
    redo: undoRedo.redo,
    newFile: editorActions.newFile,
    saveFile: () => {}, // Implement save functionality
    openFile: () => {} // Implement open functionality
  }), [insertText, showPreview, settingsActions, dialogActions, undoRedo, editorActions]);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts(keyboardContext, !settings.zenMode);

  // UI state object for components
  const uiState = React.useMemo(() => ({
    showPreview,
    showToc,
    showOutline,
    showNavigation: showToc || showOutline,
    sidebarCollapsed
  }), [showPreview, showToc, showOutline, sidebarCollapsed]);

  // Event handlers with custom overrides
  const handleMarkdownChange = React.useCallback((value: string) => {
    editorActions.setMarkdown(value);
    eventHandlers.onMarkdownChange?.(value);
  }, [editorActions, eventHandlers]);

  const handleThemeChange = React.useCallback((newTheme: Theme) => {
    themeActions.setTheme(newTheme);
    eventHandlers.onThemeChange?.(newTheme);
  }, [themeActions, eventHandlers]);

  return (
    <EditorErrorBoundary enableReporting={process.env.NODE_ENV === 'production'}>
      <PerformanceMonitor enabled={process.env.NODE_ENV === 'development'}>
        <EditorContainer
          theme={theme.currentTheme}
          responsive={responsive}
          zenMode={settings.zenMode}
          onToggleZenMode={settingsActions.toggleZenMode}
          className={className}
          style={style}
        >
          {/* Mobile Navigation */}
          {responsive.isMobile && !settings.zenMode && (
            <MobileNav
              currentTheme={theme.currentTheme}
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
              onLineHeightChange={(height) => settingsActions.updateSettings({ lineHeight: height })}
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
              currentTheme={theme.currentTheme}
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
            />
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <MemoizedEditorSidebar
              markdown={editor.markdown}
              theme={theme.currentTheme}
              uiState={uiState}
              onToggleToc={() => setShowToc(!showToc)}
              onToggleOutline={() => setShowOutline(!showOutline)}
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              responsive={responsive}
              zenMode={settings.zenMode}
            />

            {/* Editor and Preview */}
            <MemoizedEditorMainContent
              markdown={editor.markdown}
              onChange={handleMarkdownChange}
              theme={theme.currentTheme}
              settings={settings}
              showPreview={showPreview}
              responsive={responsive}
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
            currentTheme={theme.currentTheme}
          />
        </EditorContainer>
      </PerformanceMonitor>
    </EditorErrorBoundary>
  );
};

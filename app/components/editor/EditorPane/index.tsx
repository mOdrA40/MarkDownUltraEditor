/**
 * @fileoverview Main EditorPane component - refactored with modular architecture
 * @author Axel Modra
 */

import type React from 'react';
import { useEffect } from 'react';
import { EditorHeader } from './components/EditorHeader';
import { EditorTextarea } from './components/EditorTextarea';
import { FocusModeOverlay } from './components/FocusModeOverlay';
import { LineNumbers } from './components/LineNumbers';
import { useEditorState } from './hooks/useEditorState';
import { useResponsiveEditor } from './hooks/useResponsiveEditor';
import { useSimpleEditor } from './hooks/useSimpleEditor';
import { useTypewriterMode } from './hooks/useTypewriterMode';
import type { EditorPaneProps } from './types/editorPane.types';
import { generateEditorStyles } from './utils/editorStyles';
import { handleKeyDown } from './utils/keyboardHandlers';

/**
 * Main EditorPane component with modular architecture
 * Supports vim mode, typewriter mode, focus mode, and responsive design
 */
export const EditorPane: React.FC<EditorPaneProps> = ({
  markdown,
  onChange,
  fontSize = 14,
  lineHeight = 1.6,
  focusMode = false,
  typewriterMode = false,
  wordWrap = true,
  vimMode = false,
  theme,
  isMobile = false,
  isTablet = false,
  onInsertTextAtCursor,
}) => {
  // State management
  const { vimModeState, textareaRef, vim } = useEditorState(markdown, onChange, vimMode);

  // Ultra-simple editor without complex state management
  const { insertTextAtCursor, autoResize } = useSimpleEditor(textareaRef, {
    minHeight: 100,
    maxHeight: 1000,
  });

  // Pass insertTextAtCursor to parent component
  useEffect(() => {
    if (onInsertTextAtCursor) {
      onInsertTextAtCursor(insertTextAtCursor);
    }
  }, [onInsertTextAtCursor, insertTextAtCursor]);

  // Auto-resize on mount only - changes are handled by textarea onChange
  useEffect(() => {
    autoResize();
  }, [autoResize]);

  // Responsive configuration
  const responsiveConfig = useResponsiveEditor(fontSize, lineHeight, isMobile, isTablet);

  // Typewriter mode functionality
  useTypewriterMode({
    enabled: typewriterMode,
    textareaRef,
  });

  // Generate editor styles
  const editorStyles = generateEditorStyles(responsiveConfig, wordWrap, theme);

  // Keyboard event handler
  const handleKeyDownEvent = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleKeyDown(e, {
      vimMode,
      vimHandler: vim,
      markdown,
      onChange,
    });
  };

  return (
    <div
      className={`h-full flex flex-col ${responsiveConfig.isMobileOrTablet ? 'editor-pane-responsive' : ''}`}
    >
      {/* Editor Header */}
      <EditorHeader
        show={true}
        focusMode={focusMode}
        typewriterMode={typewriterMode}
        vimMode={vimMode}
        vimModeState={vimModeState}
        theme={theme}
      />

      {/* Editor Content Area */}
      <div className="flex-1 relative">
        {/* Main Textarea */}
        <EditorTextarea
          textareaRef={textareaRef}
          markdown={markdown}
          onChange={onChange}
          onKeyDown={handleKeyDownEvent}
          focusMode={focusMode}
          typewriterMode={typewriterMode}
          wordWrap={wordWrap}
          editorStyles={editorStyles}
          onAutoResize={autoResize}
        />

        {/* Line Numbers Overlay */}
        <LineNumbers
          show={!focusMode}
          markdown={markdown}
          fontSize={responsiveConfig.fontSize}
          lineHeight={responsiveConfig.lineHeight}
          theme={theme}
        />

        {/* Focus Mode Overlay */}
        <FocusModeOverlay enabled={focusMode} theme={theme} />
      </div>
    </div>
  );
};

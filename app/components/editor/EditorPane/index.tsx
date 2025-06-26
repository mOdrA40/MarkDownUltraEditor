/**
 * @fileoverview Main EditorPane component - refactored with modular architecture
 * @author Axel Modra
 */

import React from 'react';
import { EditorPaneProps } from "./types/editorPane.types";
import { useEditorState } from "./hooks/useEditorState";
import { useTypewriterMode } from "./hooks/useTypewriterMode";
import { useResponsiveEditor } from "./hooks/useResponsiveEditor";
import { useAutoResize } from "./hooks/useAutoResize";
import { EditorHeader } from "./components/EditorHeader";
import { EditorTextarea } from "./components/EditorTextarea";
import { LineNumbers } from "./components/LineNumbers";
import { FocusModeOverlay } from "./components/FocusModeOverlay";
import { generateEditorStyles } from "./utils/editorStyles";
import { handleKeyDown } from "./utils/keyboardHandlers";

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
  isTablet = false
}) => {
  // State management
  const { vimModeState, textareaRef, vim } = useEditorState(
    markdown,
    onChange,
    vimMode
  );

  // Responsive configuration
  const responsiveConfig = useResponsiveEditor(
    fontSize,
    lineHeight,
    isMobile,
    isTablet
  );

  // Auto-resize functionality
  useAutoResize(textareaRef, markdown);

  // Typewriter mode functionality
  useTypewriterMode({
    enabled: typewriterMode,
    textareaRef
  });

  // Generate editor styles
  const editorStyles = generateEditorStyles(responsiveConfig, wordWrap, theme);

  // Keyboard event handler
  const handleKeyDownEvent = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleKeyDown(e, {
      vimMode,
      vimHandler: vim,
      markdown,
      onChange
    });
  };

  return (
    <div className={`h-full flex flex-col ${responsiveConfig.isMobileOrTablet ? 'editor-pane-responsive' : ''}`}>
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
        <FocusModeOverlay
          enabled={focusMode}
          theme={theme}
        />
      </div>
    </div>
  );
};

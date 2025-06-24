/**
 * @fileoverview Editor header component with mode indicators
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { EditorHeaderConfig } from "../types/editorPane.types";
import { generateHeaderStyles } from "../utils/editorStyles";

/**
 * Editor header component that displays current editor modes
 */
export const EditorHeader: React.FC<EditorHeaderConfig> = ({
  show,
  focusMode,
  typewriterMode,
  vimMode,
  vimModeState,
  theme
}) => {
  // Don't render if not shown or in focus mode
  if (!show || focusMode) return null;

  const headerStyles = generateHeaderStyles(theme);

  return (
    <div 
      className="px-4 py-2 border-b backdrop-blur-md"
      style={headerStyles}
    >
      <h3
        className="text-sm font-medium"
        style={{ color: theme?.text || 'inherit' }}
      >
        Editor
        {focusMode && (
          <span className="ml-2 text-xs opacity-60">(Focus Mode)</span>
        )}
        {typewriterMode && (
          <span className="ml-2 text-xs opacity-60">(Typewriter)</span>
        )}
        {vimMode && (
          <span className="ml-2 text-xs opacity-60">
            (Vim: {vimModeState.toUpperCase()})
          </span>
        )}
      </h3>
    </div>
  );
};

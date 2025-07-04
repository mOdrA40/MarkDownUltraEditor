import type React from 'react';
import type { EditorHeaderConfig } from '../types/editorPane.types';
import { generateHeaderStyles } from '@/utils/themeUtils';

/**
 * Editor header component that displays current editor modes
 */
export const EditorHeader: React.FC<EditorHeaderConfig> = ({
  show,
  focusMode,
  typewriterMode,
  vimMode,
  vimModeState,
  theme,
}) => {
  // Don't render if not shown or in focus mode
  if (!show || focusMode) return null;

  const headerStyles = generateHeaderStyles(theme);

  return (
    <div
      className="px-4 py-2 border-b backdrop-blur-md"
      style={{
        ...headerStyles,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <h3 className="text-sm font-medium">
        Editor
        {focusMode && <span className="ml-2 text-xs opacity-60">(Focus Mode)</span>}
        {typewriterMode && <span className="ml-2 text-xs opacity-60">(Typewriter)</span>}
        {vimMode && (
          <span className="ml-2 text-xs opacity-60">(Vim: {vimModeState.toUpperCase()})</span>
        )}
      </h3>
    </div>
  );
};

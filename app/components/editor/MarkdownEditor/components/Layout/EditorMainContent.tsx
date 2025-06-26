/**
 * @fileoverview Editor main content area with editor and preview panes
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { EditorPane } from "../../../EditorPane";
import { PreviewPane } from "../../../PreviewPane";
import { Theme } from "../../../../features/ThemeSelector";
import { EditorSettings, ResponsiveState } from '../../types';

/**
 * Props for EditorMainContent component
 */
export interface EditorMainContentProps {
  // Content
  markdown: string;
  onChange: (value: string) => void;
  
  // Theme
  theme: Theme;
  
  // Settings
  settings: EditorSettings;
  
  // UI state
  showPreview: boolean;
  
  // Responsive
  responsive: ResponsiveState;
}

/**
 * Editor main content component with editor and preview panes
 */
export const EditorMainContent: React.FC<EditorMainContentProps> = ({
  markdown,
  onChange,
  theme,
  settings,
  showPreview,
  responsive
}) => {
  const { isMobile, isTablet, isSmallTablet } = responsive;
  const { zenMode } = settings;

  return (
    <div className={`flex-1 flex min-w-0 overflow-hidden ${(isMobile || isSmallTablet) ? 'flex-col' : 'flex-row'}`}>
      {/* Editor Pane */}
      <div className={`
        ${(isMobile || isSmallTablet) ? 'w-full' : showPreview && !zenMode ? 'w-1/2' : 'w-full'}
        ${(isMobile || isSmallTablet) && showPreview && !zenMode ? 'h-1/2' : 'flex-1'}
        ${(isMobile || isSmallTablet) ? 'border-b' : showPreview && !zenMode ? 'border-r' : ''}
        min-h-0 overflow-hidden
      `}>
        <EditorPane
          markdown={markdown}
          onChange={onChange}
          fontSize={settings.fontSize}
          lineHeight={settings.lineHeight}
          focusMode={settings.focusMode}
          typewriterMode={settings.typewriterMode}
          wordWrap={settings.wordWrap}
          vimMode={settings.vimMode}
          theme={theme}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      </div>

      {/* Preview Pane */}
      {showPreview && !zenMode && (
        <div className={`
          ${(isMobile || isSmallTablet) ? 'w-full h-1/2' : 'w-1/2'}
          min-h-0 overflow-hidden
        `}>
          <PreviewPane
            markdown={markdown}
            isDarkMode={theme.id === 'dark'}
            theme={theme}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </div>
      )}
    </div>
  );
};

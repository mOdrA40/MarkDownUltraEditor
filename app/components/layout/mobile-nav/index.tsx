/**
 * Main MobileNav Component
 * Mengintegrasikan header dan sidebar dengan state management yang clean
 */

import React from 'react';
import { NavHeader } from './components/NavHeader';
import { NavSidebar } from './components/NavSidebar';
import { useMobileNav } from './hooks/useMobileNav';
import { MobileNavProps } from './types/navTypes';

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTheme,
  onThemeChange,
  showPreview,
  onTogglePreview,
  onToggleZen,
  onSearch,
  onNewFile,
  markdown,
  fileName,
  onLoad,
  onFileNameChange,
  onInsertText,
  fontSize,
  onFontSizeChange,
  lineHeight,
  onLineHeightChange,
  focusMode,
  onFocusModeToggle,
  typewriterMode,
  onTypewriterModeToggle,
  wordWrap,
  onWordWrapToggle,
  vimMode,
  onVimModeToggle,
  zenMode,
  onZenModeToggle,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onShowAdvancedExport,
  onShowTemplates
}) => {
  const { isOpen, toggleSidebar, closeSidebar } = useMobileNav();

  return (
    <div className="flex flex-col w-full">
      {/* Navigation Header */}
      <NavHeader
        currentTheme={currentTheme}
        fileName={fileName}
        onFileNameChange={onFileNameChange}
        onMenuToggle={toggleSidebar}
        onSearch={onSearch}
        showPreview={showPreview}
        onTogglePreview={onTogglePreview}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Navigation Sidebar */}
      <NavSidebar
        isOpen={isOpen}
        onClose={closeSidebar}
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
        markdown={markdown}
        fileName={fileName}
        onLoad={onLoad}
        onNewFile={onNewFile}
        onInsertText={onInsertText}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        lineHeight={lineHeight}
        onLineHeightChange={onLineHeightChange}
        focusMode={focusMode}
        onFocusModeToggle={onFocusModeToggle}
        typewriterMode={typewriterMode}
        onTypewriterModeToggle={onTypewriterModeToggle}
        wordWrap={wordWrap}
        onWordWrapToggle={onWordWrapToggle}
        vimMode={vimMode}
        onVimModeToggle={onVimModeToggle}
        zenMode={zenMode}
        onZenModeToggle={onZenModeToggle}
        showPreview={showPreview}
        onTogglePreview={onTogglePreview}
        onToggleZen={onToggleZen}
        onShowAdvancedExport={onShowAdvancedExport}
        onShowTemplates={onShowTemplates}
      />
    </div>
  );
};

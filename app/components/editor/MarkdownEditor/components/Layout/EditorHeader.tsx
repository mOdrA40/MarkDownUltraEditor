/**
 * @fileoverview Editor header component with file controls and toolbar
 * @author Axel Modra
 */
import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, EyeOff, Search, Maximize2, Minimize2, Keyboard } from 'lucide-react';
import { type Theme, ThemeSelector } from '../../../../features/ThemeSelector';
import { FileOperations } from '../../../../features/FileOperations';
import { Toolbar } from '../../../Toolbar';
import { WritingSettings } from '../../../../features/WritingSettings';
import { UndoRedoButtons } from '../../../UndoRedoButtons';
import { AuthButtons } from '../../../../auth/AuthButtons';
import { StorageStatus } from '../../../../features/StorageStatus/StorageStatus';
import type { EditorSettings, ResponsiveState } from '../../types';
import { getHeaderClassName, generateHeaderStyles } from '@/utils/themeUtils';
/**
 * Props for EditorHeader component
 */
export interface EditorHeaderProps {
  // File state
  fileName: string;
  isModified: boolean;
  onFileNameChange: (name: string) => void;

  // Theme
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;

  // File operations
  markdown: string;
  onLoad: (content: string, name: string) => void;
  onNewFile: () => void;

  // View controls
  showPreview: boolean;
  onTogglePreview: () => void;

  // Dialog controls
  onShowSearch: () => void;
  onShowTemplates: () => void;
  onShowAdvancedExport: () => void;
  onShowShortcuts: () => void;

  // Toolbar
  onInsertText: (text: string) => void;

  // Settings
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;

  // Undo/Redo
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Responsive
  responsive: ResponsiveState;

  // Zen mode
  zenMode: boolean;
}
/**
 * Editor header component with file controls, theme selector, and toolbar
 */
export const EditorHeader: React.FC<EditorHeaderProps> = ({
  fileName,
  isModified,
  onFileNameChange,
  currentTheme,
  onThemeChange,
  markdown,
  onLoad,
  onNewFile,
  showPreview,
  onTogglePreview,
  onShowSearch,
  onShowTemplates,
  onShowAdvancedExport,
  onShowShortcuts,
  onInsertText,
  settings,
  onSettingsChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  responsive,
  zenMode,
}) => {
  const navigate = useNavigate();
  const { isMobile, isTablet, isSmallTablet } = responsive;
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Don't render header in zen mode
  if (zenMode) return null;

  /**
   * Toggle fullscreen mode
   */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
  // Get theme-based header styling
  const headerClassName = getHeaderClassName(currentTheme);
  const headerStyles = generateHeaderStyles(currentTheme);
  return (
    <div
      className={`editor-header border-b backdrop-blur-md ${headerClassName}`}
      style={{
        ...headerStyles,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-2 sm:px-4 py-2 gap-2">
        {/* File Info Row */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <FileText
              className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
              style={{ color: currentTheme.primary }}
            />
            <Input
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
              className="w-24 sm:w-32 md:w-48 h-6 sm:h-8 text-xs sm:text-sm font-medium border-0 bg-transparent"
              style={{
                borderColor: currentTheme.accent,
                color: currentTheme.text,
              }}
            />
            {isModified && (
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                Modified
              </Badge>
            )}
          </div>
        </div>
        {/* Controls Row - Responsive Layout */}
        <div
          className={`
          ${isTablet ? 'flex flex-col gap-2' : 'flex items-center justify-between gap-1 sm:gap-2'}
          overflow-x-auto
        `}
        >
          {/* First Row - File Operations & Theme */}
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center space-x-1 flex-shrink-0">
              <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
              {!isTablet && <Separator orientation="vertical" className="h-4 sm:h-6" />}
              <div className="flex items-center space-x-1">
                <FileOperations
                  markdown={markdown}
                  fileName={fileName}
                  onLoad={onLoad}
                  currentTheme={currentTheme}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowAdvancedExport}
                  className="h-6 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap transform-none will-change-auto"
                  title="Advanced Export"
                  style={{
                    transform: 'none',
                    willChange: 'auto',
                    color: currentTheme.text,
                  }}
                  data-theme-button="true"
                >
                  Export+
                </Button>
              </div>
            </div>
            {/* Undo/Redo - Always visible */}
            <div className={`flex items-center ${isSmallTablet ? 'space-x-0.5' : 'space-x-1'}`}>
              <UndoRedoButtons
                onUndo={onUndo}
                onRedo={onRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                isMobile={isMobile}
                isTablet={isTablet}
                className={isSmallTablet ? 'undo-redo-compact' : ''}
                currentTheme={currentTheme}
              />
            </div>
          </div>
          {/* Second Row - Action Buttons */}
          <div
            className={`
            flex items-center ${isTablet ? 'justify-center' : 'justify-end'}
            space-x-1 flex-wrap gap-1
          `}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowSearch}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-2"
              title="Search"
              style={{ color: currentTheme.text }}
              data-theme-button="true"
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onTogglePreview}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-2"
              title="Toggle Preview"
              style={{ color: currentTheme.text }}
              data-theme-button="true"
            >
              {showPreview ? (
                <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowShortcuts}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-2"
              title="Keyboard Shortcuts (Ctrl+?)"
              style={{ color: currentTheme.text }}
              data-theme-button="true"
            >
              <Keyboard className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-2 hidden lg:flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              style={{ color: currentTheme.text }}
              data-theme-button="true"
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowTemplates}
              className="h-6 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
              title="Document Templates"
              style={{ color: currentTheme.text }}
              data-theme-button="true"
            >
              Templates
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('New button clicked - calling onNewFile');
                onNewFile();
              }}
              className="h-6 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
              title="New Document"
              style={{ color: currentTheme.text }}
              data-theme-button="true"
            >
              New
            </Button>

            {/* Authentication Buttons */}
            <div className="flex items-center">
              <Separator orientation="vertical" className="h-4 sm:h-6 mx-1" />
              <AuthButtons
                responsive={responsive}
                onViewFiles={() => {
                  window.location.href = '/files';
                }}
                onSettings={() => {
                  navigate('/settings');
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Toolbar - Only on desktop/tablet */}
      <div
        className={`${isSmallTablet ? 'overflow-x-auto toolbar-small-tablet' : 'overflow-x-hidden'}`}
      >
        <Toolbar onInsertText={onInsertText} currentTheme={currentTheme} />
      </div>

      {/* Writing Settings - Only on desktop/tablet */}
      <div
        className={`${isSmallTablet ? 'overflow-x-auto writing-settings-compact' : 'overflow-x-hidden'}`}
      >
        <WritingSettings
          fontSize={settings.fontSize}
          onFontSizeChange={(size) => onSettingsChange({ fontSize: size })}
          lineHeight={settings.lineHeight}
          onLineHeightChange={(height) => onSettingsChange({ lineHeight: height })}
          focusMode={settings.focusMode}
          onFocusModeToggle={() => onSettingsChange({ focusMode: !settings.focusMode })}
          typewriterMode={settings.typewriterMode}
          onTypewriterModeToggle={() =>
            onSettingsChange({ typewriterMode: !settings.typewriterMode })
          }
          wordWrap={settings.wordWrap}
          onWordWrapToggle={() => onSettingsChange({ wordWrap: !settings.wordWrap })}
          vimMode={settings.vimMode}
          onVimModeToggle={() => onSettingsChange({ vimMode: !settings.vimMode })}
          zenMode={settings.zenMode}
          onZenModeToggle={() => onSettingsChange({ zenMode: !settings.zenMode })}
        />
      </div>

      {/* Storage Status - Only on desktop/tablet */}
      {!isMobile && (
        <div className="px-4 py-2 border-t border-border/50">
          <StorageStatus compact={isSmallTablet} />
        </div>
      )}
    </div>
  );
};

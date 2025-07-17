/*
EditorHeader
@author Axel Modra
 */

import {
  Eye,
  EyeOff,
  FileText,
  Keyboard,
  List,
  Maximize2,
  Minimize2,
  PanelLeft,
  Search,
} from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { generateHeaderStyles, getHeaderClassName } from "@/utils/themeUtils";
import { AuthButtons } from "../../../../auth/AuthButtons";
import { FileOperations } from "../../../../features/FileOperations";
import { StorageStatus } from "../../../../features/StorageStatus/StorageStatus";
import { type Theme, ThemeSelector } from "../../../../features/ThemeSelector";
import { WritingSettings } from "../../../../features/WritingSettings";
import { Toolbar } from "../../../Toolbar";
import { UndoRedoButtons } from "../../../UndoRedoButtons";
import type { EditorSettings, ResponsiveState } from "../../types";

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

  // Sidebar controls
  showToc?: boolean;
  showOutline?: boolean;
  onToggleToc?: () => void;
  onToggleOutline?: () => void;
}

/**
 * EditorHeader component
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
  showToc,
  showOutline,
  onToggleToc,
  onToggleOutline,
}) => {
  const { isMobile, isTablet, isSmallTablet } = responsive;
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Compute desktop state from responsive props to avoid race condition
  const isDesktop = !isMobile && !isTablet && !isSmallTablet;

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (zenMode || isMobile) return null;

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

  const headerClassName = getHeaderClassName(currentTheme);
  const headerStyles = generateHeaderStyles(currentTheme);

  return (
    <div
      className={`desktop-editor-header editor-header border-b backdrop-blur-md ${headerClassName}`}
      style={{
        ...headerStyles,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Desktop Layout */}
      {isDesktop ? (
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 gap-2">
          {/* Left Side - File Info */}
          <div
            className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1"
            data-file-info="true"
          >
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
                <Badge
                  variant="secondary"
                  className="text-xs hidden sm:inline-flex"
                >
                  Modified
                </Badge>
              )}
            </div>
          </div>

          {/* Center */}
          <div className="flex items-center gap-2" data-theme-selector="true">
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
            />
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-1 flex-shrink-0">
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
              className="h-6 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
              title="Advanced Export"
              style={{ color: currentTheme.text }}
              data-theme-button="true"
            >
              Export+
            </Button>

            <Separator orientation="vertical" className="h-4 sm:h-6 mx-1" />

            <UndoRedoButtons
              onUndo={onUndo}
              onRedo={onRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              isMobile={isMobile}
              isTablet={isTablet}
              className=""
              currentTheme={currentTheme}
            />
          </div>
        </div>
      ) : (
        /* Tablet Layout */
        <div className="flex flex-col px-2 sm:px-4 py-2 gap-2">
          {/* File Info Row */}
          <div
            className="flex items-center space-x-2 sm:space-x-4 min-w-0"
            data-file-info="true"
          >
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
                <Badge
                  variant="secondary"
                  className="text-xs hidden sm:inline-flex"
                >
                  Modified
                </Badge>
              )}
            </div>
          </div>

          {/* Theme Selector Row */}
          <div
            className="flex items-center justify-center gap-2 py-1 border-b border-gray-200/50 dark:border-gray-700/50"
            data-theme-selector="true"
          >
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto">
            {/* Left Side */}
            <div className="flex items-center space-x-1 flex-shrink-0">
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
                className="h-6 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
                title="Advanced Export"
                style={{ color: currentTheme.text }}
                data-theme-button="true"
              >
                Export+
              </Button>
            </div>

            {/* Right Side - Undo/Redo */}
            <div
              className={`flex items-center ${
                isSmallTablet ? "space-x-0.5" : "space-x-1"
              }`}
            >
              <UndoRedoButtons
                onUndo={onUndo}
                onRedo={onRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                isMobile={isMobile}
                isTablet={isTablet}
                className={isSmallTablet ? "undo-redo-compact" : ""}
                currentTheme={currentTheme}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons Row - For both desktop and tablet */}
      <div
        className={`flex items-center ${
          isDesktop ? "justify-end" : "justify-center"
        } space-x-1 px-2 sm:px-4 py-1 border-t border-gray-200/50 dark:border-gray-700/50`}
      >
        {/* Sidebar Controls - TOC and Outline */}
        {onToggleToc && (
          <Button
            variant={showToc ? "default" : "ghost"}
            size="sm"
            onClick={onToggleToc}
            className={`h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-2 transition-all duration-200 ${
              showToc
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title={
              showToc ? "Hide Table of Contents" : "Show Table of Contents"
            }
            style={{
              color: showToc ? undefined : currentTheme.text,
              borderColor: showToc ? "rgb(59 130 246 / 0.3)" : "transparent",
            }}
            data-theme-button="true"
          >
            <List className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}

        {onToggleOutline && (
          <Button
            variant={showOutline ? "default" : "ghost"}
            size="sm"
            onClick={onToggleOutline}
            className={`h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-2 transition-all duration-200 ${
              showOutline
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-sm"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title={
              showOutline ? "Hide Document Outline" : "Show Document Outline"
            }
            style={{
              color: showOutline ? undefined : currentTheme.text,
              borderColor: showOutline ? "rgb(34 197 94 / 0.3)" : "transparent",
            }}
            data-theme-button="true"
          >
            <PanelLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}

        {(onToggleToc || onToggleOutline) && (
          <Separator orientation="vertical" className="h-4 sm:h-6" />
        )}

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
          className="hidden xl:flex h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-2"
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
          className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-2"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
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
            onNewFile();
          }}
          className="h-6 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
          title="New Document"
          style={{ color: currentTheme.text }}
          data-theme-button="true"
        >
          New
        </Button>

        {/* Files Button - Always visible for both guest and authenticated users */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = "/files";
          }}
          className="h-6 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
          title="My Files"
          style={{ color: currentTheme.text }}
          data-theme-button="true"
        >
          Files
        </Button>

        {/* Authentication Buttons */}
        <div className="flex items-center">
          <Separator orientation="vertical" className="h-4 sm:h-6 mx-1" />
          <AuthButtons
            responsive={responsive}
            onViewFiles={() => {
              window.location.href = "/files";
            }}
            onSettings={() => {
              window.location.href = "/settings";
            }}
          />
        </div>
      </div>

      {/* Toolbar - Only on desktop/tablet */}
      <div
        className={`${
          isSmallTablet
            ? "overflow-x-auto toolbar-small-tablet"
            : "overflow-x-hidden"
        }`}
      >
        <Toolbar onInsertText={onInsertText} currentTheme={currentTheme} />
      </div>

      {/* Writing Settings - Only on desktop/tablet */}
      <div
        className={`${
          isSmallTablet
            ? "overflow-x-auto writing-settings-compact"
            : "overflow-x-hidden"
        }`}
      >
        <WritingSettings
          fontSize={settings.fontSize}
          onFontSizeChange={(size) => onSettingsChange({ fontSize: size })}
          lineHeight={settings.lineHeight}
          onLineHeightChange={(height) =>
            onSettingsChange({ lineHeight: height })
          }
          focusMode={settings.focusMode}
          onFocusModeToggle={() =>
            onSettingsChange({ focusMode: !settings.focusMode })
          }
          typewriterMode={settings.typewriterMode}
          onTypewriterModeToggle={() =>
            onSettingsChange({ typewriterMode: !settings.typewriterMode })
          }
          wordWrap={settings.wordWrap}
          onWordWrapToggle={() =>
            onSettingsChange({ wordWrap: !settings.wordWrap })
          }
          vimMode={settings.vimMode}
          onVimModeToggle={() =>
            onSettingsChange({ vimMode: !settings.vimMode })
          }
          zenMode={settings.zenMode}
          onZenModeToggle={() =>
            onSettingsChange({ zenMode: !settings.zenMode })
          }
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

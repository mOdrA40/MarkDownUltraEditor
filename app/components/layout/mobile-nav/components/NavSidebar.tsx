/**
 * Komponen sidebar untuk mobile navigation
 * Menangani slide-out menu dengan semua navigation sections
 */

import { BookOpen, Download, FileText, Palette, User } from 'lucide-react';
import type React from 'react';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Toolbar } from '../../../editor/Toolbar';
import { FileOperations } from '../../../features/FileOperations';
import { ThemeSelector } from '../../../features/ThemeSelector';
import { WritingSettings } from '../../../features/WritingSettings';
// Import types
import type { NavSidebarProps } from '../types/navTypes';
// Import components
import { NavSection } from './NavSection';

export const NavSidebar: React.FC<NavSidebarProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  markdown,
  fileName,
  onLoad,
  onNewFile,
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
  showPreview,
  onTogglePreview,
  onToggleZen,
  onShowAdvancedExport,
  onShowTemplates,
}) => {
  /**
   * Execute action and close sidebar
   */
  const executeAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="mobile-nav-sidebar w-80 overflow-y-auto">
        <div className="space-y-6 pt-6">
          {/* Authentication Section */}
          <NavSection title="Account" icon={User} collapsible={false}>
            <div className="flex justify-center">
              <AuthButtons
                responsive={{
                  isMobile: true,
                  isTablet: false,
                  isSmallTablet: true,
                }}
                className="w-full"
              />
            </div>
          </NavSection>

          <Separator />

          {/* Theme Section */}
          <NavSection title="Theme" icon={Palette} collapsible={false}>
            <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
          </NavSection>

          <Separator />

          {/* File Operations Section */}
          <NavSection title="File Operations" icon={FileText} collapsible={false}>
            <div className="space-y-2">
              {/* New File Button */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => executeAction(onNewFile)}
              >
                <FileText className="h-4 w-4 mr-2" />
                New File
              </Button>

              {/* File Operations Component */}
              <FileOperations
                markdown={markdown}
                fileName={fileName}
                isMobileNav={true}
                currentTheme={currentTheme}
                onLoad={(content, name) => {
                  onLoad(content, name);
                  onClose();
                }}
              />

              {/* Document Templates */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => executeAction(onShowTemplates)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Document Templates
              </Button>

              {/* Advanced Export */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => executeAction(onShowAdvancedExport)}
              >
                <Download className="h-4 w-4 mr-2" />
                Advanced Export
              </Button>
            </div>
          </NavSection>

          <Separator />

          {/* Formatting Tools Section */}
          <NavSection
            title="Formatting"
            icon={FileText}
            collapsible={true}
            defaultCollapsed={false}
          >
            <div className="space-y-3">
              <Toolbar
                onInsertText={(text) => executeAction(() => onInsertText(text))}
                compact={true}
                forceMobileLayout={true}
                className="mobile-nav-toolbar"
              />
            </div>
          </NavSection>

          <Separator />

          {/* Writing Settings Section */}
          <NavSection
            title="Writing Settings"
            icon={FileText}
            collapsible={true}
            defaultCollapsed={false}
          >
            <WritingSettings
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
              forceMobileLayout={true}
              className="mobile-nav-writing-settings"
            />
          </NavSection>

          <Separator />

          {/* View Options Section */}
          <NavSection title="View Options" icon={FileText} collapsible={false}>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => executeAction(onTogglePreview)}
              >
                {showPreview ? (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Show Preview
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => executeAction(onToggleZen)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Zen Mode
              </Button>
            </div>
          </NavSection>
        </div>
      </SheetContent>
    </Sheet>
  );
};

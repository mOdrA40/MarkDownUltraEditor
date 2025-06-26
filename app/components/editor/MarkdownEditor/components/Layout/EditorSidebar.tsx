/**
 * @fileoverview Editor sidebar component with navigation and outline
 * @author Axel Modra
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { TableOfContents } from "../../../../navigation/TableOfContents";
import { DocumentOutline } from "../../../../navigation/DocumentOutline";
import { Theme } from "../../../../features/ThemeSelector";
import { ResponsiveState, UIState } from '../../types';
import { getHeaderClassName, generateHeaderStyles } from '@/utils/themeUtils';

/**
 * Props for EditorSidebar component
 */
export interface EditorSidebarProps {
  // Content
  markdown: string;
  
  // Theme
  theme: Theme;
  
  // UI state
  uiState: UIState;
  onToggleToc: () => void;
  onToggleOutline: () => void;
  onToggleSidebar: () => void;
  
  // Responsive
  responsive: ResponsiveState;
  
  // Zen mode
  zenMode: boolean;
}

/**
 * Editor sidebar component with table of contents and document outline
 */
export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  markdown,
  theme,
  uiState,
  onToggleToc,
  onToggleOutline,
  onToggleSidebar,
  responsive,
  zenMode
}) => {
  const { isMobile, isTablet } = responsive;
  const { showToc, showOutline, sidebarCollapsed } = uiState;

  // Don't render sidebar on mobile or in zen mode
  if (isMobile || zenMode) return null;

  // Don't render if neither TOC nor outline is shown
  if (!showToc && !showOutline) return null;

  // Get theme-based styling
  const headerClassName = getHeaderClassName(theme);
  const headerStyles = generateHeaderStyles(theme);

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          ${isTablet ? 'w-56' : 'w-72'}
          border-r backdrop-blur-md ${headerClassName}
          ${sidebarCollapsed ? 'hidden' : ''}
          flex flex-col
          transition-all duration-300 ease-in-out
          shadow-lg shadow-black/5
        `}
        style={{
          ...headerStyles,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          opacity: 0.9
        }}
      >
        {/* Table of Contents - Top Half */}
        {showToc && (
          <div className={`
            ${showOutline ? 'flex-1' : 'h-full'}
            min-h-0
            ${showOutline ? 'border-b border-gray-200 dark:border-gray-700' : ''}
            transition-all duration-300
          `}>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Table of Contents
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleToc}
                  className="h-6 w-6 p-0"
                  title="Hide Table of Contents"
                >
                  <PanelLeftClose className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <TableOfContents markdown={markdown} theme={theme} />
            </div>
          </div>
        )}

        {/* Document Outline - Bottom Half */}
        {showOutline && (
          <div className={`
            ${showToc ? 'flex-1' : 'h-full'}
            min-h-0
            transition-all duration-300
          `}>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Document Outline
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleOutline}
                  className="h-6 w-6 p-0"
                  title="Hide Document Outline"
                >
                  <PanelLeftClose className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <DocumentOutline markdown={markdown} theme={theme} />
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Collapse Toggle - Tablet only */}
      {isTablet && (showToc || showOutline) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="fixed left-2 top-1/2 z-10 h-8 w-8 p-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border shadow-md"
          title={sidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      )}
    </>
  );
};

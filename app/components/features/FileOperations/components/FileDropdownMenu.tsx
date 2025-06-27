/**
 * @fileoverview File operations dropdown menu component
 * @author Axel Modra
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { FileText, Download, Upload, Save, FileUp } from "lucide-react";
import type { Theme } from '@/components/features/ThemeSelector';
import { getThemeTextColor } from '@/utils/themeUtils';

interface FileDropdownMenuProps {
  /** Mobile navigation styling flag */
  isMobileNav: boolean;
  /** File operation handlers */
  onLoadFile: () => void;
  onSaveMarkdown: () => void;
  onExportHtml: () => void;
  onExportJson: () => void;
  /** Current theme for styling */
  currentTheme?: Theme;
}

/**
 * Dropdown menu component for file operations
 */
export const FileDropdownMenu: React.FC<FileDropdownMenuProps> = ({
  isMobileNav,
  onLoadFile,
  onSaveMarkdown,
  onExportHtml,
  onExportJson,
  currentTheme
}) => {
  // Get theme-based styling
  const textColor = getThemeTextColor(currentTheme);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isMobileNav ? "outline" : "ghost"}
          size="sm"
          className={
            isMobileNav
              ? "w-full justify-start h-10 px-3 text-sm"
              : "h-6 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap transform-none will-change-auto"
          }
          style={{
            transform: 'none',
            willChange: 'auto'
          }}
        >
          <FileText className={isMobileNav ? "h-4 w-4 mr-2" : "h-3 w-3 sm:h-4 sm:w-4 mr-1"} />
          File
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align="start"
        className="w-48"
        style={{
          backgroundColor: currentTheme?.surface || undefined,
          borderColor: currentTheme?.accent || undefined,
          color: textColor,
          position: 'fixed',
          transform: 'none',
          willChange: 'auto'
        }}
      >
        <DropdownMenuItem onClick={onLoadFile}>
          <Upload className="h-4 w-4 mr-2" />
          Open File
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onSaveMarkdown}>
          <Save className="h-4 w-4 mr-2" />
          Save as Markdown
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onExportHtml}>
          <Download className="h-4 w-4 mr-2" />
          Export as HTML
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onExportJson}>
          <FileUp className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

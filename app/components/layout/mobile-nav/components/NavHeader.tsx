/**
 * Komponen header untuk mobile navigation
 * Menangani menu button, file name input, dan quick actions
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu } from "lucide-react";
import { NavHeaderProps } from '../types/navTypes';
import { QuickActions } from './QuickActions';

export const NavHeader: React.FC<NavHeaderProps> = ({
  currentTheme,
  fileName,
  onFileNameChange,
  onMenuToggle,
  onSearch,
  showPreview,
  onTogglePreview,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  return (
    <div className="flex items-center justify-between p-3 border-b backdrop-blur-md bg-white/80 dark:bg-gray-900/80">
      {/* Left: Menu Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0 flex-shrink-0"
        onClick={onMenuToggle}
        aria-label="Open navigation menu"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Center: File Name Input */}
      <div className="flex-1 text-center px-2 min-w-0">
        <Input
          value={fileName}
          onChange={(e) => onFileNameChange(e.target.value)}
          className="mobile-filename-input text-sm font-medium text-center border-0 bg-transparent focus:bg-white/50 dark:focus:bg-gray-800/50 h-8 px-2"
          style={{
            color: currentTheme.text,
            borderColor: currentTheme.accent
          }}
          placeholder="Enter file name..."
          aria-label="File name"
        />
      </div>

      {/* Right: Quick Actions */}
      <QuickActions
        onSearch={onSearch}
        showPreview={showPreview}
        onTogglePreview={onTogglePreview}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  );
};

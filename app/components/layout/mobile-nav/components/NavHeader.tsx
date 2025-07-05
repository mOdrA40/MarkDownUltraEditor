/**
 * Komponen header untuk mobile navigation
 * Menangani menu button, file name input, dan quick actions
 */

import { Menu } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateHeaderStyles, getHeaderClassName } from '@/utils/themeUtils';
import type { NavHeaderProps } from '../types/navTypes';
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
  canRedo,
}) => {
  // Get theme-based header styling
  const headerClassName = getHeaderClassName(currentTheme);
  const headerStyles = generateHeaderStyles(currentTheme);

  return (
    <div
      className={`mobile-nav-header flex items-center justify-between p-3 border-b backdrop-blur-md ${headerClassName}`}
      style={{
        ...headerStyles,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
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
            borderColor: currentTheme.accent,
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

/**
 * Toolbar Component
 * Komponen utama toolbar markdown dengan responsive layout
 *
 * @author Axel Modra
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useKeyboardShortcuts, useToolbar } from '../hooks/useToolbar';
import type { ToolbarProps } from '../types/toolbar.types';
import { DesktopToolbar } from './DesktopToolbar';
import { MobileToolbar } from './MobileToolbar';
import { TabletToolbar } from './TabletToolbar';

/**
 * Komponen Toolbar
 * Menampilkan toolbar markdown dengan layout yang responsif
 * Secara otomatis memilih layout yang tepat berdasarkan ukuran layar
 *
 * @param props - Props untuk komponen
 * @returns JSX Element
 */
export const Toolbar: React.FC<ToolbarProps> = React.memo(
  ({
    onInsertText,
    className,
    compact = false,
    disabled = false,
    customButtons = [],
    currentTheme,
  }) => {
    // Menggunakan custom hook untuk toolbar logic
    const { filteredButtons, currentBreakpoint, isMobile, isTablet, isDesktop } = useToolbar({
      onInsertText,
      customButtons,
    });

    // Setup keyboard shortcuts
    useKeyboardShortcuts({
      buttons: filteredButtons,
      enabled: !disabled,
    });

    // Jika disabled, tampilkan placeholder
    if (disabled) {
      return (
        <div
          className={cn(
            'w-full px-4 py-2 border-b bg-muted/50',
            'flex items-center justify-center',
            'text-sm text-muted-foreground',
            className
          )}
        >
          Toolbar disabled
        </div>
      );
    }

    return (
      <div className={cn('w-full', className)}>
        {/* Mobile Layout (320px - 499px) */}
        {isMobile && (
          <MobileToolbar
            formatButtons={filteredButtons}
            onInsertText={onInsertText}
            currentTheme={currentTheme}
          />
        )}

        {/* Tablet Layout (500px - 1279px) */}
        {isTablet && (
          <TabletToolbar
            formatButtons={filteredButtons}
            onInsertText={onInsertText}
            compact={currentBreakpoint === 'smallTablet' || compact}
            currentTheme={currentTheme}
          />
        )}

        {/* Desktop Layout (1280px+) */}
        {isDesktop && (
          <DesktopToolbar
            formatButtons={filteredButtons}
            onInsertText={onInsertText}
            currentTheme={currentTheme}
          />
        )}
      </div>
    );
  }
);

// Set display name untuk debugging
Toolbar.displayName = 'Toolbar';

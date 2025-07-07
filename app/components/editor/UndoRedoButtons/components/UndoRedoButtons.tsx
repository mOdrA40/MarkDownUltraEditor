/**
 * UndoRedoButtons Component
 * Komponen utama untuk undo/redo dengan responsive layout
 *
 * @author Axel Modra
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { addEventListenerWithCleanup } from '@/utils/common';
import { useKeyboardShortcuts, useUndoRedoState } from '../hooks/useKeyboardShortcuts';
import type { UndoRedoButtonsProps } from '../types/undoRedo.types';
import { DesktopUndoRedo } from './DesktopUndoRedo';
import { MobileUndoRedo } from './MobileUndoRedo';
import { TabletUndoRedo } from './TabletUndoRedo';

/**
 * Komponen UndoRedoButtons
 * Menampilkan undo/redo buttons dengan layout yang responsif
 * Secara otomatis memilih layout yang tepat berdasarkan ukuran layar
 *
 * @param props - Props untuk komponen
 * @returns JSX Element
 */
export const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = React.memo(
  ({
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    isMobile = false,
    isTablet = false,
    className,
    disabled = false,
    currentTheme,
  }) => {
    // State untuk window width (untuk auto-detection jika tidak ada props)
    const [windowWidth, setWindowWidth] = useState<number>(
      typeof window !== 'undefined' ? window.innerWidth : 1280
    );

    // Effect untuk mendengarkan resize window
    useEffect(() => {
      if (typeof window === 'undefined') return;

      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      return addEventListenerWithCleanup(window, 'resize', handleResize);
    }, []);

    // Auto-detect responsive mode jika tidak ada props
    const autoIsMobile = windowWidth <= 499;
    const autoIsTablet = windowWidth >= 500 && windowWidth <= 1023;

    // Gunakan props jika ada, fallback ke auto-detection
    const finalIsMobile = isMobile || autoIsMobile;
    const finalIsTablet = isTablet || autoIsTablet;

    // Setup keyboard shortcuts
    useKeyboardShortcuts({
      onUndo,
      onRedo,
      canUndo,
      canRedo,
      isMobile: finalIsMobile,
      isTablet: finalIsTablet,
      enabled: !disabled,
    });

    // Setup state management dengan validation
    const { handleUndo, handleRedo, canPerformUndo, canPerformRedo } = useUndoRedoState({
      onUndo,
      onRedo,
      canUndo,
      canRedo,
      disabled,
    });

    // Jika disabled, tampilkan placeholder atau hidden
    if (disabled) {
      return (
        <div className={cn('flex items-center space-x-1 opacity-50', className)}>
          <div className="text-xs text-muted-foreground">Undo/Redo disabled</div>
        </div>
      );
    }

    // Mobile Layout (≤499px)
    if (finalIsMobile) {
      return (
        <MobileUndoRedo
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canPerformUndo}
          canRedo={canPerformRedo}
          className={className}
          currentTheme={currentTheme}
        />
      );
    }

    // Tablet Layout (500px-1023px)
    if (finalIsTablet) {
      return (
        <TabletUndoRedo
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canPerformUndo}
          canRedo={canPerformRedo}
          className={className}
          currentTheme={currentTheme}
        />
      );
    }

    // Desktop Layout (≥1024px)
    return (
      <DesktopUndoRedo
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canPerformUndo}
        canRedo={canPerformRedo}
        className={className}
        currentTheme={currentTheme}
      />
    );
  }
);

// Set display name untuk debugging
UndoRedoButtons.displayName = 'UndoRedoButtons';

/**
 * Keyboard Shortcuts Hook
 * Custom hook untuk mengelola keyboard shortcuts undo/redo
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useEffect, useCallback } from 'react';
import type { KeyboardShortcutConfig } from '../types/undoRedo.types';
import { DEFAULT_KEYBOARD_SHORTCUTS, matchesShortcut } from '../utils/undoRedo.utils';

/**
 * Props untuk useKeyboardShortcuts hook
 */
interface UseKeyboardShortcutsProps {
  /** Callback untuk undo action */
  onUndo: () => void;
  /** Callback untuk redo action */
  onRedo: () => void;
  /** Apakah undo tersedia */
  canUndo: boolean;
  /** Apakah redo tersedia */
  canRedo: boolean;
  /** Apakah dalam mode mobile */
  isMobile?: boolean;
  /** Apakah dalam mode tablet */
  isTablet?: boolean;
  /** Apakah shortcuts diaktifkan */
  enabled?: boolean;
  /** Custom shortcut configuration */
  shortcuts?: KeyboardShortcutConfig;
}

/**
 * Return type untuk useKeyboardShortcuts hook
 */
interface UseKeyboardShortcutsReturn {
  /** Shortcut configuration yang digunakan */
  shortcuts: KeyboardShortcutConfig;
  /** Apakah shortcuts aktif */
  isEnabled: boolean;
}

/**
 * Custom hook untuk mengelola keyboard shortcuts undo/redo
 * Hanya aktif pada desktop untuk menghindari konflik dengan mobile/tablet
 * 
 * @param props - Props untuk hook
 * @returns Object dengan shortcut configuration dan status
 */
export const useKeyboardShortcuts = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isMobile = false,
  isTablet = false,
  enabled = true,
  shortcuts = DEFAULT_KEYBOARD_SHORTCUTS
}: UseKeyboardShortcutsProps): UseKeyboardShortcutsReturn => {
  
  // Shortcuts hanya aktif pada desktop
  const isEnabled = enabled && !isMobile && !isTablet;

  /**
   * Handler untuk keyboard events
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Cek undo shortcut
    if (matchesShortcut(event, shortcuts.undo)) {
      event.preventDefault();
      if (canUndo) {
        onUndo();
      }
      return;
    }

    // Cek redo shortcut
    if (matchesShortcut(event, shortcuts.redo)) {
      event.preventDefault();
      if (canRedo) {
        onRedo();
      }
      return;
    }

    // Cek alternative redo shortcut (Ctrl+Shift+Z)
    if (
      event.key.toLowerCase() === 'z' &&
      event.ctrlKey &&
      event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      if (canRedo) {
        onRedo();
      }
      return;
    }
  }, [onUndo, onRedo, canUndo, canRedo, shortcuts]);

  /**
   * Effect untuk menambah/menghapus event listener
   */
  useEffect(() => {
    if (!isEnabled) return;

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, isEnabled]);

  return {
    shortcuts,
    isEnabled
  };
};

/**
 * Props untuk useUndoRedoState hook
 */
interface UseUndoRedoStateProps {
  /** Callback untuk undo */
  onUndo: () => void;
  /** Callback untuk redo */
  onRedo: () => void;
  /** Apakah undo tersedia */
  canUndo: boolean;
  /** Apakah redo tersedia */
  canRedo: boolean;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Return type untuk useUndoRedoState hook
 */
interface UseUndoRedoStateReturn {
  /** Handler untuk undo dengan validation */
  handleUndo: () => void;
  /** Handler untuk redo dengan validation */
  handleRedo: () => void;
  /** Apakah undo dapat dilakukan */
  canPerformUndo: boolean;
  /** Apakah redo dapat dilakukan */
  canPerformRedo: boolean;
}

/**
 * Custom hook untuk mengelola state dan handlers undo/redo
 * Menambahkan validation dan error handling
 * 
 * @param props - Props untuk hook
 * @returns Object dengan handlers dan state
 */
export const useUndoRedoState = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  disabled = false
}: UseUndoRedoStateProps): UseUndoRedoStateReturn => {
  
  /**
   * Handler untuk undo dengan validation
   */
  const handleUndo = useCallback(() => {
    if (!disabled && canUndo && typeof onUndo === 'function') {
      try {
        onUndo();
      } catch (error) {
        console.error('Error during undo operation:', error);
      }
    }
  }, [onUndo, canUndo, disabled]);

  /**
   * Handler untuk redo dengan validation
   */
  const handleRedo = useCallback(() => {
    if (!disabled && canRedo && typeof onRedo === 'function') {
      try {
        onRedo();
      } catch (error) {
        console.error('Error during redo operation:', error);
      }
    }
  }, [onRedo, canRedo, disabled]);

  // State yang sudah divalidasi
  const canPerformUndo = !disabled && canUndo;
  const canPerformRedo = !disabled && canRedo;

  return {
    handleUndo,
    handleRedo,
    canPerformUndo,
    canPerformRedo
  };
};

/**
 * Props untuk useResponsiveUndoRedo hook
 */
interface UseResponsiveUndoRedoProps {
  /** Window width saat ini */
  windowWidth?: number;
}

/**
 * Return type untuk useResponsiveUndoRedo hook
 */
interface UseResponsiveUndoRedoReturn {
  /** Apakah dalam mode mobile */
  isMobile: boolean;
  /** Apakah dalam mode tablet */
  isTablet: boolean;
  /** Apakah dalam mode desktop */
  isDesktop: boolean;
  /** Breakpoint saat ini */
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Custom hook untuk mendeteksi responsive breakpoints
 * 
 * @param props - Props untuk hook
 * @returns Object dengan responsive state
 */
export const useResponsiveUndoRedo = ({
  windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
}: UseResponsiveUndoRedoProps = {}): UseResponsiveUndoRedoReturn => {
  
  // Tentukan breakpoint berdasarkan window width
  const isMobile = windowWidth <= 499;
  const isTablet = windowWidth >= 500 && windowWidth <= 1023;
  const isDesktop = windowWidth >= 1024;

  // Tentukan breakpoint string
  let breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (isMobile) {
    breakpoint = 'mobile';
  } else if (isTablet) {
    breakpoint = 'tablet';
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    breakpoint
  };
};

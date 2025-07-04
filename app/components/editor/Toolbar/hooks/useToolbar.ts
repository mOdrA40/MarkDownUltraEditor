/**
 * Toolbar Hooks
 * Custom hooks untuk mengelola state dan logic toolbar
 *
 * @author Axel Modra
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormatButton, ButtonCategory } from '../types/toolbar.types';
import {
  createFormatButtons,
  createCodeBlockAction,
  filterButtonsByCategory,
  groupButtonsByCategory,
  getBreakpoint,
  getBreakpointConfig,
  matchesShortcut,
} from '../utils/toolbar.utils';

/**
 * Props untuk useToolbar hook
 */
interface UseToolbarProps {
  /** Callback untuk insert text ke editor */
  onInsertText: (text: string) => void;
  /** Kategori buttons yang diaktifkan */
  enabledCategories?: ButtonCategory[];
  /** Custom format buttons */
  customButtons?: FormatButton[];
}

/**
 * Return type untuk useToolbar hook
 */
interface UseToolbarReturn {
  /** Semua format buttons yang tersedia */
  formatButtons: FormatButton[];
  /** Buttons yang difilter berdasarkan kategori */
  filteredButtons: FormatButton[];
  /** Buttons yang digroup berdasarkan kategori */
  groupedButtons: Record<ButtonCategory, FormatButton[]>;
  /** Action untuk insert code block */
  insertCodeBlock: () => void;
  /** Breakpoint saat ini */
  currentBreakpoint: keyof typeof import('../constants/formatButtons.constants').RESPONSIVE_BREAKPOINTS;
  /** Konfigurasi breakpoint saat ini */
  breakpointConfig: ReturnType<typeof getBreakpointConfig>;
  /** Apakah dalam mode mobile */
  isMobile: boolean;
  /** Apakah dalam mode tablet */
  isTablet: boolean;
  /** Apakah dalam mode desktop */
  isDesktop: boolean;
}

/**
 * Custom hook untuk mengelola toolbar state dan logic
 *
 * @param props - Props untuk hook
 * @returns Object dengan state dan functions untuk toolbar
 */
export const useToolbar = ({
  onInsertText,
  enabledCategories = ['heading', 'formatting', 'code', 'content', 'list', 'media'],
  customButtons = [],
}: UseToolbarProps): UseToolbarReturn => {
  // State untuk window width
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  // Effect untuk mendengarkan resize window
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoized format buttons
  const formatButtons = useMemo(() => {
    const defaultButtons = createFormatButtons(onInsertText);
    return [...defaultButtons, ...customButtons];
  }, [onInsertText, customButtons]);

  // Filtered buttons berdasarkan kategori yang diaktifkan
  const filteredButtons = useMemo(() => {
    return filterButtonsByCategory(formatButtons, enabledCategories);
  }, [formatButtons, enabledCategories]);

  // Grouped buttons berdasarkan kategori
  const groupedButtons = useMemo(() => {
    return groupButtonsByCategory(filteredButtons);
  }, [filteredButtons]);

  // Code block action
  const insertCodeBlock = useCallback(() => {
    createCodeBlockAction(onInsertText)();
  }, [onInsertText]);

  // Current breakpoint
  const currentBreakpoint = useMemo(() => {
    return getBreakpoint(windowWidth);
  }, [windowWidth]);

  // Breakpoint config
  const breakpointConfig = useMemo(() => {
    return getBreakpointConfig(currentBreakpoint);
  }, [currentBreakpoint]);

  // Responsive flags
  const isMobile = currentBreakpoint === 'mobile';
  const isTablet = currentBreakpoint === 'smallTablet' || currentBreakpoint === 'tablet';
  const isDesktop = currentBreakpoint === 'desktop';

  return {
    formatButtons,
    filteredButtons,
    groupedButtons,
    insertCodeBlock,
    currentBreakpoint,
    breakpointConfig,
    isMobile,
    isTablet,
    isDesktop,
  };
};

/**
 * Props untuk useKeyboardShortcuts hook
 */
interface UseKeyboardShortcutsProps {
  /** Format buttons dengan shortcuts */
  buttons: FormatButton[];
  /** Apakah shortcuts diaktifkan */
  enabled?: boolean;
}

/**
 * Custom hook untuk mengelola keyboard shortcuts toolbar
 *
 * @param props - Props untuk hook
 */
export const useKeyboardShortcuts = ({
  buttons,
  enabled = true,
}: UseKeyboardShortcutsProps): void => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Cari button yang match dengan shortcut
      const matchingButton = buttons.find(
        (button) => button.shortcut && matchesShortcut(event, button.shortcut)
      );

      if (matchingButton) {
        event.preventDefault();
        matchingButton.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [buttons, enabled]);
};

/**
 * Props untuk useResponsiveLayout hook
 */
interface UseResponsiveLayoutProps {
  /** Breakpoint saat ini */
  breakpoint: keyof typeof import('../constants/formatButtons.constants').RESPONSIVE_BREAKPOINTS;
  /** Format buttons */
  buttons: FormatButton[];
}

/**
 * Return type untuk useResponsiveLayout hook
 */
interface UseResponsiveLayoutReturn {
  /** Layout yang akan digunakan */
  layout: 'grid' | 'flex' | 'single-row';
  /** Jumlah kolom untuk grid */
  gridColumns: number;
  /** Chunks buttons untuk layout */
  buttonChunks: FormatButton[][];
  /** CSS classes untuk container */
  containerClasses: string;
  /** CSS classes untuk buttons */
  buttonClasses: string;
}

/**
 * Custom hook untuk mengelola responsive layout
 *
 * @param props - Props untuk hook
 * @returns Object dengan layout configuration
 */
export const useResponsiveLayout = ({
  breakpoint,
  buttons,
}: UseResponsiveLayoutProps): UseResponsiveLayoutReturn => {
  const config = getBreakpointConfig(breakpoint);

  // Tentukan layout berdasarkan breakpoint
  const layout = useMemo(() => {
    if (breakpoint === 'mobile') return 'grid';
    if (breakpoint === 'desktop') return 'single-row';
    return 'flex';
  }, [breakpoint]);

  // Grid columns
  const gridColumns = config.buttonsPerRow;

  // Button chunks untuk grid layout
  const buttonChunks = useMemo(() => {
    if (layout !== 'grid') return [buttons];

    const chunks: FormatButton[][] = [];
    for (let i = 0; i < buttons.length; i += gridColumns) {
      chunks.push(buttons.slice(i, i + gridColumns));
    }
    return chunks;
  }, [buttons, gridColumns, layout]);

  // Container classes
  const containerClasses = useMemo(() => {
    const baseClasses = ['w-full'];

    if (breakpoint === 'mobile') {
      baseClasses.push('block', 'sm:hidden');
    } else if (breakpoint === 'smallTablet') {
      baseClasses.push(
        'hidden',
        'sm:block',
        'md:hidden',
        'px-2',
        'py-2',
        'border-b',
        'bg-background/50',
        'backdrop-blur'
      );
    } else if (breakpoint === 'tablet') {
      baseClasses.push(
        'hidden',
        'md:block',
        'xl:hidden',
        'px-3',
        'py-2',
        'border-b',
        'bg-background/50',
        'backdrop-blur'
      );
    } else {
      baseClasses.push(
        'hidden',
        'xl:block',
        'px-4',
        'py-2',
        'border-b',
        'bg-background/50',
        'backdrop-blur'
      );
    }

    return baseClasses.join(' ');
  }, [breakpoint]);

  // Button classes
  const buttonClasses = useMemo(() => {
    const baseClasses = ['transition-all', 'duration-200', 'hover:scale-105', 'active:scale-95'];

    if (breakpoint === 'mobile') {
      baseClasses.push('h-9', 'text-xs', 'font-medium');
    } else if (breakpoint === 'smallTablet') {
      baseClasses.push('h-6', 'px-2', 'text-xs', 'flex-shrink-0');
    } else if (breakpoint === 'tablet') {
      baseClasses.push('h-7', 'px-3', 'text-xs');
    } else {
      baseClasses.push('h-8', 'text-xs');
    }

    return baseClasses.join(' ');
  }, [breakpoint]);

  return {
    layout,
    gridColumns,
    buttonChunks,
    containerClasses,
    buttonClasses,
  };
};

/**
 * Toolbar Utilities
 * Fungsi-fungsi utility untuk operasi toolbar
 *
 * @author Axel Modra
 */

import {
  FORMAT_BUTTON_CONFIGS,
  type FormatButtonConfig,
  MARKDOWN_TEMPLATES,
  RESPONSIVE_BREAKPOINTS,
} from '../constants/formatButtons.constants';
import type { ButtonCategory, FormatButton } from '../types/toolbar.types';

/**
 * Membuat format button dengan action callback
 * @param config - Konfigurasi button
 * @param onInsertText - Callback untuk insert text
 * @returns Format button dengan action
 */
export const createFormatButton = (
  config: FormatButtonConfig,
  onInsertText: (text: string) => void
): FormatButton => ({
  ...config,
  action: () => onInsertText(config.template),
});

/**
 * Membuat semua format buttons dengan action callbacks
 * @param onInsertText - Callback untuk insert text
 * @returns Array format buttons
 */
export const createFormatButtons = (onInsertText: (text: string) => void): FormatButton[] => {
  return FORMAT_BUTTON_CONFIGS.map((config) => createFormatButton(config, onInsertText));
};

/**
 * Membuat action untuk insert code block
 * @param onInsertText - Callback untuk insert text
 * @returns Function untuk insert code block
 */
export const createCodeBlockAction = (onInsertText: (text: string) => void) => {
  return () => onInsertText(MARKDOWN_TEMPLATES.codeBlock.template);
};

/**
 * Filter buttons berdasarkan kategori
 * @param buttons - Array format buttons
 * @param categories - Kategori yang diinginkan
 * @returns Filtered buttons
 */
export const filterButtonsByCategory = (
  buttons: FormatButton[],
  categories: ButtonCategory[]
): FormatButton[] => {
  return buttons.filter((button) => button.category && categories.includes(button.category));
};

/**
 * Group buttons berdasarkan kategori
 * @param buttons - Array format buttons
 * @returns Object dengan buttons yang digroup
 */
export const groupButtonsByCategory = (
  buttons: FormatButton[]
): Record<ButtonCategory, FormatButton[]> => {
  const groups: Partial<Record<ButtonCategory, FormatButton[]>> = {};

  buttons.forEach((button) => {
    if (button.category) {
      if (!groups[button.category]) {
        groups[button.category] = [];
      }
      groups[button.category]!.push(button);
    }
  });

  return groups as Record<ButtonCategory, FormatButton[]>;
};

/**
 * Mendapatkan breakpoint berdasarkan lebar layar
 * @param width - Lebar layar dalam pixel
 * @returns Nama breakpoint
 */
export const getBreakpoint = (width: number): keyof typeof RESPONSIVE_BREAKPOINTS => {
  if (width <= RESPONSIVE_BREAKPOINTS.mobile.max) {
    return 'mobile';
  }
  if (width <= RESPONSIVE_BREAKPOINTS.smallTablet.max) {
    return 'smallTablet';
  }
  if (width <= RESPONSIVE_BREAKPOINTS.tablet.max) {
    return 'tablet';
  }
  return 'desktop';
};

/**
 * Mendapatkan konfigurasi untuk breakpoint tertentu
 * @param breakpoint - Nama breakpoint
 * @returns Konfigurasi breakpoint
 */
export const getBreakpointConfig = (breakpoint: keyof typeof RESPONSIVE_BREAKPOINTS) => {
  return RESPONSIVE_BREAKPOINTS[breakpoint];
};

/**
 * Membagi buttons menjadi chunks untuk layout grid
 * @param buttons - Array format buttons
 * @param chunkSize - Ukuran setiap chunk
 * @returns Array of button chunks
 */
export const chunkButtons = <T>(buttons: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < buttons.length; i += chunkSize) {
    chunks.push(buttons.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Mendapatkan CSS classes untuk button berdasarkan breakpoint
 * @param breakpoint - Nama breakpoint
 * @param customClasses - CSS classes tambahan
 * @returns String CSS classes
 */
export const getButtonClasses = (
  breakpoint: keyof typeof RESPONSIVE_BREAKPOINTS,
  customClasses?: string
): string => {
  const baseClasses = [
    'transition-all',
    'duration-200',
    'hover:scale-105',
    'active:scale-95',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-blue-500',
  ];

  // Tambahkan classes berdasarkan breakpoint
  if (breakpoint === 'mobile') {
    baseClasses.push('h-9', 'text-xs', 'font-medium');
  } else if (breakpoint === 'smallTablet') {
    baseClasses.push('h-6', 'px-2', 'text-xs', 'flex-shrink-0');
  } else if (breakpoint === 'tablet') {
    baseClasses.push('h-7', 'px-3', 'text-xs');
  } else {
    baseClasses.push('h-8', 'text-xs');
  }

  if (customClasses) {
    baseClasses.push(customClasses);
  }

  return baseClasses.join(' ');
};

/**
 * Mendapatkan CSS classes untuk container berdasarkan breakpoint
 * @param breakpoint - Nama breakpoint
 * @returns String CSS classes
 */
export const getContainerClasses = (breakpoint: keyof typeof RESPONSIVE_BREAKPOINTS): string => {
  const baseClasses = ['w-full'];

  if (breakpoint === 'mobile') {
    return baseClasses.concat(['block', 'sm:hidden']).join(' ');
  }
  if (breakpoint === 'smallTablet') {
    return baseClasses
      .concat([
        'hidden',
        'sm:block',
        'md:hidden',
        'px-2',
        'py-2',
        'border-b',
        'bg-background/50',
        'backdrop-blur',
      ])
      .join(' ');
  }
  if (breakpoint === 'tablet') {
    return baseClasses
      .concat([
        'hidden',
        'md:block',
        'xl:hidden',
        'px-3',
        'py-2',
        'border-b',
        'bg-background/50',
        'backdrop-blur',
      ])
      .join(' ');
  }
  return baseClasses
    .concat(['hidden', 'xl:block', 'px-4', 'py-2', 'border-b', 'bg-background/50', 'backdrop-blur'])
    .join(' ');
};

/**
 * Validasi markdown template
 * @param template - Template yang akan divalidasi
 * @returns True jika valid, false jika tidak
 */
export const isValidMarkdownTemplate = (template: string): boolean => {
  return typeof template === 'string' && template.length > 0;
};

/**
 * Escape markdown characters
 * @param text - Text yang akan di-escape
 * @returns Text yang sudah di-escape
 */
export const escapeMarkdown = (text: string): string => {
  return text.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&');
};

/**
 * Parse shortcut string menjadi key combination
 * @param shortcut - String shortcut (e.g., "Ctrl+B")
 * @returns Object dengan key combination
 */
export const parseShortcut = (
  shortcut: string
): {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
} => {
  const parts = shortcut.toLowerCase().split('+');
  return {
    ctrl: parts.includes('ctrl'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    key: parts[parts.length - 1],
  };
};

/**
 * Check apakah keyboard event match dengan shortcut
 * @param event - Keyboard event
 * @param shortcut - String shortcut
 * @returns True jika match, false jika tidak
 */
export const matchesShortcut = (event: KeyboardEvent, shortcut: string): boolean => {
  const parsed = parseShortcut(shortcut);
  return (
    event.ctrlKey === parsed.ctrl &&
    event.shiftKey === parsed.shift &&
    event.altKey === parsed.alt &&
    event.key.toLowerCase() === parsed.key
  );
};

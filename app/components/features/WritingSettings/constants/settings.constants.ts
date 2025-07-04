/**
 * WritingSettings Constants - Konfigurasi dan Konstanta
 * Definisi konstanta untuk WritingSettings module
 *
 * @author Axel Modra
 */

import type {
  BreakpointType,
  ControlSize,
  SettingsConfig,
  WritingModeConfig,
} from '../types/settings.types';

/**
 * Konstanta untuk batasan font size
 */
export const FONT_SIZE_CONSTRAINTS = {
  /** Ukuran font minimum */
  MIN: 12,
  /** Ukuran font maksimum */
  MAX: 24,
  /** Step perubahan font size */
  STEP: 1,
  /** Default font size */
  DEFAULT: 16,
} as const;

/**
 * Konstanta untuk batasan line height
 */
export const LINE_HEIGHT_CONSTRAINTS = {
  /** Line height minimum */
  MIN: 1.2,
  /** Line height maksimum */
  MAX: 2.5,
  /** Step perubahan line height */
  STEP: 0.1,
  /** Default line height */
  DEFAULT: 1.5,
} as const;

/**
 * Konfigurasi default untuk settings
 */
export const DEFAULT_SETTINGS: SettingsConfig = {
  minFontSize: FONT_SIZE_CONSTRAINTS.MIN,
  maxFontSize: FONT_SIZE_CONSTRAINTS.MAX,
  minLineHeight: LINE_HEIGHT_CONSTRAINTS.MIN,
  maxLineHeight: LINE_HEIGHT_CONSTRAINTS.MAX,
  fontSizeStep: FONT_SIZE_CONSTRAINTS.STEP,
  lineHeightStep: LINE_HEIGHT_CONSTRAINTS.STEP,
};

/**
 * Konfigurasi writing modes
 */
export const WRITING_MODES: Record<string, WritingModeConfig> = {
  focus: {
    id: 'focus',
    label: 'Focus',
    iconName: 'Focus',
    description: 'Highlight current paragraph for better focus',
    defaultActive: false,
  },
  typewriter: {
    id: 'typewriter',
    label: 'Writer',
    iconName: 'Type',
    description: 'Typewriter mode for distraction-free writing',
    defaultActive: false,
  },
  wordWrap: {
    id: 'wordWrap',
    label: 'Wrap',
    iconName: 'AlignLeft',
    description: 'Enable word wrapping for long lines',
    defaultActive: true,
  },
  vim: {
    id: 'vim',
    label: 'Vim',
    iconName: 'Keyboard',
    description: 'Enable Vim keybindings for power users',
    defaultActive: false,
  },
  zen: {
    id: 'zen',
    label: 'Zen',
    iconName: 'Eye',
    description: 'Zen mode for distraction-free writing',
    defaultActive: false,
  },
} as const;

/**
 * Breakpoints untuk responsive design
 */
export const BREAKPOINTS = {
  /** Mobile breakpoint (320px - 499px) */
  mobile: {
    min: 320,
    max: 499,
    type: 'mobile' as BreakpointType,
  },
  /** Small tablet breakpoint (500px - 767px) */
  smallTablet: {
    min: 500,
    max: 767,
    type: 'small-tablet' as BreakpointType,
  },
  /** Tablet breakpoint (768px - 1023px) */
  tablet: {
    min: 768,
    max: 1023,
    type: 'tablet' as BreakpointType,
  },
  /** Desktop breakpoint (1024px+) */
  desktop: {
    min: 1024,
    max: Number.POSITIVE_INFINITY,
    type: 'desktop' as BreakpointType,
  },
} as const;

/**
 * Ukuran control yang tersedia
 */
export const CONTROL_SIZES: Record<
  ControlSize,
  {
    button: string;
    icon: string;
    text: string;
    spacing: string;
  }
> = {
  sm: {
    button: 'h-5 w-5 p-0',
    icon: 'h-2 w-2',
    text: 'text-xs',
    spacing: 'space-x-1',
  },
  md: {
    button: 'h-6 w-6 p-0',
    icon: 'h-3 w-3',
    text: 'text-xs',
    spacing: 'space-x-1',
  },
  lg: {
    button: 'h-7 w-7 p-0',
    icon: 'h-3 w-3',
    text: 'text-sm',
    spacing: 'space-x-2',
  },
} as const;

/**
 * CSS classes untuk responsive layouts
 */
export const RESPONSIVE_CLASSES = {
  mobile: {
    container: 'block sm:hidden space-y-4',
    fontControl: 'flex items-center justify-between',
    lineControl: 'flex items-center justify-between',
    modeButtons: 'grid grid-cols-2 gap-2',
    zenButton: 'w-full h-9 text-xs',
  },
  'small-tablet': {
    container:
      'hidden sm:flex md:hidden items-center space-x-1 px-2 py-2 bg-background/50 backdrop-blur border-b overflow-x-auto',
    control: 'flex items-center space-x-1 flex-shrink-0',
    button: 'h-6 px-2 text-xs flex-shrink-0',
    separator: 'h-3',
  },
  tablet: {
    container:
      'hidden md:flex lg:hidden items-center space-x-2 px-3 py-2 bg-background/50 backdrop-blur border-b',
    control: 'flex items-center space-x-1',
    button: 'h-7 text-xs',
    separator: 'h-4',
  },
  desktop: {
    container:
      'hidden lg:flex items-center space-x-2 px-4 py-2 bg-background/50 backdrop-blur border-b',
    control: 'flex items-center space-x-1',
    button: 'h-7 text-xs',
    separator: 'h-4',
  },
} as const;

/**
 * Animasi dan transisi
 */
export const ANIMATIONS = {
  /** Durasi transisi default */
  duration: '0.2s',
  /** Easing function */
  easing: 'ease-in-out',
  /** Hover scale */
  hoverScale: 'scale-105',
  /** Active scale */
  activeScale: 'scale-95',
} as const;

/**
 * Accessibility constants
 */
export const A11Y = {
  /** Minimum touch target size (44px) */
  minTouchTarget: 44,
  /** ARIA labels */
  labels: {
    fontSizeIncrease: 'Increase font size',
    fontSizeDecrease: 'Decrease font size',
    lineHeightIncrease: 'Increase line height',
    lineHeightDecrease: 'Decrease line height',
    toggleFocus: 'Toggle focus mode',
    toggleTypewriter: 'Toggle typewriter mode',
    toggleWordWrap: 'Toggle word wrap',
    toggleVim: 'Toggle Vim mode',
    toggleZen: 'Toggle zen mode',
  },
} as const;

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  fontSizeIncrease: 'Ctrl+=',
  fontSizeDecrease: 'Ctrl+-',
  toggleFocus: 'Ctrl+Shift+F',
  toggleTypewriter: 'Ctrl+Shift+T',
  toggleWordWrap: 'Ctrl+Shift+W',
  toggleVim: 'Ctrl+Shift+V',
  toggleZen: 'Ctrl+Shift+Z',
} as const;

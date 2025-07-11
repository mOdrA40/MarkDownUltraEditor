/**
 * WritingSettings Constants
@author Axel Modra
 */

import { BREAKPOINTS as RESPONSIVE_BREAKPOINTS } from '@/utils/responsive';
import type {
  BreakpointType,
  ControlSize,
  SettingsConfig,
  WritingModeConfig,
} from '../types/settings.types';

/**
 * Font size constraints
 */
export const FONT_SIZE_CONSTRAINTS = {
  MIN: 12,
  MAX: 24,
  STEP: 1,
  DEFAULT: 16,
} as const;

/**
 * Line height constraints
 */
export const LINE_HEIGHT_CONSTRAINTS = {
  MIN: 1.2,
  MAX: 2.5,
  STEP: 0.1,
  DEFAULT: 1.5,
} as const;

/**
 * Default settings
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
 * Writing modes
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
 * Breakpoints
 */

export const BREAKPOINTS = {
  /** Mobile breakpoint */
  mobile: {
    min: RESPONSIVE_BREAKPOINTS.mobileSmall.min,
    max: RESPONSIVE_BREAKPOINTS.mobile.max,
    type: 'mobile' as BreakpointType,
  },
  /** Small tablet breakpoint */
  smallTablet: {
    min: RESPONSIVE_BREAKPOINTS.tabletSmall.min,
    max: RESPONSIVE_BREAKPOINTS.tabletSmall.max,
    type: 'small-tablet' as BreakpointType,
  },
  /** Tablet breakpoint */
  tablet: {
    min: RESPONSIVE_BREAKPOINTS.tabletLarge.min,
    max: RESPONSIVE_BREAKPOINTS.tabletLarge.max,
    type: 'tablet' as BreakpointType,
  },
  /** Desktop breakpoint */
  desktop: {
    min: RESPONSIVE_BREAKPOINTS.desktopSmall.min,
    max: Number.POSITIVE_INFINITY,
    type: 'desktop' as BreakpointType,
  },
} as const;

/**
 * Control sizes
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
 * CSS classes
 */
export const RESPONSIVE_CLASSES = {
  mobile: {
    container: 'block space-y-4',
    fontControl: 'flex items-center justify-between',
    lineControl: 'flex items-center justify-between',
    modeButtons: 'grid grid-cols-2 gap-2',
    zenButton: 'w-full h-9 text-xs',
  },
  'small-tablet': {
    container:
      'flex items-center space-x-1 px-2 py-2 bg-background/50 backdrop-blur border-b overflow-x-auto',
    control: 'flex items-center space-x-1 flex-shrink-0',
    button: 'h-6 px-2 text-xs flex-shrink-0',
    separator: 'h-3',
  },
  tablet: {
    container: 'flex items-center space-x-2 px-3 py-2 bg-background/50 backdrop-blur border-b',
    control: 'flex items-center space-x-1',
    button: 'h-7 text-xs',
    separator: 'h-4',
  },
  desktop: {
    container: 'flex items-center space-x-2 px-4 py-2 bg-background/50 backdrop-blur border-b',
    control: 'flex items-center space-x-1',
    button: 'h-7 text-xs',
    separator: 'h-4',
  },
} as const;

/**
 * Animations
 */
export const ANIMATIONS = {
  /** Default duration */
  duration: '0.2s',
  easing: 'ease-in-out',
  hoverScale: 'scale-105',
  activeScale: 'scale-95',
} as const;

/**
 * Accessibility constants
 */
export const A11Y = {
  minTouchTarget: 44,
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

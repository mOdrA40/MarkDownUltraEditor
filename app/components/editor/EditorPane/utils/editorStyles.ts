/**
 * @fileoverview Editor styling utilities and calculations
 * @author Axel Modra
 */

import type { Theme } from '../../../features/ThemeSelector';
import type { EditorStyles, ResponsiveConfig } from '../types/editorPane.types';

/**
 * Calculate responsive font size and line height based on device type
 */
export const calculateResponsiveConfig = (
  fontSize: number,
  lineHeight: number,
  isMobile: boolean,
  isTablet: boolean
): ResponsiveConfig => {
  const responsiveFontSize = isMobile
    ? Math.max(14, fontSize - 1)
    : isTablet
      ? Math.max(15, fontSize)
      : fontSize;

  const responsiveLineHeight = isMobile ? 1.5 : isTablet ? 1.6 : lineHeight;

  return {
    fontSize: responsiveFontSize,
    lineHeight: responsiveLineHeight,
    isMobileOrTablet: isMobile || isTablet,
  };
};

/**
 * Generate editor styles based on configuration and theme
 */
export const generateEditorStyles = (
  responsiveConfig: ResponsiveConfig,
  wordWrap: boolean,
  theme?: Theme
): EditorStyles => {
  const { fontSize, lineHeight, isMobileOrTablet } = responsiveConfig;

  return {
    fontSize: `${fontSize}px`,
    lineHeight,
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    whiteSpace: isMobileOrTablet ? 'pre-wrap' : wordWrap ? 'pre-wrap' : 'pre',
    backgroundColor: theme?.surface || 'transparent',
    borderColor: theme?.accent || 'transparent',
    wordWrap: isMobileOrTablet ? 'break-word' : wordWrap ? 'break-word' : 'normal',
    overflowWrap: isMobileOrTablet ? 'break-word' : wordWrap ? 'break-word' : 'normal',
    overflowX: isMobileOrTablet ? 'hidden' : 'auto',
    hyphens: isMobileOrTablet ? 'auto' : 'none',
  } as EditorStyles;
};

/**
 * Generate padding styles for textarea based on focus mode
 */
export const generatePaddingStyles = (focusMode: boolean): string => {
  return `1.5rem 1.5rem 1.5rem ${focusMode ? '2rem' : '3.5rem'}`;
};

/**
 * Generate line numbers styles
 */
export const generateLineNumberStyles = (
  fontSize: number,
  lineHeight: number,
  theme?: Theme
): React.CSSProperties => {
  return {
    backgroundColor: theme?.surface ? `${theme.surface}60` : 'rgba(0,0,0,0.03)',
    borderColor: theme?.accent ? `${theme.accent}40` : 'rgba(0,0,0,0.1)',
    color: theme?.text ? `${theme.text}60` : 'rgba(0,0,0,0.4)',
    fontSize: `${Math.max(10, fontSize - 2)}px`,
    lineHeight,
  };
};

/**
 * Convert hex color to rgba with opacity
 */
const hexToRgba = (hex: string, opacity: number): string => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Parse hex to RGB
  const r = Number.parseInt(cleanHex.substring(0, 2), 16);
  const g = Number.parseInt(cleanHex.substring(2, 4), 16);
  const b = Number.parseInt(cleanHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Generate header styles based on theme
 */
export const generateHeaderStyles = (theme?: Theme) => {
  // Use theme surface color with proper opacity, fallback to light gray
  const backgroundColor = theme?.surface
    ? hexToRgba(theme.surface, 0.8)
    : 'rgba(248, 250, 252, 0.8)'; // bg-slate-50 with opacity

  return {
    backgroundColor,
    borderColor: theme?.accent || 'rgba(226, 232, 240, 1)', // border-slate-200
    color: theme?.text || 'inherit',
  };
};

/**
 * Generate focus mode gradient background
 */
export const generateFocusModeGradient = (theme?: Theme): string => {
  const baseColor = theme?.background || 'white';
  return `linear-gradient(to bottom, 
    ${baseColor}00 0%, 
    ${baseColor}40 20%, 
    ${baseColor}40 80%, 
    ${baseColor}00 100%)`;
};

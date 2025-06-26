/**
 * Theme Utilities
 * Utility functions untuk theme management dan styling
 * 
 * @author Axel Modra
 */

import type { Theme } from '@/components/features/ThemeSelector';

/**
 * Convert hex color to rgba with opacity
 */
export const hexToRgba = (hex: string, opacity: number): string => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Generate header class name based on theme
 */
export const getHeaderClassName = (theme?: Theme): string => {
  if (!theme) return 'header-default';
  
  // Map theme IDs to CSS class names
  const themeClassMap: Record<string, string> = {
    'ocean': 'header-ocean',
    'forest': 'header-forest',
    'sunset': 'header-sunset',
    'purple': 'header-purple',
    'rose': 'header-rose',
    'dark': 'header-dark'
  };
  
  return themeClassMap[theme.id] || 'header-default';
};

/**
 * Generate header styles based on theme (fallback for inline styles)
 */
export const generateHeaderStyles = (theme?: Theme) => {
  if (!theme) {
    return {
      backgroundColor: 'rgba(248, 250, 252, 0.8)', // bg-slate-50 with opacity
      borderColor: 'rgba(226, 232, 240, 1)', // border-slate-200
      color: 'inherit'
    };
  }

  // Map specific theme colors for better consistency
  const themeStylesMap: Record<string, any> = {
    'ocean': {
      backgroundColor: 'rgba(224, 242, 254, 0.8)', // ocean surface with opacity
      borderColor: 'rgba(2, 132, 199, 1)', // ocean accent
      color: 'rgba(12, 74, 110, 1)' // ocean text
    },
    'forest': {
      backgroundColor: 'rgba(220, 252, 231, 0.8)', // forest surface with opacity
      borderColor: 'rgba(16, 185, 129, 1)', // forest accent
      color: 'rgba(20, 83, 45, 1)' // forest text
    },
    'sunset': {
      backgroundColor: 'rgba(254, 215, 170, 0.8)', // sunset surface with opacity
      borderColor: 'rgba(249, 115, 22, 1)', // sunset accent
      color: 'rgba(154, 52, 18, 1)' // sunset text
    },
    'purple': {
      backgroundColor: 'rgba(243, 232, 255, 0.8)', // purple surface with opacity
      borderColor: 'rgba(147, 51, 234, 1)', // purple accent
      color: 'rgba(88, 28, 135, 1)' // purple text
    },
    'rose': {
      backgroundColor: 'rgba(255, 228, 230, 0.8)', // rose surface with opacity
      borderColor: 'rgba(244, 63, 94, 1)', // rose accent
      color: 'rgba(159, 18, 57, 1)' // rose text
    },
    'dark': {
      backgroundColor: 'rgba(30, 41, 59, 0.8)', // dark surface with opacity
      borderColor: 'rgba(139, 92, 246, 1)', // dark accent
      color: 'rgba(241, 245, 249, 1)' // dark text
    }
  };

  // Return specific theme styles or fallback to computed styles
  return themeStylesMap[theme.id] || {
    backgroundColor: theme.surface ? hexToRgba(theme.surface, 0.8) : 'rgba(248, 250, 252, 0.8)',
    borderColor: theme.accent || 'rgba(226, 232, 240, 1)',
    color: theme.text || 'inherit'
  };
};

/**
 * Get theme-based text color with contrast
 */
export const getThemeTextColor = (theme?: Theme): string => {
  return theme?.text || 'inherit';
};

/**
 * Get theme-based accent color
 */
export const getThemeAccentColor = (theme?: Theme): string => {
  return theme?.accent || '#3b82f6'; // blue-500 as fallback
};

/**
 * Check if theme is dark mode
 */
export const isDarkTheme = (theme?: Theme): boolean => {
  return theme?.id === 'dark';
};

/**
 * Get contrast color for theme background
 */
export const getContrastColor = (theme?: Theme): string => {
  if (isDarkTheme(theme)) {
    return '#ffffff';
  }
  return '#000000';
};

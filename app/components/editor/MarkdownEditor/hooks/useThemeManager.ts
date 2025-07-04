/**
 * @fileoverview Theme management hook
 * @author Axel Modra
 */

import { useState, useEffect, useCallback } from 'react';
import { type Theme, themes } from '../../../features/ThemeSelector';
import type { UseThemeManagerReturn, ThemeState } from '../types';
import { STORAGE_KEYS, THEME_CONFIG } from '../utils/constants';

/**
 * Custom hook for managing theme state and operations
 * Handles theme switching, persistence, and CSS variable application
 */
export const useThemeManager = (initialTheme?: Theme): UseThemeManagerReturn => {
  // Theme state
  const [currentTheme, setCurrentTheme] = useState<Theme>(initialTheme || themes[0]);

  /**
   * Apply theme to document root
   */
  const applyTheme = useCallback((theme: Theme) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Apply custom CSS properties for backward compatibility
    root.style.setProperty(`${THEME_CONFIG.CSS_VARIABLE_PREFIX}primary`, theme.primary);
    root.style.setProperty(`${THEME_CONFIG.CSS_VARIABLE_PREFIX}secondary`, theme.secondary);
    root.style.setProperty(`${THEME_CONFIG.CSS_VARIABLE_PREFIX}background`, theme.background);
    root.style.setProperty(`${THEME_CONFIG.CSS_VARIABLE_PREFIX}surface`, theme.surface);
    root.style.setProperty(`${THEME_CONFIG.CSS_VARIABLE_PREFIX}text`, theme.text);
    root.style.setProperty(`${THEME_CONFIG.CSS_VARIABLE_PREFIX}accent`, theme.accent);

    // Remove all theme classes first
    document.documentElement.className = document.documentElement.className
      .replace(/theme-\w+/g, '')
      .replace(/\bdark\b/g, '')
      .trim();

    // Handle dark mode class
    if (theme.id === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // Add theme-specific class for non-dark themes
      document.documentElement.classList.add(`theme-${theme.id}`);
    }

    console.log(`🎨 Theme applied: ${theme.id}, classes: ${document.documentElement.className}`);
  }, []);

  /**
   * Save theme to localStorage
   */
  const saveTheme = useCallback((theme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme.id);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, []);

  /**
   * Load saved theme from localStorage
   */
  const loadSavedTheme = useCallback((): Theme | null => {
    try {
      const savedThemeId = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedThemeId) {
        const savedTheme = themes.find((t) => t.id === savedThemeId);
        return savedTheme || null;
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
    return null;
  }, []);

  /**
   * Set theme with all side effects
   */
  const handleSetTheme = useCallback(
    (theme: Theme) => {
      setCurrentTheme(theme);
      applyTheme(theme);
      saveTheme(theme);
    },
    [applyTheme, saveTheme]
  );

  /**
   * Get theme by ID
   */
  const getThemeById = useCallback((themeId: string): Theme | null => {
    return themes.find((theme) => theme.id === themeId) || null;
  }, []);

  /**
   * Get next theme in rotation
   */
  const getNextTheme = useCallback((): Theme => {
    const currentIndex = themes.findIndex((theme) => theme.id === currentTheme.id);
    const nextIndex = (currentIndex + 1) % themes.length;
    return themes[nextIndex];
  }, [currentTheme.id]);

  /**
   * Get previous theme in rotation
   */
  const getPreviousTheme = useCallback((): Theme => {
    const currentIndex = themes.findIndex((theme) => theme.id === currentTheme.id);
    const previousIndex = currentIndex === 0 ? themes.length - 1 : currentIndex - 1;
    return themes[previousIndex];
  }, [currentTheme.id]);

  /**
   * Cycle to next theme
   */
  const cycleToNextTheme = useCallback(() => {
    const nextTheme = getNextTheme();
    handleSetTheme(nextTheme);
  }, [getNextTheme, handleSetTheme]);

  /**
   * Cycle to previous theme
   */
  const cycleToPreviousTheme = useCallback(() => {
    const previousTheme = getPreviousTheme();
    handleSetTheme(previousTheme);
  }, [getPreviousTheme, handleSetTheme]);

  /**
   * Check if current theme is dark
   */
  const isDarkTheme = useCallback((): boolean => {
    return currentTheme.id === 'dark';
  }, [currentTheme.id]);

  /**
   * Toggle between light and dark theme
   */
  const toggleDarkMode = useCallback(() => {
    if (isDarkTheme()) {
      // Switch to default light theme (ocean)
      const lightTheme = themes.find((theme) => theme.id === 'ocean') || themes[0];
      handleSetTheme(lightTheme);
    } else {
      // Switch to dark theme
      const darkTheme = themes.find((theme) => theme.id === 'dark');
      if (darkTheme) {
        handleSetTheme(darkTheme);
      }
    }
  }, [isDarkTheme, handleSetTheme]);

  /**
   * Get theme contrast ratio (for accessibility)
   */
  const getThemeContrastRatio = useCallback((theme: Theme): number => {
    // Simple contrast calculation (can be enhanced)
    const bgLuminance = getLuminance(theme.background);
    const textLuminance = getLuminance(theme.text);
    const lighter = Math.max(bgLuminance, textLuminance);
    const darker = Math.min(bgLuminance, textLuminance);
    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  /**
   * Helper function to calculate luminance
   */
  const getLuminance = (color: string): number => {
    // Simple luminance calculation for hex colors
    const hex = color.replace('#', '');
    const r = Number.parseInt(hex.substring(0, 2), 16) / 255;
    const g = Number.parseInt(hex.substring(2, 4), 16) / 255;
    const b = Number.parseInt(hex.substring(4, 6), 16) / 255;

    const sRGB = [r, g, b].map((c) => {
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  /**
   * Load saved theme on mount
   */
  useEffect(() => {
    if (!initialTheme) {
      const savedTheme = loadSavedTheme();
      if (savedTheme) {
        setCurrentTheme(savedTheme);
        applyTheme(savedTheme);
      } else {
        // Apply default theme
        applyTheme(currentTheme);
      }
    } else {
      applyTheme(currentTheme);
    }
  }, [initialTheme, loadSavedTheme, applyTheme, currentTheme]);

  // Create state object
  const state: ThemeState = {
    currentTheme,
  };

  // Create actions object
  const actions = {
    setTheme: handleSetTheme,
    applyTheme,
    saveTheme,
    loadSavedTheme,
    cycleToNextTheme,
    cycleToPreviousTheme,
    toggleDarkMode,
    getThemeById,
    getNextTheme,
    getPreviousTheme,
    isDarkTheme,
    getThemeContrastRatio,
  };

  return {
    state,
    actions,
    themes,
    utils: {
      isDark: isDarkTheme(),
      contrastRatio: getThemeContrastRatio(currentTheme),
      availableThemes: themes,
    },
  };
};

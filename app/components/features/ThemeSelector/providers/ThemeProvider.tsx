/**
 * Global Theme Provider
 * Provider global untuk mengelola theme state di seluruh aplikasi
 * 
 * @author Axel Modra
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { themes } from '../constants/themes.constants';
import type { Theme } from '../types/theme.types';

/**
 * Theme Context interface
 */
interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: Theme[];
  isLoading: boolean;
}

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

/**
 * Storage key untuk theme
 */
const THEME_STORAGE_KEY = 'markdownEditor_theme';

/**
 * Global Theme Provider Component
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = themes[0] 
}) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Apply theme to document root
   */
  const applyTheme = useCallback((theme: Theme) => {
    if (typeof document === 'undefined') return;

    // Remove all existing theme classes
    document.documentElement.className = document.documentElement.className
      .replace(/theme-\w+/g, '')
      .replace(/\bdark\b/g, '')
      .trim();

    // Apply new theme class
    if (theme.id === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add(`theme-${theme.id}`);
    }

    // Set CSS custom properties for button colors to prevent JavaScript override
    const root = document.documentElement;
    const buttonColorMap: Record<string, string> = {
      'ocean': '#1e3a8a',
      'forest': '#14532d',
      'sunset': '#c2410c',
      'purple': '#6b21a8',
      'rose': '#be185d',
      'dark': 'hsl(210 40% 98%)'
    };

    const buttonColor = buttonColorMap[theme.id] || theme.text;
    root.style.setProperty('--theme-button-color', buttonColor);

    // Force immediate application with high priority
    setTimeout(() => {
      const buttons = document.querySelectorAll('button[data-theme-button="true"], .editor-header button, .toolbar button');
      buttons.forEach((button) => {
        if (button instanceof HTMLElement) {
          button.style.setProperty('color', buttonColor, 'important');
        }
      });
    }, 0);

    console.log(`🎨 Global Theme applied: ${theme.id}, button color: ${buttonColor}, classes: ${document.documentElement.className}`);
  }, []);

  /**
   * Setup MutationObserver to watch for DOM changes and reapply button colors
   */
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const buttonColorMap: Record<string, string> = {
      'ocean': '#1e3a8a',
      'forest': '#14532d',
      'sunset': '#c2410c',
      'purple': '#6b21a8',
      'rose': '#be185d',
      'dark': 'hsl(210 40% 98%)'
    };

    const applyButtonColors = () => {
      const buttonColor = buttonColorMap[currentTheme.id] || currentTheme.text;
      const buttons = document.querySelectorAll('button[data-theme-button="true"], .editor-header button, .toolbar button');
      buttons.forEach((button) => {
        if (button instanceof HTMLElement) {
          button.style.setProperty('color', buttonColor, 'important');
        }
      });
    };

    // Initial application
    applyButtonColors();

    // Setup MutationObserver to watch for new buttons
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              if (node.tagName === 'BUTTON' || node.querySelector('button')) {
                shouldReapply = true;
              }
            }
          });
        }
      });

      if (shouldReapply) {
        setTimeout(applyButtonColors, 0);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [currentTheme]);

  /**
   * Save theme to localStorage
   */
  const saveTheme = useCallback((theme: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme.id);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, []);

  /**
   * Load saved theme from localStorage
   */
  const loadSavedTheme = useCallback((): Theme | null => {
    try {
      const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId) {
        const savedTheme = themes.find(t => t.id === savedThemeId);
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
  const setTheme = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    saveTheme(theme);
  }, [applyTheme, saveTheme]);

  /**
   * Load saved theme on mount
   */
  useEffect(() => {
    const savedTheme = loadSavedTheme();
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Apply default theme
      applyTheme(currentTheme);
    }
    setIsLoading(false);
  }, [loadSavedTheme, applyTheme, currentTheme]);

  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes: themes,
    isLoading
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook untuk menggunakan theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * HOC untuk komponen yang membutuhkan theme
 */
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: Theme }>
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const { currentTheme } = useTheme();
    return <Component {...(props as P)} theme={currentTheme} ref={ref} />;
  });

  WrappedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

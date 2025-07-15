/**
 * Common utility functions - Centralized to avoid duplication
 * Menggabungkan semua utility functions yang duplikat di berbagai file
 */

import { safeConsole } from '@/utils/console';

/**
 * ===== PERFORMANCE UTILITIES =====
 */

/**
 * Debounce function - Universal implementation
 * Digunakan di: writingSettingsUtils, headingUtils, responsiveUtils, editorHelpers, dll
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function - Universal implementation
 * Digunakan di: headingUtils, responsiveUtils, editorHelpers, dll
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * ===== COLOR UTILITIES =====
 */

/**
 * Calculate luminance of a color
 * Helper function untuk contrast calculations
 */
const calculateLuminance = (color: string): number => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255;
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255;
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255;

  // Calculate relative luminance
  const sRGB = [r, g, b].map((c) => {
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
};

/**
 * Calculate contrast ratio between two colors
 * Digunakan di: accessibility.ts, theme.utils.ts
 */
export const calculateContrastRatio = (foreground: string, background: string): number => {
  const l1 = calculateLuminance(foreground);
  const l2 = calculateLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast ratio meets WCAG standards
 * Digunakan di: accessibility.ts, theme.utils.ts
 */
export const meetsContrastRequirement = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean => {
  const ratio = calculateContrastRatio(foreground, background);

  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  return size === 'large' ? ratio >= 3 : ratio >= 4.5;
};

/**
 * ===== STORAGE UTILITIES =====
 */

/**
 * Check if localStorage is available
 * Digunakan di: storageUtils.ts, editorStorageUtils.ts
 */
export const isStorageAvailable = (): boolean => {
  try {
    if (typeof localStorage === 'undefined') return false;
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safe localStorage getter with error handling
 * Digunakan di: storageUtils.ts, editorStorageUtils.ts
 */
export const getStorageItem = (key: string): string | null => {
  try {
    if (!isStorageAvailable()) return null;
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get item from localStorage: ${key}`, error);
    return null;
  }
};

/**
 * Safe localStorage setter with error handling
 * Digunakan di: storageUtils.ts, editorStorageUtils.ts
 */
export const setStorageItem = (key: string, value: string): boolean => {
  try {
    if (!isStorageAvailable()) return false;
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to set item in localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Safe localStorage remover with error handling
 * Digunakan di: storageUtils.ts, editorStorageUtils.ts
 */
export const removeStorageItem = (key: string): boolean => {
  try {
    if (!isStorageAvailable()) return false;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove item from localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Get JSON data from localStorage
 * Digunakan di: storageUtils.ts, editorStorageUtils.ts
 */
export const getStorageJSON = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = getStorageItem(key);
    if (item === null) return defaultValue || null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to parse JSON from localStorage: ${key}`, error);
    return defaultValue || null;
  }
};

/**
 * Set JSON data to localStorage
 * Digunakan di: storageUtils.ts, editorStorageUtils.ts
 */
export const setStorageJSON = <T>(key: string, value: T): boolean => {
  try {
    const jsonString = JSON.stringify(value);
    return setStorageItem(key, jsonString);
  } catch (error) {
    console.warn(`Failed to stringify JSON for localStorage: ${key}`, error);
    return false;
  }
};

/**
 * ===== VALIDATION UTILITIES =====
 */

/**
 * Deep compare objects
 * Digunakan di: writingSettingsUtils.ts dan berbagai komponen
 */
export const deepEqual = <T extends Record<string, unknown>>(obj1: T, obj2: T): boolean => {
  const keys1 = Object.keys(obj1) as (keyof T)[];
  const keys2 = Object.keys(obj2) as (keyof T)[];

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => obj1[key] === obj2[key]);
};

/**
 * Format bytes to human readable string
 * Digunakan di: storageUtils.ts, FilesManager.tsx
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format date to relative time string
 * Digunakan di: FilesManager.tsx, FilesTable.tsx
 * Note: This function requires date-fns to be imported in the calling module
 */
export const formatRelativeDate = (
  dateString: string,
  formatDistanceToNow: (date: Date, options: { addSuffix: boolean }) => string
): string => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
};

/**
 * ===== ARRAY UTILITIES =====
 */

/**
 * Generic search filter for objects with text properties
 * Digunakan di: FilesManager.tsx, useTemplateFilters.ts, keyboard-shortcuts
 */
export const searchFilter = <T extends Record<string, unknown>>(
  items: T[],
  query: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter((item) =>
    searchFields.some((field) => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery);
      }
      if (Array.isArray(value)) {
        return value.some((v) => typeof v === 'string' && v.toLowerCase().includes(lowerQuery));
      }
      return false;
    })
  );
};

/**
 * Generic sorting function for arrays of objects
 * Digunakan di: FilesManager.tsx, templateUtils.ts
 */
export const sortByField = <T extends Record<string, unknown>>(
  items: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    let comparison = 0;

    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      // Fallback to string comparison
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return direction === 'asc' ? comparison : -comparison;
  });
};

/**
 * Group array items by a specific field
 * Digunakan di: toolbar.utils.ts, documentTemplates.ts
 */
export const groupByField = <T extends Record<string, unknown>, K extends keyof T>(
  items: T[],
  field: K
): Record<string, T[]> => {
  return items.reduce(
    (groups, item) => {
      const key = String(item[field]);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
};

/**
 * ===== REGEX UTILITIES =====
 */

/**
 * Escape special regex characters
 * Digunakan di: useSearchEngine.ts, editorHelpers.ts
 */
export const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Create safe regex pattern with error handling
 * Digunakan di: useSearchEngine.ts, editorHelpers.ts
 */
export const createSafeRegex = (
  pattern: string,
  flags = 'g',
  options: { shouldEscape?: boolean; wholeWord?: boolean } = {}
): RegExp => {
  const { shouldEscape = true, wholeWord = false } = options;

  let processedPattern = shouldEscape ? escapeRegex(pattern) : pattern;

  if (wholeWord) {
    processedPattern = `\\b${processedPattern}\\b`;
  }

  try {
    return new RegExp(processedPattern, flags);
  } catch {
    // Fallback to escaped pattern if regex is invalid
    return new RegExp(escapeRegex(pattern), flags);
  }
};

/**
 * ===== ERROR HANDLING UTILITIES =====
 */

/**
 * Centralized error logging with context
 * Digunakan di: EditorErrorBoundary.tsx, performance.ts, dll
 */
export const logError = (
  error: unknown,
  context = '',
  additionalData?: Record<string, unknown>
): void => {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  const logData = {
    message: errorObj.message,
    stack: errorObj.stack,
    context,
    timestamp: new Date().toISOString(),
    ...additionalData,
  };

  if (process.env.NODE_ENV === 'development') {
    safeConsole.error(`Error in ${context}:`, logData);
  } else {
    
    safeConsole.error('Application error:', logData);
  }
};

/**
 * Safe error handler with fallback
 * Digunakan di: performance.ts, LazyLoader.tsx
 */
export const safeExecute = <T>(fn: () => T, fallback: T, context = 'unknown'): T => {
  try {
    return fn();
  } catch (error) {
    logError(error, context);
    return fallback;
  }
};

/**
 * ===== KEY GENERATION UTILITIES =====
 */

/**
 * Generate unique key from array of components
 * Digunakan di: PreviewPanel.tsx, dll
 */
export const generateKey = (
  components: (string | number | boolean | null | undefined)[]
): string => {
  return components
    .map((component) => {
      if (component === null || component === undefined) return 'null';
      if (typeof component === 'string' && component.length > 50) {
        // For long strings, use first 10 chars + hash-like suffix
        return `${component.substring(0, 10)}-${component.length}`;
      }
      return String(component);
    })
    .join('-');
};

/**
 * Generate unique ID with prefix
 * Digunakan di: editorHelpers.ts, dll
 */
export const generateId = (prefix = 'id', suffix?: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const parts = [prefix, timestamp, random];

  if (suffix) {
    parts.push(suffix);
  }

  return parts.join('-');
};

/**
 * ===== CLIPBOARD UTILITIES =====
 */

/**
 * Copy text to clipboard with error handling
 * Digunakan di: EditorErrorBoundary.tsx, languageUtils.ts, CodeBlock.tsx
 */
export const copyToClipboard = async (
  text: string,
  options: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    fallbackAlert?: boolean;
  } = {}
): Promise<boolean> => {
  const { onSuccess, onError, fallbackAlert = false } = options;

  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.();
    return true;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Clipboard operation failed');
    onError?.(err);

    if (fallbackAlert) {
      // Improved fallback using Selection API instead of deprecated execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      try {
        // Use Selection API as modern fallback
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(textArea);
        selection?.removeAllRanges();
        selection?.addRange(range);

        // Try to copy using keyboard shortcut simulation
        const copyEvent = new KeyboardEvent('keydown', {
          key: 'c',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });

        textArea.dispatchEvent(copyEvent);
        document.body.removeChild(textArea);
        onSuccess?.();
        return true;
      } catch (fallbackError) {
        document.body.removeChild(textArea);
        logError(fallbackError, 'clipboard-fallback');
        return false;
      }
    }

    logError(err, 'clipboard');
    return false;
  }
};

/**
 * Copy text with visual feedback on button
 * Digunakan di: languageUtils.ts, CodeBlock.tsx
 */
export const copyWithButtonFeedback = async (
  text: string,
  button: HTMLButtonElement,
  options: {
    successText?: string;
    successColor?: string;
    resetDelay?: number;
  } = {}
): Promise<void> => {
  const { successText = '✅ Copied!', successColor = '#10b981', resetDelay = 1500 } = options;

  const originalText = button.textContent;
  const originalBgColor = button.style.backgroundColor;
  const originalColor = button.style.color;

  await copyToClipboard(text, {
    onSuccess: () => {
      button.textContent = successText;
      button.style.backgroundColor = successColor;
      button.style.color = 'white';
    },
    onError: (error) => {
      button.textContent = '❌ Failed';
      button.style.backgroundColor = '#ef4444';
      button.style.color = 'white';
      logError(error, 'copy-with-feedback');
    },
  });

  // Reset button after delay
  setTimeout(() => {
    button.textContent = originalText;
    button.style.backgroundColor = originalBgColor;
    button.style.color = originalColor;
  }, resetDelay);
};

/**
 * ===== THEME UTILITIES =====
 */

/**
 * Detect if current theme is dark mode
 * Digunakan di: formatPreviewGenerators.ts, ThemeProvider.tsx
 */
export const isDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;

  const body = document.body;
  const html = document.documentElement;

  // Check data attributes
  const bodyTheme = body.getAttribute('data-theme');
  const htmlTheme = html.getAttribute('data-theme');

  // Check classes
  const hasDarkClass =
    body.classList.contains('dark') ||
    body.classList.contains('theme-dark') ||
    html.classList.contains('dark') ||
    html.classList.contains('theme-dark');

  // Check theme attributes
  const isDarkTheme = bodyTheme === 'dark' || htmlTheme === 'dark';

  // Check system preference as fallback
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return hasDarkClass || isDarkTheme || prefersDark;
};

/**
 * Get current theme name from DOM
 * Digunakan di: formatPreviewGenerators.ts, ThemeProvider.tsx
 */
export const getCurrentTheme = (): string => {
  if (typeof window === 'undefined') return 'default';

  const body = document.body;
  const html = document.documentElement;

  // Check data attributes first
  const bodyTheme = body.getAttribute('data-theme');
  const htmlTheme = html.getAttribute('data-theme');

  if (bodyTheme) return bodyTheme;
  if (htmlTheme) return htmlTheme;

  // Check theme classes
  const classList = [...body.classList, ...html.classList];
  const themeClass = classList.find((cls) => cls.startsWith('theme-'));

  if (themeClass) {
    return themeClass.replace('theme-', '');
  }

  // Check for dark class
  if (classList.includes('dark')) {
    return 'dark';
  }

  return 'default';
};

/**
 * ===== MEDIA QUERY UTILITIES =====
 */

/**
 * Create MediaQueryList safely
 * Digunakan di: useMediaQuery.ts, useResponsive.ts, responsive.utils.ts
 */
export const createMediaQueryList = (query: string): MediaQueryList | null => {
  if (typeof window === 'undefined') return null;
  return window.matchMedia(query);
};

/**
 * Check if media query matches
 * Digunakan di: responsive.utils.ts, useResponsive.ts
 */
export const matchesMediaQuery = (query: string): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
};

/**
 * Get preferred color scheme
 * Digunakan di: responsive.utils.ts, ThemeProvider.tsx
 */
export const getPreferredColorScheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Check if user prefers reduced motion
 * Digunakan di: responsive.utils.ts, animations
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * ===== TIMEOUT/INTERVAL UTILITIES =====
 */

/**
 * Safe timeout with cleanup tracking
 * Digunakan di: toastUtils.ts, useStorageMonitor.ts
 */
export const createSafeTimeout = (
  callback: () => void,
  delay: number,
  timeoutMap?: Map<string, ReturnType<typeof setTimeout>>,
  key?: string
): ReturnType<typeof setTimeout> => {
  const timeout = setTimeout(() => {
    if (timeoutMap && key) {
      timeoutMap.delete(key);
    }
    callback();
  }, delay);

  if (timeoutMap && key) {
    // Clear existing timeout if exists
    if (timeoutMap.has(key)) {
      clearTimeout(timeoutMap.get(key));
    }
    timeoutMap.set(key, timeout);
  }

  return timeout;
};

/**
 * Safe interval with cleanup tracking
 * Digunakan di: useStorageMonitor.ts, performance monitoring
 */
export const createSafeInterval = (
  callback: () => void,
  delay: number,
  intervalMap?: Map<string, ReturnType<typeof setInterval>>,
  key?: string
): ReturnType<typeof setInterval> => {
  const interval = setInterval(callback, delay);

  if (intervalMap && key) {
    // Clear existing interval if exists
    if (intervalMap.has(key)) {
      clearInterval(intervalMap.get(key));
    }
    intervalMap.set(key, interval);
  }

  return interval;
};

/**
 * Clear all timeouts from a map
 * Digunakan di: toastUtils.ts, cleanup functions
 */
export const clearAllTimeouts = (timeoutMap: Map<string, ReturnType<typeof setTimeout>>): void => {
  timeoutMap.forEach((timeout) => clearTimeout(timeout));
  timeoutMap.clear();
};

/**
 * Clear all intervals from a map
 * Digunakan di: useStorageMonitor.ts, cleanup functions
 */
export const clearAllIntervals = (
  intervalMap: Map<string, ReturnType<typeof setInterval>>
): void => {
  intervalMap.forEach((interval) => clearInterval(interval));
  intervalMap.clear();
};

/**
 * ===== EVENT LISTENER UTILITIES =====
 */

/**
 * Add event listener with automatic cleanup tracking
 * Digunakan di: useTypewriterMode.ts, UndoRedoButtons.tsx, useResponsive.ts
 */
export const addEventListenerWithCleanup = <K extends keyof WindowEventMap>(
  target: Window | Document | Element,
  type: K,
  listener: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): (() => void) => {
  target.addEventListener(type, listener as EventListener, options);

  return () => {
    target.removeEventListener(type, listener as EventListener, options);
  };
};

/**
 * Add multiple event listeners with cleanup
 * Digunakan di: useTypewriterMode.ts, keyboard shortcuts
 */
export const addMultipleEventListeners = <K extends keyof WindowEventMap>(
  target: Window | Document | Element,
  events: Array<{
    type: K;
    listener: (event: WindowEventMap[K]) => void;
    options?: boolean | AddEventListenerOptions;
  }>
): (() => void) => {
  const cleanupFunctions = events.map(({ type, listener, options }) =>
    addEventListenerWithCleanup(target, type, listener, options)
  );

  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
};

/**
 * Add media query listener with cleanup
 * Digunakan di: useMediaQuery.ts, useResponsive.ts
 */
export const addMediaQueryListener = (
  query: string,
  callback: (event: MediaQueryListEvent) => void
): (() => void) => {
  if (typeof window === 'undefined')
    return () => {
      // No cleanup needed on server side
    };

  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener('change', callback);

  return () => {
    mediaQuery.removeEventListener('change', callback);
  };
};

/**
 * ===== DOM UTILITIES =====
 */

/**
 * Safe querySelector with null check
 * Digunakan di: ThemeProvider.tsx, headingUtils.ts
 */
export const safeQuerySelector = <T extends Element = Element>(
  selector: string,
  container: Document | Element = document
): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    return container.querySelector<T>(selector);
  } catch {
    return null;
  }
};

/**
 * Safe querySelectorAll with empty array fallback
 * Digunakan di: ThemeProvider.tsx, accessibility.ts
 */
export const safeQuerySelectorAll = <T extends Element = Element>(
  selector: string,
  container: Document | Element = document
): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    return Array.from(container.querySelectorAll<T>(selector));
  } catch {
    return [];
  }
};

/**
 * Safe getElementById with null check
 * Digunakan di: headingUtils.ts, accessibility.ts
 */
export const safeGetElementById = <T extends HTMLElement = HTMLElement>(id: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    return document.getElementById(id) as T | null;
  } catch {
    return null;
  }
};

/**
 * Find scroll container for element
 * Digunakan di: headingUtils.ts, scroll utilities
 */
export const findScrollContainer = (
  element: Element,
  fallbackSelectors: string[] = ['.prose', '[data-preview-pane]']
): Element => {
  if (typeof window === 'undefined') return element;

  // Try fallback selectors first
  for (const selector of fallbackSelectors) {
    const container = safeQuerySelector(selector);
    if (container) return container;
  }

  // Find scrollable parent
  let parent = element.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    if (
      style.overflow === 'auto' ||
      style.overflow === 'scroll' ||
      style.overflowY === 'auto' ||
      style.overflowY === 'scroll'
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return document.documentElement;
};

/**
 * ===== LOADING STATE UTILITIES =====
 */

/**
 * Standard loading state interface
 * Digunakan di: useFileStorage.ts, MarkdownEditor types
 */
export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  error?: string;
}

/**
 * Create initial loading state
 */
export const createLoadingState = (isLoading = false): LoadingState => ({
  isLoading,
  progress: undefined,
  message: undefined,
  error: undefined,
});

/**
 * Update loading state with progress
 */
export const updateLoadingProgress = (
  state: LoadingState,
  progress: number,
  message?: string
): LoadingState => ({
  ...state,
  isLoading: true,
  progress: Math.max(0, Math.min(100, progress)),
  message,
  error: undefined,
});

/**
 * Set loading error state
 */
export const setLoadingError = (state: LoadingState, error: string): LoadingState => ({
  ...state,
  isLoading: false,
  progress: undefined,
  error,
});

/**
 * Complete loading state
 */
export const completeLoading = (state: LoadingState): LoadingState => ({
  ...state,
  isLoading: false,
  progress: 100,
  error: undefined,
});

/**
 * ===== VALIDATION UTILITIES =====
 */

/**
 * Standard validation result interface
 * Digunakan di: writingSettingsUtils.ts, MarkdownEditor types
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Create validation result
 */
export const createValidationResult = (
  isValid = true,
  errors: string[] = [],
  warnings: string[] = []
): ValidationResult => ({
  isValid,
  errors,
  warnings,
});

/**
 * Validate numeric range
 * Digunakan di: writingSettingsUtils.ts
 */
export const validateNumericRange = (
  value: unknown,
  min: number,
  max: number,
  fieldName = 'value'
): ValidationResult => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return createValidationResult(false, [`${fieldName} must be a valid number`]);
  }

  if (value < min || value > max) {
    return createValidationResult(false, [`${fieldName} must be between ${min} and ${max}`]);
  }

  return createValidationResult(true);
};

/**
 * Validate required object properties
 * Digunakan di: writingSettingsUtils.ts
 */
export const validateRequiredProperties = <T extends Record<string, unknown>>(
  obj: unknown,
  requiredProps: (keyof T)[]
): ValidationResult => {
  if (!obj || typeof obj !== 'object') {
    return createValidationResult(false, ['Object is required']);
  }

  const errors: string[] = [];
  const objTyped = obj as Record<string, unknown>;

  for (const prop of requiredProps) {
    if (!(prop in objTyped)) {
      errors.push(`Property '${String(prop)}' is required`);
    }
  }

  return createValidationResult(errors.length === 0, errors);
};

/**
 * Validate boolean properties
 * Digunakan di: writingSettingsUtils.ts
 */
export const validateBooleanProperties = <T extends Record<string, unknown>>(
  obj: Record<string, unknown>,
  booleanProps: (keyof T)[]
): ValidationResult => {
  const errors: string[] = [];

  for (const prop of booleanProps) {
    const propKey = String(prop);
    if (typeof obj[propKey] !== 'boolean') {
      errors.push(`Property '${propKey}' must be a boolean`);
    }
  }

  return createValidationResult(errors.length === 0, errors);
};

/**
 * ===== COMMON CONSTANTS =====
 */

/**
 * Common debounce delays
 * Menggabungkan dari berbagai file constants
 */
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  AUTO_SAVE: 2000,
  RESIZE: 100,
  SCROLL: 50,
  INPUT: 500,
  TYPING: 150,
} as const;

/**
 * Common animation durations
 * Menggabungkan dari berbagai file constants
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

/**
 * Storage thresholds
 * Menggabungkan dari storageUtils.ts
 */
export const STORAGE_THRESHOLDS = {
  WARNING: 80, // 80% usage
  CRITICAL: 95, // 95% usage
} as const;

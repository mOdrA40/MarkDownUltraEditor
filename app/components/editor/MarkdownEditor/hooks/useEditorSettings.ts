/**
 * @fileoverview Editor settings management hook
 * @author Axel Modra
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorSettings } from "../types";
import { DEFAULT_EDITOR_CONFIG, STORAGE_KEYS } from "../utils/constants";

/**
 * Hook return type for editor settings
 */
export interface UseEditorSettingsReturn {
  settings: EditorSettings;
  actions: {
    updateFontSize: (size: number) => void;
    updateLineHeight: (height: number) => void;
    toggleFocusMode: () => void;
    toggleTypewriterMode: () => void;
    toggleWordWrap: () => void;
    toggleVimMode: () => void;
    toggleZenMode: () => void;
    updateSettings: (newSettings: Partial<EditorSettings>) => void;
    resetSettings: () => void;
    saveSettings: () => void;
    loadSettings: () => void;
  };
}

/**
 * Custom hook for managing editor settings
 * Handles font size, line height, focus mode, typewriter mode, etc.
 */
export const useEditorSettings = (
  initialSettings?: Partial<EditorSettings>
): UseEditorSettingsReturn => {
  // Initialize settings with defaults
  const [settings, setSettings] = useState<EditorSettings>({
    ...DEFAULT_EDITOR_CONFIG.defaultSettings,
    ...initialSettings,
  });

  const isInitialLoadRef = useRef(false);

  /**
   * Update font size
   */
  const updateFontSize = useCallback((size: number) => {
    const clampedSize = Math.max(8, Math.min(32, size));
    setSettings((prev) => ({
      ...prev,
      fontSize: clampedSize,
    }));
  }, []);

  /**
   * Update line height
   */
  const updateLineHeight = useCallback((height: number) => {
    const clampedHeight = Math.max(1.0, Math.min(3.0, height));
    setSettings((prev) => ({
      ...prev,
      lineHeight: clampedHeight,
    }));
  }, []);

  /**
   * Toggle focus mode
   */
  const toggleFocusMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      focusMode: !prev.focusMode,
    }));
  }, []);

  /**
   * Toggle typewriter mode
   */
  const toggleTypewriterMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      typewriterMode: !prev.typewriterMode,
    }));
  }, []);

  /**
   * Toggle word wrap
   */
  const toggleWordWrap = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      wordWrap: !prev.wordWrap,
    }));
  }, []);

  /**
   * Toggle vim mode
   */
  const toggleVimMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      vimMode: !prev.vimMode,
    }));
  }, []);

  /**
   * Toggle zen mode
   */
  const toggleZenMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      zenMode: !prev.zenMode,
    }));
  }, []);

  /**
   * Update multiple settings at once
   */
  const updateSettings = useCallback((newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  }, []);

  /**
   * Reset settings to defaults
   */
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_EDITOR_CONFIG.defaultSettings);
  }, []);

  /**
   * Save settings to localStorage
   */
  const saveSettings = useCallback(() => {
    if (typeof localStorage === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      import("@/utils/console").then(({ safeConsole }) => {
        safeConsole.warn("Failed to save settings to localStorage:", error);
      });
    }
  }, [settings]);

  /**
   * Load settings from localStorage
   */
  const loadSettings = useCallback(() => {
    if (typeof localStorage === "undefined") return;

    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings((prev) => ({
          ...prev,
          ...parsedSettings,
        }));
      }
    } catch (error) {
      import("@/utils/console").then(({ safeConsole }) => {
        safeConsole.warn("Failed to load settings from localStorage:", error);
      });
    }
  }, []);

  /**
   * Auto-save settings when they change
   */
  useEffect(() => {
    if (isInitialLoadRef.current) {
      const timer = setTimeout(() => {
        saveSettings();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [saveSettings]);

  /**
   * Load saved settings on mount
   */
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      loadSettings();
      isInitialLoadRef.current = true;
    }
  }, [loadSettings]);

  /**
   * Handle page unload to save settings
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeUnload = () => {
      saveSettings();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      saveSettings();
    };
  }, [saveSettings]);

  const actions = {
    updateFontSize,
    updateLineHeight,
    toggleFocusMode,
    toggleTypewriterMode,
    toggleWordWrap,
    toggleVimMode,
    toggleZenMode,
    updateSettings,
    resetSettings,
    saveSettings,
    loadSettings,
  };

  return {
    settings,
    actions,
  };
};

/**
 * Hook for individual setting toggles with optimized re-renders
 */
export const useSettingToggle = (
  _settingKey: keyof EditorSettings,
  initialValue: boolean,
  onToggle?: (value: boolean) => void
) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    const newValue = !value;
    setValue(newValue);
    onToggle?.(newValue);
  }, [value, onToggle]);

  return [value, toggle] as const;
};

/**
 * Hook for numeric settings with validation
 */
export const useNumericSetting = (
  initialValue: number,
  min: number,
  max: number,
  onChange?: (value: number) => void
) => {
  const [value, setValue] = useState(initialValue);

  const updateValue = useCallback(
    (newValue: number) => {
      const clampedValue = Math.max(min, Math.min(max, newValue));
      setValue(clampedValue);
      onChange?.(clampedValue);
    },
    [min, max, onChange]
  );

  const increment = useCallback(() => {
    updateValue(value + 1);
  }, [value, updateValue]);

  const decrement = useCallback(() => {
    updateValue(value - 1);
  }, [value, updateValue]);

  return {
    value,
    setValue: updateValue,
    increment,
    decrement,
    isAtMin: value <= min,
    isAtMax: value >= max,
  };
};

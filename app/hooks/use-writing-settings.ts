/**
 * Main writing settings hook dengan refactored architecture
 * Menggunakan separated concerns dan comprehensive validation
 */

import { useReducer, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  WritingSettings,
  UseWritingSettingsOptions,
  UseWritingSettingsReturn,
  DEFAULT_WRITING_SETTINGS,
  DEFAULT_VALIDATION_RULES,
  WRITING_SETTINGS_CONSTANTS
} from '@/types/writingSettings';
import {
  writingSettingsReducer,
  writingSettingsActionCreators
} from './writingSettings/writingSettingsReducer';
import {
  loadSettingsFromStorage,
  saveSettingsToStorage,
  validateFontSize,
  validateLineHeight,
  exportWritingSettings,
  importWritingSettings,
  debounce,
  areSettingsEqual
} from '@/utils/writingSettingsUtils';

/**
 * Main useWritingSettings hook dengan comprehensive features
 */
export const useWritingSettings = (
  options: UseWritingSettingsOptions = {}
): UseWritingSettingsReturn => {
  const {
    storageKey = WRITING_SETTINGS_CONSTANTS.DEFAULT_STORAGE_KEY,
    autoSaveDelay = WRITING_SETTINGS_CONSTANTS.DEFAULT_AUTO_SAVE_DELAY,
    validationRules = DEFAULT_VALIDATION_RULES,
    onSettingsChange
  } = options;

  const [settings, dispatch] = useReducer(writingSettingsReducer, DEFAULT_WRITING_SETTINGS);
  const previousSettingsRef = useRef<WritingSettings>(settings);

  // Debounced save function
  const debouncedSave = useMemo(
    () => debounce((...args: unknown[]): void => {
      const settingsToSave = args[0] as WritingSettings;
      saveSettingsToStorage(settingsToSave, storageKey);
    }, autoSaveDelay),
    [storageKey, autoSaveDelay]
  );

  // Merge validation rules dengan defaults menggunakan useMemo
  const mergedValidationRules = useMemo(() => ({
    ...DEFAULT_VALIDATION_RULES,
    ...validationRules
  }), [validationRules]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadedSettings = loadSettingsFromStorage(storageKey, mergedValidationRules);
    if (!areSettingsEqual(loadedSettings, DEFAULT_WRITING_SETTINGS)) {
      dispatch(writingSettingsActionCreators.loadSettings(loadedSettings));
    }
  }, [storageKey, mergedValidationRules]);

  // Auto-save settings when they change
  useEffect(() => {
    if (!areSettingsEqual(settings, previousSettingsRef.current)) {
      debouncedSave(settings);
      onSettingsChange?.(settings);
      previousSettingsRef.current = settings;
    }
  }, [settings, debouncedSave, onSettingsChange]);

  // Action creators
  const setFontSize = useCallback((size: number) => {
    dispatch({ type: 'SET_FONT_SIZE', payload: size });
  }, []);

  const setLineHeight = useCallback((height: number) => {
    dispatch({ type: 'SET_LINE_HEIGHT', payload: height });
  }, []);

  const toggleFocusMode = useCallback(() => {
    console.log('toggleFocusMode called');
    dispatch({ type: 'TOGGLE_FOCUS_MODE' });
  }, []);

  const toggleTypewriterMode = useCallback(() => {
    console.log('toggleTypewriterMode called');
    dispatch({ type: 'TOGGLE_TYPEWRITER_MODE' });
  }, []);

  const toggleWordWrap = useCallback(() => {
    console.log('toggleWordWrap called');
    dispatch({ type: 'TOGGLE_WORD_WRAP' });
  }, []);

  const toggleVimMode = useCallback(() => {
    console.log('toggleVimMode called');
    dispatch({ type: 'TOGGLE_VIM_MODE' });
  }, []);

  const toggleZenMode = useCallback(() => {
    console.log('toggleZenMode called');
    dispatch({ type: 'TOGGLE_ZEN_MODE' });
  }, []);

  const resetSettings = useCallback(() => {
    dispatch(writingSettingsActionCreators.resetSettings());
  }, []);

  // Batch update method
  const batchUpdate = useCallback((updates: Partial<WritingSettings>) => {
    dispatch(writingSettingsActionCreators.batchUpdate(updates));
  }, []);

  // Validation methods
  const isValidFontSize = useCallback((size: number) => {
    return validateFontSize(size, mergedValidationRules);
  }, [mergedValidationRules]);

  const isValidLineHeight = useCallback((height: number) => {
    return validateLineHeight(height, mergedValidationRules);
  }, [mergedValidationRules]);

  // Export/Import methods
  const exportSettings = useCallback(() => {
    return exportWritingSettings(settings);
  }, [settings]);

  const importSettings = useCallback((settingsJson: string) => {
    const importedSettings = importWritingSettings(settingsJson, mergedValidationRules);
    if (importedSettings) {
      dispatch(writingSettingsActionCreators.loadSettings(importedSettings));
      return true;
    }
    return false;
  }, [mergedValidationRules]);

  return {
    // Settings values
    fontSize: settings.fontSize,
    lineHeight: settings.lineHeight,
    focusMode: settings.focusMode,
    typewriterMode: settings.typewriterMode,
    wordWrap: settings.wordWrap,
    vimMode: settings.vimMode,
    zenMode: settings.zenMode,

    // Action creators
    setFontSize,
    setLineHeight,
    toggleFocusMode,
    toggleTypewriterMode,
    toggleWordWrap,
    toggleVimMode,
    toggleZenMode,
    resetSettings,
    batchUpdate,

    // Utility methods
    isValidFontSize,
    isValidLineHeight,
    exportSettings,
    importSettings,
  };
};

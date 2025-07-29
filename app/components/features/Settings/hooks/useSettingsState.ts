/**
 * @fileoverview Main settings state management hook
 * @author Axel Modra
 */

import { useCallback, useEffect, useState } from 'react';
import { type Theme, useTheme } from '@/components/features/ThemeSelector';
import { useToast } from '@/hooks/core/useToast';
import { loadSettingsFromStorage, saveSettingsToStorage } from '@/utils/writingSettingsUtils';
import { DEFAULT_PREFERENCES, DEFAULT_TAB, STORAGE_KEYS } from '../constants';
import type { AppPreferences, SettingsState, UseSettingsReturn } from '../types/settings';

/**
 * Main settings state management hook
 */
export const useSettingsState = (): UseSettingsReturn => {
  const { currentTheme, setTheme: setGlobalTheme } = useTheme();
  const { toast } = useToast();

  const [state, setState] = useState<SettingsState>({
    preferences: {
      ...DEFAULT_PREFERENCES,
      theme: currentTheme,
    },
    hasUnsavedChanges: false,
    isLoading: true,
    activeTab: DEFAULT_TAB,
    isEditingName: false,
    editFirstName: '',
    editLastName: '',
  });

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const savedWritingSettings = loadSettingsFromStorage();
        const savedPreferences = localStorage.getItem(STORAGE_KEYS.PREFERENCES);

        let loadedPrefs = {
          ...DEFAULT_PREFERENCES,
          theme: currentTheme,
        };

        loadedPrefs.writingSettings = savedWritingSettings;

        if (savedPreferences) {
          try {
            const parsed = JSON.parse(savedPreferences);
            loadedPrefs = { ...loadedPrefs, ...parsed };
          } catch (error) {
            import('@/utils/console').then(({ safeConsole }) => {
              safeConsole.warn('Failed to parse saved preferences:', error);
            });
          }
        }

        setState((prev) => ({
          ...prev,
          preferences: loadedPrefs,
          isLoading: false,
        }));
      } catch (error) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.error('Error loading preferences:', error);
        });
        toast({
          title: 'Settings Load Error',
          description: 'Failed to load your settings. Using defaults.',
          variant: 'destructive',
        });
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadPreferences();
  }, [toast, currentTheme]);

  // Update preference
  const updatePreference = useCallback(
    <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
      setState((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, [key]: value },
        hasUnsavedChanges: true,
      }));

      if (key === 'theme') {
        setGlobalTheme(value as Theme);
      }
    },
    [setGlobalTheme]
  );

  // Save preferences
  const savePreferences = useCallback(async () => {
    try {
      // Save app preferences
      localStorage.setItem(STORAGE_KEYS.THEME, state.preferences.theme.id);
      saveSettingsToStorage(state.preferences.writingSettings);

      const { theme: _theme, writingSettings: _writingSettings, ...appPrefs } = state.preferences;
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(appPrefs));

      setState((prev) => ({ ...prev, hasUnsavedChanges: false }));

      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been saved successfully.',
      });
    } catch (error) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.error('Error saving preferences:', error);
      });
      toast({
        title: 'Save Error',
        description: 'Failed to save your settings. Please try again.',
        variant: 'destructive',
      });
    }
  }, [state.preferences, toast]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    if (
      window.confirm(
        'Are you sure you want to reset all settings to defaults? This cannot be undone.'
      )
    ) {
      setState((prev) => ({
        ...prev,
        preferences: DEFAULT_PREFERENCES,
        hasUnsavedChanges: true,
      }));
      toast({
        title: 'Settings Reset',
        description: 'All settings have been reset to defaults.',
      });
    }
  }, [toast]);

  // Set active tab
  const setActiveTab = useCallback((tab: string) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  // Set editing name state
  const setIsEditingName = useCallback((editing: boolean) => {
    setState((prev) => ({ ...prev, isEditingName: editing }));
  }, []);

  // Set edit first name
  const setEditFirstName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      editFirstName: name,
      hasUnsavedChanges: true,
    }));
  }, []);

  // Set edit last name
  const setEditLastName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      editLastName: name,
      hasUnsavedChanges: true,
    }));
  }, []);

  return {
    state,
    actions: {
      updatePreference,
      savePreferences,
      resetToDefaults,
      setActiveTab,
      setIsEditingName,
      setEditFirstName,
      setEditLastName,
    },
  };
};

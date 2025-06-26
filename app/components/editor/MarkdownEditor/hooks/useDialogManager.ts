/**
 * @fileoverview Dialog state management hook
 * @author Senior Developer
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { DialogState, UseDialogManagerReturn } from '../types';

/**
 * Custom hook for managing dialog visibility state
 * Centralizes all modal/dialog state management
 */
export const useDialogManager = (): UseDialogManagerReturn => {
  // Dialog state
  const [dialogState, setDialogState] = useState<DialogState>({
    showSearch: false,
    showShortcuts: false,
    showTemplates: false,
    showAdvancedExport: false
  });

  /**
   * Show a specific dialog
   */
  const showDialog = useCallback((dialog: keyof DialogState) => {
    setDialogState(prev => ({
      ...prev,
      [dialog]: true
    }));
  }, []);

  /**
   * Hide a specific dialog
   */
  const hideDialog = useCallback((dialog: keyof DialogState) => {
    setDialogState(prev => ({
      ...prev,
      [dialog]: false
    }));
  }, []);

  /**
   * Hide all dialogs
   */
  const hideAllDialogs = useCallback(() => {
    setDialogState({
      showSearch: false,
      showShortcuts: false,
      showTemplates: false,
      showAdvancedExport: false
    });
  }, []);

  /**
   * Toggle a specific dialog
   */
  const toggleDialog = useCallback((dialog: keyof DialogState) => {
    setDialogState(prev => ({
      ...prev,
      [dialog]: !prev[dialog]
    }));
  }, []);

  /**
   * Check if any dialog is open
   */
  const isAnyDialogOpen = useCallback((): boolean => {
    return Object.values(dialogState).some(isOpen => isOpen);
  }, [dialogState]);

  /**
   * Get list of open dialogs
   */
  const getOpenDialogs = useCallback((): (keyof DialogState)[] => {
    return Object.entries(dialogState)
      .filter(([, isOpen]) => isOpen)
      .map(([dialog]) => dialog as keyof DialogState);
  }, [dialogState]);

  /**
   * Show search dialog with optional query
   */
  const showSearchDialog = useCallback((query?: string) => {
    showDialog('showSearch');
    // If query is provided, it can be passed to the search component
    if (query) {
      // This would typically be handled by the search component itself
      console.log('Opening search with query:', query);
    }
  }, [showDialog]);



  /**
   * Show templates dialog
   */
  const showTemplatesDialog = useCallback(() => {
    showDialog('showTemplates');
  }, [showDialog]);

  /**
   * Show advanced export dialog
   */
  const showAdvancedExportDialog = useCallback(() => {
    showDialog('showAdvancedExport');
  }, [showDialog]);

  /**
   * Show keyboard shortcuts dialog
   */
  const showShortcutsDialog = useCallback(() => {
    showDialog('showShortcuts');
  }, [showDialog]);

  /**
   * Handle escape key to close dialogs
   */
  const handleEscapeKey = useCallback(() => {
    if (isAnyDialogOpen()) {
      hideAllDialogs();
      return true; // Indicates that escape was handled
    }
    return false;
  }, [isAnyDialogOpen, hideAllDialogs]);

  /**
   * Dialog-specific close handlers
   */
  const closeSearchDialog = useCallback(() => hideDialog('showSearch'), [hideDialog]);
  const closeTemplatesDialog = useCallback(() => hideDialog('showTemplates'), [hideDialog]);
  const closeAdvancedExportDialog = useCallback(() => hideDialog('showAdvancedExport'), [hideDialog]);
  const closeShortcutsDialog = useCallback(() => hideDialog('showShortcuts'), [hideDialog]);

  // Create actions object
  const actions = {
    showDialog,
    hideDialog,
    hideAllDialogs,
    toggleDialog,
    showSearchDialog,
    showTemplatesDialog,
    showAdvancedExportDialog,
    showShortcutsDialog,
    handleEscapeKey,
    // Specific close handlers
    closeSearchDialog,
    closeTemplatesDialog,
    closeAdvancedExportDialog,
    closeShortcutsDialog
  };

  // Create utility functions
  const utils = {
    isAnyDialogOpen,
    getOpenDialogs,
    isDialogOpen: (dialog: keyof DialogState) => dialogState[dialog],
    getDialogCount: () => getOpenDialogs().length
  };

  return {
    state: dialogState,
    actions,
    utils
  };
};

/**
 * Extended dialog manager return type with utilities
 */
export interface UseDialogManagerExtendedReturn extends UseDialogManagerReturn {
  utils: {
    isAnyDialogOpen: () => boolean;
    getOpenDialogs: () => (keyof DialogState)[];
    isDialogOpen: (dialog: keyof DialogState) => boolean;
    getDialogCount: () => number;
  };
}

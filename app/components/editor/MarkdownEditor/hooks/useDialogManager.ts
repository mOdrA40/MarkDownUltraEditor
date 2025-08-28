/**
 * @fileoverview Dialog state management hook
 * @author Axel Modra
 */

import { useCallback, useState } from "react";
import type { DialogState, UseDialogManagerReturn } from "../types";

/**
 * Custom hook for managing dialog visibility state
 * Centralizes all modal/dialog state management
 */
export const useDialogManager = (): UseDialogManagerReturn => {
  const [dialogState, setDialogState] = useState<DialogState>({
    showSearch: false,
    showShortcuts: false,
    showTemplates: false,
    showAdvancedExport: false,
  });

  /**
   * Show a specific dialog
   */
  const showDialog = useCallback((dialog: keyof DialogState) => {
    setDialogState((prev) => ({
      ...prev,
      [dialog]: true,
    }));
  }, []);

  /**
   * Hide a specific dialog
   */
  const hideDialog = useCallback((dialog: keyof DialogState) => {
    setDialogState((prev) => ({
      ...prev,
      [dialog]: false,
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
      showAdvancedExport: false,
    });
  }, []);

  /**
   * Toggle a specific dialog
   */
  const toggleDialog = useCallback((dialog: keyof DialogState) => {
    setDialogState((prev) => ({
      ...prev,
      [dialog]: !prev[dialog],
    }));
  }, []);

  /**
   * Check if any dialog is open
   */
  const isAnyDialogOpen = useCallback((): boolean => {
    return Object.values(dialogState).some((isOpen) => isOpen);
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
  const showSearchDialog = useCallback(
    (query?: string) => {
      showDialog("showSearch");
      if (query) {
        import("@/utils/console").then(({ safeConsole }) => {
          safeConsole.dev("Opening search with query:", query);
        });
      }
    },
    [showDialog]
  );

  /**
   * Show templates dialog
   */
  const showTemplatesDialog = useCallback(() => {
    showDialog("showTemplates");
  }, [showDialog]);

  /**
   * Show advanced export dialog
   */
  const showAdvancedExportDialog = useCallback(() => {
    showDialog("showAdvancedExport");
  }, [showDialog]);

  /**
   * Show keyboard shortcuts dialog
   */
  const showShortcutsDialog = useCallback(() => {
    showDialog("showShortcuts");
  }, [showDialog]);

  /**
   * Handle escape key to close dialogs
   */
  const handleEscapeKey = useCallback(() => {
    if (isAnyDialogOpen()) {
      hideAllDialogs();
      return true;
    }
    return false;
  }, [isAnyDialogOpen, hideAllDialogs]);

  /**
   * Dialog-specific close handlers
   */
  const closeSearchDialog = useCallback(
    () => hideDialog("showSearch"),
    [hideDialog]
  );
  const closeTemplatesDialog = useCallback(
    () => hideDialog("showTemplates"),
    [hideDialog]
  );
  const closeAdvancedExportDialog = useCallback(
    () => hideDialog("showAdvancedExport"),
    [hideDialog]
  );
  const closeShortcutsDialog = useCallback(
    () => hideDialog("showShortcuts"),
    [hideDialog]
  );

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
    closeSearchDialog,
    closeTemplatesDialog,
    closeAdvancedExportDialog,
    closeShortcutsDialog,
  };

  const utils = {
    isAnyDialogOpen,
    getOpenDialogs,
    isDialogOpen: (dialog: keyof DialogState) => dialogState[dialog],
    getDialogCount: () => getOpenDialogs().length,
  };

  return {
    state: dialogState,
    actions,
    utils,
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

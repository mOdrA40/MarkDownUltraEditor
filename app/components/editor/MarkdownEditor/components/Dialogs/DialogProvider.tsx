/**
 * @fileoverview Dialog context provider for managing dialog state
 * @author Axel Modra
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { DialogState } from '../../types';

/**
 * Dialog action types
 */
type DialogAction =
  | { type: 'SHOW_DIALOG'; payload: keyof DialogState }
  | { type: 'HIDE_DIALOG'; payload: keyof DialogState }
  | { type: 'HIDE_ALL_DIALOGS' }
  | { type: 'TOGGLE_DIALOG'; payload: keyof DialogState };

/**
 * Dialog context interface
 */
interface DialogContextType {
  state: DialogState;
  showDialog: (dialog: keyof DialogState) => void;
  hideDialog: (dialog: keyof DialogState) => void;
  hideAllDialogs: () => void;
  toggleDialog: (dialog: keyof DialogState) => void;
  isAnyDialogOpen: () => boolean;
  getOpenDialogs: () => (keyof DialogState)[];
}

/**
 * Initial dialog state
 */
const initialDialogState: DialogState = {
  showSearch: false,
  showShortcuts: false,
  showTemplates: false,
  showAdvancedExport: false
};

/**
 * Dialog reducer
 */
const dialogReducer = (state: DialogState, action: DialogAction): DialogState => {
  switch (action.type) {
    case 'SHOW_DIALOG':
      return {
        ...state,
        [action.payload]: true
      };
    
    case 'HIDE_DIALOG':
      return {
        ...state,
        [action.payload]: false
      };
    
    case 'HIDE_ALL_DIALOGS':
      return {
        showSearch: false,
        showShortcuts: false,
        showTemplates: false,
        showAdvancedExport: false
      };
    
    case 'TOGGLE_DIALOG':
      return {
        ...state,
        [action.payload]: !state[action.payload]
      };
    
    default:
      return state;
  }
};

/**
 * Dialog context
 */
const DialogContext = createContext<DialogContextType | undefined>(undefined);

/**
 * Dialog provider props
 */
interface DialogProviderProps {
  children: React.ReactNode;
  initialState?: Partial<DialogState>;
}

/**
 * Dialog provider component
 */
export const DialogProvider: React.FC<DialogProviderProps> = ({
  children,
  initialState = {}
}) => {
  const [state, dispatch] = useReducer(dialogReducer, {
    ...initialDialogState,
    ...initialState
  });

  /**
   * Show a specific dialog
   */
  const showDialog = useCallback((dialog: keyof DialogState) => {
    dispatch({ type: 'SHOW_DIALOG', payload: dialog });
  }, []);

  /**
   * Hide a specific dialog
   */
  const hideDialog = useCallback((dialog: keyof DialogState) => {
    dispatch({ type: 'HIDE_DIALOG', payload: dialog });
  }, []);

  /**
   * Hide all dialogs
   */
  const hideAllDialogs = useCallback(() => {
    dispatch({ type: 'HIDE_ALL_DIALOGS' });
  }, []);

  /**
   * Toggle a specific dialog
   */
  const toggleDialog = useCallback((dialog: keyof DialogState) => {
    dispatch({ type: 'TOGGLE_DIALOG', payload: dialog });
  }, []);

  /**
   * Check if any dialog is open
   */
  const isAnyDialogOpen = useCallback((): boolean => {
    return Object.values(state).some(isOpen => isOpen);
  }, [state]);

  /**
   * Get list of open dialogs
   */
  const getOpenDialogs = useCallback((): (keyof DialogState)[] => {
    return Object.entries(state)
      .filter(([, isOpen]) => isOpen)
      .map(([dialog]) => dialog as keyof DialogState);
  }, [state]);

  /**
   * Handle escape key globally
   */
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isAnyDialogOpen()) {
        event.preventDefault();
        hideAllDialogs();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isAnyDialogOpen, hideAllDialogs]);

  const contextValue: DialogContextType = {
    state,
    showDialog,
    hideDialog,
    hideAllDialogs,
    toggleDialog,
    isAnyDialogOpen,
    getOpenDialogs
  };

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
};

/**
 * Hook to use dialog context
 */
export const useDialogContext = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialogContext must be used within a DialogProvider');
  }
  return context;
};

/**
 * Hook for specific dialog management
 */
export const useDialog = (dialogKey: keyof DialogState) => {
  const { state, showDialog, hideDialog, toggleDialog } = useDialogContext();
  
  return {
    isOpen: state[dialogKey],
    show: () => showDialog(dialogKey),
    hide: () => hideDialog(dialogKey),
    toggle: () => toggleDialog(dialogKey)
  };
};

/**
 * Higher-order component for dialog management
 */
export const withDialogManagement = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => {
    return (
      <DialogProvider>
        <Component {...props} />
      </DialogProvider>
    );
  };

  WrappedComponent.displayName = `withDialogManagement(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

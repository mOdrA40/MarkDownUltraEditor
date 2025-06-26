/**
 * @fileoverview State management type definitions
 * @author Axel Modra
 */

import { Theme } from "../../../features/ThemeSelector";

/**
 * State management action types
 */
export enum ActionType {
  // Editor actions
  SET_MARKDOWN = 'SET_MARKDOWN',
  SET_FILE_NAME = 'SET_FILE_NAME',
  SET_MODIFIED = 'SET_MODIFIED',
  NEW_FILE = 'NEW_FILE',
  LOAD_FILE = 'LOAD_FILE',
  
  // UI actions
  TOGGLE_PREVIEW = 'TOGGLE_PREVIEW',
  TOGGLE_TOC = 'TOGGLE_TOC',
  TOGGLE_OUTLINE = 'TOGGLE_OUTLINE',
  TOGGLE_NAVIGATION = 'TOGGLE_NAVIGATION',
  TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_COLLAPSED = 'SET_SIDEBAR_COLLAPSED',
  
  // Settings actions
  UPDATE_FONT_SIZE = 'UPDATE_FONT_SIZE',
  UPDATE_LINE_HEIGHT = 'UPDATE_LINE_HEIGHT',
  TOGGLE_FOCUS_MODE = 'TOGGLE_FOCUS_MODE',
  TOGGLE_TYPEWRITER_MODE = 'TOGGLE_TYPEWRITER_MODE',
  TOGGLE_WORD_WRAP = 'TOGGLE_WORD_WRAP',
  TOGGLE_VIM_MODE = 'TOGGLE_VIM_MODE',
  TOGGLE_ZEN_MODE = 'TOGGLE_ZEN_MODE',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  
  // Theme actions
  SET_THEME = 'SET_THEME',
  APPLY_THEME = 'APPLY_THEME',
  
  // Dialog actions
  SHOW_DIALOG = 'SHOW_DIALOG',
  HIDE_DIALOG = 'HIDE_DIALOG',
  HIDE_ALL_DIALOGS = 'HIDE_ALL_DIALOGS',
  
  // Responsive actions
  UPDATE_RESPONSIVE = 'UPDATE_RESPONSIVE',
  SET_DEVICE_TYPE = 'SET_DEVICE_TYPE',
  
  // Undo/Redo actions
  UNDO = 'UNDO',
  REDO = 'REDO',
  CLEAR_HISTORY = 'CLEAR_HISTORY',
  
  // System actions
  RESET_STATE = 'RESET_STATE',
  LOAD_SAVED_STATE = 'LOAD_SAVED_STATE',
  SAVE_STATE = 'SAVE_STATE'
}

/**
 * Base action interface
 */
export interface BaseAction {
  type: ActionType;
  timestamp?: number;
  meta?: {
    source?: string;
    userId?: string;
    sessionId?: string;
  };
}

/**
 * Editor-related actions
 */
export interface SetMarkdownAction extends BaseAction {
  type: ActionType.SET_MARKDOWN;
  payload: string;
}

export interface SetFileNameAction extends BaseAction {
  type: ActionType.SET_FILE_NAME;
  payload: string;
}

export interface SetModifiedAction extends BaseAction {
  type: ActionType.SET_MODIFIED;
  payload: boolean;
}

export interface LoadFileAction extends BaseAction {
  type: ActionType.LOAD_FILE;
  payload: {
    content: string;
    fileName: string;
  };
}

/**
 * UI-related actions
 */
export interface TogglePreviewAction extends BaseAction {
  type: ActionType.TOGGLE_PREVIEW;
}

export interface ToggleTocAction extends BaseAction {
  type: ActionType.TOGGLE_TOC;
}

export interface ToggleOutlineAction extends BaseAction {
  type: ActionType.TOGGLE_OUTLINE;
}

export interface ToggleNavigationAction extends BaseAction {
  type: ActionType.TOGGLE_NAVIGATION;
}

export interface SetSidebarCollapsedAction extends BaseAction {
  type: ActionType.SET_SIDEBAR_COLLAPSED;
  payload: boolean;
}

/**
 * Settings-related actions
 */
export interface UpdateFontSizeAction extends BaseAction {
  type: ActionType.UPDATE_FONT_SIZE;
  payload: number;
}

export interface UpdateLineHeightAction extends BaseAction {
  type: ActionType.UPDATE_LINE_HEIGHT;
  payload: number;
}

export interface ToggleFocusModeAction extends BaseAction {
  type: ActionType.TOGGLE_FOCUS_MODE;
}

export interface ToggleTypewriterModeAction extends BaseAction {
  type: ActionType.TOGGLE_TYPEWRITER_MODE;
}

export interface ToggleWordWrapAction extends BaseAction {
  type: ActionType.TOGGLE_WORD_WRAP;
}

export interface ToggleVimModeAction extends BaseAction {
  type: ActionType.TOGGLE_VIM_MODE;
}

export interface ToggleZenModeAction extends BaseAction {
  type: ActionType.TOGGLE_ZEN_MODE;
}

export interface UpdateSettingsAction extends BaseAction {
  type: ActionType.UPDATE_SETTINGS;
  payload: {
    fontSize?: number;
    lineHeight?: number;
    focusMode?: boolean;
    typewriterMode?: boolean;
    wordWrap?: boolean;
    vimMode?: boolean;
    zenMode?: boolean;
  };
}

/**
 * Theme-related actions
 */
export interface SetThemeAction extends BaseAction {
  type: ActionType.SET_THEME;
  payload: Theme;
}

/**
 * Dialog-related actions
 */
export interface ShowDialogAction extends BaseAction {
  type: ActionType.SHOW_DIALOG;
  payload: string;
}

export interface HideDialogAction extends BaseAction {
  type: ActionType.HIDE_DIALOG;
  payload: string;
}

/**
 * Responsive-related actions
 */
export interface UpdateResponsiveAction extends BaseAction {
  type: ActionType.UPDATE_RESPONSIVE;
  payload: {
    isMobile?: boolean;
    isTablet?: boolean;
    isSmallTablet?: boolean;
    screenWidth?: number;
    screenHeight?: number;
  };
}

/**
 * System actions
 */
export interface ResetStateAction extends BaseAction {
  type: ActionType.RESET_STATE;
}

export interface LoadSavedStateAction extends BaseAction {
  type: ActionType.LOAD_SAVED_STATE;
  payload: Record<string, unknown>;
}

export interface SaveStateAction extends BaseAction {
  type: ActionType.SAVE_STATE;
}

/**
 * Union type of all possible actions
 */
export type EditorAction =
  | SetMarkdownAction
  | SetFileNameAction
  | SetModifiedAction
  | LoadFileAction
  | TogglePreviewAction
  | ToggleTocAction
  | ToggleOutlineAction
  | ToggleNavigationAction
  | SetSidebarCollapsedAction
  | UpdateFontSizeAction
  | UpdateLineHeightAction
  | ToggleFocusModeAction
  | ToggleTypewriterModeAction
  | ToggleWordWrapAction
  | ToggleVimModeAction
  | ToggleZenModeAction
  | UpdateSettingsAction
  | SetThemeAction
  | ShowDialogAction
  | HideDialogAction
  | UpdateResponsiveAction
  | ResetStateAction
  | LoadSavedStateAction
  | SaveStateAction;

/**
 * State reducer function type
 */
export type StateReducer<TState> = (state: TState, action: EditorAction) => TState;

/**
 * State middleware function type
 */
export type StateMiddleware<TState> = (
  state: TState,
  action: EditorAction,
  next: (action: EditorAction) => TState
) => TState;

/**
 * State listener function type
 */
export type StateListener<TState> = (
  state: TState,
  prevState: TState,
  action: EditorAction
) => void;

/**
 * State manager configuration
 */
export interface StateManagerConfig {
  /** Enable state persistence */
  enablePersistence: boolean;
  /** Storage key for persistence */
  storageKey: string;
  /** Enable action logging */
  enableLogging: boolean;
  /** Maximum number of actions to keep in history */
  maxHistorySize: number;
  /** Debounce time for state persistence */
  persistenceDebounceMs: number;
}

/**
 * State manager interface
 */
export interface StateManager<TState> {
  /** Current state */
  state: TState;
  /** Dispatch an action */
  dispatch: (action: EditorAction) => void;
  /** Subscribe to state changes */
  subscribe: (listener: StateListener<TState>) => () => void;
  /** Get current state */
  getState: () => TState;
  /** Reset state to initial */
  reset: () => void;
  /** Load state from storage */
  loadState: () => void;
  /** Save state to storage */
  saveState: () => void;
}

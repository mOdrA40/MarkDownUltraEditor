/**
 * @fileoverview Comprehensive type definitions for MarkdownEditor
 * @author Axel Modra
 */

import type { Theme } from '../../../features/ThemeSelector';

/**
 * Main editor state interface
 */
export interface EditorState {
  /** Current markdown content */
  markdown: string;
  /** Current file name */
  fileName: string;
  /** Whether content has been modified */
  isModified: boolean;
  /** Auto-save enabled flag */
  autoSave: boolean;
}

/**
 * Editor settings configuration
 */
export interface EditorSettings {
  /** Font size in pixels */
  fontSize: number;
  /** Line height multiplier */
  lineHeight: number;
  /** Focus mode enabled */
  focusMode: boolean;
  /** Typewriter mode enabled */
  typewriterMode: boolean;
  /** Word wrap enabled */
  wordWrap: boolean;
  /** Vim mode enabled */
  vimMode: boolean;
  /** Zen mode enabled */
  zenMode: boolean;
}

/**
 * UI visibility state
 */
export interface UIState {
  /** Show preview pane */
  showPreview: boolean;
  /** Show table of contents */
  showToc: boolean;
  /** Show document outline */
  showOutline: boolean;
  /** Show navigation (combined TOC + Outline) */
  showNavigation: boolean;
  /** Sidebar collapsed state */
  sidebarCollapsed: boolean;
}

/**
 * Dialog visibility state
 */
export interface DialogState {
  /** Show search dialog */
  showSearch: boolean;
  /** Show keyboard shortcuts dialog */
  showShortcuts: boolean;
  /** Show document templates dialog */
  showTemplates: boolean;
  /** Show advanced export dialog */
  showAdvancedExport: boolean;
}

/**
 * Responsive layout configuration
 */
export interface ResponsiveState {
  /** Mobile device detected */
  isMobile: boolean;
  /** Tablet device detected */
  isTablet: boolean;
  /** Small tablet device detected */
  isSmallTablet: boolean;
}

/**
 * Theme management state
 */
export interface ThemeState {
  /** Current active theme */
  currentTheme: Theme;
}

/**
 * Undo/Redo functionality state
 */
export interface UndoRedoState {
  /** Can perform undo */
  canUndo: boolean;
  /** Can perform redo */
  canRedo: boolean;
}

/**
 * Complete application state combining all sub-states
 */
export interface AppState {
  editor: EditorState;
  settings: EditorSettings;
  ui: UIState;
  dialogs: DialogState;
  responsive: ResponsiveState;
  theme: ThemeState;
  undoRedo: UndoRedoState;
}

/**
 * Action types for state management
 */
export type EditorAction =
  | { type: 'SET_MARKDOWN'; payload: string }
  | { type: 'SET_FILE_NAME'; payload: string }
  | { type: 'SET_MODIFIED'; payload: boolean }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'TOGGLE_TOC' }
  | { type: 'TOGGLE_OUTLINE' }
  | { type: 'TOGGLE_NAVIGATION' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<EditorSettings> }
  | { type: 'UPDATE_RESPONSIVE'; payload: Partial<ResponsiveState> }
  | { type: 'SHOW_DIALOG'; payload: keyof DialogState }
  | { type: 'HIDE_DIALOG'; payload: keyof DialogState }
  | { type: 'RESET_STATE' };

/**
 * Event handler types
 */
export interface EditorEventHandlers {
  onMarkdownChange: (value: string) => void;
  onFileNameChange: (name: string) => void;
  onThemeChange: (theme: Theme) => void;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
  onInsertText: (text: string) => void;
  onInsertImage: (imageUrl: string, altText: string) => void;
  onLoadTemplate: (content: string, fileName: string) => void;
  onNewFile: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

/**
 * Component props interfaces
 */
export interface MarkdownEditorProps {
  /** Initial markdown content */
  initialMarkdown?: string;
  /** Initial file name */
  initialFileName?: string;
  /** Initial theme */
  initialTheme?: Theme;
  /** Custom event handlers */
  eventHandlers?: Partial<EditorEventHandlers>;
  /** Custom CSS classes */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Hook return types
 */
export interface UseEditorStateReturn {
  state: EditorState;
  actions: {
    setMarkdown: (value: string) => void;
    setFileName: (name: string) => void;
    setModified: (modified: boolean) => void;
    newFile: () => void;
    loadFile: (content: string, name: string) => void;
  };
  undoRedo: {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clearHistory: (newValue?: string) => void;
  };
}

/**
 * Device type enumeration - Updated to match new responsive system
 */
export enum DeviceType {
  MOBILE_SMALL = 'mobile-small',
  MOBILE = 'mobile',
  TABLET_SMALL = 'tablet-small',
  TABLET_LARGE = 'tablet-large',
  DESKTOP_SMALL = 'desktop-small',
  DESKTOP_LARGE = 'desktop-large',
}

/**
 * Breakpoint keys
 */
export type BreakpointKey = 'mobile' | 'tablet' | 'desktop';

/**
 * Layout configuration interface
 */
export interface LayoutConfig {
  showSidebar: boolean;
  sidebarWidth: number;
  autoCollapseSidebar: boolean;
  stackLayout: boolean;
  compactMode: boolean;
  touchFriendly: boolean;
}

/**
 * Component sizing interface
 */
export interface ComponentSizing {
  buttonSize: 'sm' | 'md' | 'lg';
  iconSize: number;
  fontSizeMultiplier: number;
  spacingMultiplier: number;
  minTouchTarget: number;
}

export interface UseResponsiveLayoutReturn {
  state: ResponsiveState;
  config: {
    deviceType: DeviceType;
    screenWidth: number;
    screenHeight: number;
    isTouchDevice: boolean;
    orientation: 'portrait' | 'landscape';
  };
  layout: LayoutConfig;
  sizing: ComponentSizing;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  actions: {
    updateBreakpoints: () => void;
  };
  utils: {
    isDevice: (type: DeviceType) => boolean;
    isAtLeast: (breakpoint: BreakpointKey) => boolean;
    isAtMost: (breakpoint: BreakpointKey) => boolean;
    getOptimalLayout: () => LayoutConfig;
    getComponentSizing: () => ComponentSizing;
  };
}

export interface UseThemeManagerReturn {
  state: ThemeState;
  actions: {
    setTheme: (theme: Theme) => void;
    applyTheme: (theme: Theme) => void;
    saveTheme: (theme: Theme) => void;
    loadSavedTheme: () => Theme | null;
    cycleToNextTheme: () => void;
    cycleToPreviousTheme: () => void;
    toggleDarkMode: () => void;
    getThemeById: (themeId: string) => Theme | null;
    getNextTheme: () => Theme;
    getPreviousTheme: () => Theme;
    isDarkTheme: () => boolean;
    getThemeContrastRatio: (theme: Theme) => number;
  };
  themes: Theme[];
  utils: {
    isDark: boolean;
    contrastRatio: number;
    availableThemes: Theme[];
  };
}

export interface UseDialogManagerReturn {
  state: DialogState;
  actions: {
    showDialog: (dialog: keyof DialogState) => void;
    hideDialog: (dialog: keyof DialogState) => void;
    hideAllDialogs: () => void;
    toggleDialog: (dialog: keyof DialogState) => void;
    showSearchDialog: (query?: string) => void;
    showTemplatesDialog: () => void;
    showAdvancedExportDialog: () => void;
    showShortcutsDialog: () => void;
    handleEscapeKey: () => boolean;
    closeSearchDialog: () => void;
    closeTemplatesDialog: () => void;
    closeAdvancedExportDialog: () => void;
    closeShortcutsDialog: () => void;
  };
  utils: {
    isAnyDialogOpen: () => boolean;
    getOpenDialogs: () => (keyof DialogState)[];
    isDialogOpen: (dialog: keyof DialogState) => boolean;
    getDialogCount: () => number;
  };
}

/**
 * Utility types
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Configuration types
 */
export interface EditorConfig {
  /** Default settings */
  defaultSettings: EditorSettings;
  /** Responsive breakpoints */
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  /** Auto-save configuration */
  autoSave: {
    enabled: boolean;
    debounceMs: number;
  };
  /** Undo/Redo configuration */
  undoRedo: {
    maxHistorySize: number;
    debounceMs: number;
  };
}

/**
 * Error types
 */
export interface EditorError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type EditorErrorType =
  | 'LOAD_ERROR'
  | 'SAVE_ERROR'
  | 'THEME_ERROR'
  | 'RESPONSIVE_ERROR'
  | 'VALIDATION_ERROR';

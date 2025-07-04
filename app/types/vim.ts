/**
 * Type definitions untuk Vim mode system
 * Comprehensive types untuk vim functionality
 */

/**
 * Vim mode types
 */
export type VimMode = 'normal' | 'insert' | 'visual' | 'command';

/**
 * Vim command interface
 */
export interface VimCommand {
  key: string;
  mode: VimMode;
  description: string;
  execute: (context: VimContext) => void;
}

/**
 * Vim context untuk command execution
 */
export interface VimContext {
  textarea: HTMLTextAreaElement;
  value: string;
  selectionStart: number;
  selectionEnd: number;
  mode: VimMode;
  changeMode: (mode: VimMode) => void;
  updateValue: (newValue: string, newCursor?: number) => void;
}

/**
 * Vim cursor style configuration
 */
export interface VimCursorConfig {
  normal: {
    caretColor: string;
    focused: boolean;
  };
  insert: {
    caretColor: string;
    focused: boolean;
  };
  visual: {
    caretColor: string;
    focused: boolean;
  };
  command: {
    caretColor: string;
    focused: boolean;
  };
}

/**
 * Vim mode options
 */
export interface UseVimModeOptions {
  /**
   * Enable/disable vim mode
   */
  enabled: boolean;

  /**
   * Callback ketika mode berubah
   */
  onModeChange?: (mode: VimMode) => void;

  /**
   * Callback ketika value berubah
   */
  onValueChange?: (value: string) => void;

  /**
   * Custom cursor configuration
   */
  cursorConfig?: Partial<VimCursorConfig>;

  /**
   * Custom commands
   */
  customCommands?: VimCommand[];

  /**
   * Command timeout (ms)
   */
  commandTimeout?: number;
}

/**
 * Vim mode return interface
 */
export interface UseVimModeReturn {
  /**
   * Current vim mode
   */
  mode: VimMode;

  /**
   * Whether vim mode is enabled
   */
  isEnabled: boolean;

  /**
   * Key down handler untuk textarea
   */
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;

  /**
   * Enter insert mode
   */
  enterInsertMode: () => void;

  /**
   * Enter normal mode
   */
  enterNormalMode: () => void;

  /**
   * Enter visual mode
   */
  enterVisualMode: () => void;

  /**
   * Enter command mode
   */
  enterCommandMode: () => void;

  /**
   * Execute vim command
   */
  executeCommand: (command: string) => void;

  /**
   * Get available commands untuk current mode
   */
  getAvailableCommands: () => VimCommand[];
}

/**
 * Vim command registry interface
 */
export interface VimCommandRegistry {
  register: (command: VimCommand) => void;
  unregister: (key: string, mode: VimMode) => void;
  getCommand: (key: string, mode: VimMode) => VimCommand | undefined;
  getCommands: (mode: VimMode) => VimCommand[];
  clear: () => void;
}

/**
 * Vim state interface
 */
export interface VimState {
  mode: VimMode;
  commandBuffer: string;
  lastCommand: string;
  repeatCount: number;
  isRecording: boolean;
  macroBuffer: string[];
}

/**
 * Default vim cursor configuration
 */
export const DEFAULT_VIM_CURSOR_CONFIG: VimCursorConfig = {
  normal: {
    caretColor: 'transparent',
    focused: false,
  },
  insert: {
    caretColor: 'auto',
    focused: true,
  },
  visual: {
    caretColor: 'auto',
    focused: true,
  },
  command: {
    caretColor: 'auto',
    focused: true,
  },
};

/**
 * Vim constants
 */
export const VIM_CONSTANTS = {
  COMMAND_TIMEOUT: 1000,
  MAX_COMMAND_BUFFER: 10,
  ESCAPE_KEY: 'Escape',
  ENTER_KEY: 'Enter',
  SPACE_KEY: ' ',
} as const;

/**
 * Type definitions untuk Writing Settings
 * Comprehensive types untuk writing configuration
 */

/**
 * Writing settings interface
 */
export interface WritingSettings {
  fontSize: number;
  lineHeight: number;
  focusMode: boolean;
  typewriterMode: boolean;
  wordWrap: boolean;
  vimMode: boolean;
  zenMode: boolean;
}

/**
 * Writing settings action types
 */
export type WritingSettingsAction =
  | { type: 'SET_FONT_SIZE'; payload: number }
  | { type: 'SET_LINE_HEIGHT'; payload: number }
  | { type: 'TOGGLE_FOCUS_MODE' }
  | { type: 'TOGGLE_TYPEWRITER_MODE' }
  | { type: 'TOGGLE_WORD_WRAP' }
  | { type: 'TOGGLE_VIM_MODE' }
  | { type: 'TOGGLE_ZEN_MODE' }
  | { type: 'LOAD_SETTINGS'; payload: WritingSettings }
  | { type: 'RESET_SETTINGS' }
  | { type: 'BATCH_UPDATE'; payload: Partial<WritingSettings> };

/**
 * Writing settings validation rules
 */
export interface WritingSettingsValidation {
  fontSize: {
    min: number;
    max: number;
    step: number;
  };
  lineHeight: {
    min: number;
    max: number;
    step: number;
  };
}

/**
 * Writing settings hook options
 */
export interface UseWritingSettingsOptions {
  /**
   * Storage key untuk localStorage
   */
  storageKey?: string;

  /**
   * Auto-save delay (ms)
   */
  autoSaveDelay?: number;

  /**
   * Enable validation
   */
  enableValidation?: boolean;

  /**
   * Custom validation rules
   */
  validationRules?: Partial<WritingSettingsValidation>;

  /**
   * Callback ketika settings berubah
   */
  onSettingsChange?: (settings: WritingSettings) => void;
}

/**
 * Writing settings hook return type
 */
export interface UseWritingSettingsReturn extends WritingSettings {
  // Action creators
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  toggleFocusMode: () => void;
  toggleTypewriterMode: () => void;
  toggleWordWrap: () => void;
  toggleVimMode: () => void;
  toggleZenMode: () => void;
  resetSettings: () => void;
  batchUpdate: (updates: Partial<WritingSettings>) => void;

  // Utility methods
  isValidFontSize: (size: number) => boolean;
  isValidLineHeight: (height: number) => boolean;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

/**
 * Default writing settings
 */
export const DEFAULT_WRITING_SETTINGS: WritingSettings = {
  fontSize: 14,
  lineHeight: 1.6,
  focusMode: false,
  typewriterMode: false,
  wordWrap: true,
  vimMode: false,
  zenMode: false,
};

/**
 * Default validation rules
 */
export const DEFAULT_VALIDATION_RULES: WritingSettingsValidation = {
  fontSize: {
    min: 8,
    max: 32,
    step: 1,
  },
  lineHeight: {
    min: 1.0,
    max: 3.0,
    step: 0.1,
  },
};

/**
 * Writing settings constants
 */
export const WRITING_SETTINGS_CONSTANTS = {
  DEFAULT_STORAGE_KEY: 'markdownEditor_settings',
  DEFAULT_AUTO_SAVE_DELAY: 500,
  EXPORT_VERSION: '1.0',
} as const;

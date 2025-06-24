/**
 * Writing settings reducer dengan comprehensive state management
 * Pure reducer functions dengan immutable updates
 */

import { 
  WritingSettings, 
  WritingSettingsAction, 
  DEFAULT_WRITING_SETTINGS 
} from '@/types/writingSettings';
import { sanitizeWritingSettings } from '@/utils/writingSettingsUtils';

/**
 * Writing settings reducer dengan validation
 */
export const writingSettingsReducer = (
  state: WritingSettings, 
  action: WritingSettingsAction
): WritingSettings => {
  switch (action.type) {
    case 'SET_FONT_SIZE': {
      const fontSize = action.payload;
      
      // Basic validation
      if (typeof fontSize !== 'number' || fontSize < 8 || fontSize > 32) {
        console.warn(`Invalid font size: ${fontSize}. Must be between 8 and 32.`);
        return state;
      }
      
      return {
        ...state,
        fontSize
      };
    }

    case 'SET_LINE_HEIGHT': {
      const lineHeight = action.payload;
      
      // Basic validation
      if (typeof lineHeight !== 'number' || lineHeight < 1.0 || lineHeight > 3.0) {
        console.warn(`Invalid line height: ${lineHeight}. Must be between 1.0 and 3.0.`);
        return state;
      }
      
      return {
        ...state,
        lineHeight
      };
    }

    case 'TOGGLE_FOCUS_MODE':
      return {
        ...state,
        focusMode: !state.focusMode
      };

    case 'TOGGLE_TYPEWRITER_MODE':
      return {
        ...state,
        typewriterMode: !state.typewriterMode
      };

    case 'TOGGLE_WORD_WRAP':
      return {
        ...state,
        wordWrap: !state.wordWrap
      };

    case 'TOGGLE_VIM_MODE':
      return {
        ...state,
        vimMode: !state.vimMode
      };

    case 'TOGGLE_ZEN_MODE':
      return {
        ...state,
        zenMode: !state.zenMode
      };

    case 'LOAD_SETTINGS': {
      // Sanitize loaded settings
      const sanitizedSettings = sanitizeWritingSettings(action.payload);
      return sanitizedSettings;
    }

    case 'RESET_SETTINGS':
      return { ...DEFAULT_WRITING_SETTINGS };

    case 'BATCH_UPDATE': {
      const updates = action.payload;
      
      // Validate each update
      const validatedUpdates: Partial<WritingSettings> = {};
      
      if (updates.fontSize !== undefined) {
        if (typeof updates.fontSize === 'number' && updates.fontSize >= 8 && updates.fontSize <= 32) {
          validatedUpdates.fontSize = updates.fontSize;
        }
      }
      
      if (updates.lineHeight !== undefined) {
        if (typeof updates.lineHeight === 'number' && updates.lineHeight >= 1.0 && updates.lineHeight <= 3.0) {
          validatedUpdates.lineHeight = updates.lineHeight;
        }
      }
      
      // Boolean updates
      const booleanProps: (keyof WritingSettings)[] = [
        'focusMode', 'typewriterMode', 'wordWrap', 'vimMode', 'zenMode'
      ];
      
      booleanProps.forEach(prop => {
        if (updates[prop] !== undefined && typeof updates[prop] === 'boolean') {
          (validatedUpdates as unknown as Record<string, unknown>)[prop] = updates[prop];
        }
      });
      
      return {
        ...state,
        ...validatedUpdates
      };
    }

    default: {
      console.warn(`Unknown writing settings action: ${(action as { type: string }).type}`);
      return state;
    }
  }
};

/**
 * Action creators untuk writing settings
 */
export const writingSettingsActionCreators = {
  setFontSize: (fontSize: number): WritingSettingsAction => ({
    type: 'SET_FONT_SIZE',
    payload: fontSize
  }),

  setLineHeight: (lineHeight: number): WritingSettingsAction => ({
    type: 'SET_LINE_HEIGHT',
    payload: lineHeight
  }),

  toggleFocusMode: (): WritingSettingsAction => ({
    type: 'TOGGLE_FOCUS_MODE'
  }),

  toggleTypewriterMode: (): WritingSettingsAction => ({
    type: 'TOGGLE_TYPEWRITER_MODE'
  }),

  toggleWordWrap: (): WritingSettingsAction => ({
    type: 'TOGGLE_WORD_WRAP'
  }),

  toggleVimMode: (): WritingSettingsAction => ({
    type: 'TOGGLE_VIM_MODE'
  }),

  toggleZenMode: (): WritingSettingsAction => ({
    type: 'TOGGLE_ZEN_MODE'
  }),

  loadSettings: (settings: WritingSettings): WritingSettingsAction => ({
    type: 'LOAD_SETTINGS',
    payload: settings
  }),

  resetSettings: (): WritingSettingsAction => ({
    type: 'RESET_SETTINGS'
  }),

  batchUpdate: (updates: Partial<WritingSettings>): WritingSettingsAction => ({
    type: 'BATCH_UPDATE',
    payload: updates
  })
};

/**
 * Writing settings components export
 * Re-export semua writing settings-related components dan hooks
 */

// Re-export main hook
export { useWritingSettings } from '@/hooks/use-writing-settings';

// Re-export types
export type { 
  WritingSettings,
  WritingSettingsAction,
  WritingSettingsValidation,
  UseWritingSettingsOptions,
  UseWritingSettingsReturn
} from '@/types/writingSettings';

// Re-export utilities
export {
  validateFontSize,
  validateLineHeight,
  validateWritingSettings,
  sanitizeWritingSettings,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  exportWritingSettings,
  importWritingSettings,
  debounce,
  areSettingsEqual,
  getSettingsDiff
} from '@/utils/writingSettingsUtils';

// Re-export constants from types
export {
  DEFAULT_WRITING_SETTINGS,
  DEFAULT_VALIDATION_RULES,
  WRITING_SETTINGS_CONSTANTS
} from '@/types/writingSettings';

// Re-export reducer dan action creators
export { 
  writingSettingsReducer, 
  writingSettingsActionCreators 
} from '@/hooks/writingSettings/writingSettingsReducer';

/**
 * Writing settings provider component
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { useWritingSettings } from '@/hooks/use-writing-settings';
import type { UseWritingSettingsReturn, UseWritingSettingsOptions } from '@/types/writingSettings';

const WritingSettingsContext = createContext<UseWritingSettingsReturn | null>(null);

interface WritingSettingsProviderProps {
  children: ReactNode;
  options?: UseWritingSettingsOptions;
}

export const WritingSettingsProvider: React.FC<WritingSettingsProviderProps> = ({ 
  children, 
  options 
}) => {
  const settingsApi = useWritingSettings(options);

  return (
    <WritingSettingsContext.Provider value={settingsApi}>
      {children}
    </WritingSettingsContext.Provider>
  );
};

/**
 * Hook untuk menggunakan writing settings context
 */
export const useWritingSettingsContext = (): UseWritingSettingsReturn => {
  const context = useContext(WritingSettingsContext);
  if (!context) {
    throw new Error('useWritingSettingsContext must be used within a WritingSettingsProvider');
  }
  return context;
};

/**
 * Font size control component
 */
interface FontSizeControlProps {
  value: number;
  onChange: (size: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const FontSizeControl: React.FC<FontSizeControlProps> = ({
  value,
  onChange,
  min = 8,
  max = 32,
  step = 1,
  className = ''
}) => {
  return (
    <div className={`font-size-control ${className}`}>
      <label className="block text-sm font-medium mb-1">
        Font Size: {value}px
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}px</span>
        <span>{max}px</span>
      </div>
    </div>
  );
};

/**
 * Line height control component
 */
interface LineHeightControlProps {
  value: number;
  onChange: (height: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const LineHeightControl: React.FC<LineHeightControlProps> = ({
  value,
  onChange,
  min = 1.0,
  max = 3.0,
  step = 0.1,
  className = ''
}) => {
  return (
    <div className={`line-height-control ${className}`}>
      <label className="block text-sm font-medium mb-1">
        Line Height: {value.toFixed(1)}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

/**
 * Toggle setting component
 */
interface ToggleSettingProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const ToggleSetting: React.FC<ToggleSettingProps> = ({
  label,
  description,
  checked,
  onChange,
  className = ''
}) => {
  return (
    <div className={`toggle-setting ${className}`}>
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="form-checkbox h-4 w-4"
        />
        <div>
          <div className="text-sm font-medium">{label}</div>
          {description && (
            <div className="text-xs text-gray-500">{description}</div>
          )}
        </div>
      </label>
    </div>
  );
};

/**
 * Writing settings panel component
 */
interface WritingSettingsPanelProps {
  className?: string;
}

export const WritingSettingsPanel: React.FC<WritingSettingsPanelProps> = ({
  className = ''
}) => {
  const {
    fontSize,
    lineHeight,
    focusMode,
    typewriterMode,
    wordWrap,
    vimMode,
    zenMode,
    setFontSize,
    setLineHeight,
    toggleFocusMode,
    toggleTypewriterMode,
    toggleWordWrap,
    toggleVimMode,
    toggleZenMode,
    resetSettings
  } = useWritingSettingsContext();

  return (
    <div className={`writing-settings-panel space-y-4 ${className}`}>
      <div className="space-y-4">
        <FontSizeControl
          value={fontSize}
          onChange={setFontSize}
        />
        
        <LineHeightControl
          value={lineHeight}
          onChange={setLineHeight}
        />
      </div>

      <div className="space-y-3">
        <ToggleSetting
          label="Focus Mode"
          description="Highlight current paragraph"
          checked={focusMode}
          onChange={toggleFocusMode}
        />
        
        <ToggleSetting
          label="Typewriter Mode"
          description="Keep cursor centered"
          checked={typewriterMode}
          onChange={toggleTypewriterMode}
        />
        
        <ToggleSetting
          label="Word Wrap"
          description="Wrap long lines"
          checked={wordWrap}
          onChange={toggleWordWrap}
        />
        
        <ToggleSetting
          label="Vim Mode"
          description="Enable Vim keybindings"
          checked={vimMode}
          onChange={toggleVimMode}
        />
        
        <ToggleSetting
          label="Zen Mode"
          description="Distraction-free writing"
          checked={zenMode}
          onChange={toggleZenMode}
        />
      </div>

      <button
        onClick={resetSettings}
        className="
          w-full px-3 py-2 text-sm
          bg-gray-100 hover:bg-gray-200
          dark:bg-gray-800 dark:hover:bg-gray-700
          rounded border
        "
      >
        Reset to Defaults
      </button>
    </div>
  );
};

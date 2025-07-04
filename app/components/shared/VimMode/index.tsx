/**
 * Vim mode components export
 * Re-export semua vim-related components dan hooks
 */

// Re-export main hook
// Re-export command registry
export {
  registerDefaultCommands,
  useVimMode,
  vimCommandRegistry,
} from '@/hooks/editor';
// Re-export types
export type {
  UseVimModeOptions,
  UseVimModeReturn,
  VimCommand,
  VimCommandRegistry,
  VimContext,
  VimMode,
  VimState,
} from '@/types/vim';

// Re-export constants from types
export {
  DEFAULT_VIM_CURSOR_CONFIG,
  VIM_CONSTANTS,
} from '@/types/vim';
// Re-export utilities
export {
  applyCursorStyle,
  deleteCharacter,
  deleteCurrentLine,
  getCurrentLine,
  getLineNumber,
  insertText,
  isValidVimCommand,
  moveByWord,
  moveToLine,
  moveToLineEnd,
  moveToLineStart,
  parseVimCommand,
} from '@/utils/vimUtils';

/**
 * Vim mode indicator component
 */
import React from 'react';
import { useVimMode, vimCommandRegistry } from '@/hooks/editor';
import type { VimMode } from '@/types/vim';

interface VimModeIndicatorProps {
  mode: VimMode;
  isEnabled: boolean;
  className?: string;
}

export const VimModeIndicator: React.FC<VimModeIndicatorProps> = ({
  mode,
  isEnabled,
  className = '',
}) => {
  if (!isEnabled) return null;

  const getModeColor = (mode: VimMode): string => {
    switch (mode) {
      case 'normal':
        return 'bg-blue-500 text-white';
      case 'insert':
        return 'bg-green-500 text-white';
      case 'visual':
        return 'bg-yellow-500 text-black';
      case 'command':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getModeLabel = (mode: VimMode): string => {
    switch (mode) {
      case 'normal':
        return 'NORMAL';
      case 'insert':
        return 'INSERT';
      case 'visual':
        return 'VISUAL';
      case 'command':
        return 'COMMAND';
      default:
        return (mode as string).toUpperCase();
    }
  };

  return (
    <div
      className={`
        px-2 py-1 text-xs font-mono font-bold rounded
        ${getModeColor(mode)}
        ${className}
      `}
      title={`Vim Mode: ${getModeLabel(mode)}`}
    >
      {getModeLabel(mode)}
    </div>
  );
};

/**
 * Vim command palette component
 */
interface VimCommandPaletteProps {
  mode: VimMode;
  onCommandSelect?: (command: string) => void;
  className?: string;
}

export const VimCommandPalette: React.FC<VimCommandPaletteProps> = ({
  mode,
  onCommandSelect,
  className = '',
}) => {
  const commands = vimCommandRegistry.getCommands(mode);

  if (commands.length === 0) return null;

  return (
    <div className={`vim-command-palette ${className}`}>
      <h3 className="text-sm font-semibold mb-2">Available Commands ({mode} mode)</h3>
      <div className="space-y-1">
        {commands.map((command) => (
          <button
            key={`${command.mode}-${command.key}`}
            className="
              w-full text-left px-2 py-1 text-xs
              hover:bg-gray-100 dark:hover:bg-gray-800
              rounded font-mono
            "
            onClick={() => onCommandSelect?.(command.key)}
            title={command.description}
          >
            <span className="font-bold">{command.key}</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{command.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Vim mode wrapper component
 */
interface VimModeWrapperProps {
  children: React.ReactNode;
  enabled: boolean;
  showIndicator?: boolean;
  showCommandPalette?: boolean;
  className?: string;
}

export const VimModeWrapper: React.FC<VimModeWrapperProps> = ({
  children,
  enabled,
  showIndicator = true,
  showCommandPalette = false,
  className = '',
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = React.useState('');

  const { mode } = useVimMode(textareaRef, value, setValue, { enabled });

  return (
    <div className={`vim-mode-wrapper ${className}`}>
      {showIndicator && <VimModeIndicator mode={mode} isEnabled={enabled} className="mb-2" />}

      <div className="relative">{children}</div>

      {showCommandPalette && enabled && <VimCommandPalette mode={mode} className="mt-2" />}
    </div>
  );
};

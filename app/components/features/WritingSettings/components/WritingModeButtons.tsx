/**
 * WritingModeButtons Component - Tombol-tombol Writing Mode
 * Komponen untuk toggle berbagai writing modes
 *
 * @author Axel Modra
 */

import { Eye, Focus, Keyboard, Type } from 'lucide-react';
import type React from 'react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { A11Y, WRITING_MODES } from '../constants/settings.constants';
import type { WritingModeButtonsProps } from '../types/settings.types';

/**
 * WritingModeButtons component for toggling writing modes
 */
export const WritingModeButtons: React.FC<WritingModeButtonsProps> = memo(
  ({
    focusMode,
    onFocusModeToggle,
    typewriterMode,
    onTypewriterModeToggle,
    wordWrap,
    onWordWrapToggle,
    vimMode,
    onVimModeToggle,
    zenMode,
    onZenModeToggle,
    size = 'md',
    orientation = 'horizontal',
    className = '',
  }) => {
    // Button configuration based on size
    const getButtonClasses = () => {
      const baseClasses = 'text-xs transition-all duration-200';

      switch (size) {
        case 'sm':
          return `${baseClasses} h-6 px-2`;
        case 'lg':
          return `${baseClasses} h-9 px-3`;
        default:
          return `${baseClasses} h-7 px-2`;
      }
    };

    const getIconSize = () => {
      switch (size) {
        case 'sm':
          return 'h-2 w-2';
        case 'lg':
          return 'h-4 w-4';
        default:
          return 'h-3 w-3';
      }
    };

    // Konfigurasi container berdasarkan orientation
    const getContainerClasses = () => {
      const baseClasses = 'flex items-center';

      switch (orientation) {
        case 'vertical':
          return `${baseClasses} flex-col space-y-2`;
        case 'grid':
          return 'grid grid-cols-2 gap-2';
        default:
          return `${baseClasses} space-x-1`;
      }
    };

    const buttonClasses = getButtonClasses();
    const iconSize = getIconSize();
    const containerClasses = getContainerClasses();

    return (
      <div className={`writing-mode-buttons ${containerClasses} ${className}`}>
        {/* Focus Mode Button */}
        <Button
          variant={focusMode ? 'default' : 'ghost'}
          size="sm"
          onClick={onFocusModeToggle}
          className={`${buttonClasses} flex-shrink-0 writing-mode-button ${focusMode ? 'active' : ''}`}
          aria-label={A11Y.labels.toggleFocus}
          aria-pressed={focusMode}
          title={WRITING_MODES.focus.description}
          data-state={focusMode ? 'on' : 'off'}
        >
          <Focus className={`${iconSize} ${orientation !== 'vertical' ? 'mr-1' : ''}`} />
          {orientation === 'grid' ? (
            WRITING_MODES.focus.label
          ) : (
            <span className="hidden sm:inline">{WRITING_MODES.focus.label}</span>
          )}
        </Button>

        {/* Typewriter Mode Button */}
        <Button
          variant={typewriterMode ? 'default' : 'ghost'}
          size="sm"
          onClick={onTypewriterModeToggle}
          className={`${buttonClasses} flex-shrink-0 writing-mode-button ${typewriterMode ? 'active' : ''}`}
          aria-label={A11Y.labels.toggleTypewriter}
          aria-pressed={typewriterMode}
          title={WRITING_MODES.typewriter.description}
          data-state={typewriterMode ? 'on' : 'off'}
        >
          <Type className={`${iconSize} ${orientation !== 'vertical' ? 'mr-1' : ''}`} />
          {orientation === 'grid' ? (
            WRITING_MODES.typewriter.label
          ) : (
            <span className="hidden sm:inline">{WRITING_MODES.typewriter.label}</span>
          )}
        </Button>

        {/* Word Wrap Button */}
        <Button
          variant={wordWrap ? 'default' : 'ghost'}
          size="sm"
          onClick={onWordWrapToggle}
          className={`${buttonClasses} flex-shrink-0 writing-mode-button ${wordWrap ? 'active' : ''}`}
          aria-label={A11Y.labels.toggleWordWrap}
          aria-pressed={wordWrap}
          title={WRITING_MODES.wordWrap.description}
          data-state={wordWrap ? 'on' : 'off'}
        >
          {orientation === 'grid' ? (
            WRITING_MODES.wordWrap.label
          ) : (
            <span className="text-xs font-medium">W</span>
          )}
        </Button>

        {/* Vim Mode Button */}
        <Button
          variant={vimMode ? 'default' : 'ghost'}
          size="sm"
          onClick={onVimModeToggle}
          className={`${buttonClasses} flex-shrink-0 writing-mode-button ${vimMode ? 'active' : ''}`}
          aria-label={A11Y.labels.toggleVim}
          aria-pressed={vimMode}
          title={WRITING_MODES.vim.description}
          data-state={vimMode ? 'on' : 'off'}
        >
          <Keyboard className={`${iconSize} ${orientation !== 'vertical' ? 'mr-1' : ''}`} />
          {orientation === 'grid' ? (
            WRITING_MODES.vim.label
          ) : (
            <span className="hidden sm:inline">{WRITING_MODES.vim.label}</span>
          )}
        </Button>

        {/* Zen Mode Button - Special handling for full width on mobile */}
        {orientation === 'grid' ? (
          <div className="col-span-2">
            <Button
              variant={zenMode ? 'default' : 'ghost'}
              size="sm"
              onClick={onZenModeToggle}
              className={`${buttonClasses} w-full writing-mode-button ${zenMode ? 'active' : ''}`}
              aria-label={A11Y.labels.toggleZen}
              aria-pressed={zenMode}
              title={WRITING_MODES.zen.description}
              data-state={zenMode ? 'on' : 'off'}
            >
              <Eye className={`${iconSize} mr-2`} />
              {WRITING_MODES.zen.label} Mode
            </Button>
          </div>
        ) : (
          <Button
            variant={zenMode ? 'default' : 'ghost'}
            size="sm"
            onClick={onZenModeToggle}
            className={`${buttonClasses} flex-shrink-0 writing-mode-button ${zenMode ? 'active' : ''}`}
            aria-label={A11Y.labels.toggleZen}
            aria-pressed={zenMode}
            title={WRITING_MODES.zen.description}
            data-state={zenMode ? 'on' : 'off'}
          >
            <Eye className={`${iconSize} ${orientation !== 'vertical' ? 'mr-1' : ''}`} />
            <span className="hidden sm:inline">{WRITING_MODES.zen.label}</span>
          </Button>
        )}
      </div>
    );
  }
);

WritingModeButtons.displayName = 'WritingModeButtons';

export default WritingModeButtons;

/**
 * Vim command definitions dan registry
 * Implementasi command pattern untuk vim functionality
 */

import { VimCommand, VimCommandRegistry, VimMode } from '@/types/vim';
import { 
  moveToLineStart, 
  moveToLineEnd, 
  deleteCurrentLine, 
  moveByWord, 
  insertText, 
  deleteCharacter,

} from '@/utils/vimUtils';

/**
 * Command registry implementation
 */
class VimCommandRegistryImpl implements VimCommandRegistry {
  private commands = new Map<string, VimCommand>();

  private getKey(key: string, mode: VimMode): string {
    return `${mode}:${key}`;
  }

  register(command: VimCommand): void {
    const key = this.getKey(command.key, command.mode);
    this.commands.set(key, command);
  }

  unregister(key: string, mode: VimMode): void {
    const commandKey = this.getKey(key, mode);
    this.commands.delete(commandKey);
  }

  getCommand(key: string, mode: VimMode): VimCommand | undefined {
    const commandKey = this.getKey(key, mode);
    return this.commands.get(commandKey);
  }

  getCommands(mode: VimMode): VimCommand[] {
    const modePrefix = `${mode}:`;
    return Array.from(this.commands.values()).filter(cmd => 
      this.getKey(cmd.key, cmd.mode).startsWith(modePrefix)
    );
  }

  clear(): void {
    this.commands.clear();
  }
}

/**
 * Global command registry instance
 */
export const vimCommandRegistry = new VimCommandRegistryImpl();

/**
 * Normal mode commands
 */
const normalModeCommands: VimCommand[] = [
  // Movement commands
  {
    key: 'h',
    mode: 'normal',
    description: 'Move cursor left',
    execute: (context) => {
      const newPos = Math.max(0, context.selectionStart - 1);
      context.textarea.setSelectionRange(newPos, newPos);
    }
  },
  {
    key: 'j',
    mode: 'normal',
    description: 'Move cursor down',
    execute: (context) => {
      const lines = context.value.split('\n');
      const currentPos = context.selectionStart;
      const currentLineStart = context.value.lastIndexOf('\n', currentPos - 1) + 1;
      const currentLineIndex = context.value.substring(0, currentPos).split('\n').length - 1;
      const columnIndex = currentPos - currentLineStart;
      
      if (currentLineIndex < lines.length - 1) {
        const nextLineStart = context.value.indexOf('\n', currentPos) + 1;
        const nextLineLength = lines[currentLineIndex + 1].length;
        const newPos = nextLineStart + Math.min(columnIndex, nextLineLength);
        context.textarea.setSelectionRange(newPos, newPos);
      }
    }
  },
  {
    key: 'k',
    mode: 'normal',
    description: 'Move cursor up',
    execute: (context) => {
      const currentPos = context.selectionStart;
      const currentLineStart = context.value.lastIndexOf('\n', currentPos - 1) + 1;
      const currentLineIndex = context.value.substring(0, currentPos).split('\n').length - 1;
      const columnIndex = currentPos - currentLineStart;
      
      if (currentLineIndex > 0) {
        const prevLineStart = context.value.lastIndexOf('\n', currentLineStart - 2) + 1;
        const prevLineEnd = currentLineStart - 1;
        const prevLineLength = prevLineEnd - prevLineStart;
        const newPos = prevLineStart + Math.min(columnIndex, prevLineLength);
        context.textarea.setSelectionRange(newPos, newPos);
      }
    }
  },
  {
    key: 'l',
    mode: 'normal',
    description: 'Move cursor right',
    execute: (context) => {
      const newPos = Math.min(context.value.length, context.selectionStart + 1);
      context.textarea.setSelectionRange(newPos, newPos);
    }
  },
  
  // Line movement commands
  {
    key: '0',
    mode: 'normal',
    description: 'Move to beginning of line',
    execute: (context) => moveToLineStart(context.textarea)
  },
  {
    key: '$',
    mode: 'normal',
    description: 'Move to end of line',
    execute: (context) => moveToLineEnd(context.textarea)
  },
  {
    key: '^',
    mode: 'normal',
    description: 'Move to first non-blank character',
    execute: (context) => {
      moveToLineStart(context.textarea);
      const line = context.value.substring(context.textarea.selectionStart);
      const match = line.match(/^\s*/);
      if (match) {
        const newPos = context.textarea.selectionStart + match[0].length;
        context.textarea.setSelectionRange(newPos, newPos);
      }
    }
  },
  
  // Word movement commands
  {
    key: 'w',
    mode: 'normal',
    description: 'Move to next word',
    execute: (context) => moveByWord(context.textarea, 'forward')
  },
  {
    key: 'b',
    mode: 'normal',
    description: 'Move to previous word',
    execute: (context) => moveByWord(context.textarea, 'backward')
  },
  
  // Insert mode commands
  {
    key: 'i',
    mode: 'normal',
    description: 'Enter insert mode',
    execute: (context) => context.changeMode('insert')
  },
  {
    key: 'I',
    mode: 'normal',
    description: 'Enter insert mode at beginning of line',
    execute: (context) => {
      moveToLineStart(context.textarea);
      context.changeMode('insert');
    }
  },
  {
    key: 'a',
    mode: 'normal',
    description: 'Enter insert mode after cursor',
    execute: (context) => {
      const newPos = Math.min(context.value.length, context.selectionStart + 1);
      context.textarea.setSelectionRange(newPos, newPos);
      context.changeMode('insert');
    }
  },
  {
    key: 'A',
    mode: 'normal',
    description: 'Enter insert mode at end of line',
    execute: (context) => {
      moveToLineEnd(context.textarea);
      context.changeMode('insert');
    }
  },
  {
    key: 'o',
    mode: 'normal',
    description: 'Open new line below',
    execute: (context) => {
      moveToLineEnd(context.textarea);
      insertText(context, '\n');
      context.changeMode('insert');
    }
  },
  {
    key: 'O',
    mode: 'normal',
    description: 'Open new line above',
    execute: (context) => {
      moveToLineStart(context.textarea);
      insertText(context, '\n');
      const newPos = context.textarea.selectionStart - 1;
      context.textarea.setSelectionRange(newPos, newPos);
      context.changeMode('insert');
    }
  },
  
  // Delete commands
  {
    key: 'x',
    mode: 'normal',
    description: 'Delete character under cursor',
    execute: (context) => deleteCharacter(context, 'forward')
  },
  {
    key: 'X',
    mode: 'normal',
    description: 'Delete character before cursor',
    execute: (context) => deleteCharacter(context, 'backward')
  },
  {
    key: 'dd',
    mode: 'normal',
    description: 'Delete current line',
    execute: (context) => deleteCurrentLine(context)
  },
  
  // Visual mode
  {
    key: 'v',
    mode: 'normal',
    description: 'Enter visual mode',
    execute: (context) => context.changeMode('visual')
  },
  
  // Command mode
  {
    key: ':',
    mode: 'normal',
    description: 'Enter command mode',
    execute: (context) => context.changeMode('command')
  }
];

/**
 * Insert mode commands
 */
const insertModeCommands: VimCommand[] = [
  {
    key: 'Escape',
    mode: 'insert',
    description: 'Return to normal mode',
    execute: (context) => context.changeMode('normal')
  }
];

/**
 * Visual mode commands
 */
const visualModeCommands: VimCommand[] = [
  {
    key: 'Escape',
    mode: 'visual',
    description: 'Return to normal mode',
    execute: (context) => context.changeMode('normal')
  }
];

/**
 * Command mode commands
 */
const commandModeCommands: VimCommand[] = [
  {
    key: 'Escape',
    mode: 'command',
    description: 'Return to normal mode',
    execute: (context) => context.changeMode('normal')
  }
];

/**
 * Register all default commands
 */
export const registerDefaultCommands = (): void => {
  // Clear existing commands
  vimCommandRegistry.clear();
  
  // Register all commands
  [...normalModeCommands, ...insertModeCommands, ...visualModeCommands, ...commandModeCommands]
    .forEach(command => vimCommandRegistry.register(command));
};

/**
 * Initialize vim commands
 */
registerDefaultCommands();

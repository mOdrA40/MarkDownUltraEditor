/**
 * Komponen untuk menampilkan individual key dalam shortcut
 * Menangani styling dan formatting key combinations
 */

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ShortcutKeyProps } from '../types/shortcutTypes';

export const ShortcutKey: React.FC<ShortcutKeyProps> = ({
  keyName,
  isLast = false,
  variant = 'default'
}) => {
  /**
   * Mendapatkan styling berdasarkan variant
   */
  const getKeyStyle = () => {
    switch (variant) {
      case 'mac':
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600";
      case 'special':
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  /**
   * Format key name untuk display yang lebih baik
   */
  const formatKeyName = (key: string): string => {
    const keyMappings: Record<string, string> = {
      'Ctrl': 'Ctrl',
      'Control': 'Ctrl',
      'Cmd': '⌘',
      'Command': '⌘',
      'Alt': 'Alt',
      'Option': '⌥',
      'Shift': '⇧',
      'Meta': '⌘',
      'Enter': '↵',
      'Tab': '⇥',
      'Space': 'Space',
      'Backspace': '⌫',
      'Delete': '⌦',
      'Escape': '⎋',
      'Esc': '⎋',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Up': '↑',
      'Down': '↓',
      'Left': '←',
      'Right': '→'
    };

    return keyMappings[key] || key;
  };

  /**
   * Mendapatkan ukuran key berdasarkan panjang text
   */
  const getKeySize = (key: string): string => {
    const formattedKey = formatKeyName(key);
    
    if (formattedKey.length === 1) {
      return "min-w-[24px] h-6";
    } else if (formattedKey.length <= 3) {
      return "min-w-[32px] h-6";
    } else {
      return "min-w-[40px] h-6";
    }
  };

  const formattedKey = formatKeyName(keyName);
  const keyStyle = getKeyStyle();
  const keySize = getKeySize(keyName);

  return (
    <div className="flex items-center">
      <Badge
        variant="secondary"
        className={`
          ${keyStyle} ${keySize}
          text-xs font-mono font-medium
          px-2 py-1 rounded border
          flex items-center justify-center
          transition-colors duration-200
          hover:bg-opacity-80
        `}
      >
        {formattedKey}
      </Badge>
      
      {!isLast && (
        <span className="text-xs text-muted-foreground mx-1 font-medium">
          +
        </span>
      )}
    </div>
  );
};

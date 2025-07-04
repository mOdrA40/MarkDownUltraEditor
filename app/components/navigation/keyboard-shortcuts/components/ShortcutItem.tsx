/**
 * Component for displaying individual shortcut item
 * Handles shortcut display with description and key combinations
 */

import type React from 'react';
import type { ShortcutItemProps } from '../types/shortcutTypes';
import { ShortcutKey } from './ShortcutKey';

export const ShortcutItem: React.FC<ShortcutItemProps> = ({ item, showMacKeys = false, index }) => {
  // Select keys based on platform
  const keys = showMacKeys && item.macKeys ? item.macKeys : item.keys;

  // Determine if shortcut is enabled
  const isEnabled = item.enabled !== false;

  return (
    <div
      className={`
        flex items-center justify-between py-2 px-1 rounded-md
        transition-colors duration-200
        ${isEnabled ? 'hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'}
        ${index % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'}
      `}
    >
      {/* Description */}
      <div className="flex-1 min-w-0">
        <span
          className={`
            text-sm font-medium
            ${isEnabled ? 'text-foreground' : 'text-muted-foreground'}
          `}
        >
          {item.description}
        </span>

        {!isEnabled && <span className="text-xs text-muted-foreground ml-2">(Tidak tersedia)</span>}
      </div>

      {/* Key Combination */}
      <div className="flex items-center space-x-0 ml-4">
        {keys.map((key, keyIndex) => (
          <ShortcutKey
            key={`${key}-${keyIndex}`}
            keyName={key}
            isLast={keyIndex === keys.length - 1}
            variant={showMacKeys ? 'mac' : 'default'}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Individual outline item component
 */

import { Hash } from 'lucide-react';
import type React from 'react';
import type { OutlineItemProps } from '@/types/outline';
import { getOutlineItemA11yProps, getOutlineItemStyles } from '@/utils/outlineUtils';

/**
 * Individual outline item dengan styling dan interactions
 */
export const OutlineItem: React.FC<OutlineItemProps> = ({ item, isActive, theme, onClick }) => {
  const { className, style } = getOutlineItemStyles(item, isActive, theme);
  const a11yProps = getOutlineItemA11yProps(item, isActive);

  const handleClick = () => {
    onClick(item.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(item.id);
    }
  };

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...a11yProps}
    >
      <Hash
        className="h-3 w-3 mr-2 opacity-50 flex-shrink-0 mt-0.5"
        style={{ color: isActive ? theme?.primary || '#3b82f6' : undefined }}
        aria-hidden="true"
      />
      <span
        className="break-words leading-tight flex-1"
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto',
          lineHeight: '1.3',
        }}
      >
        {item.text}
      </span>
    </button>
  );
};

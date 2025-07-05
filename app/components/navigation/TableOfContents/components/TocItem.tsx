/**
 * @fileoverview TocItem - Individual item component untuk Table of Contents
 * @author Axel Modra
 */

import type React from 'react';
import { Button } from '@/components/ui/button';
import { getActiveHeadingClasses, getHeadingLevelClasses } from '@/utils/headingUtils';
import type { TocItemProps } from '../types/toc.types';

/**
 * Komponen individual item untuk Table of Contents
 */
export const TocItem: React.FC<TocItemProps> = ({ item, index, isActive, theme, onClick }) => {
  const levelClasses = getHeadingLevelClasses(item.level);
  const activeClasses = getActiveHeadingClasses(isActive);

  const handleClick = () => {
    onClick(item.id);
  };

  return (
    <Button
      key={index}
      variant="ghost"
      size="sm"
      onClick={handleClick}
      data-heading-id={item.id}
      className={`
        w-full justify-start text-left h-auto py-2 px-3 rounded-md
        ${levelClasses}
        ${activeClasses}
        focus:outline-none focus:ring-2 focus:ring-primary/50
        whitespace-normal min-h-[2.5rem]
      `}
      style={{
        backgroundColor: isActive ? `${theme?.primary || '#3b82f6'}10` : 'transparent',
        color: isActive ? theme?.primary || '#3b82f6' : theme?.text || 'inherit',
      }}
      title={`Navigate to: ${item.text}`}
      aria-label={`Navigate to ${item.text} heading, level ${item.level}`}
      aria-current={isActive ? 'location' : undefined}
      tabIndex={isActive ? 0 : -1}
    >
      <span className="flex items-start gap-2 leading-tight">
        <span
          className="opacity-50 flex-shrink-0 mt-0.5"
          aria-hidden="true"
          style={{ fontSize: '0.75em' }}
        >
          {'#'.repeat(item.level)}
        </span>
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
      </span>
    </Button>
  );
};

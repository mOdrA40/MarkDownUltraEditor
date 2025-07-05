/**
 * @fileoverview TocList - List component untuk Table of Contents items
 * @author Axel Modra
 */

import type React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TocListProps } from '../types/toc.types';
import { TocItem } from './TocItem';

/**
 * Komponen list untuk Table of Contents items
 */
export const TocList: React.FC<TocListProps> = ({ items, theme, onItemClick, isActive }) => {
  if (items.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground italic">
          No headings found. Add some headings to your document to see the table of contents.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <nav className="p-4" aria-labelledby="toc-heading" aria-label="Table of Contents Navigation">
        <ul className="space-y-1" aria-label="Document headings">
          {items.map((item, index) => {
            const isItemActive = isActive(item.id);

            return (
              <TocItem
                key={item.id}
                item={item}
                index={index}
                isActive={isItemActive}
                theme={theme}
                onClick={onItemClick}
              />
            );
          })}
        </ul>
      </nav>
    </ScrollArea>
  );
};

/**
 * @fileoverview TocList - List component untuk Table of Contents items
 * @author Axel Modra
 */

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { TocItem } from './TocItem';
import { TocListProps } from '../types/toc.types';

/**
 * Komponen list untuk Table of Contents items
 */
export const TocList: React.FC<TocListProps> = ({
  items,
  theme,
  onItemClick,
  isActive
}) => {
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
      <div
        className="p-4"
        role="navigation"
        aria-labelledby="toc-heading"
        aria-label="Table of Contents Navigation"
      >
        <div
          className="space-y-1"
          role="list"
          aria-label="Document headings"
        >
          {items.map((item, index) => {
            const isItemActive = isActive(item.id);
            
            return (
              <TocItem
                key={`${item.id}-${index}`}
                item={item}
                index={index}
                isActive={isItemActive}
                theme={theme}
                onClick={onItemClick}
              />
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
};

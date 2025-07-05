/**
 * @fileoverview High-performance VirtualizedTableOfContents using TanStack Virtual
 * @author Axel Modra
 */

import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronRight, Hash } from 'lucide-react';
import React, { useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { TOCItem, VirtualizedTableOfContentsProps } from './types';

/**
 * VirtualizedTableOfContents component for handling large document outlines
 * Features:
 * - Virtualization for documents with 1000+ headings
 * - Smooth scrolling to active item
 * - Hierarchical indentation
 * - Performance optimized
 */
export const VirtualizedTableOfContents: React.FC<VirtualizedTableOfContentsProps> = ({
  items,
  activeId,
  onItemClick,
  className = '',
  itemHeight = 32,
  overscan = 5,
  maxHeight = 400,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Memoize processed items for performance
  const processedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      isActive: item.id === activeId,
    }));
  }, [items, activeId]);

  // Initialize virtualizer
  const virtualizer = useVirtualizer({
    count: processedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
    // Performance optimizations
    measureElement: undefined,
    scrollMargin: 0,
    gap: 0,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Auto-scroll to active item
  React.useEffect(() => {
    if (activeId) {
      const activeIndex = processedItems.findIndex((item) => item.id === activeId);
      if (activeIndex !== -1) {
        virtualizer.scrollToIndex(activeIndex, {
          align: 'center',
          behavior: 'smooth',
        });
      }
    }
  }, [activeId, processedItems, virtualizer]);

  // Early return if no items
  if (processedItems.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-4 text-muted-foreground', className)}>
        <Hash className="mr-2 h-4 w-4" />
        No headings found
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div
        ref={parentRef}
        className="overflow-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const item = processedItems[virtualItem.index];
            if (!item) return null;

            return (
              <VirtualizedTOCItem
                key={virtualItem.key}
                virtualItem={virtualItem}
                item={item}
                onClick={onItemClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Individual TOC item component for virtualized list
 */
interface VirtualizedTOCItemProps {
  // biome-ignore lint/suspicious/noExplicitAny: VirtualItem type from TanStack Virtual
  virtualItem: any;
  item: TOCItem;
  onClick: (item: TOCItem) => void;
}

const VirtualizedTOCItem: React.FC<VirtualizedTOCItemProps> = ({ virtualItem, item, onClick }) => {
  // Calculate indentation based on heading level
  const indentLevel = Math.max(0, item.level - 1);
  const indentPx = indentLevel * 16; // 16px per level

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${virtualItem.size}px`,
        transform: `translateY(${virtualItem.start}px)`,
      }}
    >
      <button
        type="button"
        onClick={() => onClick(item)}
        className={cn(
          'w-full text-left px-2 py-1 text-sm transition-colors duration-150',
          'hover:bg-accent hover:text-accent-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'flex items-center gap-2',
          item.isActive && 'bg-accent text-accent-foreground font-medium'
        )}
        style={{ paddingLeft: `${8 + indentPx}px` }}
        title={`${item.text} (Line ${item.line})`}
      >
        {/* Hierarchy indicator */}
        {item.level > 1 && (
          <ChevronRight
            className="h-3 w-3 text-muted-foreground flex-shrink-0"
            style={{ marginLeft: `${Math.max(0, (item.level - 2) * 8)}px` }}
          />
        )}

        {/* Heading level indicator */}
        <Hash className="h-3 w-3 text-muted-foreground flex-shrink-0" />

        {/* Heading text */}
        <span className="truncate flex-1 min-w-0">{item.text}</span>

        {/* Line number */}
        <span className="text-xs text-muted-foreground flex-shrink-0 ml-auto">{item.line}</span>
      </button>
    </div>
  );
};

/**
 * Hook for extracting TOC items from markdown content
 */
export const useTOCItems = (content: string): TOCItem[] => {
  return useMemo(() => {
    const lines = content.split('\n');
    const items: TOCItem[] = [];

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        items.push({
          id,
          text,
          level,
          line: index + 1,
        });
      }
    });

    return items;
  }, [content]);
};

/**
 * Hook for tracking active heading based on scroll position
 */
export const useActiveHeading = (items: TOCItem[], scrollElement?: HTMLElement | null) => {
  const [activeId, setActiveId] = React.useState<string>('');

  React.useEffect(() => {
    if (!scrollElement || items.length === 0) return;

    const handleScroll = () => {
      const scrollTop = scrollElement.scrollTop;
      const scrollHeight = scrollElement.scrollHeight;
      const clientHeight = scrollElement.clientHeight;

      // If near bottom, activate last item
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setActiveId(items[items.length - 1].id);
        return;
      }

      // Find active heading based on scroll position
      // This is a simplified version - in real implementation,
      // you'd need to get actual element positions
      const progress = scrollTop / (scrollHeight - clientHeight);
      const activeIndex = Math.floor(progress * items.length);
      const activeItem = items[Math.min(activeIndex, items.length - 1)];

      if (activeItem) {
        setActiveId(activeItem.id);
      }
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [items, scrollElement]);

  return activeId;
};

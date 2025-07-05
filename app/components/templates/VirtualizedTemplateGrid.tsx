/**
 * @fileoverview High-performance VirtualizedTemplateGrid using TanStack Virtual
 * @author Axel Modra
 */

import { useVirtualizer } from '@tanstack/react-virtual';
import { FileText } from 'lucide-react';
import type React from 'react';
import { useMemo, useRef } from 'react';
import type { DocumentTemplate } from '@/types/templates';

/**
 * Props interface for VirtualizedTemplateGrid
 */
interface VirtualizedTemplateGridProps {
  templates: DocumentTemplate[];
  onPreview: (template: DocumentTemplate) => void;
  onSelect: (template: DocumentTemplate) => void;
  itemsPerRow?: number;
  itemHeight?: number;
  gap?: number;
  overscan?: number;
  className?: string;
}

/**
 * VirtualizedTemplateGrid component for handling large template collections efficiently
 * Features:
 * - Grid virtualization for optimal performance
 * - Responsive grid layout
 * - 60FPS scrolling
 * - Memory efficient
 */
export const VirtualizedTemplateGrid: React.FC<VirtualizedTemplateGridProps> = ({
  templates,
  onPreview,
  onSelect,
  itemsPerRow = 3,
  itemHeight = 200,
  gap = 16,
  overscan = 2,
  className = '',
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate rows needed
  const rowCount = Math.ceil(templates.length / itemsPerRow);

  // Group templates into rows
  const rows = useMemo(() => {
    const result: DocumentTemplate[][] = [];
    for (let i = 0; i < templates.length; i += itemsPerRow) {
      result.push(templates.slice(i, i + itemsPerRow));
    }
    return result;
  }, [templates, itemsPerRow]);

  // Initialize virtualizer for rows
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan,
    // Performance optimizations
    measureElement: undefined,
    scrollMargin: 0,
    gap: 0,
  });

  const items = virtualizer.getVirtualItems();

  if (templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">No templates found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`h-[600px] overflow-auto ${className}`}
      style={{
        contain: 'strict', // CSS containment for better performance
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {items.map((virtualItem) => {
          const rowTemplates = rows[virtualItem.index];
          if (!rowTemplates) return null;

          return (
            <VirtualizedTemplateRow
              key={virtualItem.key}
              virtualItem={virtualItem}
              templates={rowTemplates}
              onPreview={onPreview}
              onSelect={onSelect}
              itemsPerRow={itemsPerRow}
              gap={gap}
            />
          );
        })}
      </div>
    </div>
  );
};

/**
 * Individual template row component for virtualized grid
 */
interface VirtualizedTemplateRowProps {
  // biome-ignore lint/suspicious/noExplicitAny: VirtualItem type from TanStack Virtual
  virtualItem: any;
  templates: DocumentTemplate[];
  onPreview: (template: DocumentTemplate) => void;
  onSelect: (template: DocumentTemplate) => void;
  itemsPerRow: number;
  gap: number;
}

const VirtualizedTemplateRow: React.FC<VirtualizedTemplateRowProps> = ({
  virtualItem,
  templates,
  onPreview,
  onSelect,
  itemsPerRow,
  gap,
}) => {
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
      <div
        className="grid gap-4 px-4"
        style={{
          gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {templates.map((template) => (
          <VirtualizedTemplateCard
            key={template.id}
            template={template}
            onPreview={onPreview}
            onSelect={onSelect}
          />
        ))}

        {/* Fill empty slots in the last row */}
        {templates.length < itemsPerRow &&
          Array.from({ length: itemsPerRow - templates.length }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Empty slots don't have meaningful IDs
            <div key={`empty-slot-${itemsPerRow}-${index}`} />
          ))}
      </div>
    </div>
  );
};

/**
 * Individual template card component
 */
interface VirtualizedTemplateCardProps {
  template: DocumentTemplate;
  onPreview: (template: DocumentTemplate) => void;
  onSelect: (template: DocumentTemplate) => void;
}

const VirtualizedTemplateCard: React.FC<VirtualizedTemplateCardProps> = ({
  template,
  onPreview,
  onSelect,
}) => {
  return (
    <div className="group relative bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200">
      <button
        type="button"
        onClick={() => onSelect(template)}
        className="w-full text-left space-y-3 cursor-pointer"
        aria-label={`Select template: ${template.name}`}
      >
        {/* Template icon */}
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
          <FileText className="w-6 h-6 text-primary" />
        </div>

        {/* Template info */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm line-clamp-2 text-foreground">{template.name}</h3>

          <p className="text-xs text-muted-foreground line-clamp-3">{template.description}</p>

          {/* Template metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="capitalize">{template.category}</span>
            {template.tags && template.tags.length > 0 && (
              <span className="truncate ml-2">
                {template.tags.slice(0, 2).join(', ')}
                {template.tags.length > 2 && '...'}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template);
            }}
            className="p-1.5 bg-background/80 backdrop-blur-sm border border-border rounded-md hover:bg-muted transition-colors"
            title="Preview"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
            className="p-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            title="Use Template"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

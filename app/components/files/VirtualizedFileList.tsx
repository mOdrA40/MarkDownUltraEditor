/**
 * @fileoverview High-performance VirtualizedFileList using TanStack Virtual
 * @author Axel Modra
 */

import { useVirtualizer } from '@tanstack/react-virtual';
import type React from 'react';
import { useRef } from 'react';
import { FileDropdownMenu } from '@/components/files/shared/FileDropdownMenu';
import type { FileData } from '@/lib/supabase';

/**
 * Props interface for VirtualizedFileList
 */
interface VirtualizedFileListProps {
  files: FileData[];
  onOpen: (file: FileData) => void;
  onDelete: (file: FileData) => void;
  onDuplicate: (file: FileData) => void;
  onExport: (file: FileData) => void;
  formatDate: (date: string) => string;
  formatFileSize: (bytes: number) => string;
  itemHeight?: number;
  overscan?: number;
  className?: string;
}

/**
 * VirtualizedFileList component for handling large file lists efficiently
 * Features:
 * - 60FPS scrolling performance
 * - Memory efficient (only renders visible items)
 * - Variable height support
 * - Smooth scrolling
 */
export const VirtualizedFileList: React.FC<VirtualizedFileListProps> = ({
  files,
  onOpen,
  onDelete,
  onDuplicate,
  onExport,
  formatDate,
  formatFileSize,
  itemHeight = 80,
  overscan = 5,
  className = '',
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Initialize virtualizer with optimized settings
  const virtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
    measureElement: undefined,
    scrollMargin: 0,
    gap: 0,
  });

  const items = virtualizer.getVirtualItems();

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No files found</p>
          <p className="text-sm">Your files will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`h-[400px] sm:h-[500px] lg:h-[600px] overflow-auto mt-2 ${className}`}
      style={{
        contain: 'strict',
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
          const file = files[virtualItem.index];
          if (!file) return null;

          return (
            <VirtualizedFileItem
              key={virtualItem.key}
              virtualItem={virtualItem}
              file={file}
              onOpen={onOpen}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onExport={onExport}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
            />
          );
        })}
      </div>
    </div>
  );
};

/**
 * Individual file item component for virtualized list
 */
interface VirtualizedFileItemProps {
  // biome-ignore lint/suspicious/noExplicitAny: VirtualItem type from TanStack Virtual
  virtualItem: any;
  file: FileData;
  onOpen: (file: FileData) => void;
  onDelete: (file: FileData) => void;
  onDuplicate: (file: FileData) => void;
  onExport: (file: FileData) => void;
  formatDate: (date: string) => string;
  formatFileSize: (bytes: number) => string;
}

const VirtualizedFileItem: React.FC<VirtualizedFileItemProps> = ({
  virtualItem,
  file,
  onOpen,
  onDelete,
  onDuplicate,
  onExport,
  formatDate,
  formatFileSize,
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
      <div className="p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex items-center justify-between gap-3 relative">
          <button
            type="button"
            className="flex-1 min-w-0 text-left pr-2"
            onClick={() => onOpen(file)}
            aria-label={`Open file ${file.title}`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.title}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {file.fileSize ? formatFileSize(file.fileSize) : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file.updatedAt || file.createdAt
                      ? formatDate(file.updatedAt || file.createdAt || '')
                      : '-'}
                  </p>
                </div>
                {file.tags && file.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {file.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {file.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                        +{file.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </button>

          <div className="flex items-center ml-4">
            <FileDropdownMenu
              file={file}
              viewType="virtualized"
              onOpen={() => onOpen(file)}
              onDelete={() => onDelete(file)}
              onDuplicate={() => onDuplicate(file)}
              onExport={() => onExport(file)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

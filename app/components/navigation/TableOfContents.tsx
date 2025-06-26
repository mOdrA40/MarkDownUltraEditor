
/**
 * @fileoverview TableOfContents - Komponen untuk navigasi heading dalam dokumen
 * @author Axel Modra
 * @refactored Memisahkan concerns dan menggunakan composition pattern
 */

import React, { useMemo } from 'react';
import { parseMarkdownHeadings } from '@/utils/headingUtils';

// Custom hooks dan components
import { useTocNavigation } from './TableOfContents/hooks/useTocNavigation';
import { TocHeader } from './TableOfContents/components/TocHeader';
import { TocList } from './TableOfContents/components/TocList';
import { EmptyToc } from './TableOfContents/components/EmptyToc';

// Types
import { TableOfContentsProps } from './TableOfContents/types/toc.types';

/**
 * Komponen Table of Contents dengan architecture yang bersih
 * Menggunakan composition pattern dan separation of concerns
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({
  markdown,
  theme
}) => {
  // Parse headings menggunakan utility function
  const tocItems = useMemo(() => parseMarkdownHeadings(markdown), [markdown]);

  // Setup TOC navigation dengan custom hook
  const {
    isActive,
    handleHeadingClick,
    totalItems
  } = useTocNavigation(tocItems, {
    offset: 100,
    threshold: 0.6,
    rootMargin: '-20% 0px -35% 0px'
  }, {
    enabled: true,
    offset: 100
  });

  return (
    <div className="h-full flex flex-col" data-toc-container>
      {/* Header */}
      <TocHeader
        itemCount={totalItems}
        theme={theme}
      />

      {/* Content */}
      {tocItems.length === 0 ? (
        <EmptyToc theme={theme} />
      ) : (
        <TocList
          items={tocItems}
          theme={theme}
          onItemClick={handleHeadingClick}
          isActive={isActive}
        />
      )}
    </div>
  );
};

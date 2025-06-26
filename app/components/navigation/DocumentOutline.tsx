
import React, { useMemo } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseMarkdownHeadings } from '@/utils/headingUtils';
import { useScrollSpy, useKeyboardNavigation, useOutlineNavigation } from '@/hooks/navigation';
import { isOutlineEmpty } from '@/utils/outlineUtils';
import { DocumentOutlineProps } from '@/types/outline';

// Sub-components
import { OutlineHeader } from './outline/OutlineHeader';
import { OutlineItem } from './outline/OutlineItem';
import { EmptyOutline } from './outline/EmptyOutline';

/**
 * Main DocumentOutline component
 * Menampilkan struktur heading dari markdown dengan navigasi interaktif
 */
export const DocumentOutline: React.FC<DocumentOutlineProps> = ({ markdown, theme }) => {
  // Parse headings menggunakan utility function
  const outline = useMemo(() => parseMarkdownHeadings(markdown), [markdown]);

  // Extract heading IDs untuk scroll spy
  const headingIds = useMemo(() => outline.map(item => item.id), [outline]);

  // Setup scroll spy untuk mendeteksi active heading
  const { activeId, isActive, setActiveHeading } = useScrollSpy(headingIds, {
    offset: 100,
    threshold: 0.6,
    rootMargin: '-20% 0px -35% 0px'
  });

  // Setup keyboard navigation
  useKeyboardNavigation({
    headingIds,
    activeId,
    onActiveChange: setActiveHeading,
    enabled: true,
    offset: 100
  });

  // Setup outline navigation logic
  const { handleHeadingClick } = useOutlineNavigation(outline, {
    headingIds,
    activeId,
    onActiveChange: setActiveHeading,
    enabled: true,
    offset: 120
  });

  // Early return untuk empty state
  if (isOutlineEmpty(outline)) {
    return <EmptyOutline theme={theme} />;
  }

  return (
    <div className="h-full flex flex-col" data-outline-container>
      <OutlineHeader theme={theme} headingCount={outline.length} />

      <ScrollArea className="flex-1">
        <div
          className="p-2 space-y-1"
          role="navigation"
          aria-labelledby="outline-heading"
          aria-label="Document Outline Navigation"
        >
          <div
            role="list"
            aria-label="Document structure"
          >
            {outline.map((item, index) => {
              const isItemActive = isActive(item.id);

              return (
                <OutlineItem
                  key={index}
                  item={item}
                  isActive={isItemActive}
                  theme={theme}
                  onClick={handleHeadingClick}
                />
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

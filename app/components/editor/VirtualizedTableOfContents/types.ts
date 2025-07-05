/**
 * @fileoverview Types for VirtualizedTableOfContents
 * @author Axel Modra
 */

/**
 * Table of Contents item interface
 */
export interface TOCItem {
  id: string;
  text: string;
  level: number;
  line: number;
  isActive?: boolean;
}

/**
 * Props interface for VirtualizedTableOfContents
 */
export interface VirtualizedTableOfContentsProps {
  items: TOCItem[];
  activeId?: string;
  onItemClick: (item: TOCItem) => void;
  className?: string;
  itemHeight?: number;
  overscan?: number;
  maxHeight?: number;
}

/**
 * @fileoverview Type definitions untuk TableOfContents components
 * @author Senior Developer
 * @version 1.0.0
 */

import { HeadingItem } from '@/utils/headingUtils';

/**
 * Props untuk komponen TableOfContents utama
 */
export interface TableOfContentsProps {
  /** Konten markdown */
  markdown: string;
  /** Theme configuration */
  theme?: {
    surface?: string;
    accent?: string;
    text?: string;
    primary?: string;
  };
}

/**
 * Props untuk TocHeader component
 */
export interface TocHeaderProps {
  /** Jumlah TOC items */
  itemCount: number;
  /** Theme configuration */
  theme?: {
    surface?: string;
    accent?: string;
    text?: string;
  };
}

/**
 * Props untuk TocItem component
 */
export interface TocItemProps {
  /** Heading item data */
  item: HeadingItem;
  /** Index dalam list */
  index: number;
  /** Apakah item sedang aktif */
  isActive: boolean;
  /** Theme configuration */
  theme?: {
    primary?: string;
    text?: string;
  };
  /** Callback ketika item diklik */
  onClick: (headingId: string) => void;
}

/**
 * Props untuk TocList component
 */
export interface TocListProps {
  /** Array of TOC items */
  items: HeadingItem[];
  /** Theme configuration */
  theme?: {
    primary?: string;
    text?: string;
  };
  /** Callback ketika item diklik */
  onItemClick: (headingId: string) => void;
  /** Function untuk check apakah item aktif */
  isActive: (headingId: string) => boolean;
}

/**
 * Navigation options untuk TOC
 */
export interface TocNavigationOptions {
  /** Offset untuk scroll */
  offset?: number;
  /** Scroll behavior */
  behavior?: ScrollBehavior;
  /** Prefer editor over preview */
  preferEditor?: boolean;
}

/**
 * TOC navigation state
 */
export interface TocNavigationState {
  /** Current active heading ID */
  activeId: string;
  /** Array of heading IDs */
  headingIds: string[];
  /** Navigation options */
  options: TocNavigationOptions;
  /** Loading state */
  isNavigating: boolean;
}

/**
 * TOC scroll spy options
 */
export interface TocScrollSpyOptions {
  /** Offset dari top */
  offset?: number;
  /** Threshold untuk intersection observer */
  threshold?: number;
  /** Root margin untuk intersection observer */
  rootMargin?: string;
}

/**
 * TOC keyboard navigation options
 */
export interface TocKeyboardOptions {
  /** Apakah keyboard navigation enabled */
  enabled?: boolean;
  /** Offset untuk scroll */
  offset?: number;
}

/**
 * Empty state props
 */
export interface EmptyTocProps {
  /** Custom message */
  message?: string;
  /** Theme configuration */
  theme?: {
    text?: string;
  };
}

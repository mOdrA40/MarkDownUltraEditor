/**
 * Type definitions untuk DocumentOutline components
 */

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export interface DocumentOutlineProps {
  markdown: string;
  theme?: ThemeConfig;
}

export interface ThemeConfig {
  surface?: string;
  accent?: string;
  text?: string;
  primary?: string;
}

export interface OutlineHeaderProps {
  theme?: ThemeConfig;
  headingCount: number;
}

export interface OutlineItemProps {
  item: HeadingItem;
  isActive: boolean;
  theme?: ThemeConfig;
  onClick: (headingId: string) => void;
}

export interface EmptyOutlineProps {
  theme?: ThemeConfig;
}

export interface UseOutlineNavigationOptions {
  headingIds: string[];
  activeId: string | null;
  onActiveChange: (id: string) => void;
  enabled: boolean;
  offset: number;
}

export interface UseOutlineNavigationReturn {
  handleHeadingClick: (headingId: string) => Promise<void>;
}

export interface ScrollOptions {
  offset?: number;
  behavior?: ScrollBehavior;
  preferEditor?: boolean;
}

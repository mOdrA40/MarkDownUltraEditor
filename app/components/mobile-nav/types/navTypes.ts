/**
 * TypeScript interfaces untuk Mobile Navigation
 * Mendefinisikan struktur data dan props untuk sistem navigasi mobile
 */

import { Theme } from "../../../components/ThemeSelector";

export interface MobileNavProps {
  /** Current theme */
  currentTheme: Theme;
  /** Callback untuk mengubah theme */
  onThemeChange: (theme: Theme) => void;
  /** Status preview visibility */
  showPreview: boolean;
  /** Callback untuk toggle preview */
  onTogglePreview: () => void;
  /** Callback untuk toggle zen mode */
  onToggleZen: () => void;
  /** Callback untuk search */
  onSearch: () => void;
  /** Callback untuk new file */
  onNewFile: () => void;
  /** Markdown content */
  markdown: string;
  /** Current file name */
  fileName: string;
  /** Callback untuk load file */
  onLoad: (content: string, name: string) => void;
  /** Callback untuk file name change */
  onFileNameChange: (name: string) => void;
  /** Callback untuk insert text */
  onInsertText: (text: string) => void;
  /** Font size */
  fontSize: number;
  /** Callback untuk font size change */
  onFontSizeChange: (size: number) => void;
  /** Line height */
  lineHeight: number;
  /** Callback untuk line height change */
  onLineHeightChange: (height: number) => void;
  /** Focus mode status */
  focusMode: boolean;
  /** Callback untuk focus mode toggle */
  onFocusModeToggle: () => void;
  /** Typewriter mode status */
  typewriterMode: boolean;
  /** Callback untuk typewriter mode toggle */
  onTypewriterModeToggle: () => void;
  /** Word wrap status */
  wordWrap: boolean;
  /** Callback untuk word wrap toggle */
  onWordWrapToggle: () => void;
  /** Vim mode status */
  vimMode: boolean;
  /** Callback untuk vim mode toggle */
  onVimModeToggle: () => void;
  /** Zen mode status */
  zenMode: boolean;
  /** Callback untuk zen mode toggle */
  onZenModeToggle: () => void;
  /** Undo callback */
  onUndo: () => void;
  /** Redo callback */
  onRedo: () => void;
  /** Can undo status */
  canUndo: boolean;
  /** Can redo status */
  canRedo: boolean;
  /** Callback untuk advanced export */
  onShowAdvancedExport: () => void;
  /** Callback untuk image manager */
  onShowImageManager: () => void;
  /** Callback untuk templates */
  onShowTemplates: () => void;
}

export interface NavHeaderProps {
  /** Current theme */
  currentTheme: Theme;
  /** Current file name */
  fileName: string;
  /** Callback untuk file name change */
  onFileNameChange: (name: string) => void;
  /** Callback untuk menu toggle */
  onMenuToggle: () => void;
  /** Callback untuk search */
  onSearch: () => void;
  /** Show preview status */
  showPreview: boolean;
  /** Callback untuk toggle preview */
  onTogglePreview: () => void;
  /** Undo callback */
  onUndo: () => void;
  /** Redo callback */
  onRedo: () => void;
  /** Can undo status */
  canUndo: boolean;
  /** Can redo status */
  canRedo: boolean;
}

export interface NavSidebarProps {
  /** Sidebar open status */
  isOpen: boolean;
  /** Callback untuk close sidebar */
  onClose: () => void;
  /** Current theme */
  currentTheme: Theme;
  /** Callback untuk theme change */
  onThemeChange: (theme: Theme) => void;
  /** Markdown content */
  markdown: string;
  /** File name */
  fileName: string;
  /** Callback untuk load file */
  onLoad: (content: string, name: string) => void;
  /** Callback untuk new file */
  onNewFile: () => void;
  /** Callback untuk insert text */
  onInsertText: (text: string) => void;
  /** Font size */
  fontSize: number;
  /** Callback untuk font size change */
  onFontSizeChange: (size: number) => void;
  /** Line height */
  lineHeight: number;
  /** Callback untuk line height change */
  onLineHeightChange: (height: number) => void;
  /** Focus mode status */
  focusMode: boolean;
  /** Callback untuk focus mode toggle */
  onFocusModeToggle: () => void;
  /** Typewriter mode status */
  typewriterMode: boolean;
  /** Callback untuk typewriter mode toggle */
  onTypewriterModeToggle: () => void;
  /** Word wrap status */
  wordWrap: boolean;
  /** Callback untuk word wrap toggle */
  onWordWrapToggle: () => void;
  /** Vim mode status */
  vimMode: boolean;
  /** Callback untuk vim mode toggle */
  onVimModeToggle: () => void;
  /** Zen mode status */
  zenMode: boolean;
  /** Callback untuk zen mode toggle */
  onZenModeToggle: () => void;
  /** Show preview status */
  showPreview: boolean;
  /** Callback untuk toggle preview */
  onTogglePreview: () => void;
  /** Callback untuk toggle zen */
  onToggleZen: () => void;
  /** Callback untuk advanced export */
  onShowAdvancedExport: () => void;
  /** Callback untuk image manager */
  onShowImageManager: () => void;
  /** Callback untuk templates */
  onShowTemplates: () => void;
}

export interface NavSectionProps {
  /** Section title */
  title: string;
  /** Section icon */
  icon: React.ComponentType<{ className?: string }>;
  /** Section children */
  children: React.ReactNode;
  /** Apakah section collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

export interface QuickActionsProps {
  /** Callback untuk search */
  onSearch: () => void;
  /** Show preview status */
  showPreview: boolean;
  /** Callback untuk toggle preview */
  onTogglePreview: () => void;
  /** Undo callback */
  onUndo: () => void;
  /** Redo callback */
  onRedo: () => void;
  /** Can undo status */
  canUndo: boolean;
  /** Can redo status */
  canRedo: boolean;
}

export interface NavAction {
  /** Action ID */
  id: string;
  /** Action label */
  label: string;
  /** Action icon */
  icon: React.ComponentType<{ className?: string }>;
  /** Action callback */
  onClick: () => void;
  /** Apakah action disabled */
  disabled?: boolean;
  /** Action variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  /** Badge text (optional) */
  badge?: string;
}

export interface NavSection {
  /** Section ID */
  id: string;
  /** Section title */
  title: string;
  /** Section icon */
  icon: React.ComponentType<{ className?: string }>;
  /** Section actions */
  actions: NavAction[];
  /** Section order */
  order?: number;
  /** Apakah section collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

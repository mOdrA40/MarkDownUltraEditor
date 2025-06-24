/**
 * Type definitions untuk DocumentTemplates components
 */

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: TemplateCategory;
  difficulty: TemplateDifficulty;
  tags: string[];
  icon: string;
  estimatedTime: string;
  /** Preview text untuk template */
  preview?: string;
  /** Template author */
  author?: string;
  /** Last updated date */
  lastUpdated?: string;
  /** Template version untuk compatibility checking */
  version?: number;
  /** Required features untuk template compatibility */
  requiredFeatures?: string[];
  /** Creation timestamp */
  createdAt?: string | Date;
  /** Last update timestamp */
  updatedAt?: string | Date;
  /** Template popularity score */
  popularity?: number;
}

export type TemplateCategory = 'readme' | 'blog' | 'documentation' | 'academic' | 'business' | 'personal';
export type TemplateDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ViewMode = 'grid' | 'list';

export interface DocumentTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (content: string, fileName: string) => void;
}

export interface TemplateFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  categories: TemplateCategory[];
  isMobile: boolean;
  isTablet: boolean;
}

export interface TemplateCardProps {
  template: DocumentTemplate;
  viewMode: ViewMode;
  isMobile: boolean;
  isTablet: boolean;
  onPreview: (template: DocumentTemplate) => void;
  onSelect: (template: DocumentTemplate) => void;
}

export interface TemplatePreviewProps {
  template: DocumentTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: DocumentTemplate) => void;
}

export interface TemplateGridProps {
  templates: DocumentTemplate[];
  viewMode: ViewMode;
  isMobile: boolean;
  isTablet: boolean;
  onPreview: (template: DocumentTemplate) => void;
  onSelect: (template: DocumentTemplate) => void;
}

export interface UseTemplateFiltersOptions {
  templates: DocumentTemplate[];
}

export interface UseTemplateFiltersReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredTemplates: DocumentTemplate[];
}

export interface UseTemplateActionsOptions {
  onSelectTemplate: (content: string, fileName: string) => void;
  onClose: () => void;
}

export interface UseTemplateActionsReturn {
  handleSelectTemplate: (template: DocumentTemplate) => void;
  handlePreviewTemplate: (template: DocumentTemplate) => void;
  selectedTemplate: DocumentTemplate | null;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}

export interface CategoryInfo {
  id: string;
  name: string;
  count: number;
}

export type DifficultyColors = {
  [key in TemplateDifficulty]: string;
};

export type CategoryIcons = {
  [key in TemplateCategory]: React.ComponentType<{ className?: string }>;
};

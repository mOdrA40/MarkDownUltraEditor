/**
 * Type definitions untuk useTemplateFilters module
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { DocumentTemplate } from '@/types/templates';

/**
 * Interface untuk template filter options
 */
export interface TemplateFilterOptions {
  /** Templates yang akan difilter */
  templates: DocumentTemplate[];
  /** Initial search term */
  initialSearchTerm?: string;
  /** Initial selected category */
  initialCategory?: string;
  /** Case sensitive search */
  caseSensitive?: boolean;
  /** Search dalam content juga */
  searchInContent?: boolean;
  /** Custom search function */
  customSearchFunction?: (templates: DocumentTemplate[], searchTerm: string) => DocumentTemplate[];
  /** Custom filter function */
  customFilterFunction?: (templates: DocumentTemplate[], filters: FilterCriteria) => DocumentTemplate[];
}

/**
 * Interface untuk filter criteria
 */
export interface FilterCriteria {
  /** Search term */
  searchTerm: string;
  /** Selected category */
  category: string;
  /** Difficulty level filter */
  difficulty?: string;
  /** Tags filter */
  tags?: string[];
  /** Date range filter */
  dateRange?: {
    from: Date;
    to: Date;
  };
  /** Custom filters */
  customFilters?: Record<string, unknown>;
}

/**
 * Interface untuk search options
 */
export interface SearchOptions {
  /** Case sensitive search */
  caseSensitive?: boolean;
  /** Search dalam content */
  searchInContent?: boolean;
  /** Search dalam tags */
  searchInTags?: boolean;
  /** Search dalam description */
  searchInDescription?: boolean;
  /** Minimum search term length */
  minSearchLength?: number;
  /** Search debounce delay */
  debounceDelay?: number;
}

/**
 * Interface untuk sort options
 */
export interface SortOptions {
  /** Sort field */
  field: 'name' | 'category' | 'difficulty' | 'createdAt' | 'updatedAt' | 'popularity';
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Interface untuk template search return values
 */
export interface UseTemplateSearchReturn {
  /** Current search term */
  searchTerm: string;
  /** Set search term function */
  setSearchTerm: (term: string) => void;
  /** Clear search function */
  clearSearch: () => void;
  /** Search results */
  searchResults: DocumentTemplate[];
  /** Search loading state */
  isSearching: boolean;
  /** Search suggestions */
  suggestions: string[];
}

/**
 * Interface untuk template filters return values (backward compatibility)
 */
export interface UseTemplateFiltersReturn {
  /** Current search term */
  searchTerm: string;
  /** Set search term function */
  setSearchTerm: (term: string) => void;
  /** Selected category */
  selectedCategory: string;
  /** Set selected category function */
  setSelectedCategory: (category: string) => void;
  /** Filtered templates */
  filteredTemplates: DocumentTemplate[];
}

/**
 * Interface untuk advanced template filters return values
 */
export interface UseAdvancedTemplateFiltersReturn extends UseTemplateFiltersReturn {
  /** Filter criteria */
  filterCriteria: FilterCriteria;
  /** Update filter criteria */
  updateFilterCriteria: (criteria: Partial<FilterCriteria>) => void;
  /** Clear all filters */
  clearAllFilters: () => void;
  /** Sort options */
  sortOptions: SortOptions;
  /** Update sort options */
  updateSortOptions: (options: SortOptions) => void;
  /** Filter statistics */
  filterStats: FilterStatistics;
  /** Available categories */
  availableCategories: string[];
  /** Available tags */
  availableTags: string[];
}

/**
 * Interface untuk filter statistics
 */
export interface FilterStatistics {
  /** Total templates */
  totalTemplates: number;
  /** Filtered templates count */
  filteredCount: number;
  /** Filter efficiency (filtered/total) */
  filterEfficiency: number;
  /** Most popular category */
  popularCategory: string;
  /** Most used tags */
  popularTags: string[];
}

/**
 * Interface untuk template category info
 */
export interface CategoryInfo {
  /** Category ID */
  id: string;
  /** Category name */
  name: string;
  /** Template count dalam category */
  count: number;
  /** Category description */
  description?: string;
  /** Category icon */
  icon?: string;
}

/**
 * Interface untuk template tag info
 */
export interface TagInfo {
  /** Tag name */
  name: string;
  /** Usage count */
  count: number;
  /** Tag color */
  color?: string;
  /** Tag description */
  description?: string;
}

/**
 * Type untuk filter events
 */
export type FilterEvent = 
  | { type: 'SEARCH_CHANGED'; payload: { searchTerm: string } }
  | { type: 'CATEGORY_CHANGED'; payload: { category: string } }
  | { type: 'FILTERS_APPLIED'; payload: { criteria: FilterCriteria } }
  | { type: 'FILTERS_CLEARED'; payload: Record<string, never> }
  | { type: 'SORT_CHANGED'; payload: { sortOptions: SortOptions } };

/**
 * Interface untuk filter performance metrics
 */
export interface FilterPerformanceMetrics {
  /** Filter execution time */
  executionTime: number;
  /** Number of templates processed */
  templatesProcessed: number;
  /** Filter complexity score */
  complexityScore: number;
  /** Memory usage */
  memoryUsage?: number;
}

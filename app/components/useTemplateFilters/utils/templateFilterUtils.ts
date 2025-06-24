/**
 * Template Filter utility functions
 * 
 * Kumpulan utility functions untuk template filtering
 * yang dapat digunakan secara independen.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { DocumentTemplate } from '@/types/templates';
import { FilterCriteria, SearchOptions, SortOptions, CategoryInfo, TagInfo, FilterStatistics } from '../types';

/**
 * Konstanta untuk template filtering
 */
export const TEMPLATE_FILTER_CONSTANTS = {
  /** Default minimum search length */
  DEFAULT_MIN_SEARCH_LENGTH: 2,
  /** Default debounce delay */
  DEFAULT_DEBOUNCE_DELAY: 300,
  /** Maximum search results */
  MAX_SEARCH_RESULTS: 100,
  /** All categories identifier */
  ALL_CATEGORIES: 'all',
} as const;

/**
 * Search templates berdasarkan search term
 * 
 * @param templates - Array of templates
 * @param searchTerm - Search term
 * @param options - Search options
 * @returns Filtered templates
 */
export const searchTemplates = (
  templates: DocumentTemplate[],
  searchTerm: string,
  options: SearchOptions = {}
): DocumentTemplate[] => {
  const {
    caseSensitive = false,
    searchInContent = true,
    searchInTags = true,
    searchInDescription = true,
    minSearchLength = TEMPLATE_FILTER_CONSTANTS.DEFAULT_MIN_SEARCH_LENGTH
  } = options;

  // Return all templates jika search term terlalu pendek
  if (searchTerm.trim().length < minSearchLength) {
    return templates;
  }

  const normalizedSearchTerm = caseSensitive 
    ? searchTerm.trim() 
    : searchTerm.trim().toLowerCase();

  return templates.filter(template => {
    // Search dalam name (always included)
    const nameMatch = caseSensitive
      ? template.name.includes(normalizedSearchTerm)
      : template.name.toLowerCase().includes(normalizedSearchTerm);

    if (nameMatch) return true;

    // Search dalam content
    if (searchInContent && template.content) {
      const contentMatch = caseSensitive
        ? template.content.includes(normalizedSearchTerm)
        : template.content.toLowerCase().includes(normalizedSearchTerm);
      
      if (contentMatch) return true;
    }

    // Search dalam description
    if (searchInDescription && template.description) {
      const descriptionMatch = caseSensitive
        ? template.description.includes(normalizedSearchTerm)
        : template.description.toLowerCase().includes(normalizedSearchTerm);
      
      if (descriptionMatch) return true;
    }

    // Search dalam tags
    if (searchInTags && template.tags) {
      const tagsMatch = template.tags.some(tag => 
        caseSensitive
          ? tag.includes(normalizedSearchTerm)
          : tag.toLowerCase().includes(normalizedSearchTerm)
      );
      
      if (tagsMatch) return true;
    }

    return false;
  });
};

/**
 * Filter templates berdasarkan criteria
 * 
 * @param templates - Array of templates
 * @param criteria - Filter criteria
 * @returns Filtered templates
 */
export const filterTemplates = (
  templates: DocumentTemplate[],
  criteria: FilterCriteria
): DocumentTemplate[] => {
  let filteredTemplates = [...templates];

  // Apply search filter
  if (criteria.searchTerm.trim()) {
    filteredTemplates = searchTemplates(filteredTemplates, criteria.searchTerm);
  }

  // Apply category filter
  if (criteria.category && criteria.category !== TEMPLATE_FILTER_CONSTANTS.ALL_CATEGORIES) {
    filteredTemplates = filteredTemplates.filter(template => 
      template.category === criteria.category
    );
  }

  // Apply difficulty filter
  if (criteria.difficulty) {
    filteredTemplates = filteredTemplates.filter(template => 
      template.difficulty === criteria.difficulty
    );
  }

  // Apply tags filter
  if (criteria.tags && criteria.tags.length > 0) {
    filteredTemplates = filteredTemplates.filter(template => 
      template.tags && criteria.tags!.some(tag => template.tags!.includes(tag))
    );
  }

  // Apply date range filter
  if (criteria.dateRange) {
    filteredTemplates = filteredTemplates.filter(template => {
      if (!template.createdAt) return true;

      try {
        const templateDate = new Date(template.createdAt);
        // Check if date is valid
        if (isNaN(templateDate.getTime())) return true;

        return templateDate >= criteria.dateRange!.from && templateDate <= criteria.dateRange!.to;
      } catch {
        console.warn('Invalid date format in template:', template.id, template.createdAt);
        return true; // Include templates with invalid dates
      }
    });
  }

  // Apply custom filters
  if (criteria.customFilters) {
    Object.entries(criteria.customFilters).forEach(([key, value]) => {
      filteredTemplates = filteredTemplates.filter(template => {
        // Implement custom filter logic berdasarkan key dan value
        return applyCustomFilter(template, key, value);
      });
    });
  }

  return filteredTemplates;
};

/**
 * Apply custom filter ke template
 * 
 * @param template - Template yang akan difilter
 * @param filterKey - Filter key
 * @param filterValue - Filter value
 * @returns Boolean indicating if template passes filter
 */
export const applyCustomFilter = (
  template: DocumentTemplate,
  filterKey: string,
  filterValue: unknown
): boolean => {
  // Implement custom filter logic sesuai kebutuhan
  switch (filterKey) {
    case 'hasImages':
      return filterValue ? template.content.includes('![') : true;
    case 'hasCodeBlocks':
      return filterValue ? template.content.includes('```') : true;
    case 'wordCount': {
      const wordCount = template.content.split(/\s+/).length;
      if (typeof filterValue === 'object' && filterValue !== null &&
          'min' in filterValue && 'max' in filterValue) {
        const range = filterValue as { min: number; max: number };
        return wordCount >= range.min && wordCount <= range.max;
      }
      return true;
    }
    default:
      return true;
  }
};

/**
 * Sort templates berdasarkan sort options
 * 
 * @param templates - Array of templates
 * @param sortOptions - Sort options
 * @returns Sorted templates
 */
export const sortTemplates = (
  templates: DocumentTemplate[],
  sortOptions: SortOptions
): DocumentTemplate[] => {
  const { field, direction } = sortOptions;
  
  return [...templates].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'difficulty': {
        const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
        comparison = (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) -
                    (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0);
        break;
      }
      case 'createdAt': {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        // Handle invalid dates
        const validDateA = isNaN(dateA) ? 0 : dateA;
        const validDateB = isNaN(dateB) ? 0 : dateB;
        comparison = validDateA - validDateB;
        break;
      }
      case 'updatedAt': {
        const updatedA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const updatedB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        // Handle invalid dates
        const validUpdatedA = isNaN(updatedA) ? 0 : updatedA;
        const validUpdatedB = isNaN(updatedB) ? 0 : updatedB;
        comparison = validUpdatedA - validUpdatedB;
        break;
      }
      case 'popularity':
        comparison = (a.popularity || 0) - (b.popularity || 0);
        break;
      default:
        comparison = 0;
    }

    return direction === 'desc' ? -comparison : comparison;
  });
};

/**
 * Get available categories dari templates
 * 
 * @param templates - Array of templates
 * @returns Array of category info
 */
export const getAvailableCategories = (templates: DocumentTemplate[]): CategoryInfo[] => {
  const categoryMap = new Map<string, CategoryInfo>();

  templates.forEach(template => {
    const category = template.category;
    if (categoryMap.has(category)) {
      categoryMap.get(category)!.count++;
    } else {
      categoryMap.set(category, {
        id: category,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        count: 1,
        description: `Templates in ${category} category`
      });
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
};

/**
 * Get available tags dari templates
 * 
 * @param templates - Array of templates
 * @returns Array of tag info
 */
export const getAvailableTags = (templates: DocumentTemplate[]): TagInfo[] => {
  const tagMap = new Map<string, TagInfo>();

  templates.forEach(template => {
    if (template.tags) {
      template.tags.forEach(tag => {
        if (tagMap.has(tag)) {
          tagMap.get(tag)!.count++;
        } else {
          tagMap.set(tag, {
            name: tag,
            count: 1,
            description: `Templates tagged with ${tag}`
          });
        }
      });
    }
  });

  return Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
};

/**
 * Calculate filter statistics
 * 
 * @param originalTemplates - Original templates array
 * @param filteredTemplates - Filtered templates array
 * @returns Filter statistics
 */
export const calculateFilterStatistics = (
  originalTemplates: DocumentTemplate[],
  filteredTemplates: DocumentTemplate[]
): FilterStatistics => {
  const totalTemplates = originalTemplates.length;
  const filteredCount = filteredTemplates.length;
  const filterEfficiency = totalTemplates > 0 ? filteredCount / totalTemplates : 0;

  // Find most popular category
  const categories = getAvailableCategories(filteredTemplates);
  const popularCategory = categories.length > 0 ? categories[0].name : '';

  // Find most used tags
  const tags = getAvailableTags(filteredTemplates);
  const popularTags = tags.slice(0, 5).map(tag => tag.name);

  return {
    totalTemplates,
    filteredCount,
    filterEfficiency,
    popularCategory,
    popularTags
  };
};

/**
 * Generate search suggestions berdasarkan templates
 * 
 * @param templates - Array of templates
 * @param currentSearchTerm - Current search term
 * @param maxSuggestions - Maximum number of suggestions
 * @returns Array of search suggestions
 */
export const generateSearchSuggestions = (
  templates: DocumentTemplate[],
  currentSearchTerm: string,
  maxSuggestions: number = 5
): string[] => {
  if (currentSearchTerm.length < 2) return [];

  const suggestions = new Set<string>();
  const searchTerm = currentSearchTerm.toLowerCase();

  templates.forEach(template => {
    // Add template name suggestions
    if (template.name.toLowerCase().includes(searchTerm)) {
      suggestions.add(template.name);
    }

    // Add tag suggestions
    if (template.tags) {
      template.tags.forEach(tag => {
        if (tag.toLowerCase().includes(searchTerm)) {
          suggestions.add(tag);
        }
      });
    }

    // Add category suggestions
    if (template.category.toLowerCase().includes(searchTerm)) {
      suggestions.add(template.category);
    }
  });

  return Array.from(suggestions).slice(0, maxSuggestions);
};

/**
 * Create empty filter criteria
 * 
 * @returns Empty filter criteria
 */
export const createEmptyFilterCriteria = (): FilterCriteria => ({
  searchTerm: '',
  category: TEMPLATE_FILTER_CONSTANTS.ALL_CATEGORIES,
  difficulty: '',
  tags: [],
  customFilters: {}
});

/**
 * Validate filter criteria
 * 
 * @param criteria - Filter criteria to validate
 * @returns Boolean indicating if criteria is valid
 */
export const validateFilterCriteria = (criteria: FilterCriteria): boolean => {
  // Basic validation
  if (typeof criteria.searchTerm !== 'string') return false;
  if (typeof criteria.category !== 'string') return false;
  
  // Validate tags array
  if (criteria.tags && !Array.isArray(criteria.tags)) return false;
  
  // Validate date range
  if (criteria.dateRange) {
    if (!(criteria.dateRange.from instanceof Date) || !(criteria.dateRange.to instanceof Date)) {
      return false;
    }
    if (criteria.dateRange.from > criteria.dateRange.to) return false;
  }

  return true;
};

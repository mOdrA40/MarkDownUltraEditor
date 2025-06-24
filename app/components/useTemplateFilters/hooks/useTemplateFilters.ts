/**
 * useTemplateFilters Hook (Backward Compatibility)
 * 
 * Hook untuk backward compatibility yang mempertahankan interface
 * yang sama dengan versi sebelumnya.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useState, useMemo } from 'react';

import { UseTemplateFiltersReturn, TemplateFilterOptions } from '../types';
import { 
  filterTemplates, 
  createEmptyFilterCriteria,
  TEMPLATE_FILTER_CONSTANTS 
} from '../utils/templateFilterUtils';

/**
 * Hook untuk template filtering dengan backward compatibility
 * 
 * @param options - Template filter options
 * @returns Object dengan filter functions (backward compatible)
 */
export const useTemplateFilters = (
  options: TemplateFilterOptions
): UseTemplateFiltersReturn => {
  const { 
    templates,
    initialSearchTerm = '',
    initialCategory = TEMPLATE_FILTER_CONSTANTS.ALL_CATEGORIES,
    customSearchFunction,
    customFilterFunction
  } = options;

  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  /**
   * Filtered templates berdasarkan search term dan category
   */
  const filteredTemplates = useMemo(() => {
    try {
      // Create filter criteria
      const filterCriteria = {
        ...createEmptyFilterCriteria(),
        searchTerm,
        category: selectedCategory
      };

      // Use custom filter function jika ada
      if (customFilterFunction) {
        return customFilterFunction(templates, filterCriteria);
      }

      // Use custom search function jika ada dan hanya search term yang digunakan
      if (customSearchFunction && searchTerm.trim() && selectedCategory === TEMPLATE_FILTER_CONSTANTS.ALL_CATEGORIES) {
        return customSearchFunction(templates, searchTerm);
      }

      // Default filtering
      return filterTemplates(templates, filterCriteria);
    } catch (error) {
      console.error('Error filtering templates:', error);
      return templates; // Fallback ke semua templates
    }
  }, [templates, searchTerm, selectedCategory, customSearchFunction, customFilterFunction]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredTemplates
  };
};

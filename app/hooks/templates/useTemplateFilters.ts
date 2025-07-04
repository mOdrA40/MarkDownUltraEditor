/**
 * useTemplateFilters Hook (Simplified)
 *
 * Hook untuk template filtering dengan implementasi sederhana
 *
 * @author Axel Modra
 */

import { useState, useMemo } from 'react';
import type { DocumentTemplate } from '@/types/templates';

// Simple filter interface
interface TemplateFilterOptions {
  templates: DocumentTemplate[];
}

interface UseTemplateFiltersReturn {
  filteredTemplates: DocumentTemplate[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
}

/**
 * Hook untuk template filters dengan backward compatibility
 */
export const useTemplateFilters = (options: TemplateFilterOptions): UseTemplateFiltersReturn => {
  const { templates } = options;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories dari templates
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(templates.map((template) => template.category))
    ).sort();

    return ['all', ...uniqueCategories];
  }, [templates]);

  // Filter templates berdasarkan search term dan category
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((template) => template.category === selectedCategory);
    }

    return filtered;
  }, [templates, searchTerm, selectedCategory]);

  return {
    filteredTemplates,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
  };
};

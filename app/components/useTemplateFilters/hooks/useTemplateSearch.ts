/**
 * useTemplateSearch Hook
 * 
 * Custom hook untuk template search dengan debouncing,
 * suggestions, dan performance optimization.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { DocumentTemplate } from '@/types/templates';
import { UseTemplateSearchReturn, SearchOptions } from '../types';
import { 
  searchTemplates, 
  generateSearchSuggestions,
  TEMPLATE_FILTER_CONSTANTS 
} from '../utils/templateFilterUtils';

/**
 * Hook untuk template search dengan advanced features
 * 
 * @param templates - Array of templates untuk search
 * @param options - Search options
 * @returns Object dengan search functions dan state
 */
export const useTemplateSearch = (
  templates: DocumentTemplate[],
  options: SearchOptions = {}
): UseTemplateSearchReturn => {
  const {
    caseSensitive = false,
    searchInContent = true,
    searchInTags = true,
    searchInDescription = true,
    minSearchLength = TEMPLATE_FILTER_CONSTANTS.DEFAULT_MIN_SEARCH_LENGTH,
    debounceDelay = TEMPLATE_FILTER_CONSTANTS.DEFAULT_DEBOUNCE_DELAY
  } = options;

  const [searchTerm, setSearchTermState] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Debounced search term untuk actual searching
   */
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  /**
   * Set search term dengan debouncing
   * 
   * @param term - Search term
   */
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setIsSearching(true);

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout untuk debouncing
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(term);
      setIsSearching(false);
    }, debounceDelay);
  }, [debounceDelay]);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchTermState('');
    setDebouncedSearchTerm('');
    setIsSearching(false);
    
    // Clear timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  /**
   * Search results berdasarkan debounced search term
   */
  const searchResults = useMemo(() => {
    if (debouncedSearchTerm.trim().length < minSearchLength) {
      return templates;
    }

    try {
      const startTime = performance.now();
      
      const results = searchTemplates(templates, debouncedSearchTerm, {
        caseSensitive,
        searchInContent,
        searchInTags,
        searchInDescription,
        minSearchLength
      });

      const endTime = performance.now();
      const searchTime = endTime - startTime;

      // Log performance untuk debugging
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Search completed in ${searchTime.toFixed(2)}ms`, {
          searchTerm: debouncedSearchTerm,
          resultsCount: results.length,
          totalTemplates: templates.length
        });
      }

      // Warning jika search terlalu lambat
      if (searchTime > 100) {
        console.warn(`Slow search detected: ${searchTime.toFixed(2)}ms for "${debouncedSearchTerm}"`);
      }

      return results;
    } catch (error) {
      console.error('Error during template search:', error);
      return templates; // Fallback ke semua templates
    }
  }, [
    templates, 
    debouncedSearchTerm, 
    caseSensitive, 
    searchInContent, 
    searchInTags, 
    searchInDescription, 
    minSearchLength
  ]);

  /**
   * Search suggestions berdasarkan current search term
   */
  const suggestions = useMemo(() => {
    if (searchTerm.trim().length < minSearchLength) {
      return [];
    }

    try {
      return generateSearchSuggestions(templates, searchTerm, 5);
    } catch (error) {
      console.error('Error generating search suggestions:', error);
      return [];
    }
  }, [templates, searchTerm, minSearchLength]);

  /**
   * Cleanup effect untuk clear timeout
   */
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    searchResults,
    isSearching,
    suggestions
  };
};

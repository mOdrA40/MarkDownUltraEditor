/**
 * @fileoverview Custom hook untuk search engine functionality
 * @author Axel Modra
 */

import { useCallback, useMemo, useState } from 'react';
import type {
  NavigationDirection,
  ReplaceResult,
  SearchEngineState,
  SearchMatch,
  SearchOptions,
  SearchResult,
} from '../types/search.types';

/**
 * Escape special regex characters
 * @param string - String to escape
 * @returns Escaped string
 */
const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Create regex pattern from search term
 * @param searchTerm - Search term
 * @param options - Search options
 * @returns RegExp object
 */
const createSearchRegex = (searchTerm: string, options: SearchOptions): RegExp => {
  const { caseSensitive, useRegex = false, wholeWord = false } = options;

  let pattern = useRegex ? searchTerm : escapeRegex(searchTerm);

  if (wholeWord) {
    pattern = `\\b${pattern}\\b`;
  }

  const flags = caseSensitive ? 'g' : 'gi';

  try {
    return new RegExp(pattern, flags);
  } catch {
    // Fallback to escaped pattern if regex is invalid
    return new RegExp(escapeRegex(searchTerm), flags);
  }
};

/**
 * Find all matches in markdown content
 * @param markdown - Markdown content
 * @param searchTerm - Search term
 * @param options - Search options
 * @returns Search result
 */
const findMatches = (
  markdown: string,
  searchTerm: string,
  options: SearchOptions
): SearchResult => {
  if (!searchTerm.trim()) {
    return {
      matches: [],
      totalMatches: 0,
      searchTerm,
      options,
    };
  }

  const regex = createSearchRegex(searchTerm, options);
  const matches: SearchMatch[] = [];
  let match: RegExpExecArray | null;

  match = regex.exec(markdown);
  while (match !== null) {
    matches.push({
      index: match.index,
      text: match[0],
      length: match[0].length,
    });
    match = regex.exec(markdown);
  }

  return {
    matches,
    totalMatches: matches.length,
    searchTerm,
    options,
  };
};

/**
 * Custom hook untuk search engine functionality
 * @param markdown - Markdown content
 */
export const useSearchEngine = (markdown: string) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // Search options
  const searchOptions: SearchOptions = useMemo(
    () => ({
      caseSensitive,
      useRegex,
      wholeWord,
    }),
    [caseSensitive, useRegex, wholeWord]
  );

  // Find matches using memoization for performance
  const searchResult = useMemo(() => {
    setIsSearching(true);
    const result = findMatches(markdown, searchTerm, searchOptions);
    setIsSearching(false);

    // Reset current match if no matches found
    if (result.matches.length === 0) {
      setCurrentMatch(0);
    } else if (currentMatch >= result.matches.length) {
      setCurrentMatch(0);
    }

    return result;
  }, [markdown, searchTerm, searchOptions, currentMatch]);

  /**
   * Navigate to specific match
   * @param direction - Navigation direction
   */
  const navigateMatch = useCallback(
    (direction: NavigationDirection) => {
      const { matches } = searchResult;

      if (matches.length === 0) return;

      switch (direction) {
        case 'next':
          setCurrentMatch((prev) => (prev + 1) % matches.length);
          break;
        case 'prev':
          setCurrentMatch((prev) => (prev - 1 + matches.length) % matches.length);
          break;
        case 'first':
          setCurrentMatch(0);
          break;
        case 'last':
          setCurrentMatch(matches.length - 1);
          break;
      }
    },
    [searchResult]
  );

  /**
   * Replace single occurrence
   * @returns Replace result
   */
  const replaceOne = useCallback((): ReplaceResult => {
    const { matches } = searchResult;

    if (!searchTerm || matches.length === 0) {
      return {
        newMarkdown: markdown,
        replacementCount: 0,
        success: false,
      };
    }

    const match = matches[currentMatch];
    const before = markdown.substring(0, match.index);
    const after = markdown.substring(match.index + match.length);
    const newMarkdown = before + replaceTerm + after;

    return {
      newMarkdown,
      replacementCount: 1,
      success: true,
    };
  }, [markdown, searchResult, currentMatch, searchTerm, replaceTerm]);

  /**
   * Replace all occurrences
   * @returns Replace result
   */
  const replaceAll = useCallback((): ReplaceResult => {
    if (!searchTerm) {
      return {
        newMarkdown: markdown,
        replacementCount: 0,
        success: false,
      };
    }

    const regex = createSearchRegex(searchTerm, searchOptions);
    const newMarkdown = markdown.replace(regex, replaceTerm);
    const replacementCount = searchResult.totalMatches;

    return {
      newMarkdown,
      replacementCount,
      success: replacementCount > 0,
    };
  }, [markdown, searchTerm, replaceTerm, searchOptions, searchResult]);

  /**
   * Clear search state
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setReplaceTerm('');
    setCurrentMatch(0);
  }, []);

  /**
   * Get current search engine state
   */
  const getState = useCallback(
    (): SearchEngineState => ({
      searchTerm,
      replaceTerm,
      options: searchOptions,
      matches: searchResult.matches,
      currentMatch,
      isSearching,
    }),
    [searchTerm, replaceTerm, searchOptions, searchResult, currentMatch, isSearching]
  );

  return {
    // State
    searchTerm,
    replaceTerm,
    caseSensitive,
    useRegex,
    wholeWord,
    currentMatch,
    isSearching,

    // Search results
    matches: searchResult.matches,
    totalMatches: searchResult.totalMatches,

    // Actions
    setSearchTerm,
    setReplaceTerm,
    setCaseSensitive,
    setUseRegex,
    setWholeWord,
    navigateMatch,
    replaceOne,
    replaceAll,
    clearSearch,
    getState,

    // Computed
    hasMatches: searchResult.matches.length > 0,
    currentMatchInfo: searchResult.matches[currentMatch] || null,
  };
};

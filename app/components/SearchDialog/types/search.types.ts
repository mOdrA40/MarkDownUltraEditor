/**
 * @fileoverview Type definitions untuk SearchDialog components
 * @author Senior Developer
 * @version 1.0.0
 */

/**
 * Props untuk komponen SearchDialog utama
 */
export interface SearchDialogProps {
  /** Konten markdown untuk pencarian */
  markdown: string;
  /** Callback ketika replacement dilakukan */
  onReplace: (newMarkdown: string) => void;
  /** Callback ketika dialog ditutup */
  onClose: () => void;
}

/**
 * Props untuk SearchControls component
 */
export interface SearchControlsProps {
  /** Search term */
  searchTerm: string;
  /** Replace term */
  replaceTerm: string;
  /** Case sensitive flag */
  caseSensitive: boolean;
  /** Callback untuk update search term */
  onSearchTermChange: (term: string) => void;
  /** Callback untuk update replace term */
  onReplaceTermChange: (term: string) => void;
  /** Callback untuk toggle case sensitivity */
  onCaseSensitiveChange: (caseSensitive: boolean) => void;
}

/**
 * Props untuk SearchResults component
 */
export interface SearchResultsProps {
  /** Array of matches */
  matches: SearchMatch[];
  /** Current match index */
  currentMatch: number;
}

/**
 * Props untuk SearchActions component
 */
export interface SearchActionsProps {
  /** Array of matches */
  matches: SearchMatch[];
  /** Current match index */
  currentMatch: number;
  /** Callback untuk navigate matches */
  onNavigateMatch: (direction: 'next' | 'prev') => void;
  /** Callback untuk replace one */
  onReplaceOne: () => void;
  /** Callback untuk replace all */
  onReplaceAll: () => void;
}

/**
 * Search match object
 */
export interface SearchMatch {
  /** Index dalam markdown string */
  index: number;
  /** Matched text */
  text: string;
  /** Length of match */
  length: number;
}

/**
 * Search engine options
 */
export interface SearchOptions {
  /** Case sensitive search */
  caseSensitive: boolean;
  /** Use regex */
  useRegex?: boolean;
  /** Whole word only */
  wholeWord?: boolean;
}

/**
 * Search engine result
 */
export interface SearchResult {
  /** Array of matches found */
  matches: SearchMatch[];
  /** Total count of matches */
  totalMatches: number;
  /** Search term used */
  searchTerm: string;
  /** Options used for search */
  options: SearchOptions;
}

/**
 * Replace operation result
 */
export interface ReplaceResult {
  /** New markdown content */
  newMarkdown: string;
  /** Number of replacements made */
  replacementCount: number;
  /** Success flag */
  success: boolean;
}

/**
 * Navigation direction
 */
export type NavigationDirection = 'next' | 'prev' | 'first' | 'last';

/**
 * Search engine state
 */
export interface SearchEngineState {
  /** Current search term */
  searchTerm: string;
  /** Current replace term */
  replaceTerm: string;
  /** Search options */
  options: SearchOptions;
  /** Current matches */
  matches: SearchMatch[];
  /** Current match index */
  currentMatch: number;
  /** Loading state */
  isSearching: boolean;
}

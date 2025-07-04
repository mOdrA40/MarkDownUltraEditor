/**
 * @fileoverview SearchDialog - Komponen dialog untuk search dan replace functionality
 * @author Axel Modra
 * @refactored Memisahkan concerns dan menggunakan composition pattern
 */

import { Search } from 'lucide-react';
import type React from 'react';
import { useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SearchActions } from './SearchDialog/components/SearchActions';
import { SearchControls } from './SearchDialog/components/SearchControls';
import { SearchResults } from './SearchDialog/components/SearchResults';
// Custom hooks dan components
import { useSearchEngine } from './SearchDialog/hooks/useSearchEngine';

// Types
import type { SearchDialogProps } from './SearchDialog/types/search.types';

/**
 * Dialog component for search and replace with clean architecture
 * Uses composition pattern and separation of concerns
 */
export const SearchDialog: React.FC<SearchDialogProps> = ({ markdown, onReplace, onClose }) => {
  // Setup search engine with custom hook
  const {
    searchTerm,
    replaceTerm,
    caseSensitive,
    currentMatch,
    matches,
    totalMatches,
    setSearchTerm,
    setReplaceTerm,
    setCaseSensitive,
    navigateMatch,
    replaceOne,
    replaceAll,
    clearSearch,
  } = useSearchEngine(markdown);

  /**
   * Handle replace one with cleanup
   */
  const handleReplaceOne = useCallback(() => {
    const result = replaceOne();
    if (result.success) {
      onReplace(result.newMarkdown);
    }
  }, [replaceOne, onReplace]);

  /**
   * Handle replace all dengan cleanup
   */
  const handleReplaceAll = useCallback(() => {
    const result = replaceAll();
    if (result.success) {
      onReplace(result.newMarkdown);
      clearSearch();
    }
  }, [replaceAll, onReplace, clearSearch]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search & Replace
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Controls */}
          <SearchControls
            searchTerm={searchTerm}
            replaceTerm={replaceTerm}
            caseSensitive={caseSensitive}
            onSearchTermChange={setSearchTerm}
            onReplaceTermChange={setReplaceTerm}
            onCaseSensitiveChange={setCaseSensitive}
            matchCount={totalMatches}
            currentMatch={currentMatch}
          />

          {/* Search Results Info */}
          {searchTerm && <SearchResults matches={matches} currentMatch={currentMatch} />}

          {/* Search Actions */}
          <SearchActions
            matches={matches}
            currentMatch={currentMatch}
            onNavigateMatch={navigateMatch}
            onReplaceOne={handleReplaceOne}
            onReplaceAll={handleReplaceAll}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

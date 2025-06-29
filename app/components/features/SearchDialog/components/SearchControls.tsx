/**
 * @fileoverview SearchControls - Input controls for search and replace
 * @author Axel Modra
 */

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SearchControlsProps } from '../types/search.types';

/**
 * Component for search and replace input controls
 */
export const SearchControls: React.FC<SearchControlsProps & {
  matchCount?: number;
  currentMatch?: number;
}> = ({
  searchTerm,
  replaceTerm,
  caseSensitive,
  onSearchTermChange,
  onReplaceTermChange,
  onCaseSensitiveChange,
  matchCount = 0,
  currentMatch = 0
}) => {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Search
        </Label>
        <div className="flex space-x-2">
          <Input
            id="search"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Enter search term..."
            className="flex-1"
          />
          {matchCount > 0 && (
            <Badge variant="secondary" className="px-2 py-1 whitespace-nowrap">
              {currentMatch + 1} of {matchCount}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Replace Input */}
      <div className="space-y-2">
        <Label htmlFor="replace" className="text-sm font-medium">
          Replace with
        </Label>
        <Input
          id="replace"
          value={replaceTerm}
          onChange={(e) => onReplaceTermChange(e.target.value)}
          placeholder="Enter replacement..."
        />
      </div>
      
      {/* Options */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="caseSensitive"
          checked={caseSensitive}
          onChange={(e) => onCaseSensitiveChange(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="caseSensitive" className="text-sm">
          Case sensitive
        </Label>
      </div>
    </div>
  );
};

/**
 * @fileoverview SearchControls - Input controls for search and replace
 * @author Axel Modra
 */

import type React from 'react';
import { useId } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SearchControlsProps } from '../types/search.types';

/**
 * Component for search and replace input controls
 */
export const SearchControls: React.FC<
  SearchControlsProps & {
    matchCount?: number;
    currentMatch?: number;
  }
> = ({
  searchTerm,
  replaceTerm,
  caseSensitive,
  onSearchTermChange,
  onReplaceTermChange,
  onCaseSensitiveChange,
  matchCount = 0,
  currentMatch = 0,
}) => {
  // Generate unique IDs for form elements
  const searchId = useId();
  const replaceId = useId();
  const caseSensitiveId = useId();
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor={searchId} className="text-sm font-medium">
          Search
        </Label>
        <div className="flex space-x-2">
          <Input
            id={searchId}
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
        <Label htmlFor={replaceId} className="text-sm font-medium">
          Replace with
        </Label>
        <Input
          id={replaceId}
          value={replaceTerm}
          onChange={(e) => onReplaceTermChange(e.target.value)}
          placeholder="Enter replacement..."
        />
      </div>

      {/* Options */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={caseSensitiveId}
          checked={caseSensitive}
          onChange={(e) => onCaseSensitiveChange(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor={caseSensitiveId} className="text-sm">
          Case sensitive
        </Label>
      </div>
    </div>
  );
};

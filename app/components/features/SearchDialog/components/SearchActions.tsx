/**
 * @fileoverview SearchActions - Action buttons untuk search dan replace operations
 * @author Axel Modra
 */

import { Replace } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import type { SearchActionsProps } from '../types/search.types';

/**
 * Komponen untuk action buttons search dan replace
 */
export const SearchActions: React.FC<SearchActionsProps> = ({
  matches,
  onNavigateMatch,
  onReplaceOne,
  onReplaceAll,
}) => {
  const hasMatches = matches.length > 0;

  return (
    <div className="flex space-x-2">
      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onNavigateMatch('prev')}
        disabled={!hasMatches}
        title="Previous match (Shift+F3)"
      >
        ← Prev
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onNavigateMatch('next')}
        disabled={!hasMatches}
        title="Next match (F3)"
      >
        Next →
      </Button>

      {/* Replace Buttons */}
      <Button
        variant="outline"
        size="sm"
        onClick={onReplaceOne}
        disabled={!hasMatches}
        title="Replace current match (Ctrl+H)"
      >
        <Replace className="h-4 w-4 mr-1" />
        Replace
      </Button>

      <Button
        variant="default"
        size="sm"
        onClick={onReplaceAll}
        disabled={!hasMatches}
        title="Replace all matches (Ctrl+Shift+H)"
      >
        Replace All
      </Button>
    </div>
  );
};

/**
 * @fileoverview SearchResults - Komponen untuk menampilkan hasil pencarian
 * @author Axel Modra
 */

import type React from 'react';
import { Badge } from '@/components/ui/badge';
import type { SearchResultsProps } from '../types/search.types';

/**
 * Component for displaying search results information
 */
export const SearchResults: React.FC<SearchResultsProps> = ({ matches, currentMatch }) => {
  if (matches.length === 0) {
    return <div className="text-sm text-muted-foreground italic">No matches found</div>;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {matches.length} match{matches.length !== 1 ? 'es' : ''} found
      </div>

      <Badge variant="secondary" className="px-2 py-1">
        {currentMatch + 1} of {matches.length}
      </Badge>
    </div>
  );
};

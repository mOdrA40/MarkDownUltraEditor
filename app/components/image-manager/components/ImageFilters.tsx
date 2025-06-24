/**
 * Komponen untuk filter dan pencarian gambar
 * Menangani search input, filter tag, dan toggle view mode
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  X,
  SortAsc,
  SortDesc
} from "lucide-react";
import { ImageFiltersProps } from '../types/imageTypes';

interface ImageFiltersComponentProps extends ImageFiltersProps {
  /** Jumlah total gambar */
  totalImages?: number;
  /** Jumlah gambar yang difilter */
  filteredCount?: number;
  /** Callback untuk reset semua filter */
  onResetFilters?: () => void;
  /** Callback untuk sorting */
  onSort?: (sortBy: 'name' | 'size' | 'date' | 'type', order: 'asc' | 'desc') => void;
  /** Current sort configuration */
  currentSort?: {
    sortBy: 'name' | 'size' | 'date' | 'type';
    order: 'asc' | 'desc';
  };
}

export const ImageFilters: React.FC<ImageFiltersComponentProps> = ({
  searchTerm,
  onSearchChange,
  filterTag,
  onFilterChange,
  availableTags,
  viewMode,
  onViewModeChange,
  totalImages = 0,
  filteredCount = 0,
  onResetFilters,
  onSort,
  currentSort
}) => {
  /**
   * Handle clear search
   */
  const handleClearSearch = () => {
    onSearchChange('');
  };

  /**
   * Handle clear filter tag
   */
  const handleClearFilter = () => {
    onFilterChange('');
  };

  /**
   * Handle reset all filters
   */
  const handleResetAll = () => {
    onSearchChange('');
    onFilterChange('');
    onResetFilters?.();
  };

  /**
   * Handle sort click
   */
  const handleSortClick = (sortBy: 'name' | 'size' | 'date' | 'type') => {
    if (!onSort) return;
    
    const newOrder = currentSort?.sortBy === sortBy && currentSort?.order === 'desc' 
      ? 'asc' 
      : 'desc';
    
    onSort(sortBy, newOrder);
  };

  const hasActiveFilters = searchTerm || filterTag;
  const isFiltered = filteredCount !== totalImages;

  return (
    <div className="space-y-3">
      {/* Top Row: Search and View Mode */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari gambar atau tag..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="h-8 w-8 p-0"
            title="Grid View"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="h-8 w-8 p-0"
            title="List View"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Second Row: Tags Filter and Sort Options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Tags Filter */}
        <div className="flex items-center space-x-2 flex-wrap">
          {availableTags.length > 0 && (
            <>
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground">Filter:</span>
              
              {/* All Tags Button */}
              <Button
                variant={!filterTag ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange('')}
                className="h-6 text-xs"
              >
                Semua
              </Button>

              {/* Individual Tag Buttons */}
              {availableTags.slice(0, 5).map(tag => (
                <Button
                  key={tag}
                  variant={filterTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onFilterChange(filterTag === tag ? '' : tag)}
                  className="h-6 text-xs"
                >
                  {tag}
                  {filterTag === tag && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Button>
              ))}

              {/* More Tags Dropdown (if needed) */}
              {availableTags.length > 5 && (
                <select
                  value={filterTag}
                  onChange={(e) => onFilterChange(e.target.value)}
                  className="px-2 py-1 border rounded text-xs bg-background"
                >
                  <option value="">Lainnya...</option>
                  {availableTags.slice(5).map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              )}
            </>
          )}
        </div>

        {/* Sort Options */}
        {onSort && (
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground">Urutkan:</span>
            
            {(['name', 'size', 'date', 'type'] as const).map(sortBy => (
              <Button
                key={sortBy}
                variant={currentSort?.sortBy === sortBy ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleSortClick(sortBy)}
                className="h-6 text-xs flex items-center space-x-1"
              >
                <span>
                  {sortBy === 'name' ? 'Nama' :
                   sortBy === 'size' ? 'Ukuran' :
                   sortBy === 'date' ? 'Tanggal' :
                   'Tipe'}
                </span>
                {currentSort?.sortBy === sortBy && (
                  currentSort.order === 'asc' ? 
                    <SortAsc className="h-3 w-3" /> : 
                    <SortDesc className="h-3 w-3" />
                )}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Status and Actions */}
      <div className="flex items-center justify-between text-sm">
        {/* Results Count */}
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">
            {isFiltered ? (
              <>Menampilkan {filteredCount} dari {totalImages} gambar</>
            ) : (
              <>{totalImages} gambar</>
            )}
          </span>
          
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Filter aktif
            </Badge>
          )}
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetAll}
            className="h-6 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Reset Filter
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filter aktif:</span>
          
          {searchTerm && (
            <Badge variant="outline" className="text-xs">
              Pencarian: &ldquo;{searchTerm}&rdquo;
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {filterTag && (
            <Badge variant="outline" className="text-xs">
              Tag: {filterTag}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilter}
                className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

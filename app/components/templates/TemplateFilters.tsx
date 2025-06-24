/**
 * Filter controls untuk DocumentTemplates
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Grid3X3, List } from "lucide-react";
import { TemplateFiltersProps } from '@/types/templates';
import { getTemplateCategories } from '@/utils/documentTemplates';
import { 
  getResponsiveTextSize, 
  getResponsiveIconSize, 
  getResponsiveButtonSize 
} from '@/utils/templateUtils';

/**
 * Search dan filter controls untuk templates
 */
export const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  isMobile
}) => {
  const categories = getTemplateCategories();

  return (
    <div className={`flex flex-col gap-3 border-b bg-muted/20 ${
      isMobile ? 'p-4' : 'p-2 sm:p-3 md:p-4'
    }`}>
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className={`absolute left-3 top-2.5 text-muted-foreground ${
          getResponsiveIconSize(isMobile, 'sm')
        }`} />
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`${
            isMobile 
              ? `pl-10 ${getResponsiveTextSize(isMobile, 'sm')} ${getResponsiveButtonSize(isMobile)}` 
              : `pl-8 sm:pl-9 ${getResponsiveTextSize(isMobile, 'sm')} h-8 sm:h-9`
          }`}
        />
      </div>

      {/* Category Select and View Mode Toggle */}
      <div className={`flex items-stretch gap-2 ${
        isMobile ? 'flex-col' : 'flex-col sm:flex-row sm:items-center'
      }`}>
        {/* Category Select */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className={`${
            isMobile
              ? `min-w-full ${getResponsiveTextSize(isMobile, 'sm')} ${getResponsiveButtonSize(isMobile)}`
              : `min-w-[100px] sm:min-w-[120px] ${getResponsiveTextSize(isMobile, 'sm')} h-8 sm:h-9`
          }`}>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className={`${
            isMobile ? 'max-h-[200px]' : 'max-h-[300px]'
          }`}>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name} ({category.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-md overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={`rounded-none p-0 ${
              isMobile ? `${getResponsiveButtonSize(isMobile)} w-10 flex-1` : 'h-7 w-7'
            }`}
          >
            <Grid3X3 className={getResponsiveIconSize(isMobile, 'sm')} />
            {isMobile && <span className="ml-2">Grid</span>}
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={`rounded-none p-0 ${
              isMobile ? `${getResponsiveButtonSize(isMobile)} w-10 flex-1` : 'h-7 w-7'
            }`}
          >
            <List className={getResponsiveIconSize(isMobile, 'sm')} />
            {isMobile && <span className="ml-2">List</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

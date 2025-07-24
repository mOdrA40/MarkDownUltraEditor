/**
 * @fileoverview FilesTable toolbar with search, filters, and actions
 * @author Axel Modra
 */

import type { Table } from "@tanstack/react-table";
import {
  Download,
  Grid3X3,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FileData } from "@/lib/supabase";

/**
 * View mode type
 */
type ViewMode = "grid" | "list" | "table";

/**
 * Sort options
 */
type SortOption = "name" | "date" | "size";
type SortDirection = "asc" | "desc";

/**
 * Props interface for FilesTableToolbar
 */
interface FilesTableToolbarProps {
  table?: Table<FileData>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortByChange: (sort: SortOption) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (direction: SortDirection) => void;
  onNewFile: () => void;
  onExportAll: () => void;
  onDeleteSelected?: () => void;
  isLoading?: boolean;
  totalFiles?: number;
  selectedRowCount?: number;
}

/**
 * FilesTableToolbar component with search, filters, and bulk actions
 */
export const FilesTableToolbar: React.FC<FilesTableToolbarProps> = ({
  table,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionChange,
  onNewFile,
  onExportAll,
  onDeleteSelected,
  isLoading = false,
  totalFiles = 0,
  selectedRowCount = 0,
}) => {
  const hasSelection = selectedRowCount > 0;

  const clearSearch = () => {
    onSearchChange("");
  };

  const clearFilters = () => {
    table?.resetColumnFilters();
    onSearchChange("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top row - Search and primary actions */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-2 flex-1">
          {/* Search input */}
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 w-full"
              disabled={isLoading}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Active filters indicator */}
          {(searchQuery ||
            (table?.getState().columnFilters.length || 0) > 0) && (
            <div className="flex items-center space-x-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {searchQuery && `Search: "${searchQuery}"`}
                {searchQuery &&
                  (table?.getState().columnFilters.length || 0) > 0 &&
                  ", "}
                {(table?.getState().columnFilters.length || 0) > 0 &&
                  `${table?.getState().columnFilters.length || 0} filter(s)`}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Primary actions */}
        <div className="flex items-center justify-end sm:justify-start space-x-2">
          <Button
            onClick={onNewFile}
            size="sm"
            disabled={isLoading}
            className="flex-shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">New File</span>
            <span className="xs:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Bottom row - View controls, sorting, and bulk actions */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:space-x-4">
          {/* View mode toggle */}
          <div className="flex items-center space-x-1 rounded-md border p-1 w-fit">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("grid")}
                  className="h-7 w-7 p-0"
                >
                  <Grid3X3 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid view</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("list")}
                  className="h-7 w-7 p-0"
                >
                  <List className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List view</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("table")}
                  className="h-7 w-7 p-0"
                >
                  <SlidersHorizontal className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Table view</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Sort controls */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:space-x-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Sort by:
            </span>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortDirection}
                onValueChange={onSortDirectionChange}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Asc</SelectItem>
                  <SelectItem value="desc">Desc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File count */}
          <div className="text-sm text-muted-foreground">
            {table?.getFilteredRowModel().rows.length || totalFiles} file(s)
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-2">
          {hasSelection && (
            <>
              <Badge variant="outline" className="text-xs">
                {selectedRowCount} selected
              </Badge>

              {onDeleteSelected && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDeleteSelected}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Delete Selected</span>
                  <span className="xs:hidden">Delete</span>
                </Button>
              )}

              <Separator
                orientation="vertical"
                className="h-6 hidden sm:block"
              />
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onExportAll}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Export All</span>
            <span className="xs:hidden">Export</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

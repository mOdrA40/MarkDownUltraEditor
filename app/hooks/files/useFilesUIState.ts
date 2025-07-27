import type { Table } from '@tanstack/react-table';
import { useState } from 'react';
import type { FileData } from '@/lib/supabase';

export type ViewMode = 'grid' | 'list' | 'table';

export type SortOption = 'name' | 'date' | 'size';
export type SortDirection = 'asc' | 'desc';

export interface FilesUIState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;

  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  tableInstance: Table<FileData> | undefined;
  setTableInstance: (table: Table<FileData> | undefined) => void;

  tableKey: string;
}


export const useFilesUIState = (): FilesUIState => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [tableInstance, setTableInstance] = useState<Table<FileData> | undefined>(undefined);

  const tableKey = `files-table-${viewMode}-${sortBy}-${sortDirection}`;

  return {
    viewMode,
    setViewMode,

    searchQuery,
    setSearchQuery,

    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,

    rowSelection,
    setRowSelection,

    tableInstance,
    setTableInstance,

    tableKey,
  };
};

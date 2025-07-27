import type { Table } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import type { FileData } from '@/lib/supabase';

export interface FileSelectionState {
  selectedFiles: FileData[];
  selectedRowCount: number;
  hasSelection: boolean;

  clearSelection: (tableInstance?: Table<FileData>) => void;
  getSelectedFiles: (files: FileData[], rowSelection: Record<string, boolean>) => FileData[];
}

interface UseFileSelectionProps {
  files: FileData[];
  rowSelection: Record<string, boolean>;
  tableInstance?: Table<FileData>;
}

export const useFileSelection = ({
  files,
  rowSelection,
  tableInstance: _tableInstance,
}: UseFileSelectionProps): FileSelectionState => {
  const getSelectedFiles = useCallback(
    (fileList: FileData[], selection: Record<string, boolean>): FileData[] => {
      return fileList.filter((file) => {
        const fileId = file.id || file.title;
        return selection[fileId];
      });
    },
    []
  );

  const selectedFiles = useMemo(() => {
    return getSelectedFiles(files, rowSelection);
  }, [files, rowSelection, getSelectedFiles]);
  const selectedRowCount = selectedFiles.length;
  const hasSelection = selectedRowCount > 0;

  const clearSelection = (table?: Table<FileData>) => {
    if (table) {
      table.resetRowSelection();
    }
  };

  return {
    selectedFiles,
    selectedRowCount,
    hasSelection,
    clearSelection,
    getSelectedFiles,
  };
};

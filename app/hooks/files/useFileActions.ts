import type { Table } from '@tanstack/react-table';
import { useCallback, useState } from 'react';
import { useFileContextActions } from '@/contexts/FileContextProvider';
import type { FileData } from '@/lib/supabase';
import { safeConsole } from '@/utils/console';

type DeleteType = 'single' | 'bulk';
export interface FileActionsState {
  isDeleteConfirmOpen: boolean;
  setIsDeleteConfirmOpen: (open: boolean) => void;
  fileToDelete: FileData | null;
  setFileToDelete: (file: FileData | null) => void;
  filesToDelete: FileData[] | null;
  setFilesToDelete: (files: FileData[] | null) => void;
  deleteType: DeleteType;
  setDeleteType: (type: DeleteType) => void;

  handleOpenFile: (file: FileData) => void;
  handleDeleteFile: (file: FileData) => void;
  handleDuplicateFile: (file: FileData) => void;
  handleExportFile: (file: FileData) => void;
  handleConfirmDelete: (
    deleteFileFn: (identifier: string) => Promise<void>,
    tableInstance?: Table<FileData>
  ) => Promise<void>;
  handleBulkDelete: (
    selectedFiles: FileData[],
    deleteFileFn: (identifier: string) => Promise<void>
  ) => void;
  handleTableReady: (table: Table<FileData>) => void;
}

interface UseFileActionsProps {
  onTableInstanceChange?: (table: Table<FileData> | undefined) => void;
}

export const useFileActions = ({
  onTableInstanceChange,
}: UseFileActionsProps = {}): FileActionsState => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileData | null>(null);
  const [filesToDelete, setFilesToDelete] = useState<FileData[] | null>(null);
  const [deleteType, setDeleteType] = useState<DeleteType>('single');

  const { setActiveFileFromFilesPage } = useFileContextActions();

  const handleOpenFile = useCallback(
    (file: FileData) => {
      // Set file context before navigation to preserve state
      setActiveFileFromFilesPage(file.id || file.title, file.title);

      // Navigate to editor with file parameter
      window.location.href = `/?file=${file.id || file.title}`;
    },
    [setActiveFileFromFilesPage]
  );

  const handleDeleteFile = useCallback((file: FileData) => {
    setFileToDelete(file);
    setFilesToDelete(null);
    setDeleteType('single');
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleDuplicateFile = useCallback((file: FileData) => {
    const duplicatedFile: FileData = {
      ...file,
      id: undefined,
      title: `${file.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const params = new URLSearchParams({
      content: duplicatedFile.content,
      title: duplicatedFile.title,
    });
    window.location.href = `/?${params.toString()}`;
  }, []);

  const handleExportFile = useCallback((file: FileData) => {
    const blob = new Blob([file.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.title}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleConfirmDelete = useCallback(
    async (
      deleteFileFn: (identifier: string) => Promise<void>,
      tableInstance?: Table<FileData>
    ) => {
      try {
        if (deleteType === 'single' && fileToDelete) {
          await deleteFileFn(fileToDelete.id || fileToDelete.title);
          if (tableInstance) {
            tableInstance.resetRowSelection();
          }
        } else if (deleteType === 'bulk' && filesToDelete) {
          await Promise.all(filesToDelete.map((file) => deleteFileFn(file.id || file.title)));
          safeConsole.log(`Successfully deleted ${filesToDelete.length} files`);
          if (tableInstance) {
            tableInstance.resetRowSelection();
          }
        }

        setIsDeleteConfirmOpen(false);
        setFileToDelete(null);
        setFilesToDelete(null);
      } catch (error) {
        safeConsole.error('Error deleting file(s):', error);
      }
    },
    [deleteType, fileToDelete, filesToDelete]
  );

  const handleBulkDelete = useCallback(
    (selectedFiles: FileData[], _deleteFileFn: (identifier: string) => Promise<void>) => {
      if (selectedFiles.length === 0) return;

      setFilesToDelete(selectedFiles);
      setFileToDelete(null);
      setDeleteType('bulk');
      setIsDeleteConfirmOpen(true);
    },
    []
  );

  const handleTableReady = useCallback(
    (table: Table<FileData>) => {
      onTableInstanceChange?.(table);
    },
    [onTableInstanceChange]
  );

  return {
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    fileToDelete,
    setFileToDelete,
    filesToDelete,
    setFilesToDelete,
    deleteType,
    setDeleteType,

    handleOpenFile,
    handleDeleteFile,
    handleDuplicateFile,
    handleExportFile,
    handleConfirmDelete,
    handleBulkDelete,
    handleTableReady,
  };
};

/**
 * @fileoverview Files management component
 * @author Axel Modra
 */

import { useAuth } from '@clerk/react-router';
import type { Table } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  Cloud,
  Copy,
  Download,
  Edit,
  FileText,
  HardDrive,
  MoreVertical,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFileStorage } from '@/hooks/files';
import { useResponsiveDetection } from '@/hooks/ui/useResponsive';
import type { FileData } from '@/lib/supabase';
import { formatBytes, formatRelativeDate } from '@/utils/common';
import { safeConsole } from '@/utils/console';
import { ClientOnlyFilesTable } from './ClientOnlyFilesTable';
import { FilesTableToolbar } from './FilesTableToolbar';
import { VirtualizedFileList } from './VirtualizedFileList';

/**
 * View mode type - Enhanced with table view
 */
type ViewMode = 'grid' | 'list' | 'table';

/**
 * Sort options
 */
type SortOption = 'name' | 'date' | 'size';
type SortDirection = 'asc' | 'desc';

/**
 * Files manager component
 */
export const FilesManager: React.FC = () => {
  const { isSignedIn: _isSignedIn } = useAuth();
  const responsive = useResponsiveDetection();
  const {
    files,
    isLoadingFiles,
    storageInfo,
    deleteFile,
    exportAllFiles,
    isAuthenticated: _isAuthenticated,
  } = useFileStorage();

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [rowSelection, setRowSelection] = useState({});
  const [tableInstance, setTableInstance] = useState<Table<FileData> | undefined>(undefined);

  const selectedRowCount = Object.keys(rowSelection).length;

  // Compute accurate storage info using actual files data
  const computedStorageInfo = useMemo(() => {
    if (!storageInfo) return null;

    const totalSize = files.reduce((sum, file) => sum + (file.content?.length || 0), 0);

    return {
      ...storageInfo,
      totalFiles: files.length,
      totalSize,
    };
  }, [storageInfo, files]);

  // Filter and sort files
  const filteredAndSortedFiles = React.useMemo(() => {
    const filtered = files.filter(
      (file) =>
        file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Sort files
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date': {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        }
        case 'size':
          comparison = (a.fileSize || 0) - (b.fileSize || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [files, searchQuery, sortBy, sortDirection]);

  // Performance optimization: Use virtualization for large datasets
  const shouldUseVirtualization = filteredAndSortedFiles.length > 100;

  // Handle file operations
  const handleOpenFile = (file: FileData) => {
    window.location.href = `/?file=${file.id || file.title}`;
  };

  const handleDeleteFile = async (file: FileData) => {
    if (window.confirm(`Are you sure you want to delete "${file.title}"?`)) {
      try {
        await deleteFile(file.id || file.title);
      } catch (error) {
        safeConsole.error('Error deleting file:', error);
      }
    }
  };

  const handleTableReady = (table: Table<FileData>) => {
    setTableInstance(table);
  };

  const handleBulkDeleteFromTable = async () => {
    if (!tableInstance) return;

    const selectedRows = tableInstance.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    const selectedFiles = selectedRows.map((row) => row.original);
    const fileNames = selectedFiles.map((f) => f.title).join(', ');
    const confirmMessage =
      selectedFiles.length === 1
        ? `Are you sure you want to delete "${fileNames}"?`
        : `Are you sure you want to delete ${selectedFiles.length} files?\n\nFiles: ${fileNames}`;

    if (window.confirm(confirmMessage)) {
      try {
        await Promise.all(selectedFiles.map((file) => deleteFile(file.id || file.title)));
        safeConsole.log(`Successfully deleted ${selectedFiles.length} files`);

        tableInstance.resetRowSelection();
      } catch (error) {
        safeConsole.error('Error deleting files:', error);
      }
    }
  };

  const handleDuplicateFile = (file: FileData) => {
    const duplicatedFile = {
      ...file,
      title: `${file.title} (Copy)`,
      id: undefined,
    };

    const params = new URLSearchParams({
      title: duplicatedFile.title,
      content: duplicatedFile.content,
    });
    window.location.href = `/?${params.toString()}`;
  };

  const handleExportFile = (file: FileData) => {
    const blob = new Blob([file.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.title}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = async () => {
    try {
      await exportAllFiles();
    } catch (error) {
      safeConsole.error('Error exporting files:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    return formatBytes(bytes);
  };

  const formatDate = (dateString: string) => {
    return formatRelativeDate(dateString, formatDistanceToNow);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Editor
              </Button>

              <div>
                <h1 className="text-2xl font-bold">My Files</h1>
                <p className="text-sm text-muted-foreground">
                  {computedStorageInfo && (
                    <>
                      {computedStorageInfo.totalFiles} files •{' '}
                      {computedStorageInfo.storageType === 'cloud' ? 'Cloud' : 'Local'} storage
                    </>
                  )}
                </p>
              </div>
            </div>

            <AuthButtons
              onViewFiles={() => {
                window.location.href = '/files';
              }}
              onSettings={() => {
                window.location.href = '/settings';
              }}
              responsive={{
                isMobile: responsive.isMobile,
                isTablet: responsive.isTablet,
                isSmallTablet: responsive.windowWidth <= 640,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        {/* Storage info */}
        {computedStorageInfo && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {computedStorageInfo.storageType === 'cloud' ? (
                    <Cloud className="w-5 h-5 text-primary" />
                  ) : (
                    <HardDrive className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">
                      {computedStorageInfo.storageType === 'cloud'
                        ? 'Cloud Storage'
                        : 'Local Storage'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {computedStorageInfo.totalFiles} files •{' '}
                      {formatFileSize(computedStorageInfo.totalSize)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {files.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportAll}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export All
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Files Toolbar - Always show for all view modes */}
        {!isLoadingFiles && filteredAndSortedFiles.length > 0 && (
          <div className="mt-4">
            <FilesTableToolbar
              table={tableInstance}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortDirection={sortDirection}
              onSortDirectionChange={setSortDirection}
              onNewFile={() => {
                window.location.href = '/?new=true';
              }}
              onExportAll={handleExportAll}
              onDeleteSelected={handleBulkDeleteFromTable}
              isLoading={isLoadingFiles}
              totalFiles={filteredAndSortedFiles.length}
              selectedRowCount={selectedRowCount}
            />
          </div>
        )}

        {/* Files display - Added proper spacing from toolbar */}
        <div className="mt-6">
          {isLoadingFiles ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading files...</p>
            </div>
          ) : filteredAndSortedFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'No files found' : 'No files yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Create your first markdown file to get started'}
              </p>
              <Button
                onClick={() => {
                  window.location.href = '/?new=true';
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New File
              </Button>
            </div>
          ) : viewMode === 'table' ? (
            <ClientOnlyFilesTable
              files={filteredAndSortedFiles}
              onOpen={handleOpenFile}
              onDelete={handleDeleteFile}
              onDuplicate={handleDuplicateFile}
              onExport={handleExportFile}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
              isLoading={isLoadingFiles}
              onTableReady={handleTableReady}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
            />
          ) : shouldUseVirtualization && viewMode === 'list' ? (
            <VirtualizedFileList
              files={filteredAndSortedFiles}
              onOpen={handleOpenFile}
              onDelete={handleDeleteFile}
              onDuplicate={handleDuplicateFile}
              onExport={handleExportFile}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
            />
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2'
                  : 'space-y-3 mt-2'
              }
            >
              {filteredAndSortedFiles.map((file) => (
                <FileCard
                  key={file.id || file.title}
                  file={file}
                  viewMode={viewMode}
                  onOpen={() => handleOpenFile(file)}
                  onDelete={() => handleDeleteFile(file)}
                  onDuplicate={() => handleDuplicateFile(file)}
                  onExport={() => handleExportFile(file)}
                  formatDate={formatDate}
                  formatFileSize={formatFileSize}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * File card component
 */
interface FileCardProps {
  file: FileData;
  viewMode: ViewMode;
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  formatDate: (date: string) => string;
  formatFileSize: (bytes: number) => string;
}

const FileCard: React.FC<FileCardProps> = ({
  file,
  viewMode,
  onOpen,
  onDelete,
  onDuplicate,
  onExport,
  formatDate,
  formatFileSize,
}) => {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="flex items-center gap-3 flex-1 min-w-0 text-left"
              onClick={onOpen}
            >
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate mb-1">{file.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(file.updatedAt || file.createdAt || '')}
                  </span>
                  <span>{formatFileSize(file.fileSize || 0)}</span>
                  {file.tags && file.tags.length > 0 && (
                    <div className="flex gap-1">
                      {file.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {file.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{file.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onOpen}>
                  <Edit className="mr-2 h-4 w-4" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onOpen}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <FileText className="w-6 h-6 text-primary" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onExport();
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-base truncate">{file.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {file.content.substring(0, 100)}...
          </p>

          {file.tags && file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {file.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {file.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{file.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(file.updatedAt || file.createdAt || '')}
            </span>
            <span>{formatFileSize(file.fileSize || 0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilesManager;

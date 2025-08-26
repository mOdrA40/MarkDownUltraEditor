/**
 * @fileoverview Files management component
 * @author Axel Modra
 */

import { useAuth } from "@clerk/react-router";

import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Clock,
  Cloud,
  Download,
  FileText,
  HardDrive,
  Plus,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { PageLoader } from "@/components/shared/PageLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFileStorage } from "@/hooks/files";
import { useFileActions } from "@/hooks/files/useFileActions";
import { useFileSelection } from "@/hooks/files/useFileSelection";
import { useFilesUIState, type ViewMode } from "@/hooks/files/useFilesUIState";
import { useResponsiveDetection } from "@/hooks/ui/useResponsive";

import type { FileData } from "@/lib/supabase";
import { formatBytes, formatRelativeDate } from "@/utils/common";
import { ClientOnlyFilesTable } from "./ClientOnlyFilesTable";
import { FilesTableToolbar } from "./FilesTableToolbar";
import { FileDropdownMenu } from "./shared/FileDropdownMenu";

/**
 * Files manager component
 */
export const FilesManager: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn: _isSignedIn } = useAuth();
  const responsive = useResponsiveDetection();
  const {
    files,
    isLoadingFiles,
    storageInfo,
    isLoadingStorageInfo,
    deleteFile,
    exportAllFiles,
    isAuthenticated: _isAuthenticated,
    isInitialized,
    isAuthenticationComplete,
    isReadyToRender,
  } = useFileStorage();

  // UI state using custom hooks
  const uiState = useFilesUIState();
  const {
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
  } = uiState;

  // File actions using custom hook
  const fileActions = useFileActions({
    onTableInstanceChange: setTableInstance,
  });
  const {
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    fileToDelete,
    filesToDelete,
    deleteType,
    handleOpenFile,
    handleDeleteFile,
    handleDuplicateFile,
    handleExportFile,
    handleConfirmDelete,
    handleBulkDelete,
    handleTableReady,
  } = fileActions;

  // File selection using custom hook
  const selectionState = useFileSelection({
    files,
    rowSelection,
    tableInstance,
  });
  const { selectedRowCount } = selectionState;
  const previousFilesCountRef = useRef(files.length);

  // Reset row selection when files are deleted (files count decreases)
  useEffect(() => {
    const currentFilesCount = files.length;
    const previousFilesCount = previousFilesCountRef.current;

    // Only reset selection when files count decreases (indicating deletion)
    if (currentFilesCount < previousFilesCount) {
      setRowSelection({});
      if (tableInstance) {
        tableInstance.resetRowSelection();
      }
    }

    // Update the ref for next comparison
    previousFilesCountRef.current = currentFilesCount;
  }, [files.length, tableInstance, setRowSelection]);

  // Compute accurate storage info using actual files data
  const computedStorageInfo = useMemo(() => {
    if (!storageInfo) return null;

    // Use file.fileSize from database if available (for cloud storage),
    // otherwise fallback to content.length (for local storage)
    const totalSize = files.reduce((sum, file) => {
      if (file.fileSize && file.fileSize > 0) {
        return sum + file.fileSize;
      }
      return sum + (file.content?.length || 0);
    }, 0);

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
        file.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    // Sort files
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "date": {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        }
        case "size":
          comparison = (a.fileSize || 0) - (b.fileSize || 0);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [files, searchQuery, sortBy, sortDirection]);

  // Handle bulk delete from table
  const handleBulkDeleteFromTable = () => {
    if (!tableInstance) return;

    const selectedRows = tableInstance.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    const selectedFiles = selectedRows.map((row) => row.original);
    handleBulkDelete(selectedFiles, deleteFile);
  };

  const handleExportAll = async () => {
    try {
      await exportAllFiles();
    } catch (error) {
      import("@/utils/console").then(({ safeConsole }) => {
        safeConsole.error("Error exporting files:", error);
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    return formatBytes(bytes);
  };

  const formatDate = (dateString: string) => {
    return formatRelativeDate(dateString, formatDistanceToNow);
  };

  if (_isSignedIn === undefined) {
    return <PageLoader text="Initializing..." />;
  }

  if (!isReadyToRender) {
    return <PageLoader text="Connecting to your storage..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2 w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Back to Editor</span>
                <span className="xs:hidden">Back</span>
              </Button>

              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold">My Files</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {computedStorageInfo && (
                    <>
                      {computedStorageInfo.totalFiles} files •{" "}
                      {computedStorageInfo.storageType === "cloud"
                        ? "Cloud"
                        : "Local"}{" "}
                      storage
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end sm:justify-start">
              <AuthButtons
                onViewFiles={() => navigate("/files")}
                onSettings={() => navigate("/settings")}
                responsive={{
                  isMobile: responsive.isMobile,
                  isTablet: responsive.isTablet,
                  isSmallTablet: responsive.windowWidth <= 640,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        {/* Storage info */}
        {computedStorageInfo && !isLoadingStorageInfo && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {computedStorageInfo.storageType === "cloud" ? (
                    <Cloud className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <HardDrive className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium">
                      {computedStorageInfo.storageType === "cloud"
                        ? "Cloud Storage"
                        : "Local Storage"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {computedStorageInfo.totalFiles} files •{" "}
                      {formatFileSize(computedStorageInfo.totalSize)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end sm:justify-start gap-2">
                  {files.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportAll}
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden xs:inline">Export All</span>
                      <span className="xs:hidden">Export</span>
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
              onNewFile={() => navigate("/?new=true")}
              onExportAll={handleExportAll}
              onDeleteSelected={handleBulkDeleteFromTable}
              isLoading={isLoadingFiles}
              totalFiles={filteredAndSortedFiles.length}
              selectedRowCount={selectedRowCount}
            />
          </div>
        )}

        {/* Files display - Added proper spacing from toolbar */}
        <div className="mt-6 files-container">
          {isLoadingFiles ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading files...</p>
            </div>
          ) : filteredAndSortedFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? "No files found" : "No files yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create your first markdown file to get started"}
              </p>
              <Button onClick={() => navigate("/?new=true")}>
                <Plus className="w-4 h-4 mr-2" />
                Create New File
              </Button>
            </div>
          ) : viewMode === "table" ? (
            <ClientOnlyFilesTable
              key={tableKey}
              files={filteredAndSortedFiles}
              onTableReady={handleTableReady}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              onOpen={handleOpenFile}
              onDelete={handleDeleteFile}
              onDuplicate={handleDuplicateFile}
              onExport={handleExportFile}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
              isLoading={isLoadingFiles}
            />
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 mt-2"
                  : "space-y-2 sm:space-y-3 mt-2"
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Are you sure?"
        description={
          deleteType === "single" && fileToDelete
            ? `This will permanently delete the file "${fileToDelete.title}". This action cannot be undone.`
            : deleteType === "bulk" && filesToDelete
              ? `This will permanently delete ${filesToDelete.length} file${
                  filesToDelete.length > 1 ? "s" : ""
                }. This action cannot be undone.\n\nFiles: ${filesToDelete
                  .map((f) => f.title)
                  .join(", ")}`
              : "This action cannot be undone."
        }
        onConfirm={() => handleConfirmDelete(deleteFile, tableInstance)}
        confirmText="Delete"
        cancelText="Cancel"
      />
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
  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-3 sm:p-5 file-card-list-container">
          <div className="flex items-center justify-between gap-3 relative">
            <button
              type="button"
              className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 text-left pr-2"
              onClick={onOpen}
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate mb-1 text-sm sm:text-base">
                  {file.title}
                </h3>
                <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(file.updatedAt || file.createdAt || "")}
                  </span>
                  <span className="hidden xs:inline">
                    {formatFileSize(file.fileSize || 0)}
                  </span>
                  {file.tags && file.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {file.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
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

            <FileDropdownMenu
              file={file}
              viewType="list"
              onOpen={onOpen}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onExport={onExport}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
      onClick={onOpen}
    >
      <CardHeader className="pb-2 p-3 sm:p-6 sm:pb-2">
        <div className="flex items-start justify-between">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
          <FileDropdownMenu
            file={file}
            viewType="grid"
            onOpen={onOpen}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onExport={onExport}
            stopPropagationOnTrigger={true}
          />
        </div>
        <CardTitle className="text-sm sm:text-base truncate mt-2">
          {file.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 p-3 sm:p-6 sm:pt-0 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">
            {file.content.substring(0, 80)}...
          </p>

          {file.tags && file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
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

        <div className="space-y-1 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1 min-w-0">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {formatDate(file.updatedAt || file.createdAt || "")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="truncate flex-1">
              {formatFileSize(file.fileSize || 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilesManager;

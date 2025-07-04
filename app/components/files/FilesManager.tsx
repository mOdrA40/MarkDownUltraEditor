/**
 * @fileoverview Files management component
 * @author Axel Modra
 */

import { useAuth } from '@clerk/react-router';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  Cloud,
  Copy,
  Download,
  Edit,
  FileText,
  Grid3X3,
  HardDrive,
  List,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
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
import { Input } from '@/components/ui/input';
import { useResponsiveDetection } from '@/hooks/ui/useResponsive';
import { useFileStorage } from '@/hooks/useFileStorage';
import type { FileData } from '@/lib/supabase';

/**
 * View mode type
 */
type ViewMode = 'grid' | 'list';

/**
 * Sort options
 */
type SortOption = 'name' | 'date' | 'size';
type SortDirection = 'asc' | 'desc';

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
    deleteFile,
    exportAllFiles,
    refreshFiles,
    isAuthenticated: _isAuthenticated,
  } = useFileStorage();

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [_selectedFiles, _setSelectedFiles] = useState<Set<string>>(new Set());

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

  // Handle file operations
  const handleOpenFile = (file: FileData) => {
    // Navigate back to editor with file loaded
    navigate(`/?file=${file.id || file.title}`);
  };

  const handleDeleteFile = async (file: FileData) => {
    if (window.confirm(`Are you sure you want to delete "${file.title}"?`)) {
      try {
        await deleteFile(file.id || file.title);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  const handleDuplicateFile = (file: FileData) => {
    const duplicatedFile = {
      ...file,
      title: `${file.title} (Copy)`,
      id: undefined, // Will get new ID when saved
    };

    // Navigate to editor with duplicated content
    const params = new URLSearchParams({
      title: duplicatedFile.title,
      content: duplicatedFile.content,
    });
    navigate(`/?${params.toString()}`);
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
      console.error('Error exporting files:', error);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
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
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Editor
              </Button>

              <div>
                <h1 className="text-2xl font-bold">My Files</h1>
                <p className="text-sm text-muted-foreground">
                  {storageInfo && (
                    <>
                      {storageInfo.totalFiles} files •{' '}
                      {storageInfo.storageType === 'cloud' ? 'Cloud' : 'Local'} storage
                    </>
                  )}
                </p>
              </div>
            </div>

            <AuthButtons
              responsive={{
                isMobile: responsive.isMobile,
                isTablet: responsive.isTablet,
                isSmallTablet: responsive.windowWidth <= 640, // sm breakpoint
              }}
              onViewFiles={() => {
        // Already on files page - no action needed
      }}
              onSettings={() => navigate('/settings')}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {sortDirection === 'asc' ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  Name {sortBy === 'name' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('date')}>
                  Date {sortBy === 'date' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('size')}>
                  Size {sortBy === 'size' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                >
                  {sortDirection === 'asc' ? 'Descending' : 'Ascending'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh */}
            <Button variant="outline" size="sm" onClick={refreshFiles} disabled={isLoadingFiles}>
              <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
            </Button>

            {/* New file */}
            <Button size="sm" onClick={() => navigate('/')} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New File
            </Button>
          </div>
        </div>

        {/* Storage info */}
        {storageInfo && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {storageInfo.storageType === 'cloud' ? (
                    <Cloud className="w-5 h-5 text-primary" />
                  ) : (
                    <HardDrive className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">
                      {storageInfo.storageType === 'cloud' ? 'Cloud Storage' : 'Local Storage'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {storageInfo.totalFiles} files • {formatFileSize(storageInfo.totalSize)}
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

        {/* Files display */}
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
            <Button onClick={() => navigate('/')}>
              <Plus className="w-4 h-4 mr-2" />
              Create New File
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-2'
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
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="flex items-center gap-3 flex-1 min-w-0 text-left"
              onClick={onOpen}
            >
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate">{file.title}</h3>
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

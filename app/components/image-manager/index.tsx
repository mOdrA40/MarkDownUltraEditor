/**
 * Main ImageManager Component
 * Mengintegrasikan semua sub-komponen dan menangani orchestration
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon } from "lucide-react";

// Import components
import { ImageUploader } from './components/ImageUploader';
import { ImageFilters } from './components/ImageFilters';
import { ImageGrid } from './components/ImageGrid';
import { ImageDetails } from './components/ImageDetails';

// Import hooks
import { useImageManager } from './hooks/useImageManager';
import { useDragAndDrop } from './hooks/useDragAndDrop';

// Import types
import { ImageManagerProps, ImageItem } from './types/imageTypes';

export const ImageManager: React.FC<ImageManagerProps> = ({
  onInsertImage,
  isOpen,
  onClose
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Main state management
  const {
    images,
    selectedImage,
    viewMode,
    searchTerm,
    filterTag,
    isLoading,
    filteredImages,
    allTags,
    setSelectedImage,
    setViewMode,
    setSearchTerm,
    setFilterTag,
    addMultipleImages,
    deleteImage,
    updateImage,
    copyImageUrl,
    resetFilters
  } = useImageManager();

  // Drag and drop untuk seluruh dialog
  const {
    getDragZoneProps,
    getDragOverlayProps
  } = useDragAndDrop({
    maxFiles: 10,
    disabled: isUploading,
    onFilesDropped: async () => {
      setIsUploading(true);
      // Upload files akan ditangani oleh ImageUploader
      setActiveTab('upload');
      setIsUploading(false);
    }
  });

  /**
   * Handle upload success
   */
  const handleUploadSuccess = (uploadedImages: ImageItem[]) => {
    addMultipleImages(uploadedImages);
    setActiveTab('gallery');
  };

  /**
   * Handle image double click (quick insert)
   */
  const handleImageDoubleClick = (image: ImageItem) => {
    onInsertImage(image.url, image.name);
    onClose();
  };

  /**
   * Handle trigger upload from empty state
   */
  const handleTriggerUpload = () => {
    setActiveTab('upload');
  };

  // Get drag zone props and merge className
  const dragZoneProps = getDragZoneProps();
  const mergedClassName = `w-[95vw] max-w-6xl h-[85vh] flex flex-col p-0 mx-auto ${dragZoneProps.className || ''}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        {...dragZoneProps}
        className={mergedClassName}
        data-image-manager
      >
        {/* Global Drag Overlay */}
        <div {...getDragOverlayProps()}>
          <div className="text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-blue-500 mb-2" />
            <p className="text-lg font-medium text-blue-700 dark:text-blue-300">
              Drop gambar di sini untuk upload
            </p>
          </div>
        </div>

        {/* Header */}
        <DialogHeader className="p-3 sm:p-4 pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center text-sm sm:text-base">
            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Image Manager
            <Badge variant="secondary" className="ml-2 text-xs">
              {images.length} gambar
            </Badge>
            {isUploading && (
              <Badge variant="outline" className="ml-2 text-xs animate-pulse">
                Uploading...
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'gallery' | 'upload')}
            className="flex-1 flex flex-col"
          >
            {/* Tab Navigation */}
            <div className="px-3 sm:px-4 py-3 border-b bg-muted/10">
              <TabsList className="grid w-full max-w-md grid-cols-2 h-9 sm:h-10 bg-muted/30 p-1">
                <TabsTrigger
                  value="gallery"
                  className="text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Galeri ({filteredImages.length})
                </TabsTrigger>
                <TabsTrigger
                  value="upload"
                  className="text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Upload
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="flex-1 flex flex-col mt-0 h-full">
              {/* Filters */}
              <div className="p-2 sm:p-3 md:p-4 border-b bg-muted/20 flex-shrink-0">
                <ImageFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filterTag={filterTag}
                  onFilterChange={setFilterTag}
                  availableTags={allTags}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  totalImages={images.length}
                  filteredCount={filteredImages.length}
                  onResetFilters={resetFilters}
                />
              </div>

              {/* Content Area */}
              <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
                {/* Image Gallery */}
                <div className="flex-1 overflow-auto p-2 sm:p-3 md:p-4 min-h-0">
                  <ImageGrid
                    filteredImages={filteredImages}
                    viewMode={viewMode}
                    selectedImage={selectedImage}
                    onImageSelect={setSelectedImage}
                    onImageDoubleClick={handleImageDoubleClick}
                    isLoading={isLoading}
                    emptyMessage={
                      searchTerm || filterTag
                        ? 'Tidak ada gambar yang sesuai dengan filter'
                        : undefined
                    }
                    onTriggerUpload={handleTriggerUpload}
                  />
                </div>

                {/* Image Details Sidebar - Hidden on mobile when no image selected */}
                {(selectedImage || !isMobile) && (
                  <ImageDetails
                    image={selectedImage}
                    onInsertImage={onInsertImage}
                    onClose={onClose}
                    onDeleteImage={deleteImage}
                    onCopyUrl={copyImageUrl}
                    onShowEditor={() => {}}
                    onUpdateImage={updateImage}
                  />
                )}
              </div>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="flex-1 flex flex-col mt-0 h-full">
              <div className="flex-1 overflow-auto p-2 sm:p-3 md:p-4 min-h-0">
                <ImageUploader
                  onUploadSuccess={handleUploadSuccess}
                  isUploading={isUploading}
                  onUploadingChange={setIsUploading}
                  maxFiles={10}
                  disabled={false}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

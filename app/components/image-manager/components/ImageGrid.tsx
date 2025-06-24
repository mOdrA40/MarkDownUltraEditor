/**
 * Komponen untuk menampilkan grid/list gambar
 * Menangani rendering gambar dalam format grid atau list dengan lazy loading
 */

import React, { memo } from 'react';
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";
import { ImageGridProps, type ImageItem } from '../types/imageTypes';
import { formatFileSize, formatRelativeDate, formatTags } from '../utils/imageFormatting';

interface ImageGridComponentProps extends ImageGridProps {
  /** Callback untuk double click (quick insert) */
  onImageDoubleClick?: (image: ImageItem) => void;
  /** Apakah dalam mode loading */
  isLoading?: boolean;
  /** Placeholder message ketika tidak ada gambar */
  emptyMessage?: string;
  /** Callback untuk trigger file upload */
  onTriggerUpload?: () => void;
}

/**
 * Individual Image Item Component
 */
const ImageItem: React.FC<{
  image: ImageItem;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
}> = memo(({ image, viewMode, isSelected, onClick, onDoubleClick }) => {
  const { displayTags, remainingCount } = formatTags(image.tags, 2);

  if (viewMode === 'grid') {
    return (
      <div
        className={`
          group relative cursor-pointer transition-all duration-200
          aspect-square rounded-lg overflow-hidden border hover:shadow-lg hover:scale-105
          ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:border-blue-300'}
        `}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Select image ${image.name}, ${image.width} × ${image.height}, ${formatFileSize(image.size)}`}
        aria-pressed={isSelected}
      >
        {/* Image */}
        <img
          src={image.url}
          alt={image.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
        
        {/* Image Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-white text-xs font-medium truncate">{image.name}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-white/80 text-xs">{formatFileSize(image.size)}</p>
            <p className="text-white/80 text-xs">{image.width} × {image.height}</p>
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col space-y-1">
          {image.compressed && (
            <Badge className="bg-green-500 text-white text-xs">
              Compressed
            </Badge>
          )}
          {displayTags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {displayTags[0]}
              {remainingCount > 0 && ` +${remainingCount}`}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div
      className={`
        group flex items-center p-3 rounded-lg border cursor-pointer
        transition-all duration-200 hover:bg-muted/50
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''}
      `}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Select image ${image.name}, ${image.width} × ${image.height}, ${formatFileSize(image.size)}`}
      aria-pressed={isSelected}
    >
      {/* Thumbnail */}
      <img
        src={image.url}
        alt={image.name}
        className="w-16 h-16 object-cover rounded-md mr-3 flex-shrink-0"
        loading="lazy"
      />
      
      {/* Image Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{image.name}</p>
            <p className="text-sm text-muted-foreground">
              {image.width} × {image.height} • {formatFileSize(image.size)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatRelativeDate(image.createdAt)}
            </p>
          </div>
          
          {/* Badges */}
          <div className="flex flex-col items-end space-y-1 ml-2">
            {image.compressed && (
              <Badge className="bg-green-500 text-white text-xs">
                Compressed
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {image.type.split('/')[1].toUpperCase()}
            </Badge>
          </div>
        </div>
        
        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex items-center space-x-1 mt-2">
            {displayTags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingCount} lainnya
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ImageItem.displayName = 'ImageItem';

/**
 * Main ImageGrid Component
 */
export const ImageGrid: React.FC<ImageGridComponentProps> = ({
  filteredImages,
  viewMode,
  selectedImage,
  onImageSelect,
  onImageDoubleClick,
  isLoading = false,
  emptyMessage,
  onTriggerUpload
}) => {
  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat gambar...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (filteredImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {emptyMessage || 'Tidak ada gambar ditemukan'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {emptyMessage ? 
              'Coba sesuaikan pencarian atau filter Anda.' : 
              'Upload beberapa gambar untuk memulai.'
            }
          </p>
          {!emptyMessage && onTriggerUpload && (
            <button
              onClick={onTriggerUpload}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Upload Gambar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`
      ${viewMode === 'grid'
        ? 'grid gap-2 sm:gap-3 md:gap-4 image-grid-mobile sm:image-grid-small-tablet md:image-grid-medium-tablet lg:image-grid-desktop grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
        : 'space-y-2'
      }
    `}>
      {filteredImages.map((image) => (
        <ImageItem
          key={image.id}
          image={image}
          viewMode={viewMode}
          isSelected={selectedImage?.id === image.id}
          onClick={() => onImageSelect(image)}
          onDoubleClick={onImageDoubleClick ? () => onImageDoubleClick(image) : undefined}
        />
      ))}
    </div>
  );
};

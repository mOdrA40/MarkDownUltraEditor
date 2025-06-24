/**
 * Komponen untuk menampilkan detail gambar di sidebar
 * Menangani preview, informasi metadata, dan action buttons
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowRight, 
  Copy, 
  Edit3, 
  Trash2, 
  Download,
  Maximize2,
  Tag,
  Calendar,
  Image as ImageIcon,
  FileType,
  Ruler,
  HardDrive
} from "lucide-react";
import { ImageDetailsProps, ImageItem } from '../types/imageTypes';
import { 
  formatFileSize, 
  formatDate, 
  formatDimensions,
  formatCompressionInfo,
  getAspectRatio,
  getImageOrientation
} from '../utils/imageFormatting';

interface ImageDetailsComponentProps extends ImageDetailsProps {
  /** Callback untuk update image metadata */
  onUpdateImage?: (updatedImage: ImageItem) => void;
  /** Callback untuk download image */
  onDownloadImage?: (image: ImageItem) => void;
  /** Callback untuk view fullscreen */
  onViewFullscreen?: (image: ImageItem) => void;
}

export const ImageDetails: React.FC<ImageDetailsComponentProps> = ({
  image,
  onInsertImage,
  onClose,
  onDeleteImage,
  onCopyUrl,
  onShowEditor,
  onUpdateImage,
  onDownloadImage,
  onViewFullscreen
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(image?.name || '');
  const [editedTags, setEditedTags] = useState(image?.tags.join(', ') || '');

  if (!image) {
    return (
      <div className="w-full sm:w-80 border-t sm:border-t-0 sm:border-l bg-muted/20 p-4 flex items-center justify-center min-h-[200px] sm:min-h-0">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm sm:text-base">Pilih gambar untuk melihat detail</p>
        </div>
      </div>
    );
  }

  /**
   * Handle save edited metadata
   */
  const handleSaveEdit = () => {
    if (!onUpdateImage) return;

    const updatedImage: ImageItem = {
      ...image,
      name: editedName.trim() || image.name,
      tags: editedTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    };

    onUpdateImage(updatedImage);
    setIsEditing(false);
  };

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = () => {
    setEditedName(image.name);
    setEditedTags(image.tags.join(', '));
    setIsEditing(false);
  };

  /**
   * Handle download image
   */
  const handleDownload = () => {
    if (onDownloadImage) {
      onDownloadImage(image);
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = image.url;
      link.download = image.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const compressionInfo = image.compressed && image.originalSize 
    ? formatCompressionInfo(image.originalSize, image.size)
    : null;

  return (
    <div className="w-full sm:w-80 border-t sm:border-t-0 sm:border-l bg-muted/20 overflow-auto">
      <div className="p-2 sm:p-4 space-y-2 sm:space-y-4">
        {/* Image Preview */}
        <div className="relative">
          <div className="aspect-video rounded-lg overflow-hidden border bg-checkered">
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Preview Actions */}
          <div className="absolute top-2 right-2 flex space-x-1">
            {onViewFullscreen && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onViewFullscreen(image)}
                className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Image Metadata */}
        <div className="space-y-3">
          {/* Name */}
          <div>
            <Label className="text-sm font-medium flex items-center">
              <FileType className="h-3 w-3 mr-1" />
              Nama File
            </Label>
            {isEditing ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="mt-1"
                placeholder="Masukkan nama file..."
              />
            ) : (
              <p className="text-sm text-muted-foreground break-all mt-1">
                {image.name}
              </p>
            )}
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium flex items-center">
                <Ruler className="h-3 w-3 mr-1" />
                Dimensi
              </Label>
              <p className="text-sm text-muted-foreground">
                {formatDimensions(image.width, image.height)}
              </p>
              <p className="text-xs text-muted-foreground">
                {getImageOrientation(image.width, image.height)} • {getAspectRatio(image.width, image.height)}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium flex items-center">
                <HardDrive className="h-3 w-3 mr-1" />
                Ukuran
              </Label>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(image.size)}
              </p>
            </div>
          </div>

          {/* File Type */}
          <div>
            <Label className="text-sm font-medium">Tipe File</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {image.type}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {image.type.split('/')[1].toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Created Date */}
          <div>
            <Label className="text-sm font-medium flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Tanggal Upload
            </Label>
            <p className="text-sm text-muted-foreground">
              {formatDate(image.createdAt)}
            </p>
          </div>

          {/* Compression Info */}
          {compressionInfo && (
            <div>
              <Label className="text-sm font-medium">Kompresi</Label>
              <div className="space-y-1">
                <p className="text-sm text-green-600">
                  Hemat {compressionInfo.savedBytes} ({compressionInfo.compressionRatio})
                </p>
                <p className="text-xs text-muted-foreground">
                  Ukuran asli: {formatFileSize(image.originalSize!)}
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <Label className="text-sm font-medium flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              Tags
            </Label>
            {isEditing ? (
              <Textarea
                value={editedTags}
                onChange={(e) => setEditedTags(e.target.value)}
                placeholder="Masukkan tags dipisah koma..."
                className="mt-1 min-h-[60px]"
              />
            ) : (
              <div className="flex flex-wrap gap-1 mt-1">
                {image.tags.length > 0 ? (
                  image.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Tidak ada tags</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex space-x-2">
            <Button
              onClick={handleSaveEdit}
              size="sm"
              className="flex-1"
            >
              Simpan
            </Button>
            <Button
              onClick={handleCancelEdit}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        {!isEditing && (
          <div className="space-y-2">
            {/* Primary Action */}
            <Button
              onClick={() => {
                onInsertImage(image.url, image.name);
                onClose();
              }}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Masukkan ke Dokumen
            </Button>
            
            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyUrl(image.url)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy URL
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Edit Info
              </Button>
              
              {onShowEditor && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowEditor}
                >
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Edit Gambar
                </Button>
              )}
            </div>
            
            {/* Danger Zone */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteImage(image.id)}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus Gambar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

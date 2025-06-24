/**
 * Komponen untuk upload gambar dengan drag & drop dan file selection
 * Menangani UI upload, progress tracking, dan validasi file
 */

import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { ImageUploaderProps } from '../types/imageTypes';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useImageUpload } from '../hooks/useImageUpload';

interface ImageUploaderComponentProps extends ImageUploaderProps {
  /** Maksimal jumlah file yang dapat diupload sekaligus */
  maxFiles?: number;
  /** Apakah uploader dalam keadaan disabled */
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderComponentProps> = ({
  onUploadSuccess,
  isUploading: externalUploading,
  onUploadingChange,
  maxFiles = 10,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isUploading: internalUploading,
    uploadProgress,
    overallProgress,
    uploadStats,
    uploadFiles,
    resetUploadState
  } = useImageUpload();

  // Gunakan external atau internal uploading state
  const isUploading = externalUploading || internalUploading;

  const {
    dragActive,
    getDragZoneProps,
    getDragOverlayProps
  } = useDragAndDrop({
    maxFiles,
    disabled: disabled || isUploading,
    onFilesDropped: async (files) => {
      onUploadingChange(true);
      const uploadedImages = await uploadFiles(files);
      if (uploadedImages.length > 0) {
        onUploadSuccess(uploadedImages);
      }
      onUploadingChange(false);
    }
  });

  /**
   * Handle file input change
   */
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    onUploadingChange(true);
    const uploadedImages = await uploadFiles(files);
    if (uploadedImages.length > 0) {
      onUploadSuccess(uploadedImages);
    }
    onUploadingChange(false);

    // Reset input value
    e.target.value = '';
  };

  /**
   * Handle click upload button
   */
  const handleUploadClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  /**
   * Handle cancel upload
   */
  const handleCancelUpload = () => {
    resetUploadState();
    onUploadingChange(false);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Upload Area */}
      <div
        {...getDragZoneProps()}
        className={`
          relative flex-1 min-h-[300px] border-2 border-dashed rounded-lg
          flex items-center justify-center p-6 transition-all duration-300
          ${dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={!disabled && !isUploading ? handleUploadClick : undefined}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isUploading) {
            e.preventDefault();
            handleUploadClick();
          }
        }}
        tabIndex={!disabled && !isUploading ? 0 : -1}
        role="button"
        aria-label="Upload area - drag and drop images here or click to select files"
        aria-disabled={disabled || isUploading}
      >
        {/* Drag Overlay */}
        <div {...getDragOverlayProps()}>
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto text-blue-500 mb-2" />
            <p className="text-lg font-medium text-blue-700 dark:text-blue-300">
              Drop gambar di sini untuk upload
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Maksimal {maxFiles} file
            </p>
          </div>
        </div>

        {/* Upload Content */}
        {!isUploading ? (
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Gambar</h3>
            <p className="text-muted-foreground mb-4">
              Drag & drop gambar di sini atau klik untuk memilih file
            </p>
            <div className="space-y-2">
              <Button
                onClick={handleUploadClick}
                disabled={disabled}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Pilih Gambar
              </Button>
              <p className="text-xs text-muted-foreground">
                Mendukung: JPEG, PNG, GIF, WebP, SVG, BMP (Maks. {maxFiles} file)
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center w-full max-w-md">
            <Upload className="h-8 w-8 mx-auto text-blue-500 mb-3 animate-pulse" />
            <h3 className="text-lg font-medium mb-2">Mengupload Gambar...</h3>
            
            {/* Overall Progress */}
            <div className="space-y-2 mb-4">
              <Progress value={overallProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {uploadStats.completed} dari {uploadStats.total} file selesai
              </p>
            </div>

            {/* Cancel Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelUpload}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Batalkan
            </Button>
          </div>
        )}
      </div>

      {/* Upload Progress Details */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2 flex-shrink-0">
          <h4 className="text-sm font-medium">Progress Upload:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {uploadProgress.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{item.fileName}</p>
                </div>

                <div className="flex items-center space-x-1">
                  {item.status === 'completed' && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                  {item.status === 'error' && (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  {item.status === 'processing' && (
                    <div className="h-3 w-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}

                  <Badge
                    variant={
                      item.status === 'completed' ? 'default' :
                      item.status === 'error' ? 'destructive' :
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {item.status === 'completed' ? 'Selesai' :
                     item.status === 'error' ? 'Error' :
                     item.status === 'processing' ? `${item.progress}%` :
                     'Menunggu'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Statistics */}
      {uploadStats.total > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground flex-shrink-0">
          <span>
            Total: {uploadStats.total} |
            Selesai: {uploadStats.completed} |
            Error: {uploadStats.errors}
          </span>
          {uploadStats.isComplete && (
            <Badge variant="default" className="text-xs">
              Upload Selesai
            </Badge>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
};

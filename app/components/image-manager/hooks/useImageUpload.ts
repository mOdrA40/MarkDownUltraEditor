/**
 * Custom hook untuk menangani upload gambar
 * Menangani validasi, kompresi, dan proses upload dengan progress tracking
 */

import { useState, useCallback } from 'react';
import { ImageItem } from '../types/imageTypes';
import { validateImageFile, getValidFiles, getInvalidFiles } from '../utils/imageValidation';
import { compressImage, fileToBase64, getImageDimensions } from '../utils/imageCompression';
import { generateImageId } from '../utils/imageFormatting';
import { useToast } from '@/hooks/use-toast';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const { toast } = useToast();

  /**
   * Update progress untuk file tertentu
   */
  const updateProgress = useCallback((fileName: string, progress: number, status: UploadProgress['status']) => {
    setUploadProgress(prev => 
      prev.map(item => 
        item.fileName === fileName 
          ? { ...item, progress, status }
          : item
      )
    );
  }, []);

  /**
   * Memproses single file upload
   */
  const processSingleFile = useCallback(async (file: File): Promise<ImageItem | null> => {
    try {
      updateProgress(file.name, 10, 'processing');

      // Validasi file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      updateProgress(file.name, 30, 'processing');

      // Kompres gambar
      const originalSize = file.size;
      const compressedFile = await compressImage(file);
      
      updateProgress(file.name, 60, 'processing');

      // Convert ke base64
      const base64 = await fileToBase64(compressedFile);
      
      updateProgress(file.name, 80, 'processing');

      // Dapatkan dimensi
      const dimensions = await getImageDimensions(compressedFile);

      updateProgress(file.name, 90, 'processing');

      // Buat object ImageItem
      const newImage: ImageItem = {
        id: generateImageId(),
        name: file.name,
        url: base64,
        size: compressedFile.size,
        type: file.type,
        width: dimensions.width,
        height: dimensions.height,
        createdAt: new Date(),
        tags: [],
        compressed: compressedFile.size < originalSize,
        originalSize
      };

      updateProgress(file.name, 100, 'completed');
      return newImage;

    } catch (error) {
      updateProgress(file.name, 0, 'error');
      console.error(`Failed to process ${file.name}:`, error);
      return null;
    }
  }, [updateProgress]);

  /**
   * Upload multiple files
   */
  const uploadFiles = useCallback(async (files: FileList | File[]): Promise<ImageItem[]> => {
    if (!files || files.length === 0) return [];

    setIsUploading(true);
    const fileArray = Array.from(files);

    // Initialize progress tracking
    const initialProgress: UploadProgress[] = fileArray.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'pending' as const
    }));
    setUploadProgress(initialProgress);

    try {
      // Validasi semua file terlebih dahulu
      const validFiles = getValidFiles(fileArray);
      const invalidFiles = getInvalidFiles(fileArray);

      // Tampilkan error untuk file yang tidak valid
      if (invalidFiles.length > 0) {
        invalidFiles.forEach(({ file, error }) => {
          toast({
            title: "File tidak valid",
            description: `${file.name}: ${error}`,
            variant: "destructive"
          });
          updateProgress(file.name, 0, 'error');
        });
      }

      if (validFiles.length === 0) {
        toast({
          title: "Tidak ada file valid",
          description: "Semua file yang dipilih tidak valid",
          variant: "destructive"
        });
        return [];
      }

      // Proses file yang valid
      const uploadPromises = validFiles.map(file => processSingleFile(file));
      const results = await Promise.all(uploadPromises);

      // Filter hasil yang berhasil
      const successfulUploads = results.filter((result): result is ImageItem => result !== null);

      // Tampilkan notifikasi hasil
      if (successfulUploads.length > 0) {
        const compressionInfo = successfulUploads.filter(img => img.compressed).length;
        
        toast({
          title: "Upload berhasil",
          description: `${successfulUploads.length} gambar berhasil diupload${compressionInfo > 0 ? ` (${compressionInfo} dikompres)` : ''}`,
        });
      }

      const failedUploads = validFiles.length - successfulUploads.length;
      if (failedUploads > 0) {
        toast({
          title: "Sebagian upload gagal",
          description: `${failedUploads} dari ${validFiles.length} file gagal diupload`,
          variant: "destructive"
        });
      }

      return successfulUploads;

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload gagal",
        description: "Terjadi kesalahan saat mengupload gambar",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsUploading(false);
      // Clear progress setelah 3 detik
      setTimeout(() => {
        setUploadProgress([]);
      }, 3000);
    }
  }, [processSingleFile, updateProgress, toast]);

  /**
   * Upload dari URL
   */
  const uploadFromUrl = useCallback(async (url: string, fileName?: string): Promise<ImageItem | null> => {
    setIsUploading(true);
    
    try {
      // Fetch gambar dari URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch image from URL');
      }

      const blob = await response.blob();
      const file = new File([blob], fileName || 'image-from-url', { type: blob.type });

      const result = await processSingleFile(file);
      
      if (result) {
        toast({
          title: "Upload berhasil",
          description: "Gambar dari URL berhasil ditambahkan",
        });
      }

      return result;

    } catch (error) {
      console.error('Failed to upload from URL:', error);
      toast({
        title: "Upload gagal",
        description: "Gagal mengupload gambar dari URL",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [processSingleFile, toast]);

  /**
   * Cancel upload (untuk implementasi future)
   */
  const cancelUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress([]);
    
    toast({
      title: "Upload dibatalkan",
      description: "Proses upload telah dibatalkan",
    });
  }, [toast]);

  /**
   * Reset upload state
   */
  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress([]);
  }, []);

  /**
   * Get overall upload progress
   */
  const getOverallProgress = useCallback(() => {
    if (uploadProgress.length === 0) return 0;
    
    const totalProgress = uploadProgress.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(totalProgress / uploadProgress.length);
  }, [uploadProgress]);

  /**
   * Get upload statistics
   */
  const getUploadStats = useCallback(() => {
    const total = uploadProgress.length;
    const completed = uploadProgress.filter(item => item.status === 'completed').length;
    const processing = uploadProgress.filter(item => item.status === 'processing').length;
    const errors = uploadProgress.filter(item => item.status === 'error').length;
    const pending = uploadProgress.filter(item => item.status === 'pending').length;

    return {
      total,
      completed,
      processing,
      errors,
      pending,
      isComplete: completed === total && total > 0
    };
  }, [uploadProgress]);

  return {
    // State
    isUploading,
    uploadProgress,
    
    // Computed values
    overallProgress: getOverallProgress(),
    uploadStats: getUploadStats(),
    
    // Actions
    uploadFiles,
    uploadFromUrl,
    cancelUpload,
    resetUploadState,
    processSingleFile
  };
};

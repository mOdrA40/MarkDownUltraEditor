/**
 * Custom hook untuk manajemen state utama Image Manager
 * Menangani state gambar, mode tampilan, dan operasi CRUD
 */

import { useState, useEffect, useCallback } from 'react';
import { ImageItem, ViewMode } from '../types/imageTypes';
import { 
  loadImagesFromStorage, 
  saveImagesToStorage, 
  removeImageFromStorage,
  addImageToStorage 
} from '../utils/imageStorage';
import { useToast } from '@/hooks/use-toast';

export const useImageManager = () => {
  // State management
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  /**
   * Load images dari storage saat component mount
   */
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        const savedImages = loadImagesFromStorage();
        setImages(savedImages);
      } catch (error) {
        console.error('Failed to load images:', error);
        toast({
          title: "Error",
          description: "Gagal memuat gambar dari storage",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [toast]);

  /**
   * Menyimpan perubahan images ke storage
   */
  const saveImages = useCallback((newImages: ImageItem[]) => {
    try {
      const success = saveImagesToStorage(newImages);
      if (success) {
        setImages(newImages);
        return true;
      } else {
        throw new Error('Failed to save to storage');
      }
    } catch (error) {
      console.error('Failed to save images:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan gambar",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  /**
   * Menambahkan gambar baru
   */
  const addImage = useCallback((newImage: ImageItem) => {
    try {
      const updatedImages = addImageToStorage(newImage);
      setImages(updatedImages);
      
      toast({
        title: "Berhasil",
        description: `${newImage.name} telah ditambahkan ke galeri`,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to add image:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan gambar",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  /**
   * Menambahkan multiple gambar sekaligus
   */
  const addMultipleImages = useCallback((newImages: ImageItem[]) => {
    try {
      let currentImages = [...images];
      
      newImages.forEach(image => {
        currentImages = [...currentImages, image];
      });
      
      const success = saveImages(currentImages);
      if (success) {
        toast({
          title: "Berhasil",
          description: `${newImages.length} gambar telah ditambahkan`,
        });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to add multiple images:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan gambar",
        variant: "destructive"
      });
      return false;
    }
  }, [images, saveImages, toast]);

  /**
   * Menghapus gambar berdasarkan ID
   */
  const deleteImage = useCallback((imageId: string) => {
    try {
      const updatedImages = removeImageFromStorage(imageId);
      setImages(updatedImages);
      
      // Reset selected image jika yang dihapus sedang dipilih
      if (selectedImage?.id === imageId) {
        setSelectedImage(null);
      }
      
      toast({
        title: "Berhasil",
        description: "Gambar telah dihapus dari galeri",
      });
      
      return true;
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus gambar",
        variant: "destructive"
      });
      return false;
    }
  }, [selectedImage, toast]);

  /**
   * Update gambar yang sudah ada
   */
  const updateImage = useCallback((updatedImage: ImageItem) => {
    try {
      const updatedImages = images.map(img => 
        img.id === updatedImage.id ? updatedImage : img
      );
      
      const success = saveImages(updatedImages);
      if (success && selectedImage?.id === updatedImage.id) {
        setSelectedImage(updatedImage);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to update image:', error);
      toast({
        title: "Error",
        description: "Gagal mengupdate gambar",
        variant: "destructive"
      });
      return false;
    }
  }, [images, selectedImage, saveImages, toast]);

  /**
   * Filter gambar berdasarkan search term dan tag
   */
  const filteredImages = useCallback(() => {
    return images.filter(image => {
      const matchesSearch = !searchTerm || 
        image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = !filterTag || image.tags.includes(filterTag);
      
      return matchesSearch && matchesFilter;
    });
  }, [images, searchTerm, filterTag]);

  /**
   * Mendapatkan semua tag unik
   */
  const allTags = useCallback(() => {
    return Array.from(new Set(images.flatMap(img => img.tags)));
  }, [images]);

  /**
   * Copy URL gambar ke clipboard
   */
  const copyImageUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Berhasil",
        description: "URL gambar telah disalin ke clipboard",
      });
      return true;
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast({
        title: "Error",
        description: "Gagal menyalin URL",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  /**
   * Reset semua filter dan pencarian
   */
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterTag('');
    setSelectedImage(null);
  }, []);

  /**
   * Clear semua gambar
   */
  const clearAllImages = useCallback(() => {
    try {
      setImages([]);
      setSelectedImage(null);
      saveImagesToStorage([]);
      
      toast({
        title: "Berhasil",
        description: "Semua gambar telah dihapus",
      });
      
      return true;
    } catch (error) {
      console.error('Failed to clear images:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus semua gambar",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  return {
    // State
    images,
    selectedImage,
    viewMode,
    searchTerm,
    filterTag,
    isLoading,
    
    // Computed values
    filteredImages: filteredImages(),
    allTags: allTags(),
    
    // Actions
    setSelectedImage,
    setViewMode,
    setSearchTerm,
    setFilterTag,
    addImage,
    addMultipleImages,
    deleteImage,
    updateImage,
    copyImageUrl,
    resetFilters,
    clearAllImages,
    saveImages
  };
};

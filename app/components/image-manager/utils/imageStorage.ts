/**
 * Utility functions untuk manajemen penyimpanan gambar di localStorage
 * Menangani operasi CRUD untuk data gambar dengan error handling yang robust
 */

import { ImageItem } from '../types/imageTypes';

const STORAGE_KEY = 'markdown-editor-images';

/**
 * Memuat semua gambar dari localStorage
 * @returns Array ImageItem atau array kosong jika tidak ada data
 */
export const loadImagesFromStorage = (): ImageItem[] => {
  try {
    const savedImages = localStorage.getItem(STORAGE_KEY);
    if (!savedImages) return [];

    const parsed = JSON.parse(savedImages);
    
    // Konversi string date kembali ke Date object
    return parsed.map((img: ImageItem & { createdAt: string }) => ({
      ...img,
      createdAt: new Date(img.createdAt)
    }));
  } catch (error) {
    console.error('Failed to load images from storage:', error);
    return [];
  }
};

/**
 * Menyimpan array gambar ke localStorage
 * @param images - Array ImageItem yang akan disimpan
 * @returns boolean - true jika berhasil, false jika gagal
 */
export const saveImagesToStorage = (images: ImageItem[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    return true;
  } catch (error) {
    console.error('Failed to save images to storage:', error);
    return false;
  }
};

/**
 * Menambahkan gambar baru ke storage
 * @param newImage - ImageItem yang akan ditambahkan
 * @returns Array ImageItem yang sudah diupdate
 */
export const addImageToStorage = (newImage: ImageItem): ImageItem[] => {
  const existingImages = loadImagesFromStorage();
  const updatedImages = [...existingImages, newImage];
  
  if (saveImagesToStorage(updatedImages)) {
    return updatedImages;
  }
  
  return existingImages;
};

/**
 * Menghapus gambar dari storage berdasarkan ID
 * @param imageId - ID gambar yang akan dihapus
 * @returns Array ImageItem yang sudah diupdate
 */
export const removeImageFromStorage = (imageId: string): ImageItem[] => {
  const existingImages = loadImagesFromStorage();
  const updatedImages = existingImages.filter(img => img.id !== imageId);
  
  if (saveImagesToStorage(updatedImages)) {
    return updatedImages;
  }
  
  return existingImages;
};

/**
 * Mengupdate gambar yang sudah ada di storage
 * @param updatedImage - ImageItem dengan data yang sudah diupdate
 * @returns Array ImageItem yang sudah diupdate
 */
export const updateImageInStorage = (updatedImage: ImageItem): ImageItem[] => {
  const existingImages = loadImagesFromStorage();
  const updatedImages = existingImages.map(img => 
    img.id === updatedImage.id ? updatedImage : img
  );
  
  if (saveImagesToStorage(updatedImages)) {
    return updatedImages;
  }
  
  return existingImages;
};

/**
 * Mencari gambar berdasarkan ID
 * @param imageId - ID gambar yang dicari
 * @returns ImageItem atau null jika tidak ditemukan
 */
export const findImageById = (imageId: string): ImageItem | null => {
  const images = loadImagesFromStorage();
  return images.find(img => img.id === imageId) || null;
};

/**
 * Mendapatkan statistik storage
 * @returns Object dengan informasi storage
 */
export const getStorageStats = () => {
  const images = loadImagesFromStorage();
  const totalSize = images.reduce((sum, img) => sum + img.size, 0);
  const compressedImages = images.filter(img => img.compressed).length;
  
  return {
    totalImages: images.length,
    totalSize,
    compressedImages,
    compressionRatio: images.length > 0 ? (compressedImages / images.length) * 100 : 0
  };
};

/**
 * Membersihkan storage (menghapus semua gambar)
 * @returns boolean - true jika berhasil
 */
export const clearImageStorage = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear image storage:', error);
    return false;
  }
};

/**
 * Mengekspor data gambar sebagai JSON
 * @returns string - JSON string dari semua gambar
 */
export const exportImagesData = (): string => {
  const images = loadImagesFromStorage();
  return JSON.stringify(images, null, 2);
};

/**
 * Mengimpor data gambar dari JSON string
 * @param jsonData - JSON string data gambar
 * @returns boolean - true jika berhasil
 */
export const importImagesData = (jsonData: string): boolean => {
  try {
    const images = JSON.parse(jsonData);
    
    // Validasi struktur data
    if (!Array.isArray(images)) {
      throw new Error('Invalid data format: expected array');
    }
    
    // Validasi setiap item
    const validImages = images.filter(img => 
      img.id && img.name && img.url && typeof img.size === 'number'
    );
    
    return saveImagesToStorage(validImages);
  } catch (error) {
    console.error('Failed to import images data:', error);
    return false;
  }
};

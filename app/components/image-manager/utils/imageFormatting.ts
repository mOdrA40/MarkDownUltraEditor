/**
 * Utility functions untuk formatting dan manipulasi data gambar
 * Menangani format display, konversi data, dan operasi umum lainnya
 */

import { ImageItem } from '../types/imageTypes';

/**
 * Memformat ukuran file ke format yang mudah dibaca
 * @param bytes - Ukuran dalam bytes
 * @returns String format yang mudah dibaca
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Memformat dimensi gambar
 * @param width - Lebar gambar
 * @param height - Tinggi gambar
 * @returns String format "width × height"
 */
export const formatDimensions = (width: number, height: number): string => {
  return `${width} × ${height}`;
};

/**
 * Memformat tanggal ke format yang mudah dibaca
 * @param date - Date object
 * @returns String tanggal yang diformat
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Memformat tanggal relatif (misal: "2 jam yang lalu")
 * @param date - Date object
 * @returns String tanggal relatif
 */
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Baru saja';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} hari yang lalu`;
  }
  
  return formatDate(date);
};

/**
 * Mendapatkan aspect ratio gambar
 * @param width - Lebar gambar
 * @param height - Tinggi gambar
 * @returns String aspect ratio (misal: "16:9")
 */
export const getAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  
  return `${width / divisor}:${height / divisor}`;
};

/**
 * Mendapatkan orientasi gambar
 * @param width - Lebar gambar
 * @param height - Tinggi gambar
 * @returns String orientasi
 */
export const getImageOrientation = (width: number, height: number): string => {
  if (width > height) return 'Landscape';
  if (height > width) return 'Portrait';
  return 'Square';
};

/**
 * Memformat informasi kompresi
 * @param originalSize - Ukuran asli
 * @param compressedSize - Ukuran setelah kompresi
 * @returns Object dengan informasi kompresi
 */
export const formatCompressionInfo = (originalSize: number, compressedSize: number) => {
  const savedBytes = originalSize - compressedSize;
  const savedPercentage = Math.round((savedBytes / originalSize) * 100);
  
  return {
    savedBytes: formatFileSize(savedBytes),
    savedPercentage,
    compressionRatio: `${savedPercentage}%`
  };
};

/**
 * Membuat ID unik untuk gambar
 * @param prefix - Prefix untuk ID (default: 'img')
 * @returns String ID unik
 */
export const generateImageId = (prefix: string = 'img'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Memformat nama file untuk display
 * @param fileName - Nama file asli
 * @param maxLength - Panjang maksimal (default: 30)
 * @returns Nama file yang dipotong jika terlalu panjang
 */
export const formatFileName = (fileName: string, maxLength: number = 30): string => {
  if (fileName.length <= maxLength) return fileName;
  
  const extension = fileName.split('.').pop();
  const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.slice(0, maxLength - extension!.length - 4);
  
  return `${truncatedName}...${extension}`;
};

/**
 * Mendapatkan warna dominan dari MIME type
 * @param mimeType - MIME type gambar
 * @returns String kelas CSS untuk warna
 */
export const getTypeColor = (mimeType: string): string => {
  const typeColors: Record<string, string> = {
    'image/jpeg': 'bg-blue-100 text-blue-800',
    'image/jpg': 'bg-blue-100 text-blue-800',
    'image/png': 'bg-green-100 text-green-800',
    'image/gif': 'bg-purple-100 text-purple-800',
    'image/webp': 'bg-orange-100 text-orange-800',
    'image/svg+xml': 'bg-pink-100 text-pink-800',
    'image/bmp': 'bg-gray-100 text-gray-800'
  };
  
  return typeColors[mimeType] || 'bg-gray-100 text-gray-800';
};

/**
 * Memformat tags untuk display
 * @param tags - Array tags
 * @param maxTags - Jumlah maksimal tags yang ditampilkan
 * @returns Object dengan tags yang ditampilkan dan sisa
 */
export const formatTags = (tags: string[], maxTags: number = 3) => {
  const displayTags = tags.slice(0, maxTags);
  const remainingCount = Math.max(0, tags.length - maxTags);
  
  return {
    displayTags,
    remainingCount,
    hasMore: remainingCount > 0
  };
};

/**
 * Mengurutkan gambar berdasarkan kriteria
 * @param images - Array gambar
 * @param sortBy - Kriteria pengurutan
 * @param order - Urutan (asc/desc)
 * @returns Array gambar yang sudah diurutkan
 */
export const sortImages = (
  images: ImageItem[], 
  sortBy: 'name' | 'size' | 'date' | 'type',
  order: 'asc' | 'desc' = 'desc'
): ImageItem[] => {
  const sorted = [...images].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'date':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

/**
 * Memfilter gambar berdasarkan term pencarian
 * @param images - Array gambar
 * @param searchTerm - Term pencarian
 * @returns Array gambar yang difilter
 */
export const filterImagesBySearch = (images: ImageItem[], searchTerm: string): ImageItem[] => {
  if (!searchTerm.trim()) return images;
  
  const term = searchTerm.toLowerCase();
  
  return images.filter(image => 
    image.name.toLowerCase().includes(term) ||
    image.tags.some(tag => tag.toLowerCase().includes(term)) ||
    image.type.toLowerCase().includes(term)
  );
};

/**
 * Memfilter gambar berdasarkan tag
 * @param images - Array gambar
 * @param tag - Tag yang dipilih
 * @returns Array gambar yang difilter
 */
export const filterImagesByTag = (images: ImageItem[], tag: string): ImageItem[] => {
  if (!tag) return images;
  
  return images.filter(image => image.tags.includes(tag));
};

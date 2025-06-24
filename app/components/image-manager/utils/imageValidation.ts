/**
 * Utility functions untuk validasi file gambar
 * Menangani validasi tipe file, ukuran, dan format yang didukung
 */

import { ImageValidationResult } from '../types/imageTypes';

// Konstanta untuk validasi
const SUPPORTED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_FILE_SIZE = 1024; // 1KB

/**
 * Memvalidasi apakah file adalah gambar yang valid
 * @param file - File yang akan divalidasi
 * @returns ImageValidationResult dengan status dan pesan error
 */
export const validateImageFile = (file: File): ImageValidationResult => {
  // Validasi tipe file
  if (!SUPPORTED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipe file tidak didukung. Gunakan: ${SUPPORTED_TYPES.join(', ')}`
    };
  }

  // Validasi ukuran file
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `Ukuran file terlalu besar. Maksimal ${formatFileSize(MAX_FILE_SIZE)}`
    };
  }

  if (file.size < MIN_FILE_SIZE) {
    return {
      isValid: false,
      error: `Ukuran file terlalu kecil. Minimal ${formatFileSize(MIN_FILE_SIZE)}`
    };
  }

  // Validasi nama file
  if (!file.name || file.name.trim() === '') {
    return {
      isValid: false,
      error: 'Nama file tidak valid'
    };
  }

  return { isValid: true };
};

/**
 * Memvalidasi multiple files sekaligus
 * @param files - FileList atau Array File
 * @returns Array hasil validasi untuk setiap file
 */
export const validateMultipleFiles = (
  files: FileList | File[]
): Array<{ file: File; validation: ImageValidationResult }> => {
  const fileArray = Array.from(files);
  
  return fileArray.map(file => ({
    file,
    validation: validateImageFile(file)
  }));
};

/**
 * Memfilter file yang valid dari array files
 * @param files - FileList atau Array File
 * @returns Array file yang valid
 */
export const getValidFiles = (files: FileList | File[]): File[] => {
  const validationResults = validateMultipleFiles(files);
  
  return validationResults
    .filter(result => result.validation.isValid)
    .map(result => result.file);
};

/**
 * Mendapatkan file yang tidak valid beserta error message
 * @param files - FileList atau Array File
 * @returns Array file tidak valid dengan pesan error
 */
export const getInvalidFiles = (
  files: FileList | File[]
): Array<{ file: File; error: string }> => {
  const validationResults = validateMultipleFiles(files);
  
  return validationResults
    .filter(result => !result.validation.isValid)
    .map(result => ({
      file: result.file,
      error: result.validation.error || 'Unknown error'
    }));
};

/**
 * Memformat ukuran file ke format yang mudah dibaca
 * @param bytes - Ukuran dalam bytes
 * @returns String format yang mudah dibaca (KB, MB, dll)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Mengecek apakah tipe file didukung
 * @param mimeType - MIME type file
 * @returns boolean
 */
export const isSupportedImageType = (mimeType: string): boolean => {
  return SUPPORTED_TYPES.includes(mimeType);
};

/**
 * Mendapatkan ekstensi file dari nama file
 * @param fileName - Nama file
 * @returns Ekstensi file (tanpa titik)
 */
export const getFileExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot !== -1 ? fileName.slice(lastDot + 1).toLowerCase() : '';
};

/**
 * Memvalidasi dimensi gambar
 * @param width - Lebar gambar
 * @param height - Tinggi gambar
 * @returns ImageValidationResult
 */
export const validateImageDimensions = (
  width: number, 
  height: number
): ImageValidationResult => {
  const MAX_DIMENSION = 8000;
  const MIN_DIMENSION = 1;

  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    return {
      isValid: false,
      error: `Dimensi gambar terlalu kecil. Minimal ${MIN_DIMENSION}x${MIN_DIMENSION}px`
    };
  }

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    return {
      isValid: false,
      error: `Dimensi gambar terlalu besar. Maksimal ${MAX_DIMENSION}x${MAX_DIMENSION}px`
    };
  }

  return { isValid: true };
};

/**
 * Membuat nama file yang unik untuk menghindari duplikasi
 * @param originalName - Nama file asli
 * @param existingNames - Array nama file yang sudah ada
 * @returns Nama file yang unik
 */
export const generateUniqueFileName = (
  originalName: string, 
  existingNames: string[]
): string => {
  if (!existingNames.includes(originalName)) {
    return originalName;
  }

  const extension = getFileExtension(originalName);
  const nameWithoutExt = originalName.slice(0, originalName.lastIndexOf('.'));
  
  let counter = 1;
  let newName = `${nameWithoutExt}_${counter}.${extension}`;
  
  while (existingNames.includes(newName)) {
    counter++;
    newName = `${nameWithoutExt}_${counter}.${extension}`;
  }
  
  return newName;
};

/**
 * Utility functions untuk kompresi gambar
 * Menggunakan Canvas API untuk mengompres gambar dengan kualitas yang dapat dikonfigurasi
 */

import { ImageCompressionOptions } from '../types/imageTypes';

/**
 * Mengompres file gambar menggunakan Canvas API
 * @param file - File gambar yang akan dikompres
 * @param options - Opsi kompresi (maxWidth, maxHeight, quality)
 * @returns Promise<File> - File yang sudah dikompres
 */
export const compressImage = async (
  file: File, 
  options: ImageCompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8
  } = options;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Hitung dimensi baru dengan mempertahankan aspect ratio
      const { width: newWidth, height: newHeight } = calculateNewDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Gambar dan kompres
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Menghitung dimensi baru dengan mempertahankan aspect ratio
 * @param originalWidth - Lebar asli
 * @param originalHeight - Tinggi asli
 * @param maxWidth - Lebar maksimal
 * @param maxHeight - Tinggi maksimal
 * @returns Object dengan width dan height baru
 */
export const calculateNewDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  let { width, height } = { width: originalWidth, height: originalHeight };

  if (width > height) {
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
  }

  return { width, height };
};

/**
 * Mengkonversi file ke base64 string
 * @param file - File yang akan dikonversi
 * @returns Promise<string> - Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Mendapatkan dimensi gambar dari file
 * @param file - File gambar
 * @returns Promise dengan width dan height
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Membuat thumbnail dari file gambar
 * @param file - File gambar
 * @param size - Ukuran thumbnail (default: 150px)
 * @returns Promise<string> - Base64 thumbnail
 */
export const createThumbnail = async (file: File, size: number = 150): Promise<string> => {
  const compressedFile = await compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7
  });
  
  return fileToBase64(compressedFile);
};

/**
 * Menghitung persentase kompresi
 * @param originalSize - Ukuran file asli
 * @param compressedSize - Ukuran file setelah kompresi
 * @returns Persentase penghematan (0-100)
 */
export const calculateCompressionRatio = (
  originalSize: number, 
  compressedSize: number
): number => {
  if (originalSize === 0) return 0;
  return Math.round((1 - compressedSize / originalSize) * 100);
};

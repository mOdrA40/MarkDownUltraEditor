/**
 * Download file menggunakan browser API
 * Menggantikan library file-saver dengan implementasi native
 *
 * @param blob - Blob data yang akan di-download
 * @param filename - Nama file yang akan di-download
 * @throws Error jika browser tidak mendukung download
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  try {
    // Validasi input
    if (!blob || !(blob instanceof Blob)) {
      throw new Error('Invalid blob data provided');
    }

    if (!filename || typeof filename !== 'string') {
      throw new Error('Invalid filename provided');
    }

    // Buat URL object dari blob
    const url = URL.createObjectURL(blob);

    // Buat element anchor untuk trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Tambahkan ke DOM sementara
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download file error:', error);
    throw new Error(
      `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Validasi apakah browser mendukung download
 *
 * @returns true jika browser mendukung download
 */
export const isBrowserDownloadSupported = (): boolean => {
  try {
    return !!(
      typeof window !== 'undefined' &&
      window.URL &&
      typeof window.URL.createObjectURL === 'function' &&
      document.createElement &&
      'download' in document.createElement('a')
    );
  } catch {
    return false;
  }
};

/**
 * Generate filename yang aman untuk download
 * Menghilangkan karakter yang tidak diizinkan
 *
 * @param filename - Nama file original
 * @param extension - Extension file (opsional)
 * @returns Nama file yang aman
 */
export const sanitizeFilename = (filename: string, extension?: string): string => {
  // Hilangkan karakter yang tidak diizinkan
  let sanitized = filename
    .replace(/[<>:"/\\|?*]/g, '') // Karakter yang tidak diizinkan di Windows
    .replace(/\s+/g, '_') // Ganti spasi dengan underscore
    .replace(/[^\w\-_.]/g, '') // Hanya izinkan alphanumeric, dash, underscore, dot
    .substring(0, 100); // Batasi panjang filename

  // Pastikan tidak kosong
  if (!sanitized) {
    sanitized = 'document';
  }

  // Tambahkan extension jika diperlukan
  if (extension && !sanitized.endsWith(extension)) {
    sanitized += extension;
  }

  return sanitized;
};

/**
 * Estimate ukuran file dari content
 *
 * @param content - Konten yang akan di-estimate
 * @returns Estimasi ukuran dalam bytes
 */
export const estimateFileSize = (content: string): number => {
  // Rough estimation: 1 character ≈ 1 byte for ASCII
  // Untuk Unicode bisa lebih besar
  return new Blob([content]).size;
};

/**
 * Format ukuran file untuk display
 *
 * @param bytes - Ukuran dalam bytes
 * @returns String yang formatted (e.g., "1.2 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Number.parseFloat((bytes / k ** i).toFixed(2)) + ' ' + sizes[i];
};

/**
 * @fileoverview Simple compression utilities - replacement for over-complex compression.ts
 * @author Axel Modra
 */

/**
 * Simple compression result interface
 */
export interface SimpleCompressionResult {
  content: string;
  isCompressed: boolean;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Simple text compression using basic techniques
 * Only compress if content is large enough to benefit
 */
export const compressContent = (content: string): SimpleCompressionResult => {
  const originalSize = content.length;

  // Don't compress small content (overhead not worth it)
  if (originalSize < 1000) {
    return {
      content,
      isCompressed: false,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1.0,
    };
  }

  try {
    // Simple compression: just remove extra whitespace for markdown
    const compressed = content
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple newlines to double
      .replace(/[ \t]+/g, ' ') // Multiple spaces to single
      .trim();

    const compressedSize = compressed.length;
    const ratio = compressedSize / originalSize;

    // If compression doesn't help much, return original
    if (ratio > 0.9) {
      return {
        content,
        isCompressed: false,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1.0,
      };
    }

    return {
      content: compressed,
      isCompressed: true,
      originalSize,
      compressedSize,
      compressionRatio: ratio,
    };
  } catch (_error) {
    // If compression fails, return original
    return {
      content,
      isCompressed: false,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1.0,
    };
  }
};

/**
 * Simple decompression (no-op since we use simple compression)
 */
export const decompressContent = (content: string): string => {
  return content;
};

/**
 * Get content size in bytes
 */
export const getContentSize = (content: string): number => {
  return new Blob([content]).size;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
};

/**
 * Check if content should be compressed
 */
export const shouldCompress = (content: string): boolean => {
  return content.length >= 1000;
};

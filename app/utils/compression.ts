/**
 * @fileoverview Content compression utilities for storage optimization
 * @author Axel Modra
 */

import { safeConsole } from './console';

// Compression configuration
const COMPRESSION_CONFIG = {
  // Minimum content length to compress (below this, compression overhead isn't worth it)
  MIN_COMPRESS_LENGTH: 1000,
  // Maximum compression ratio to accept (if compression doesn't achieve this, store uncompressed)
  MIN_COMPRESSION_RATIO: 0.8,
  // Chunk size for large content processing
  CHUNK_SIZE: 64 * 1024, // 64KB chunks
} as const;

/**
 * Simple text compression optimized for markdown content
 * Uses pattern replacement and run-length encoding
 */

/**
 * Compress text content using simple dictionary compression
 */
const compressText = (
  input: string
): {
  compressed: string;
  originalSize: number;
  compressedSize: number;
  ratio: number;
} => {
  if (input.length < COMPRESSION_CONFIG.MIN_COMPRESS_LENGTH) {
    return {
      compressed: input,
      originalSize: input.length,
      compressedSize: input.length,
      ratio: 1.0,
    };
  }

  try {
    // Simple run-length encoding + dictionary compression
    const compressed = simpleCompress(input);
    const ratio = compressed.length / input.length;

    // If compression ratio is poor, return original
    if (ratio > COMPRESSION_CONFIG.MIN_COMPRESSION_RATIO) {
      return {
        compressed: input,
        originalSize: input.length,
        compressedSize: input.length,
        ratio: 1.0,
      };
    }

    return {
      compressed,
      originalSize: input.length,
      compressedSize: compressed.length,
      ratio,
    };
  } catch (error) {
    safeConsole.warn('Compression failed, using original content:', error);
    return {
      compressed: input,
      originalSize: input.length,
      compressedSize: input.length,
      ratio: 1.0,
    };
  }
};

/**
 * Simple compression algorithm optimized for text/markdown
 */
const simpleCompress = (input: string): string => {
  // Step 1: Replace common markdown patterns
  let result = input
    .replace(/\n\n/g, '§P§') // Double newlines (paragraphs)
    .replace(/\n/g, '§N§') // Single newlines
    .replace(/ {2}/g, '§S§') // Double spaces
    .replace(/```/g, '§C§') // Code blocks
    .replace(/##/g, '§H§') // Headers
    .replace(/\*\*/g, '§B§') // Bold
    .replace(/\*/g, '§I§') // Italic
    .replace(/\[/g, '§L§') // Link start
    .replace(/\]/g, '§R§') // Link end
    .replace(/\(/g, '§O§') // Parenthesis open
    .replace(/\)/g, '§E§'); // Parenthesis close

  // Step 2: Simple run-length encoding for repeated characters
  result = result.replace(/(.)\1{2,}/g, (match, char) => {
    return `§${char}${match.length}§`;
  });

  return `COMP:${result}`;
};

/**
 * Simple decompression algorithm
 */
const simpleDecompress = (compressed: string): string => {
  // Step 1: Restore run-length encoded patterns
  let result = compressed.replace(/§(.)(\d+)§/g, (_match, char, count) => {
    return char.repeat(Number.parseInt(count, 10));
  });

  // Step 2: Restore markdown patterns
  result = result
    .replace(/§E§/g, ')') // Parenthesis close
    .replace(/§O§/g, '(') // Parenthesis open
    .replace(/§R§/g, ']') // Link end
    .replace(/§L§/g, '[') // Link start
    .replace(/§I§/g, '*') // Italic
    .replace(/§B§/g, '**') // Bold
    .replace(/§H§/g, '##') // Headers
    .replace(/§C§/g, '```') // Code blocks
    .replace(/§S§/g, '  ') // Double spaces
    .replace(/§N§/g, '\n') // Single newlines
    .replace(/§P§/g, '\n\n'); // Double newlines (paragraphs)

  return result;
};

/**
 * Decompress text content
 */
const decompressText = (compressed: string): string => {
  try {
    // Check if content was actually compressed (has compression header)
    if (!compressed.startsWith('COMP:')) {
      return compressed; // Not compressed
    }

    return simpleDecompress(compressed.substring(5));
  } catch (error) {
    safeConsole.warn('Decompression failed, returning as-is:', error);
    return compressed;
  }
};

/**
 * Compress file content for storage
 */
export const compressContent = (
  content: string
): {
  content: string;
  isCompressed: boolean;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
} => {
  const result = compressText(content);

  return {
    content: result.compressed,
    isCompressed: result.ratio < 1.0,
    originalSize: result.originalSize,
    compressedSize: result.compressedSize,
    compressionRatio: result.ratio,
  };
};

/**
 * Decompress file content from storage
 */
export const decompressContent = (content: string): string => {
  return decompressText(content);
};

/**
 * Get content size in bytes (UTF-8)
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
 * Calculate storage savings from compression
 */
export const calculateSavings = (
  originalSize: number,
  compressedSize: number
): {
  savedBytes: number;
  savedPercentage: number;
  formattedSavings: string;
} => {
  const savedBytes = originalSize - compressedSize;
  const savedPercentage = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;

  return {
    savedBytes,
    savedPercentage,
    formattedSavings: `${formatFileSize(savedBytes)} (${savedPercentage.toFixed(1)}%)`,
  };
};

/**
 * Check if content should be compressed
 */
export const shouldCompress = (content: string): boolean => {
  return content.length >= COMPRESSION_CONFIG.MIN_COMPRESS_LENGTH;
};

/**
 * Estimate compression benefit
 */
export const estimateCompressionBenefit = (
  content: string
): {
  worthCompressing: boolean;
  estimatedRatio: number;
  estimatedSavings: string;
} => {
  if (!shouldCompress(content)) {
    return {
      worthCompressing: false,
      estimatedRatio: 1.0,
      estimatedSavings: '0 B (0%)',
    };
  }

  // Quick estimation based on content characteristics
  const repetitionScore = content.length / new Set(content).size;
  const markdownScore = (content.match(/[#*`[\]()]/g) || []).length / content.length;

  const estimatedRatio = Math.max(0.3, 1 - (repetitionScore * 0.1 + markdownScore * 0.2));
  const estimatedCompressedSize = Math.floor(content.length * estimatedRatio);
  const savings = calculateSavings(content.length, estimatedCompressedSize);

  return {
    worthCompressing: estimatedRatio < COMPRESSION_CONFIG.MIN_COMPRESSION_RATIO,
    estimatedRatio,
    estimatedSavings: savings.formattedSavings,
  };
};

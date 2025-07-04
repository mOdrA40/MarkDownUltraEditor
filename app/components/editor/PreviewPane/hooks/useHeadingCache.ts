/**
 * @fileoverview Custom hook untuk heading cache management
 * @author Axel Modra
 */

import { useCallback, useEffect } from 'react';
import { generateHeadingId } from '@/utils/headingUtils';
import type { HeadingCacheEntry } from '../types/preview.types';

// Global cache untuk heading mappings
const headingCache = new Map<string, HeadingCacheEntry>();

/**
 * Helper function untuk mendapatkan line number dari heading dengan konsistensi
 * @param markdown - Konten markdown
 * @param headingText - Text heading yang dicari
 * @returns Line number (0-based)
 */
const getHeadingLineNumber = (markdown: string, headingText: string): number => {
  const lines = markdown.split('\n');
  let foundIndex = -1;
  let headingCount = 0;

  // Find the exact heading by text and count occurrences
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const text = match[2].trim();
      if (text === headingText) {
        if (headingCount === 0) {
          foundIndex = i;
        }
        headingCount++;
      }
    }
  }

  return foundIndex >= 0 ? foundIndex : 0;
};

/**
 * Custom hook untuk mengelola heading cache
 * @param markdown - Konten markdown
 */
export const useHeadingCache = (markdown: string) => {
  // Clear cache ketika markdown berubah
  useEffect(() => {
    headingCache.clear();
  }, []);

  // Setup debugging tools untuk development
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Expose cache untuk debugging
      (window as unknown as { headingCache: typeof headingCache }).headingCache = headingCache;

      // Expose utility functions untuk debugging
      const debugUtils = {
        getHeadingLineNumber,
        clearCache: () => headingCache.clear(),
        getCacheSize: () => headingCache.size,
        getCacheEntries: () => Array.from(headingCache.entries()),
        findHeadingInCache: (text: string) => {
          for (const [key, entry] of headingCache.entries()) {
            if (entry.text === text) {
              return { key, entry };
            }
          }
          return null;
        },
      };

      (window as unknown as { headingCacheUtils: typeof debugUtils }).headingCacheUtils =
        debugUtils;

      console.log('🔧 Heading Cache Debug tools available:');
      console.log('  - headingCache - View cache Map');
      console.log('  - headingCacheUtils.clearCache() - Clear cache');
      console.log('  - headingCacheUtils.getCacheSize() - Get cache size');
      console.log('  - headingCacheUtils.getCacheEntries() - Get all entries');
      console.log('  - headingCacheUtils.findHeadingInCache(text) - Find by text');
    }
  }, []);

  /**
   * Mendapatkan atau membuat heading ID dengan caching
   * @param headingText - Text heading
   * @returns Generated heading ID
   */
  const getOrCreateHeadingId = useCallback(
    (headingText: string): string => {
      const cacheKey = `${markdown.length}-${headingText}`;

      // Check cache first
      if (headingCache.has(cacheKey)) {
        return headingCache.get(cacheKey)?.id || '';
      }

      // Generate new ID
      const lineNumber = getHeadingLineNumber(markdown, headingText);
      const id = generateHeadingId(headingText, lineNumber);

      // Store in cache
      const cacheEntry: HeadingCacheEntry = {
        text: headingText,
        lineNumber,
        id,
      };

      headingCache.set(cacheKey, cacheEntry);
      return id;
    },
    [markdown]
  );

  /**
   * Mendapatkan cache entry untuk heading tertentu
   * @param headingText - Text heading
   * @returns Cache entry atau null
   */
  const getCacheEntry = useCallback(
    (headingText: string): HeadingCacheEntry | null => {
      const cacheKey = `${markdown.length}-${headingText}`;
      return headingCache.get(cacheKey) || null;
    },
    [markdown]
  );

  /**
   * Mendapatkan semua cache entries
   * @returns Array of cache entries
   */
  const getAllCacheEntries = useCallback((): HeadingCacheEntry[] => {
    return Array.from(headingCache.values());
  }, []);

  /**
   * Clear cache secara manual
   */
  const clearCache = useCallback(() => {
    headingCache.clear();
  }, []);

  /**
   * Mendapatkan statistik cache
   */
  const getCacheStats = useCallback(() => {
    return {
      size: headingCache.size,
      entries: Array.from(headingCache.keys()),
      isEmpty: headingCache.size === 0,
    };
  }, []);

  return {
    getOrCreateHeadingId,
    getCacheEntry,
    getAllCacheEntries,
    clearCache,
    getCacheStats,
    // Expose cache untuk advanced usage
    cache: headingCache,
  };
};

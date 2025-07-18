/**
 * @fileoverview Editor helper functions and utilities
 * @author Axel Modra
 */

import type { ImageData, TemplateData, ValidationResult } from '../types';

/**
 * Text manipulation utilities
 */
export const textUtils = {
  /**
   * Count words in text
   */
  countWords: (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  },

  /**
   * Count characters in text
   */
  countCharacters: (text: string): number => {
    return text.length;
  },

  /**
   * Count characters excluding spaces
   */
  countCharactersNoSpaces: (text: string): number => {
    return text.replace(/\s/g, '').length;
  },

  /**
   * Count lines in text
   */
  countLines: (text: string): number => {
    return text.split('\n').length;
  },

  /**
   * Count paragraphs in text
   */
  countParagraphs: (text: string): number => {
    return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  },

  /**
   * Estimate reading time in minutes
   */
  estimateReadingTime: (text: string, wordsPerMinute = 200): number => {
    const wordCount = textUtils.countWords(text);
    return Math.ceil(wordCount / wordsPerMinute);
  },

  /**
   * Get text statistics
   */
  getTextStats: (text: string) => {
    return {
      words: textUtils.countWords(text),
      characters: textUtils.countCharacters(text),
      charactersNoSpaces: textUtils.countCharactersNoSpaces(text),
      lines: textUtils.countLines(text),
      paragraphs: textUtils.countParagraphs(text),
      readingTime: textUtils.estimateReadingTime(text),
    };
  },
};

/**
 * Markdown parsing utilities
 */
export const markdownUtils = {
  /**
   * Extract headings from markdown
   */
  extractHeadings: (markdown: string): Array<{ level: number; text: string; id: string }> => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: Array<{ level: number; text: string; id: string }> = [];
    let match: RegExpExecArray | null;

    match = headingRegex.exec(markdown);
    while (match !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      headings.push({ level, text, id });
      match = headingRegex.exec(markdown);
    }

    return headings;
  },

  /**
   * Extract links from markdown
   */
  extractLinks: (markdown: string): Array<{ text: string; url: string; title?: string }> => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g;
    const links: Array<{ text: string; url: string; title?: string }> = [];
    let match: RegExpExecArray | null;

    match = linkRegex.exec(markdown);
    while (match !== null) {
      links.push({
        text: match[1],
        url: match[2],
        title: match[3] || undefined,
      });
      match = linkRegex.exec(markdown);
    }

    return links;
  },

  /**
   * Extract images from markdown
   */
  extractImages: (markdown: string): ImageData[] => {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g;
    const images: ImageData[] = [];
    let match: RegExpExecArray | null;

    match = imageRegex.exec(markdown);
    while (match !== null) {
      images.push({
        alt: match[1] || '',
        url: match[2],
        title: match[3] || undefined,
      });
      match = imageRegex.exec(markdown);
    }

    return images;
  },

  /**
   * Extract code blocks from markdown
   */
  extractCodeBlocks: (markdown: string): Array<{ language: string; code: string }> => {
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const codeBlocks: Array<{ language: string; code: string }> = [];
    let match: RegExpExecArray | null;

    match = codeBlockRegex.exec(markdown);
    while (match !== null) {
      codeBlocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
      });
      match = codeBlockRegex.exec(markdown);
    }

    return codeBlocks;
  },

  /**
   * Generate table of contents from markdown
   */
  generateTOC: (markdown: string): string => {
    const headings = markdownUtils.extractHeadings(markdown);
    let toc = '';

    headings.forEach((heading) => {
      const indent = '  '.repeat(heading.level - 1);
      toc += `${indent}- [${heading.text}](#${heading.id})\n`;
    });

    return toc;
  },

  /**
   * Validate markdown syntax
   */
  validateMarkdown: (markdown: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for unmatched brackets
    const openBrackets = (markdown.match(/\[/g) || []).length;
    const closeBrackets = (markdown.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push('Unmatched square brackets detected');
    }

    // Check for unmatched parentheses in links
    const openParens = (markdown.match(/\(/g) || []).length;
    const closeParens = (markdown.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      warnings.push('Unmatched parentheses detected');
    }

    // Check for empty links
    const emptyLinks = markdown.match(/\[\]\([^)]*\)/g);
    if (emptyLinks) {
      warnings.push(`${emptyLinks.length} empty link(s) found`);
    }

    // Check for broken image references
    const brokenImages = markdown.match(/!\[[^\]]*\]\(\s*\)/g);
    if (brokenImages) {
      errors.push(`${brokenImages.length} broken image reference(s) found`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },
};

/**
 * File handling utilities
 */
export const fileUtils = {
  /**
   * Read file as text
   */
  readFileAsText: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  /**
   * Download text as file
   */
  downloadTextAsFile: (content: string, filename: string, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Validate file type
   */
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    return allowedTypes.includes(fileExtension);
  },

  /**
   * Validate file size
   */
  validateFileSize: (file: File, maxSizeBytes: number): boolean => {
    return file.size <= maxSizeBytes;
  },

  /**
   * Get file extension
   */
  getFileExtension: (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  },

  /**
   * Get file name without extension
   */
  getFileNameWithoutExtension: (filename: string): string => {
    return filename.replace(/\.[^/.]+$/, '');
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  },
};

/**
 * URL and link utilities
 */
export const urlUtils = {
  /**
   * Validate URL format
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Extract domain from URL
   */
  extractDomain: (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  },

  /**
   * Check if URL is external
   */
  isExternalUrl: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname !== window.location.hostname;
    } catch {
      return false;
    }
  },

  /**
   * Sanitize URL for safety
   */
  sanitizeUrl: (url: string): string => {
    // Remove javascript: and data: protocols for security
    if (url.toLowerCase().startsWith('javascript:') || url.toLowerCase().startsWith('data:')) {
      return '#';
    }
    return url;
  },
};

/**
 * Template utilities
 */
export const templateUtils = {
  /**
   * Create template from content
   */
  createTemplate: (
    name: string,
    content: string,
    description = '',
    category = 'Custom',
    tags: string[] = []
  ): TemplateData => {
    return {
      id: `template-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name,
      description,
      content,
      category,
      tags,
      preview: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
    };
  },

  /**
   * Filter templates by category
   */
  filterByCategory: (templates: TemplateData[], category: string): TemplateData[] => {
    return templates.filter((template) => template.category === category);
  },

  /**
   * Filter templates by tags
   */
  filterByTags: (templates: TemplateData[], tags: string[]): TemplateData[] => {
    return templates.filter((template) => tags.some((tag) => template.tags.includes(tag)));
  },

  /**
   * Search templates by name or description
   * Uses centralized search logic from documentTemplates
   */
  searchTemplates: (templates: TemplateData[], query: string): TemplateData[] => {
    // Use the same search logic as documentTemplates.searchTemplates
    const lowerQuery = query.toLowerCase();
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  },
};

// Import common utilities to avoid duplication
import { debounce, throttle } from '@/utils/common';

/**
 * Performance utilities - using centralized functions
 */
export const performanceUtils = {
  debounce,
  throttle,

  /**
   * Measure execution time
   */
  measureTime: <T>(func: () => T): { result: T; time: number } => {
    const start = performance.now();
    const result = func();
    const time = performance.now() - start;
    return { result, time };
  },
};

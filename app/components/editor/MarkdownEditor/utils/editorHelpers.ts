/**
 * @fileoverview Editor helper functions and utilities
 * @author Axel Modra
 */

import { ImageData, TemplateData, ValidationResult } from '../types';

/**
 * Text manipulation utilities
 */
export const textUtils = {
  /**
   * Count words in text
   */
  countWords: (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
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
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  },

  /**
   * Estimate reading time in minutes
   */
  estimateReadingTime: (text: string, wordsPerMinute: number = 200): number => {
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
      readingTime: textUtils.estimateReadingTime(text)
    };
  }
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
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, id });
    }

    return headings;
  },

  /**
   * Extract links from markdown
   */
  extractLinks: (markdown: string): Array<{ text: string; url: string; title?: string }> => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g;
    const links: Array<{ text: string; url: string; title?: string }> = [];
    let match;

    while ((match = linkRegex.exec(markdown)) !== null) {
      links.push({
        text: match[1],
        url: match[2],
        title: match[3] || undefined
      });
    }

    return links;
  },

  /**
   * Extract images from markdown
   */
  extractImages: (markdown: string): Array<ImageData> => {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g;
    const images: Array<ImageData> = [];
    let match;

    while ((match = imageRegex.exec(markdown)) !== null) {
      images.push({
        alt: match[1] || '',
        url: match[2],
        title: match[3] || undefined
      });
    }

    return images;
  },

  /**
   * Extract code blocks from markdown
   */
  extractCodeBlocks: (markdown: string): Array<{ language: string; code: string }> => {
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const codeBlocks: Array<{ language: string; code: string }> = [];
    let match;

    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      codeBlocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }

    return codeBlocks;
  },

  /**
   * Generate table of contents from markdown
   */
  generateTOC: (markdown: string): string => {
    const headings = markdownUtils.extractHeadings(markdown);
    let toc = '';

    headings.forEach(heading => {
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
      warnings
    };
  }
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
  downloadTextAsFile: (content: string, filename: string, mimeType: string = 'text/plain') => {
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
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
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
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
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
    if (url.toLowerCase().startsWith('javascript:') || 
        url.toLowerCase().startsWith('data:')) {
      return '#';
    }
    return url;
  }
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
    description: string = '',
    category: string = 'Custom',
    tags: string[] = []
  ): TemplateData => {
    return {
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      content,
      category,
      tags,
      preview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
    };
  },

  /**
   * Filter templates by category
   */
  filterByCategory: (templates: TemplateData[], category: string): TemplateData[] => {
    return templates.filter(template => template.category === category);
  },

  /**
   * Filter templates by tags
   */
  filterByTags: (templates: TemplateData[], tags: string[]): TemplateData[] => {
    return templates.filter(template => 
      tags.some(tag => template.tags.includes(tag))
    );
  },

  /**
   * Search templates by name or description
   */
  searchTemplates: (templates: TemplateData[], query: string): TemplateData[] => {
    const lowerQuery = query.toLowerCase();
    return templates.filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery)
    );
  }
};

/**
 * Performance utilities
 */
export const performanceUtils = {
  /**
   * Debounce function
   */
  debounce: <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function
   */
  throttle: <T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Measure execution time
   */
  measureTime: <T>(func: () => T): { result: T; time: number } => {
    const start = performance.now();
    const result = func();
    const time = performance.now() - start;
    return { result, time };
  }
};

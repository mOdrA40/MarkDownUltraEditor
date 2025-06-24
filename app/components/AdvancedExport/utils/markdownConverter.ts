/**
 * @fileoverview Utility untuk konversi Markdown ke HTML
 * @author Senior Developer
 * @version 1.0.0
 */

import { MarkdownConverterResult } from '../types/export.types';

/**
 * Konversi Markdown ke HTML dengan fitur lengkap
 * 
 * @param markdown - String markdown yang akan dikonversi
 * @param options - Opsi konversi (opsional)
 * @returns Object dengan HTML dan metadata
 */
export const convertMarkdownToHTML = (
  markdown: string, 
  options: {
    includeMetadata?: boolean;
    sanitize?: boolean;
  } = {}
): MarkdownConverterResult => {
  const { includeMetadata = false, sanitize = true } = options;
  
  if (!markdown || typeof markdown !== 'string') {
    return { html: '', metadata: includeMetadata ? { headings: [], wordCount: 0, estimatedReadTime: 0 } : undefined };
  }

  let html = markdown;
  const headings: string[] = [];

  // Convert headings dan extract untuk metadata
  html = html.replace(/^(#{1,6})\s+(.*)$/gim, (_, hashes, text) => {
    const level = hashes.length;
    const cleanText = text.trim();
    
    if (includeMetadata) {
      headings.push(cleanText);
    }
    
    return `<h${level}>${cleanText}</h${level}>`;
  });

  // Convert bold text
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  
  // Convert italic text
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  // Convert images
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]*)\)/gim,
    '<img alt="$1" src="$2" style="max-width: 100%; height: auto;" />'
  );

  // Convert links
  html = html.replace(
    /\[([^\]]*)\]\(([^)]*)\)/gim,
    '<a href="$2">$1</a>'
  );
  
  // Convert inline code
  html = html.replace(/`([^`]*)`/gim, '<code>$1</code>');
  
  // Convert code blocks
  html = html.replace(/```([^```]*)```/gims, '<pre><code>$1</code></pre>');
  
  // Convert blockquotes
  html = html.replace(/^>\s+(.*)$/gim, '<blockquote>$1</blockquote>');
  
  // Convert unordered lists
  html = html.replace(/^\*\s+(.*)$/gim, '<li>$1</li>');
  
  // Convert ordered lists
  html = html.replace(/^\d+\.\s+(.*)$/gim, '<li>$1</li>');
  
  // Wrap consecutive list items in ul/ol tags
  html = wrapListItems(html);
  
  // Convert line breaks
  html = html.replace(/\n/gim, '<br>');
  
  // Convert paragraphs (group non-tag content)
  html = wrapParagraphs(html);
  
  // Sanitize jika diperlukan
  if (sanitize) {
    html = sanitizeHTML(html);
  }

  // Generate metadata jika diminta
  let metadata;
  if (includeMetadata) {
    const wordCount = countWords(markdown);
    const estimatedReadTime = Math.ceil(wordCount / 200); // 200 words per minute
    
    metadata = {
      headings,
      wordCount,
      estimatedReadTime
    };
  }

  return { html, metadata };
};

/**
 * Wrap list items dalam ul/ol tags
 */
const wrapListItems = (html: string): string => {
  // Wrap unordered list items
  html = html.replace(/(<li>.*?<\/li>)(?:\s*<br>\s*<li>.*?<\/li>)*/gims, (match) => {
    return `<ul>${match.replace(/<br>\s*/g, '')}</ul>`;
  });
  
  return html;
};

/**
 * Wrap content dalam paragraph tags
 */
const wrapParagraphs = (html: string): string => {
  // Split by block elements
  const blockElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'blockquote', 'pre', 'div'];
  const blockRegex = new RegExp(`<(${blockElements.join('|')})[^>]*>.*?</\\1>`, 'gims');
  
  const parts = html.split(blockRegex);
  
  return parts.map(part => {
    // Skip jika sudah merupakan block element atau kosong
    if (!part.trim() || blockRegex.test(part)) {
      return part;
    }
    
    // Wrap dalam paragraph jika bukan block element
    const trimmed = part.trim();
    if (trimmed && !trimmed.startsWith('<')) {
      return `<p>${trimmed}</p>`;
    }
    
    return part;
  }).join('');
};

/**
 * Basic HTML sanitization
 */
const sanitizeHTML = (html: string): string => {
  // Remove script tags dan event handlers
  html = html.replace(/<script[^>]*>.*?<\/script>/gims, '');
  html = html.replace(/on\w+="[^"]*"/gim, '');
  html = html.replace(/javascript:/gim, '');

  // Filter hanya tag yang diizinkan (basic implementation)
  // Untuk production, gunakan library seperti DOMPurify

  return html;
};

/**
 * Hitung jumlah kata dalam text
 */
const countWords = (text: string): number => {
  return text
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 0) // Filter empty strings
    .length;
};

/**
 * Extract headings dari markdown
 */
export const extractHeadings = (markdown: string): Array<{ level: number; text: string; id: string }> => {
  const headings: Array<{ level: number; text: string; id: string }> = [];
  const headingRegex = /^(#{1,6})\s+(.*)$/gim;
  
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
    
    headings.push({ level, text, id });
  }
  
  return headings;
};

/**
 * Generate table of contents dari headings
 */
export const generateTableOfContents = (headings: Array<{ level: number; text: string; id: string }>): string => {
  if (headings.length === 0) return '';
  
  let toc = '<div class="table-of-contents"><h2>Table of Contents</h2><ul>';
  
  headings.forEach(heading => {
    const indent = '  '.repeat(heading.level - 1);
    toc += `${indent}<li><a href="#${heading.id}">${heading.text}</a></li>`;
  });
  
  toc += '</ul></div>';
  
  return toc;
};

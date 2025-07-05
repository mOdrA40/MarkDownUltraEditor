import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import type { MarkdownConverterResult } from '../types/export.types';

/**
 * Konversi Markdown ke HTML dengan fitur lengkap menggunakan ReactMarkdown
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
  const { includeMetadata = false } = options;

  if (!markdown || typeof markdown !== 'string') {
    return {
      html: '',
      metadata: includeMetadata ? { headings: [], wordCount: 0, estimatedReadTime: 0 } : undefined,
    };
  }

  try {
    // Render ReactMarkdown to HTML string using server-side rendering
    const markdownElement = React.createElement(
      ReactMarkdown,
      {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
      },
      markdown
    );

    const html = renderToStaticMarkup(markdownElement);

    // Generate metadata jika diminta
    let metadata: { headings: string[]; wordCount: number; estimatedReadTime: number } | undefined;
    if (includeMetadata) {
      const headings = extractHeadings(markdown);
      const wordCount = countWords(markdown);
      const estimatedReadTime = Math.ceil(wordCount / 200); // 200 words per minute

      metadata = {
        headings: headings.map((h) => h.text), // Convert to string array for compatibility
        wordCount,
        estimatedReadTime,
      };
    }

    return { html, metadata };
  } catch (error) {
    console.error('Error converting markdown to HTML with ReactMarkdown:', error);

    // Fallback to enhanced simple conversion
    const html = convertMarkdownToHTMLSimple(markdown);

    // Generate metadata jika diminta
    let metadata: { headings: string[]; wordCount: number; estimatedReadTime: number } | undefined;
    if (includeMetadata) {
      const headings = extractHeadings(markdown);
      const wordCount = countWords(markdown);
      const estimatedReadTime = Math.ceil(wordCount / 200);

      metadata = {
        headings: headings.map((h) => h.text),
        wordCount,
        estimatedReadTime,
      };
    }

    return { html, metadata };
  }
};

/**
 * Extract headings dari markdown untuk metadata
 */
const extractHeadings = (markdown: string): Array<{ level: number; text: string; id: string }> => {
  const headings: Array<{ level: number; text: string; id: string }> = [];
  const lines = markdown.split('\n');

  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      headings.push({ level, text, id });
    }
  });

  return headings;
};

/**
 * Simple markdown to HTML conversion as fallback
 */
const convertMarkdownToHTMLSimple = (markdown: string): string => {
  let html = markdown;

  // Convert headings
  html = html.replace(/^(#{1,6})\s+(.*)$/gim, (_, hashes, text) => {
    const level = hashes.length;
    return `<h${level}>${text.trim()}</h${level}>`;
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
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Convert inline code
  html = html.replace(/`([^`]*)`/gim, '<code>$1</code>');

  // Convert code blocks
  html = html.replace(/```([^```]*)```/gims, '<pre><code>$1</code></pre>');

  // Convert blockquotes
  html = html.replace(/^>\s+(.*)$/gim, '<blockquote>$1</blockquote>');

  // Convert unordered lists
  html = html.replace(/^\*\s+(.*)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>)(?:\s*\n\s*<li>.*?<\/li>)*/gims, '<ul>$&</ul>');

  // Convert ordered lists
  html = html.replace(/^\d+\.\s+(.*)$/gim, '<li>$1</li>');

  // Convert line breaks
  html = html.replace(/\n/gim, '<br>');

  return html;
};

/**
 * Hitung jumlah kata dalam text
 */
const countWords = (text: string): number => {
  return text
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter((word) => word.length > 0).length; // Filter empty strings
};

/**
 * Generate table of contents dari headings
 */
export const generateTableOfContents = (
  headings: Array<{ level: number; text: string; id: string }>
): string => {
  if (headings.length === 0) return '';

  let toc = '<div class="table-of-contents"><h2>Table of Contents</h2><ul>';

  headings.forEach((heading) => {
    const indent = '  '.repeat(heading.level - 1);
    toc += `${indent}<li><a href="#${heading.id}">${heading.text}</a></li>`;
  });

  toc += '</ul></div>';

  return toc;
};

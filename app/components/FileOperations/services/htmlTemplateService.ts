/**
 * @fileoverview HTML template generation service
 * @author Senior Developer
 * @version 1.0.0
 */

import { HtmlTemplateConfig } from '../types/fileOperations.types';

/**
 * Default CSS styles for HTML export
 */
const DEFAULT_HTML_STYLES = `
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    color: #333;
}
h1, h2, h3, h4, h5, h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-weight: 600;
}
h1 { 
    border-bottom: 2px solid #eee; 
    padding-bottom: 0.5rem; 
}
code {
    background: #f4f4f4;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Monaco', 'Courier New', monospace;
}
pre {
    background: #f8f8f8;
    padding: 1rem;
    border-radius: 5px;
    overflow-x: auto;
}
blockquote {
    border-left: 4px solid #ddd;
    margin: 1rem 0;
    padding-left: 1rem;
    color: #666;
}
table {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
}
th, td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
}
th {
    background: #f5f5f5;
    font-weight: 600;
}
img {
    max-width: 100%;
    height: auto;
}
a {
    color: #0066cc;
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
}
`;

/**
 * Generate complete HTML document from markdown content
 */
export const generateHtmlTemplate = (config: HtmlTemplateConfig): string => {
  const { title, content, customStyles } = config;
  
  // Process markdown content for basic HTML conversion
  const processedContent = processMarkdownToHtml(content);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <style>
        ${DEFAULT_HTML_STYLES}
        ${customStyles || ''}
    </style>
</head>
<body>
    <div id="content">
        ${processedContent}
    </div>
</body>
</html>`;
};

/**
 * Basic markdown to HTML conversion
 * Note: This is a simple conversion. For full markdown parsing, consider using a library like marked.js
 */
const processMarkdownToHtml = (markdown: string): string => {
  return markdown
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
};

/**
 * Escape HTML special characters
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Generate minimal HTML template for quick exports
 */
export const generateMinimalHtmlTemplate = (title: string, content: string): string => {
  return `<!DOCTYPE html>
<html>
<head>
    <title>${escapeHtml(title)}</title>
    <meta charset="UTF-8">
</head>
<body>
    <pre>${escapeHtml(content)}</pre>
</body>
</html>`;
};

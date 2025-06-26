/**
 * Format Buttons Constants
 * Konstanta untuk semua format buttons yang tersedia di toolbar
 * 
 * @author Axel Modra
 */

import type { FormatButton, MarkdownTemplate } from '../types/toolbar.types';

/**
 * Interface untuk format button config dengan template
 */
export interface FormatButtonConfig extends Omit<FormatButton, 'action'> {
  template: string;
}

/**
 * Fungsi helper untuk membuat format button
 */
// const createFormatButton = (
//   label: string,
//   template: string,
//   tooltip: string,
//   category: ButtonCategory,
//   style?: string,
//   shortcut?: string
// ): FormatButtonConfig => ({
//   label,
//   tooltip,
//   category,
//   style,
//   shortcut,
//   template
// });

/**
 * Template markdown untuk berbagai format
 */
export const MARKDOWN_TEMPLATES: Record<string, MarkdownTemplate> = {
  h1: {
    name: 'Heading 1',
    template: '# ',
    description: 'Large heading',
    category: 'heading'
  },
  h2: {
    name: 'Heading 2',
    template: '## ',
    description: 'Medium heading',
    category: 'heading'
  },
  h3: {
    name: 'Heading 3',
    template: '### ',
    description: 'Small heading',
    category: 'heading'
  },
  bold: {
    name: 'Bold',
    template: '**bold**',
    description: 'Bold text',
    category: 'formatting'
  },
  italic: {
    name: 'Italic',
    template: '*italic*',
    description: 'Italic text',
    category: 'formatting'
  },
  inlineCode: {
    name: 'Inline Code',
    template: '`code`',
    description: 'Inline code',
    category: 'code'
  },
  codeBlock: {
    name: 'Code Block',
    template: '```javascript\n// Your code here\nconsole.log("Hello World!");\n```',
    description: 'Code block with syntax highlighting',
    category: 'code'
  },
  link: {
    name: 'Link',
    template: '[text](url)',
    description: 'Hyperlink',
    category: 'content'
  },
  image: {
    name: 'Image',
    template: '![alt](url)',
    description: 'Image embed',
    category: 'media'
  },
  quote: {
    name: 'Quote',
    template: '> quote',
    description: 'Blockquote',
    category: 'content'
  },
  unorderedList: {
    name: 'Unordered List',
    template: '- item',
    description: 'Bullet list',
    category: 'list'
  },
  orderedList: {
    name: 'Ordered List',
    template: '1. item',
    description: 'Numbered list',
    category: 'list'
  },
  table: {
    name: 'Table',
    template: '| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |',
    description: 'Table with headers',
    category: 'content'
  }
};

/**
 * Konfigurasi format buttons dengan kategori dan shortcuts
 */
export const FORMAT_BUTTON_CONFIGS: FormatButtonConfig[] = [
  {
    label: 'H1',
    template: MARKDOWN_TEMPLATES.h1.template,
    tooltip: 'Heading 1',
    category: 'heading',
    style: 'font-bold',
    shortcut: 'Ctrl+1'
  },
  {
    label: 'H2',
    template: MARKDOWN_TEMPLATES.h2.template,
    tooltip: 'Heading 2',
    category: 'heading',
    style: 'font-bold',
    shortcut: 'Ctrl+2'
  },
  {
    label: 'H3',
    template: MARKDOWN_TEMPLATES.h3.template,
    tooltip: 'Heading 3',
    category: 'heading',
    style: 'font-bold',
    shortcut: 'Ctrl+3'
  },
  {
    label: 'B',
    template: MARKDOWN_TEMPLATES.bold.template,
    tooltip: 'Bold',
    category: 'formatting',
    style: 'font-bold',
    shortcut: 'Ctrl+B'
  },
  {
    label: 'I',
    template: MARKDOWN_TEMPLATES.italic.template,
    tooltip: 'Italic',
    category: 'formatting',
    style: 'italic',
    shortcut: 'Ctrl+I'
  },
  {
    label: 'Code',
    template: MARKDOWN_TEMPLATES.inlineCode.template,
    tooltip: 'Inline Code',
    category: 'code',
    shortcut: 'Ctrl+`'
  },
  {
    label: 'Link',
    template: MARKDOWN_TEMPLATES.link.template,
    tooltip: 'Link',
    category: 'content',
    shortcut: 'Ctrl+K'
  },
  {
    label: 'Image',
    template: MARKDOWN_TEMPLATES.image.template,
    tooltip: 'Image',
    category: 'media',
    shortcut: 'Ctrl+Shift+I'
  },
  {
    label: 'Quote',
    template: MARKDOWN_TEMPLATES.quote.template,
    tooltip: 'Blockquote',
    category: 'content',
    shortcut: 'Ctrl+Shift+.'
  },
  {
    label: 'List',
    template: MARKDOWN_TEMPLATES.unorderedList.template,
    tooltip: 'Unordered List',
    category: 'list',
    shortcut: 'Ctrl+Shift+8'
  },
  {
    label: '1.',
    template: MARKDOWN_TEMPLATES.orderedList.template,
    tooltip: 'Ordered List',
    category: 'list',
    shortcut: 'Ctrl+Shift+7'
  },
  {
    label: 'Table',
    template: MARKDOWN_TEMPLATES.table.template,
    tooltip: 'Table',
    category: 'content',
    shortcut: 'Ctrl+Shift+T'
  }
];

/**
 * Grouping buttons berdasarkan kategori
 */
export const BUTTON_GROUPS = {
  heading: FORMAT_BUTTON_CONFIGS.filter(btn => btn.category === 'heading'),
  formatting: FORMAT_BUTTON_CONFIGS.filter(btn => btn.category === 'formatting'),
  code: FORMAT_BUTTON_CONFIGS.filter(btn => btn.category === 'code'),
  content: FORMAT_BUTTON_CONFIGS.filter(btn => btn.category === 'content'),
  list: FORMAT_BUTTON_CONFIGS.filter(btn => btn.category === 'list'),
  media: FORMAT_BUTTON_CONFIGS.filter(btn => btn.category === 'media')
};

/**
 * Konfigurasi responsive breakpoints
 */
export const RESPONSIVE_BREAKPOINTS = {
  mobile: {
    max: 499,
    buttonsPerRow: 3,
    showLabels: true,
    compactMode: true
  },
  smallTablet: {
    min: 500,
    max: 767,
    buttonsPerRow: 6,
    showLabels: false,
    compactMode: true
  },
  tablet: {
    min: 768,
    max: 1279,
    buttonsPerRow: 8,
    showLabels: true,
    compactMode: false
  },
  desktop: {
    min: 1280,
    buttonsPerRow: 12,
    showLabels: true,
    compactMode: false
  }
} as const;

/**
 * CSS classes untuk berbagai ukuran button
 */
export const BUTTON_SIZES = {
  mobile: {
    height: 'h-9',
    padding: 'px-3',
    text: 'text-xs',
    icon: 'h-3 w-3'
  },
  tablet: {
    height: 'h-7',
    padding: 'px-2',
    text: 'text-xs',
    icon: 'h-3 w-3'
  },
  desktop: {
    height: 'h-8',
    padding: 'px-3',
    text: 'text-xs',
    icon: 'h-4 w-4'
  }
} as const;

/**
 * Animasi dan transisi
 */
export const TOOLBAR_ANIMATIONS = {
  button: 'transition-all duration-200 hover:scale-105 active:scale-95',
  container: 'transition-all duration-300',
  separator: 'transition-opacity duration-200'
} as const;

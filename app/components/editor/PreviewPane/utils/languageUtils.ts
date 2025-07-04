/**
 * @fileoverview Utilities untuk language management dan icon mapping
 * @author Axel Modra
 */

import type { LanguageIconMap, HighlightThemeConfig } from '../types/preview.types';

/**
 * Icon mapping for each programming language
 * Uses emoji for attractive visuals
 */
export const LANGUAGE_ICONS: LanguageIconMap = {
  // Programming languages
  javascript: '🟨',
  js: '🟨',
  typescript: '🔷',
  ts: '🔷',
  python: '🐍',
  py: '🐍',
  java: '☕',
  cpp: '⚡',
  'c++': '⚡',
  c: '⚡',
  csharp: '🔷',
  'c#': '🔷',
  cs: '🔷',
  php: '🐘',
  ruby: '💎',
  rb: '💎',
  go: '🐹',
  golang: '🐹',
  rust: '🦀',
  rs: '🦀',
  swift: '🍎',
  kotlin: '🎯',
  kt: '🎯',
  scala: '🔺',
  dart: '🎯',
  flutter: '💙',
  r: '📊',
  matlab: '🔢',
  lua: '🌙',
  perl: '🐪',
  pl: '🐪',
  haskell: '🔮',
  hs: '🔮',
  clojure: '🔄',
  clj: '🔄',
  elixir: '💜',
  ex: '💜',
  erlang: '📡',
  erl: '📡',
  fsharp: '🔷',
  fs: '🔷',
  'f#': '🔷',
  ocaml: '🐫',
  ml: '🐫',
  scheme: '🔮',
  scm: '🔮',
  lisp: '🔮',

  // Web technologies
  html: '🌐',
  css: '🎨',
  scss: '🎨',
  sass: '🎨',
  less: '🎨',
  json: '📋',
  yaml: '📄',
  yml: '📄',
  xml: '📄',
  markdown: '📝',
  md: '📝',

  // Shell and config
  bash: '🐚',
  shell: '🐚',
  sh: '🐚',
  zsh: '🐚',
  powershell: '💙',
  ps1: '💙',

  // Database
  sql: '🗃️',
  mysql: '🗃️',
  postgresql: '🐘',
  sqlite: '🗃️',
  mongodb: '🍃',
  mongo: '🍃',

  // DevOps and tools
  docker: '🐳',
  dockerfile: '🐳',
  nginx: '🌐',
  apache: '🌐',
  vim: '💚',
  makefile: '🔨',
  make: '🔨',
  cmake: '🔧',
  gradle: '🔧',
  ini: '⚙️',
  toml: '⚙️',
  conf: '⚙️',
  config: '⚙️',

  // Scientific and specialized
  latex: '📖',
  tex: '📖',
  graphql: '🔗',
  gql: '🔗',
  proto: '📦',
  protobuf: '📦',
  objectivec: '🍎',
  objc: '🍎',
  x86asm: '⚙️',
  assembly: '⚙️',
  asm: '⚙️',
  verilog: '🔌',
  v: '🔌',
  vhdl: '🔌',
  fortran: '🔬',
  f90: '🔬',
  f95: '🔬',
  pascal: '📐',
  delphi: '📐',
  prolog: '🧠',

  // Framework aliases
  react: '⚛️',
  jsx: '⚛️',
  tsx: '⚛️',
  vue: '💚',
  svelte: '🧡',
  angular: '🔺',
  node: '💚',
  nodejs: '💚',
  nextjs: '⚫',
  express: '🚂',
  django: '🐍',
  flask: '🐍',
  fastapi: '⚡',
  spring: '🍃',
  laravel: '🎭',
  rails: '💎',
  gin: '🐹',
  actix: '🦀',
  rocket: '🦀',
};

/**
 * Mendapatkan icon untuk bahasa tertentu
 * @param language - Nama bahasa
 * @returns Icon emoji atau default
 */
export const getLanguageIcon = (language: string): string => {
  return LANGUAGE_ICONS[language.toLowerCase()] || '📄';
};

/**
 * Configuration untuk highlight.js themes
 */
export const HIGHLIGHT_THEMES: Record<string, HighlightThemeConfig> = {
  light: {
    id: 'github',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css',
    isDark: false,
  },
  dark: {
    id: 'github-dark',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css',
    isDark: true,
  },
  ocean: {
    id: 'atom-one-dark',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-dark.min.css',
    isDark: true,
  },
  forest: {
    id: 'green-screen',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/base16/green-screen.min.css',
    isDark: true,
  },
  sunset: {
    id: 'solarized-dark',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/base16/solarized-dark.min.css',
    isDark: true,
  },
  purple: {
    id: 'tomorrow-night',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/base16/tomorrow-night.min.css',
    isDark: true,
  },
  rose: {
    id: 'atelier-heath-light',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/base16/atelier-heath-light.min.css',
    isDark: false,
  },
};

/**
 * Mendapatkan theme configuration berdasarkan mode dan theme
 * @param isDarkMode - Apakah dalam dark mode
 * @param themeId - ID theme
 * @returns Theme configuration
 */
export const getHighlightTheme = (isDarkMode: boolean, themeId?: string): HighlightThemeConfig => {
  if (themeId && HIGHLIGHT_THEMES[themeId]) {
    return HIGHLIGHT_THEMES[themeId];
  }

  return isDarkMode ? HIGHLIGHT_THEMES.dark : HIGHLIGHT_THEMES.light;
};

/**
 * Ekstrak text content dari React element untuk copy functionality
 * @param element - React element atau string
 * @returns Text content
 */
export const extractTextContent = (element: unknown): string => {
  if (typeof element === 'string') return element;
  if (typeof element === 'number') return element.toString();
  if (Array.isArray(element)) {
    return element.map(extractTextContent).join('');
  }
  if (element && typeof element === 'object' && 'props' in element && element.props) {
    return extractTextContent((element.props as { children?: unknown }).children);
  }
  return '';
};

/**
 * Copy text ke clipboard dengan visual feedback
 * @param text - Text yang akan di-copy
 * @param button - Button element untuk feedback
 */
export const copyToClipboard = async (text: string, button?: HTMLButtonElement): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);

    if (button) {
      const originalText = button.textContent;
      button.textContent = '✅ Copied!';
      button.style.backgroundColor = '#10b981';
      button.style.color = 'white';

      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
        button.style.color = '';
      }, 1500);
    }
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

/**
 * Mendapatkan responsive options berdasarkan device type
 * @param isMobile - Apakah mobile
 * @param isTablet - Apakah tablet
 * @returns Responsive options
 */
export const getResponsiveOptions = (isMobile: boolean, isTablet: boolean) => {
  return {
    padding: isMobile ? '1rem' : isTablet ? '1.5rem' : '1.5rem',
    fontSize: isMobile ? '14px' : isTablet ? '15px' : '16px',
    lineHeight: isMobile ? 1.5 : isTablet ? 1.6 : 1.7,
    codeSize: isMobile || isTablet ? '13px' : '14px',
  };
};

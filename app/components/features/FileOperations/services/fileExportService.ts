/**
 * @fileoverview File export service for handling various export formats
 * @author Axel Modra
 */

import { safeConsole } from '@/utils/console';
import type {
  ExportConfig,
  ExportResult,
  FileOperationCallbacks,
  JsonExportData,
} from '../types/fileOperations.types';
import { generateHtmlTemplate } from './htmlTemplateService';

/**
 * Safe file saver function that works with SSR
 */
const safeFileSaver = async (blob: Blob, filename: string): Promise<void> => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    const { saveAs } = await import('file-saver');
    saveAs(blob, filename);
  } else {
    // In SSR environment, we can't save files
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.warn('File saving is not available in server-side rendering environment');
    });
  }
};

/**
 * Export markdown file
 */
export const exportMarkdown = async (
  config: ExportConfig,
  callbacks: FileOperationCallbacks
): Promise<ExportResult> => {
  try {
    const blob = new Blob([config.content], {
      type: 'text/markdown;charset=utf-8',
    });

    await safeFileSaver(blob, config.fileName);

    callbacks.onSuccess(`${config.fileName} has been downloaded.`);

    return {
      success: true,
      fileName: config.fileName,
    };
  } catch {
    const errorMessage = 'Failed to export markdown file';
    callbacks.onError(errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Export HTML file with styled template
 */
export const exportHtml = async (
  config: ExportConfig,
  callbacks: FileOperationCallbacks
): Promise<ExportResult> => {
  try {
    const title = config.fileName.replace('.md', '');
    const htmlContent = generateHtmlTemplate({
      title,
      content: config.content,
    });

    const blob = new Blob([htmlContent], {
      type: 'text/html;charset=utf-8',
    });

    const htmlFileName = config.fileName.replace('.md', '.html');
    await safeFileSaver(blob, htmlFileName);

    callbacks.onSuccess('Your document has been exported as HTML.');

    return {
      success: true,
      fileName: htmlFileName,
    };
  } catch {
    const errorMessage = 'Failed to export HTML file';
    callbacks.onError(errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Export JSON file with metadata
 */
export const exportJson = async (
  config: ExportConfig,
  callbacks: FileOperationCallbacks
): Promise<ExportResult> => {
  try {
    // Debug logging (development only)
    safeConsole.log('JSON Export - Config received:');
    safeConsole.log('  fileName:', config.fileName);
    safeConsole.log('  contentLength:', config.content?.length || 0);
    safeConsole.log('  contentPreview:', config.content?.substring(0, 100) || 'No content');

    // Validate content
    const content = config.content || '';
    const trimmedContent = content.trim();

    // Calculate more accurate word count
    const wordCount =
      trimmedContent === ''
        ? 0
        : trimmedContent.split(/\s+/).filter((word) => word.length > 0).length;

    // Calculate character count
    const characterCount = content.length;
    const characterCountNoSpaces = content.replace(/\s/g, '').length;

    // Calculate line count
    const lineCount = content.split('\n').length;

    // Debug word count calculation (development only)
    safeConsole.log('Word count calculation:', {
      wordCount,
      characterCount,
      lineCount,
    });

    // Extract basic metadata from markdown content
    const lines = content.split('\n');
    const title =
      lines
        .find((line) => line.startsWith('# '))
        ?.replace('# ', '')
        .trim() || config.fileName.replace('.md', '');

    // Extract headings for structure overview
    const headings = lines
      .filter((line) => line.match(/^#{1,6}\s/))
      .map((line) => {
        const level = line.match(/^(#{1,6})/)?.[1].length || 1;
        const text = line.replace(/^#{1,6}\s/, '').trim();
        return { level, text };
      })
      .slice(0, 20); // Limit to first 20 headings

    // Extract code blocks count
    const codeBlockCount = (content.match(/```/g) || []).length / 2;

    // Extract links count
    const linkCount = (content.match(/\[.*?\]\(.*?\)/g) || []).length;

    // Extract images count
    const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;

    // Extract tables count
    const tableCount =
      (content.match(/\|.*\|/g) || []).length > 0
        ? content.split('\n').filter((line) => line.includes('|')).length > 0
          ? 1
          : 0
        : 0;

    // Extract list items count
    const listItemCount =
      (content.match(/^[\s]*[-*+]\s/gm) || []).length +
      (content.match(/^[\s]*\d+\.\s/gm) || []).length;

    // Extract blockquotes count
    const blockquoteCount = (content.match(/^>/gm) || []).length;

    // Calculate reading time (average 200 words per minute)
    const readingTimeMinutes = Math.ceil(wordCount / 200);

    const jsonData: JsonExportData = {
      fileName: config.fileName,
      title,
      content: config.content,
      metadata: {
        wordCount,
        characterCount,
        characterCountNoSpaces,
        lineCount,
        codeBlockCount,
        linkCount,
        imageCount,
        headingCount: headings.length,
        tableCount,
        listItemCount,
        blockquoteCount,
        readingTimeMinutes,
      },
      structure: {
        headings: headings,
      },
      exportInfo: {
        createdAt: new Date().toISOString(),
        version: '2.0',
        exportedBy: 'MarkDown Ultra Remix',
        format: 'Enhanced JSON Export',
      },
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json;charset=utf-8',
    });

    const jsonFileName = config.fileName.replace('.md', '.json');
    await safeFileSaver(blob, jsonFileName);

    callbacks.onSuccess(`JSON exported with ${wordCount} words and ${lineCount} lines.`);

    return {
      success: true,
      fileName: jsonFileName,
    };
  } catch (error) {
    safeConsole.error('JSON export error:', error);
    const errorMessage = 'Failed to export JSON file';
    callbacks.onError(errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Generic export function that handles different formats
 */
export const exportFile = async (
  config: ExportConfig,
  callbacks: FileOperationCallbacks
): Promise<ExportResult> => {
  switch (config.format) {
    case 'markdown':
      return exportMarkdown(config, callbacks);
    case 'html':
      return exportHtml(config, callbacks);
    case 'json':
      return exportJson(config, callbacks);
    default: {
      const errorMessage = `Unsupported export format: ${config.format}`;
      callbacks.onError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
};

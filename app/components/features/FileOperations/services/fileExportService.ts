/**
 * @fileoverview File export service for handling various export formats
 * @author Senior Developer
 * @version 1.0.0
 */

import * as fileSaver from 'file-saver';
import { 
  ExportConfig, 
  JsonExportData, 
  ExportResult, 
  FileOperationCallbacks 
} from '../types/fileOperations.types';
import { generateHtmlTemplate } from './htmlTemplateService';

/**
 * Export markdown file
 */
export const exportMarkdown = async (
  config: ExportConfig,
  callbacks: FileOperationCallbacks
): Promise<ExportResult> => {
  try {
    const blob = new Blob([config.content], { 
      type: 'text/markdown;charset=utf-8' 
    });
    
    fileSaver.saveAs(blob, config.fileName);
    
    callbacks.onSuccess(`${config.fileName} has been downloaded.`);
    
    return {
      success: true,
      fileName: config.fileName
    };
  } catch {
    const errorMessage = 'Failed to export markdown file';
    callbacks.onError(errorMessage);
    
    return {
      success: false,
      error: errorMessage
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
      content: config.content
    });
    
    const blob = new Blob([htmlContent], { 
      type: 'text/html;charset=utf-8' 
    });
    
    const htmlFileName = config.fileName.replace('.md', '.html');
    fileSaver.saveAs(blob, htmlFileName);
    
    callbacks.onSuccess('Your document has been exported as HTML.');
    
    return {
      success: true,
      fileName: htmlFileName
    };
  } catch {
    const errorMessage = 'Failed to export HTML file';
    callbacks.onError(errorMessage);
    
    return {
      success: false,
      error: errorMessage
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
    const jsonData: JsonExportData = {
      fileName: config.fileName,
      content: config.content,
      wordCount: config.content.trim().split(/\s+/).length,
      createdAt: new Date().toISOString(),
      version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    
    const jsonFileName = config.fileName.replace('.md', '.json');
    fileSaver.saveAs(blob, jsonFileName);
    
    callbacks.onSuccess('Your document has been exported as JSON.');
    
    return {
      success: true,
      fileName: jsonFileName
    };
  } catch {
    const errorMessage = 'Failed to export JSON file';
    callbacks.onError(errorMessage);
    
    return {
      success: false,
      error: errorMessage
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
        error: errorMessage
      };
    }
  }
};

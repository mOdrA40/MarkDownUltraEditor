/**
 * @fileoverview File import service for handling file uploads
 * @author Axel Modra
 */

import type { FileImportResult, FileOperationCallbacks } from '../types/fileOperations.types';

/**
 * Supported file types for import
 */
export const SUPPORTED_FILE_TYPES = ['.md', '.txt', '.markdown'] as const;

/**
 * Type for supported file extensions
 */
type SupportedFileType = (typeof SUPPORTED_FILE_TYPES)[number];

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate file before import
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}` as SupportedFileType;
  if (!SUPPORTED_FILE_TYPES.includes(fileExtension)) {
    return {
      valid: false,
      error: `Unsupported file type. Supported types: ${SUPPORTED_FILE_TYPES.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Import file and return content
 */
export const importFile = async (
  file: File,
  callbacks: FileOperationCallbacks
): Promise<FileImportResult | null> => {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.valid) {
      callbacks.onError(validation.error || 'Unknown validation error');
      return null;
    }

    // Read file content
    const content = await readFileContent(file);

    const result: FileImportResult = {
      content,
      fileName: file.name,
      size: file.size,
      type: file.type,
    };

    callbacks.onSuccess(`${file.name} has been loaded successfully.`);

    return result;
  } catch (error) {
    const errorMessage = `Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`;
    callbacks.onError(errorMessage);
    return null;
  }
};

/**
 * Read file content as text
 */
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        resolve(content);
      } else {
        reject(new Error('Failed to read file content'));
      }
    };

    reader.onerror = () => {
      reject(new Error('File reading error'));
    };

    reader.readAsText(file);
  });
};

/**
 * Handle file input change event
 */
export const handleFileInputChange = async (
  event: React.ChangeEvent<HTMLInputElement>,
  onLoad: (content: string, fileName: string) => void,
  callbacks: FileOperationCallbacks
): Promise<void> => {
  const file = event.target.files?.[0];
  if (!file) return;

  const result = await importFile(file, callbacks);
  if (result) {
    onLoad(result.content, result.fileName);
  }

  // Clear input value to allow re-importing the same file
  event.target.value = '';
};

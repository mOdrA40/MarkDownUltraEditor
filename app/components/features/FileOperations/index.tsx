/**
 * @fileoverview Main FileOperations component - refactored with service-based architecture
 * @author Axel Modra
 */

import type React from 'react';
import { FileDropdownMenu } from './components/FileDropdownMenu';
import { FileInput } from './components/FileInput';
import { useFileOperations } from './hooks/useFileOperations';
import type { FileOperationsProps } from './types/fileOperations.types';

/**
 * Main FileOperations component with modular service-based architecture
 * Handles file import/export operations with proper separation of concerns
 */
export const FileOperations: React.FC<FileOperationsProps> = ({
  markdown,
  fileName,
  onLoad,
  isMobileNav = false,
  currentTheme,
}) => {
  // Use custom hook for file operations
  const {
    fileInputRef,
    handleSaveMarkdown,
    handleExportHtml,
    handleExportJson,
    handleLoadFile,
    handleFileLoad,
  } = useFileOperations({
    markdown,
    fileName,
    onLoad,
  });

  return (
    <>
      {/* File Operations Dropdown Menu */}
      <FileDropdownMenu
        isMobileNav={isMobileNav}
        onLoadFile={handleLoadFile}
        onSaveMarkdown={handleSaveMarkdown}
        onExportHtml={handleExportHtml}
        onExportJson={handleExportJson}
        currentTheme={currentTheme}
      />

      {/* Hidden File Input */}
      <FileInput fileInputRef={fileInputRef} onChange={handleFileLoad} />
    </>
  );
};

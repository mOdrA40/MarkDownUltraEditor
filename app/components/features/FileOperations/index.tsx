/**
 * @fileoverview Main FileOperations component - refactored with service-based architecture
 * @author Senior Developer
 * @version 2.0.0
 */

import React from 'react';
import { FileOperationsProps } from './types/fileOperations.types';
import { useFileOperations } from './hooks/useFileOperations';
import { FileDropdownMenu } from './components/FileDropdownMenu';
import { FileInput } from './components/FileInput';

/**
 * Main FileOperations component with modular service-based architecture
 * Handles file import/export operations with proper separation of concerns
 */
export const FileOperations: React.FC<FileOperationsProps> = ({
  markdown,
  fileName,
  onLoad,
  isMobileNav = false
}) => {
  // Use custom hook for file operations
  const {
    fileInputRef,
    handleSaveMarkdown,
    handleExportHtml,
    handleExportJson,
    handleLoadFile,
    handleFileLoad
  } = useFileOperations({
    markdown,
    fileName,
    onLoad
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
      />

      {/* Hidden File Input */}
      <FileInput
        fileInputRef={fileInputRef}
        onChange={handleFileLoad}
      />
    </>
  );
};

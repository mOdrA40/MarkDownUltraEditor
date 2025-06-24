/**
 * @fileoverview Hidden file input component for file uploads
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { SUPPORTED_FILE_TYPES } from '../services/fileImportService';

interface FileInputProps {
  /** File input reference */
  fileInputRef: React.RefObject<HTMLInputElement>;
  /** File change handler */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Hidden file input component for file uploads
 */
export const FileInput: React.FC<FileInputProps> = ({
  fileInputRef,
  onChange
}) => {
  return (
    <input
      ref={fileInputRef}
      type="file"
      accept={SUPPORTED_FILE_TYPES.join(',')}
      onChange={onChange}
      style={{ display: 'none' }}
      aria-label="File input for markdown documents"
    />
  );
};

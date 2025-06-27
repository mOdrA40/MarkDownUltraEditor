/**
 * @fileoverview Custom hook for file operations
 * @author Axel Modra
 */

import { useRef } from 'react';
import { useToast } from "@/hooks/core";
import { exportFile } from '../services/fileExportService';
import { handleFileInputChange } from '../services/fileImportService';
import { ExportConfig, FileOperationCallbacks } from '../types/fileOperations.types';

interface UseFileOperationsProps {
  /** Markdown content */
  markdown: string;
  /** Current file name */
  fileName: string;
  /** File load callback */
  onLoad: (content: string, fileName: string) => void;
}

/**
 * Custom hook for managing file operations
 */
export const useFileOperations = ({
  markdown,
  fileName,
  onLoad
}: UseFileOperationsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Create callbacks for file operations
  const callbacks: FileOperationCallbacks = {
    onSuccess: (message: string) => {
      toast({
        title: "Success",
        description: message,
      });
    },
    onError: (error: string) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    }
  };

  /**
   * Handle markdown export
   */
  const handleSaveMarkdown = async (): Promise<void> => {
    const config: ExportConfig = {
      content: markdown,
      fileName,
      format: 'markdown'
    };

    await exportFile(config, {
      onSuccess: (message) => {
        toast({
          title: "File saved",
          description: message,
        });
      },
      onError: callbacks.onError
    });
  };

  /**
   * Handle HTML export
   */
  const handleExportHtml = async (): Promise<void> => {
    const config: ExportConfig = {
      content: markdown,
      fileName,
      format: 'html'
    };

    await exportFile(config, {
      onSuccess: () => {
        toast({
          title: "HTML exported",
          description: "Your document has been exported as HTML.",
        });
      },
      onError: callbacks.onError
    });
  };

  /**
   * Handle JSON export
   */
  const handleExportJson = async (): Promise<void> => {
    // Debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('useFileOperations: handleExportJson called');
      console.log('  markdown length:', markdown.length);
      console.log('  fileName:', fileName);
    }

    // Small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 100));

    // Fallback: if markdown is empty, try to get from localStorage
    let contentToExport = markdown;
    if (!contentToExport || contentToExport.trim().length === 0) {
      console.log('  markdown is empty, trying localStorage fallback');
      try {
        const savedContent = localStorage.getItem('markdownEditor_content');
        if (savedContent) {
          contentToExport = savedContent;
          console.log('  fallback content length:', contentToExport.length);
          console.log('  fallback content preview:', contentToExport.substring(0, 100));
        } else {
          console.log('  no content found in localStorage');
        }
      } catch (error) {
        console.warn('  failed to get fallback content:', error);
      }
    }

    const config: ExportConfig = {
      content: contentToExport,
      fileName,
      format: 'json'
    };

    await exportFile(config, {
      onSuccess: () => {
        toast({
          title: "JSON exported",
          description: "Your document has been exported as JSON.",
        });
      },
      onError: callbacks.onError
    });
  };

  /**
   * Handle file load trigger
   */
  const handleLoadFile = (): void => {
    fileInputRef.current?.click();
  };

  /**
   * Handle file input change
   */
  const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    await handleFileInputChange(event, onLoad, {
      onSuccess: (message) => {
        toast({
          title: "File loaded",
          description: message,
        });
      },
      onError: callbacks.onError
    });
  };

  return {
    fileInputRef,
    handleSaveMarkdown,
    handleExportHtml,
    handleExportJson,
    handleLoadFile,
    handleFileLoad
  };
};

/**
 * @fileoverview Custom hook for file operations
 * @author Senior Developer
 * @version 1.0.0
 */

import { useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
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
    const config: ExportConfig = {
      content: markdown,
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

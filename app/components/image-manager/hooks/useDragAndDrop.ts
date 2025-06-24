/**
 * Custom hook untuk menangani drag and drop functionality
 * Menangani drag events, validasi files, dan integrasi dengan upload system
 */

import { useState, useCallback, useRef } from 'react';
import { getValidFiles, getInvalidFiles } from '../utils/imageValidation';
import { useToast } from '@/hooks/use-toast';

interface DragDropOptions {
  onFilesDropped?: (files: File[]) => void;
  onInvalidFiles?: (invalidFiles: Array<{ file: File; error: string }>) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export const useDragAndDrop = (options: DragDropOptions = {}) => {
  const {
    onFilesDropped,
    onInvalidFiles,
    maxFiles = 10,
    disabled = false
  } = options;

  const [dragActive, setDragActive] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  /**
   * Handle drag enter event
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    setDragCounter(prev => prev + 1);
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, [disabled]);

  /**
   * Handle drag leave event
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setDragActive(false);
      }
      return newCounter;
    });
  }, [disabled]);

  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    // Set dropEffect untuk memberikan visual feedback
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, [disabled]);

  /**
   * Handle drop event
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragActive(false);
    setDragCounter(0);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) {
      return;
    }

    const fileArray = Array.from(files);

    // Validasi jumlah file
    if (fileArray.length > maxFiles) {
      toast({
        title: "Terlalu banyak file",
        description: `Maksimal ${maxFiles} file dapat diupload sekaligus`,
        variant: "destructive"
      });
      return;
    }

    // Validasi dan pisahkan file valid/invalid
    const validFiles = getValidFiles(fileArray);
    const invalidFiles = getInvalidFiles(fileArray);

    // Handle invalid files
    if (invalidFiles.length > 0) {
      onInvalidFiles?.(invalidFiles);
      
      // Tampilkan notifikasi untuk file invalid
      invalidFiles.forEach(({ file, error }) => {
        toast({
          title: "File tidak valid",
          description: `${file.name}: ${error}`,
          variant: "destructive"
        });
      });
    }

    // Handle valid files
    if (validFiles.length > 0) {
      onFilesDropped?.(validFiles);
    } else if (invalidFiles.length > 0) {
      toast({
        title: "Tidak ada file valid",
        description: "Semua file yang di-drop tidak valid",
        variant: "destructive"
      });
    }
  }, [disabled, maxFiles, onFilesDropped, onInvalidFiles, toast]);

  /**
   * Reset drag state
   */
  const resetDragState = useCallback(() => {
    setDragActive(false);
    setDragCounter(0);
  }, []);

  /**
   * Programmatically trigger file selection
   */
  const openFileDialog = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const fileArray = Array.from(target.files);
        
        if (fileArray.length > maxFiles) {
          toast({
            title: "Terlalu banyak file",
            description: `Maksimal ${maxFiles} file dapat diupload sekaligus`,
            variant: "destructive"
          });
          return;
        }

        const validFiles = getValidFiles(fileArray);
        const invalidFiles = getInvalidFiles(fileArray);

        if (invalidFiles.length > 0) {
          onInvalidFiles?.(invalidFiles);
          invalidFiles.forEach(({ file, error }) => {
            toast({
              title: "File tidak valid",
              description: `${file.name}: ${error}`,
              variant: "destructive"
            });
          });
        }

        if (validFiles.length > 0) {
          onFilesDropped?.(validFiles);
        }
      }
    };
    
    input.click();
  }, [maxFiles, onFilesDropped, onInvalidFiles, toast]);

  /**
   * Check if drag contains valid files
   */
  const isDragValid = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.items) return false;
    
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      const item = e.dataTransfer.items[i];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        return true;
      }
    }
    
    return false;
  }, []);

  /**
   * Get drag zone props untuk spread ke element
   */
  const getDragZoneProps = useCallback(() => ({
    ref: dropZoneRef,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    className: `
      transition-all duration-300 ease-in-out
      ${dragActive 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]' 
        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `
  }), [dragActive, disabled, handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  /**
   * Get overlay props untuk drag overlay
   */
  const getDragOverlayProps = useCallback(() => ({
    className: `
      absolute inset-0 flex items-center justify-center 
      bg-blue-50/80 dark:bg-blue-950/40 backdrop-blur-sm rounded-lg z-10
      transition-opacity duration-300
      ${dragActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `
  }), [dragActive]);

  return {
    // State
    dragActive,
    dragCounter,
    dropZoneRef,
    
    // Event handlers
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    
    // Utilities
    resetDragState,
    openFileDialog,
    isDragValid,
    getDragZoneProps,
    getDragOverlayProps,
    
    // Status
    isDisabled: disabled
  };
};

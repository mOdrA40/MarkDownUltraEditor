/**
 * @fileoverview Custom hook for canvas operations
 * @author Senior Developer
 * @version 1.0.0
 */

import { useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  CanvasState, 
  ImageFilters, 
  ImageTransform, 
  HistoryState 
} from '../types/imageEditor.types';
import { 
  initializeCanvas, 
  applyFiltersToCanvas, 
  exportCanvasAsDataURL, 
  loadImageFromDataURL 
} from '../services/canvasService';

interface UseCanvasOperationsProps {
  canvasState: CanvasState;
  filters: ImageFilters;
  transform: ImageTransform;
  historyState: HistoryState;
  setHistoryState: (state: HistoryState) => void;
  imageUrl: string;
  isOpen: boolean;
}

/**
 * Custom hook for canvas operations
 */
export const useCanvasOperations = ({
  canvasState,
  filters,
  historyState,
  setHistoryState,
  imageUrl,
  isOpen
}: Omit<UseCanvasOperationsProps, 'transform'>) => {
  const { toast } = useToast();
  const { ctx, originalImage, canvasRef } = canvasState;
  const { history, historyIndex } = historyState;

  /**
   * Save current canvas state to history
   */
  const saveToHistory = useCallback((): void => {
    if (!canvasRef.current) return;

    const dataURL = exportCanvasAsDataURL(canvasRef.current);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(dataURL);

    setHistoryState({
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  }, [canvasRef, history, historyIndex, setHistoryState]);

  /**
   * Initialize canvas when component opens
   */
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Load original image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      initializeCanvas(canvas, img, context);
      saveToHistory();
    };
    img.src = imageUrl;

  }, [isOpen, imageUrl, saveToHistory, canvasRef]);

  /**
   * Apply filters to canvas
   */
  const applyFilters = useCallback((): void => {
    if (!ctx || !originalImage || !canvasRef.current) return;
    
    applyFiltersToCanvas(canvasRef.current, originalImage, ctx, filters);
  }, [ctx, originalImage, canvasRef, filters]);

  /**
   * Undo operation
   */
  const undo = useCallback((): void => {
    if (historyIndex > 0 && canvasRef.current && ctx) {
      const prevState = history[historyIndex - 1];
      loadImageFromDataURL(prevState, (img) => {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx.drawImage(img, 0, 0);
        setHistoryState({
          history,
          historyIndex: historyIndex - 1
        });
      });
    }
  }, [historyIndex, canvasRef, ctx, history, setHistoryState]);

  /**
   * Redo operation
   */
  const redo = useCallback((): void => {
    if (historyIndex < history.length - 1 && canvasRef.current && ctx) {
      const nextState = history[historyIndex + 1];
      loadImageFromDataURL(nextState, (img) => {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx.drawImage(img, 0, 0);
        setHistoryState({
          history,
          historyIndex: historyIndex + 1
        });
      });
    }
  }, [historyIndex, canvasRef, ctx, history, setHistoryState]);

  /**
   * Save edited image
   */
  const saveImage = useCallback((onSave: (dataURL: string) => void): void => {
    if (!canvasRef.current) return;

    try {
      const dataURL = exportCanvasAsDataURL(canvasRef.current, 'image/png', 1);
      onSave(dataURL);
      
      toast({
        title: "Image saved",
        description: "Your edited image has been saved successfully.",
      });
    } catch {
      toast({
        title: "Save failed",
        description: "Failed to save the edited image.",
        variant: "destructive"
      });
    }
  }, [canvasRef, toast]);

  /**
   * Download edited image
   */
  const downloadImage = useCallback((imageName: string): void => {
    if (!canvasRef.current) return;

    const dataURL = exportCanvasAsDataURL(canvasRef.current, 'image/png', 1);
    
    const link = document.createElement('a');
    link.download = `edited_${imageName}`;
    link.href = dataURL;
    link.click();

    toast({
      title: "Image downloaded",
      description: "Your edited image has been downloaded.",
    });
  }, [canvasRef, toast]);

  /**
   * Apply filters when they change
   */
  useEffect(() => {
    applyFilters();
  }, [applyFilters, filters]);

  /**
   * Update canvas tool settings when tool changes
   */
  useEffect(() => {
    if (ctx) {
      ctx.strokeStyle = '#000000'; // Will be overridden during drawing
      ctx.lineWidth = 1; // Will be overridden during drawing
    }
  }, [ctx]);

  return {
    saveToHistory,
    applyFilters,
    undo,
    redo,
    saveImage,
    downloadImage,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
};

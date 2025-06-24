/**
 * @fileoverview Main custom hook for image editor state management
 * @author Senior Developer
 * @version 1.0.0
 */

import { useState, useRef } from 'react';
import { 
  AnnotationTool, 
  ImageFilters, 
  ImageTransform, 
  CanvasState 
} from '../types/imageEditor.types';

/**
 * Main custom hook for image editor state management
 */
export const useImageEditor = () => {
  // Canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Tool state
  const [currentTool, setCurrentTool] = useState<AnnotationTool>({
    type: 'brush',
    color: '#ff0000',
    size: 5
  });

  // Filter state
  const [filters, setFilters] = useState<ImageFilters>({
    brightness: 100,
    contrast: 100,
    saturation: 100
  });

  // Transform state
  const [transform, setTransform] = useState<ImageTransform>({
    rotation: 0,
    flipH: false,
    flipV: false
  });

  // History state
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  /**
   * Update current tool
   */
  const updateTool = (updates: Partial<AnnotationTool>): void => {
    setCurrentTool(prev => ({ ...prev, ...updates }));
  };

  /**
   * Update filters
   */
  const updateFilters = (updates: Partial<ImageFilters>): void => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  /**
   * Update transform
   */
  const updateTransform = (updates: Partial<ImageTransform>): void => {
    setTransform(prev => ({ ...prev, ...updates }));
  };

  /**
   * Reset all settings to default
   */
  const resetSettings = (): void => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100
    });
    setTransform({
      rotation: 0,
      flipH: false,
      flipV: false
    });
    setCurrentTool({
      type: 'brush',
      color: '#ff0000',
      size: 5
    });
  };

  /**
   * Get canvas state
   */
  const getCanvasState = (): CanvasState => ({
    ctx,
    originalImage,
    canvasRef,
    isDrawing
  });

  return {
    // Canvas state
    canvasRef,
    ctx,
    setCtx,
    originalImage,
    setOriginalImage,
    isDrawing,
    setIsDrawing,
    
    // Tool state
    currentTool,
    setCurrentTool,
    updateTool,
    
    // Filter state
    filters,
    setFilters,
    updateFilters,
    
    // Transform state
    transform,
    setTransform,
    updateTransform,
    
    // History state
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    
    // Utility functions
    resetSettings,
    getCanvasState
  };
};

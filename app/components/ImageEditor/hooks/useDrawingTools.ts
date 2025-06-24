/**
 * @fileoverview Custom hook for drawing tools functionality
 * @author Senior Developer
 * @version 1.0.0
 */

import { useCallback } from 'react';
import {
  AnnotationTool,
  CanvasState
} from '../types/imageEditor.types';
import { 
  getMouseCoordinates, 
  startDrawing, 
  continueDrawing 
} from '../services/canvasService';
import { 
  addTextAnnotation, 
  addRectangleAnnotation, 
  addCircleAnnotation, 
  addArrowAnnotation 
} from '../services/annotationService';

interface UseDrawingToolsProps {
  canvasState: CanvasState;
  currentTool: AnnotationTool;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  saveToHistory: () => void;
}

/**
 * Custom hook for drawing tools functionality
 */
export const useDrawingTools = ({
  canvasState,
  currentTool,
  isDrawing,
  setIsDrawing,
  saveToHistory
}: UseDrawingToolsProps) => {
  const { ctx, canvasRef } = canvasState;

  /**
   * Handle mouse down event
   */
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!ctx || !canvasRef.current) return;

    const coordinates = getMouseCoordinates(e, canvasRef.current);

    if (currentTool.type === 'brush') {
      setIsDrawing(true);
      startDrawing(ctx, coordinates);
    }
  }, [ctx, canvasRef, currentTool.type, setIsDrawing]);

  /**
   * Handle mouse move event
   */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!isDrawing || !ctx || !canvasRef.current) return;

    const coordinates = getMouseCoordinates(e, canvasRef.current);
    continueDrawing(ctx, coordinates, currentTool.color, currentTool.size);
  }, [isDrawing, ctx, canvasRef, currentTool.color, currentTool.size]);

  /**
   * Handle mouse up event
   */
  const handleMouseUp = useCallback((): void => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  }, [isDrawing, setIsDrawing, saveToHistory]);

  /**
   * Add text annotation
   */
  const addText = useCallback((): void => {
    if (!ctx) return;
    addTextAnnotation(ctx, currentTool);
    saveToHistory();
  }, [ctx, currentTool, saveToHistory]);

  /**
   * Add shape annotation
   */
  const addShape = useCallback((shapeType: 'rectangle' | 'circle'): void => {
    if (!ctx) return;

    if (shapeType === 'rectangle') {
      addRectangleAnnotation(ctx, currentTool);
    } else {
      addCircleAnnotation(ctx, currentTool);
    }
    
    saveToHistory();
  }, [ctx, currentTool, saveToHistory]);

  /**
   * Add arrow annotation
   */
  const addArrow = useCallback((): void => {
    if (!ctx) return;
    addArrowAnnotation(ctx, currentTool);
    saveToHistory();
  }, [ctx, currentTool, saveToHistory]);

  /**
   * Change tool type
   */
  const changeTool = useCallback((type: AnnotationTool['type']): void => {
    // This would be handled by the parent component
    // but we can provide validation here
    const validTypes: AnnotationTool['type'][] = ['text', 'rectangle', 'circle', 'arrow', 'brush'];
    if (!validTypes.includes(type)) {
      console.warn(`Invalid tool type: ${type}`);
      return;
    }
  }, []);

  /**
   * Change tool color
   */
  const changeColor = useCallback((color: string): void => {
    // Validate color format (basic validation)
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      console.warn(`Invalid color format: ${color}`);
      return;
    }
  }, []);

  /**
   * Change tool size
   */
  const changeSize = useCallback((size: number): void => {
    // Validate size range
    if (size < 1 || size > 50) {
      console.warn(`Invalid tool size: ${size}. Must be between 1 and 50.`);
      return;
    }
  }, []);

  return {
    // Mouse event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    
    // Annotation functions
    addText,
    addShape,
    addArrow,
    
    // Tool change functions
    changeTool,
    changeColor,
    changeSize
  };
};

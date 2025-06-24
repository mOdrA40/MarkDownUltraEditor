/**
 * @fileoverview Main ImageEditor component - refactored with modular architecture
 * @author Senior Developer
 * @version 2.0.0
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Palette } from "lucide-react";
import { ImageEditorProps } from "./types/imageEditor.types";
import { useImageEditor } from "./hooks/useImageEditor";
import { useCanvasOperations } from "./hooks/useCanvasOperations";
import { useDrawingTools } from "./hooks/useDrawingTools";
import { ToolsPanel } from "./components/ToolsPanel";
import { CanvasArea } from "./components/CanvasArea";
import { ActionButtons } from "./components/ActionButtons";

/**
 * Main ImageEditor component with modular architecture
 * Supports drawing, annotations, filters, transforms, and history management
 */
export const ImageEditor: React.FC<ImageEditorProps> = ({
  imageUrl,
  imageName,
  isOpen,
  onClose,
  onSave
}) => {
  // Main state management
  const {
    canvasRef,
    ctx,
    setCtx,
    setOriginalImage,
    isDrawing,
    setIsDrawing,
    currentTool,
    updateTool,
    filters,
    updateFilters,
    transform,
    updateTransform,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    getCanvasState
  } = useImageEditor();

  // Canvas operations
  const {
    saveToHistory,
    applyFilters,
    undo,
    redo,
    saveImage,
    downloadImage,
    canUndo,
    canRedo
  } = useCanvasOperations({
    canvasState: getCanvasState(),
    filters,
    historyState: { history, historyIndex },
    setHistoryState: ({ history: newHistory, historyIndex: newIndex }) => {
      setHistory(newHistory);
      setHistoryIndex(newIndex);
    },
    imageUrl,
    isOpen
  });

  // Drawing tools
  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useDrawingTools({
    canvasState: getCanvasState(),
    currentTool,
    isDrawing,
    setIsDrawing,
    saveToHistory
  });

  // Initialize canvas context when dialog opens
  React.useEffect(() => {
    if (isOpen && canvasRef.current && !ctx) {
      const context = canvasRef.current.getContext('2d');
      setCtx(context);
    }
  }, [isOpen, canvasRef, ctx, setCtx]);

  // Load original image when URL changes
  React.useEffect(() => {
    if (isOpen && imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setOriginalImage(img);
      img.src = imageUrl;
    }
  }, [isOpen, imageUrl, setOriginalImage]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Image Editor - {imageName}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Tools Panel */}
          <ToolsPanel
            drawingTool={{
              currentTool,
              onToolChange: updateTool
            }}
            filterControl={{
              filters,
              onFilterChange: updateFilters
            }}
            transformControl={{
              transform,
              onTransformChange: updateTransform
            }}
            canvasOperations={{
              saveToHistory,
              applyFilters,
              undo,
              redo
            }}
          />

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col">
            <CanvasArea
              canvasState={getCanvasState()}
              currentTool={currentTool}
              mouseHandlers={{
                onMouseDown: handleMouseDown,
                onMouseMove: handleMouseMove,
                onMouseUp: handleMouseUp
              }}
            />
            
            {/* Action Buttons */}
            <ActionButtons
              saveImage={() => saveImage(onSave)}
              downloadImage={() => downloadImage(imageName)}
              onClose={onClose}
              undo={undo}
              redo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

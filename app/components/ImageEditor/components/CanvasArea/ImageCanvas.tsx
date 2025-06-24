/**
 * @fileoverview Main image canvas component for editing
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { CanvasAreaConfig } from "../../types/imageEditor.types";

type ImageCanvasProps = CanvasAreaConfig;

/**
 * Main image canvas component for editing
 */
export const ImageCanvas: React.FC<ImageCanvasProps> = ({
  canvasState,
  currentTool,
  mouseHandlers
}) => {
  const { canvasRef } = canvasState;
  const { onMouseDown, onMouseMove, onMouseUp } = mouseHandlers;

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-checkered">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 shadow-lg rounded-lg bg-white cursor-crosshair"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{
          cursor: currentTool.type === 'brush' ? 'crosshair' : 'default'
        }}
        aria-label="Image editing canvas"
      />
    </div>
  );
};

/**
 * @fileoverview Annotation service for adding text, shapes, and arrows
 * @author Senior Developer
 * @version 1.0.0
 */

import { AnnotationTool } from '../types/imageEditor.types';
import { drawText, drawRectangle, drawCircle, drawArrow } from './canvasService';

/**
 * Add text annotation to canvas
 */
export const addTextAnnotation = (
  ctx: CanvasRenderingContext2D,
  tool: AnnotationTool,
  x: number = 100,
  y: number = 100
): void => {
  const text = prompt('Enter text:');
  if (!text) return;

  drawText(ctx, text, x, y, tool.color, tool.size);
};

/**
 * Add rectangle annotation to canvas
 */
export const addRectangleAnnotation = (
  ctx: CanvasRenderingContext2D,
  tool: AnnotationTool,
  x: number = 100,
  y: number = 100,
  width: number = 100,
  height: number = 60
): void => {
  drawRectangle(ctx, x, y, width, height, tool.color, tool.size);
};

/**
 * Add circle annotation to canvas
 */
export const addCircleAnnotation = (
  ctx: CanvasRenderingContext2D,
  tool: AnnotationTool,
  x: number = 150,
  y: number = 130,
  radius: number = 50
): void => {
  drawCircle(ctx, x, y, radius, tool.color, tool.size);
};

/**
 * Add arrow annotation to canvas
 */
export const addArrowAnnotation = (
  ctx: CanvasRenderingContext2D,
  tool: AnnotationTool,
  startX: number = 50,
  startY: number = 100,
  endX: number = 200,
  endY: number = 100
): void => {
  drawArrow(ctx, startX, startY, endX, endY, tool.color, tool.size);
};

/**
 * Interactive annotation placement
 */
export interface AnnotationPlacement {
  /** Start coordinates */
  start: { x: number; y: number };
  /** End coordinates (for shapes) */
  end?: { x: number; y: number };
  /** Annotation type */
  type: AnnotationTool['type'];
}

/**
 * Start interactive annotation placement
 */
export const startAnnotationPlacement = (
  x: number,
  y: number,
  type: AnnotationTool['type']
): AnnotationPlacement => {
  return {
    start: { x, y },
    type
  };
};

/**
 * Update annotation placement during drag
 */
export const updateAnnotationPlacement = (
  placement: AnnotationPlacement,
  x: number,
  y: number
): AnnotationPlacement => {
  return {
    ...placement,
    end: { x, y }
  };
};

/**
 * Finish annotation placement
 */
export const finishAnnotationPlacement = (
  ctx: CanvasRenderingContext2D,
  placement: AnnotationPlacement,
  tool: AnnotationTool
): void => {
  const { start, end, type } = placement;

  switch (type) {
    case 'text':
      addTextAnnotation(ctx, tool, start.x, start.y);
      break;
    case 'rectangle':
      if (end) {
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        addRectangleAnnotation(ctx, tool, x, y, width, height);
      } else {
        addRectangleAnnotation(ctx, tool, start.x, start.y);
      }
      break;
    case 'circle':
      if (end) {
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        addCircleAnnotation(ctx, tool, start.x, start.y, radius);
      } else {
        addCircleAnnotation(ctx, tool, start.x, start.y);
      }
      break;
    case 'arrow':
      if (end) {
        addArrowAnnotation(ctx, tool, start.x, start.y, end.x, end.y);
      } else {
        addArrowAnnotation(ctx, tool, start.x, start.y);
      }
      break;
  }
};

/**
 * Preview annotation during placement
 */
export const previewAnnotation = (
  ctx: CanvasRenderingContext2D,
  placement: AnnotationPlacement,
  tool: AnnotationTool
): void => {
  const { start, end, type } = placement;
  
  // Save current context
  ctx.save();
  
  // Set preview style (semi-transparent)
  ctx.globalAlpha = 0.5;
  ctx.setLineDash([5, 5]);

  switch (type) {
    case 'rectangle':
      if (end) {
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        drawRectangle(ctx, x, y, width, height, tool.color, tool.size);
      }
      break;
    case 'circle':
      if (end) {
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        drawCircle(ctx, start.x, start.y, radius, tool.color, tool.size);
      }
      break;
    case 'arrow':
      if (end) {
        drawArrow(ctx, start.x, start.y, end.x, end.y, tool.color, tool.size);
      }
      break;
  }
  
  // Restore context
  ctx.restore();
};

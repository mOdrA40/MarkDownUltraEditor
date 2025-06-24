/**
 * @fileoverview Canvas operations service for image editing
 * @author Senior Developer
 * @version 1.0.0
 */

import { ImageFilters, MouseCoordinates } from '../types/imageEditor.types';

/**
 * Initialize canvas with image
 */
export const initializeCanvas = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  ctx: CanvasRenderingContext2D
): void => {
  canvas.width = 800;
  canvas.height = 600;

  // Scale image to fit canvas
  const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const x = (canvas.width - scaledWidth) / 2;
  const y = (canvas.height - scaledHeight) / 2;

  // Clear and draw image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
};

/**
 * Apply filters to canvas
 */
export const applyFiltersToCanvas = (
  canvas: HTMLCanvasElement,
  originalImage: HTMLImageElement,
  ctx: CanvasRenderingContext2D,
  filters: ImageFilters
): void => {
  const { brightness, contrast, saturation } = filters;
  
  const scale = Math.min(canvas.width / originalImage.width, canvas.height / originalImage.height);
  const scaledWidth = originalImage.width * scale;
  const scaledHeight = originalImage.height * scale;
  const x = (canvas.width - scaledWidth) / 2;
  const y = (canvas.height - scaledHeight) / 2;

  // Clear and redraw with filters
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply CSS filters
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  ctx.drawImage(originalImage, x, y, scaledWidth, scaledHeight);
  ctx.filter = 'none';
};

/**
 * Get mouse coordinates relative to canvas
 */
export const getMouseCoordinates = (
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): MouseCoordinates => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

/**
 * Start drawing path
 */
export const startDrawing = (
  ctx: CanvasRenderingContext2D,
  coordinates: MouseCoordinates
): void => {
  ctx.beginPath();
  ctx.moveTo(coordinates.x, coordinates.y);
};

/**
 * Continue drawing path
 */
export const continueDrawing = (
  ctx: CanvasRenderingContext2D,
  coordinates: MouseCoordinates,
  color: string,
  size: number
): void => {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineTo(coordinates.x, coordinates.y);
  ctx.stroke();
};

/**
 * Draw text on canvas
 */
export const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size: number
): void => {
  ctx.font = `${size * 2}px Arial`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
};

/**
 * Draw rectangle on canvas
 */
export const drawRectangle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  lineWidth: number
): void => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x, y, width, height);
};

/**
 * Draw circle on canvas
 */
export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  lineWidth: number
): void => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
};

/**
 * Draw arrow on canvas
 */
export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string,
  lineWidth: number
): void => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  // Draw line
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Draw arrow head
  const headLength = 10;
  const angle = Math.atan2(endY - startY, endX - startX);
  
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLength * Math.cos(angle - Math.PI / 6),
    endY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLength * Math.cos(angle + Math.PI / 6),
    endY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
};

/**
 * Export canvas as data URL
 */
export const exportCanvasAsDataURL = (
  canvas: HTMLCanvasElement,
  format: string = 'image/png',
  quality: number = 1
): string => {
  return canvas.toDataURL(format, quality);
};

/**
 * Load image from data URL
 */
export const loadImageFromDataURL = (
  dataURL: string,
  onLoad: (image: HTMLImageElement) => void
): void => {
  const img = new Image();
  img.onload = () => onLoad(img);
  img.src = dataURL;
};

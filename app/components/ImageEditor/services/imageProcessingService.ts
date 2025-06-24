/**
 * @fileoverview Image processing service for transformations and effects
 * @author Senior Developer
 * @version 1.0.0
 */

import { ImageFilters, ImageTransform } from '../types/imageEditor.types';

/**
 * Rotate image by specified degrees
 */
export const rotateImage = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  degrees: number
): void => {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  // Save current context
  ctx.save();
  
  // Move to center, rotate, then move back
  ctx.translate(centerX, centerY);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.translate(-centerX, -centerY);
  
  // Clear and redraw
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Calculate scaled dimensions
  const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const x = (canvas.width - scaledWidth) / 2;
  const y = (canvas.height - scaledHeight) / 2;
  
  ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
  
  // Restore context
  ctx.restore();
};

/**
 * Flip image horizontally or vertically
 */
export const flipImage = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  horizontal: boolean,
  vertical: boolean
): void => {
  // Save current context
  ctx.save();
  
  // Calculate scale factors
  const scaleX = horizontal ? -1 : 1;
  const scaleY = vertical ? -1 : 1;
  
  // Apply scaling
  ctx.scale(scaleX, scaleY);
  
  // Calculate position adjustments
  const x = horizontal ? -canvas.width : 0;
  const y = vertical ? -canvas.height : 0;
  
  // Clear and redraw
  ctx.clearRect(x, y, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, canvas.width, canvas.height);
  
  // Calculate scaled dimensions
  const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const imageX = x + (canvas.width - scaledWidth) / 2;
  const imageY = y + (canvas.height - scaledHeight) / 2;
  
  ctx.drawImage(image, imageX, imageY, scaledWidth, scaledHeight);
  
  // Restore context
  ctx.restore();
};

/**
 * Apply brightness adjustment
 */
export const adjustBrightness = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  brightness: number
): void => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const factor = brightness / 100;
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * factor);     // Red
    data[i + 1] = Math.min(255, data[i + 1] * factor); // Green
    data[i + 2] = Math.min(255, data[i + 2] * factor); // Blue
    // Alpha channel (i + 3) remains unchanged
  }
  
  ctx.putImageData(imageData, 0, 0);
};

/**
 * Apply contrast adjustment
 */
export const adjustContrast = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  contrast: number
): void => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));     // Red
    data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128)); // Green
    data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128)); // Blue
  }
  
  ctx.putImageData(imageData, 0, 0);
};

/**
 * Apply saturation adjustment
 */
export const adjustSaturation = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  saturation: number
): void => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const factor = saturation / 100;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate grayscale value
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Apply saturation
    data[i] = Math.max(0, Math.min(255, gray + factor * (r - gray)));
    data[i + 1] = Math.max(0, Math.min(255, gray + factor * (g - gray)));
    data[i + 2] = Math.max(0, Math.min(255, gray + factor * (b - gray)));
  }
  
  ctx.putImageData(imageData, 0, 0);
};

/**
 * Apply combined filters to image
 */
export const applyFilters = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  filters: ImageFilters,
  transform: ImageTransform
): void => {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Apply transform
  if (transform.rotation !== 0) {
    rotateImage(canvas, ctx, image, transform.rotation);
  } else if (transform.flipH || transform.flipV) {
    flipImage(canvas, ctx, image, transform.flipH, transform.flipV);
  } else {
    // Draw image normally
    const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;
    
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
  }
  
  // Apply filters using CSS filter (more performant than pixel manipulation)
  const { brightness, contrast, saturation } = filters;
  if (brightness !== 100 || contrast !== 100 || saturation !== 100) {
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    // Re-draw with filters
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    ctx.filter = 'none';
  }
};

/**
 * Reset image to original state
 */
export const resetImage = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  originalImage: HTMLImageElement
): void => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const scale = Math.min(canvas.width / originalImage.width, canvas.height / originalImage.height);
  const scaledWidth = originalImage.width * scale;
  const scaledHeight = originalImage.height * scale;
  const x = (canvas.width - scaledWidth) / 2;
  const y = (canvas.height - scaledHeight) / 2;
  
  ctx.drawImage(originalImage, x, y, scaledWidth, scaledHeight);
};

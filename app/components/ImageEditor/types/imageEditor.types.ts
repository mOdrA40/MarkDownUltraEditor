/**
 * @fileoverview TypeScript type definitions for ImageEditor components
 * @author Senior Developer
 * @version 1.0.0
 */

/**
 * Main props interface for ImageEditor component
 */
export interface ImageEditorProps {
  /** Image URL to edit */
  imageUrl: string;
  /** Image file name */
  imageName: string;
  /** Dialog open state */
  isOpen: boolean;
  /** Close dialog callback */
  onClose: () => void;
  /** Save edited image callback */
  onSave: (editedImageUrl: string) => void;
}

/**
 * Annotation tool configuration
 */
export interface AnnotationTool {
  /** Tool type */
  type: 'text' | 'rectangle' | 'circle' | 'arrow' | 'brush';
  /** Tool color */
  color: string;
  /** Tool size */
  size: number;
}

/**
 * Image filter settings
 */
export interface ImageFilters {
  /** Brightness percentage (0-200) */
  brightness: number;
  /** Contrast percentage (0-200) */
  contrast: number;
  /** Saturation percentage (0-200) */
  saturation: number;
}

/**
 * Image transform settings
 */
export interface ImageTransform {
  /** Rotation angle in degrees */
  rotation: number;
  /** Horizontal flip */
  flipH: boolean;
  /** Vertical flip */
  flipV: boolean;
}

/**
 * Canvas state interface
 */
export interface CanvasState {
  /** Canvas context */
  ctx: CanvasRenderingContext2D | null;
  /** Original image element */
  originalImage: HTMLImageElement | null;
  /** Canvas reference */
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Drawing state */
  isDrawing: boolean;
}

/**
 * History management interface
 */
export interface HistoryState {
  /** History stack */
  history: string[];
  /** Current history index */
  historyIndex: number;
}

/**
 * Mouse event coordinates
 */
export interface MouseCoordinates {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
}

/**
 * Drawing tool configuration
 */
export interface DrawingToolConfig {
  /** Current tool */
  currentTool: AnnotationTool;
  /** Tool change callback */
  onToolChange: (tool: AnnotationTool) => void;
}

/**
 * Filter control configuration
 */
export interface FilterControlConfig {
  /** Current filters */
  filters: ImageFilters;
  /** Filter change callback */
  onFilterChange: (filters: ImageFilters) => void;
}

/**
 * Transform control configuration
 */
export interface TransformControlConfig {
  /** Current transform */
  transform: ImageTransform;
  /** Transform change callback */
  onTransformChange: (transform: ImageTransform) => void;
}

/**
 * Canvas operation callbacks
 */
export interface CanvasOperationCallbacks {
  /** Save to history */
  saveToHistory: () => void;
  /** Apply filters */
  applyFilters: () => void;
  /** Undo operation */
  undo: () => void;
  /** Redo operation */
  redo: () => void;
}

/**
 * Image editor action callbacks
 */
export interface ImageEditorActions {
  /** Save image */
  saveImage: () => void;
  /** Download image */
  downloadImage: () => void;
  /** Close editor */
  onClose: () => void;
}

/**
 * Tool panel configuration
 */
export interface ToolPanelConfig {
  /** Drawing tool config */
  drawingTool: DrawingToolConfig;
  /** Filter control config */
  filterControl: FilterControlConfig;
  /** Transform control config */
  transformControl: TransformControlConfig;
  /** Canvas operation callbacks */
  canvasOperations: CanvasOperationCallbacks;
}

/**
 * Canvas area configuration
 */
export interface CanvasAreaConfig {
  /** Canvas state */
  canvasState: CanvasState;
  /** Current tool */
  currentTool: AnnotationTool;
  /** Mouse event handlers */
  mouseHandlers: {
    onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp: () => void;
  };
}

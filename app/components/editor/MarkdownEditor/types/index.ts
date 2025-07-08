/**
 * @fileoverview Main type definitions export file
 * @author Axel Modra
 */

// Re-export all types from sub-modules
export * from './editor.types';
export type {
  ActionType,
  StateListener,
  StateManager,
  StateManagerConfig,
  StateMiddleware,
  StateReducer,
} from './state.types';

// Additional utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

/**
 * Generic event handler type
 */
export type EventHandler<T = unknown> = (event: T) => void;

/**
 * Generic callback type
 */
export type Callback<T = void> = () => T;

/**
 * Generic async callback type
 */
export type AsyncCallback<T = void> = () => Promise<T>;

/**
 * Generic value change handler
 */
export type ValueChangeHandler<T> = (value: T) => void;

/**
 * Generic toggle handler
 */
export type ToggleHandler = () => void;

/**
 * Generic error handler
 */
export type ErrorHandler = (error: Error) => void;

/**
 * Component ref types
 */
export type ComponentRef<T = HTMLElement> = React.RefObject<T>;

/**
 * CSS class name type
 */
export type ClassName = string | string[] | Record<string, boolean>;

/**
 * Style object type
 */
export type StyleObject = React.CSSProperties;

/**
 * Children prop type
 */
export type Children = React.ReactNode;

/**
 * Component props with children
 */
export interface WithChildren {
  children?: Children;
}

/**
 * Component props with className
 */
export interface WithClassName {
  className?: ClassName;
}

/**
 * Component props with style
 */
export interface WithStyle {
  style?: StyleObject;
}

/**
 * Base component props
 */
export interface BaseComponentProps extends WithChildren, WithClassName, WithStyle {
  /** Component ID */
  id?: string;
  /** Test ID for testing */
  testId?: string;
  /** Accessibility label */
  'aria-label'?: string;
  /** Accessibility description */
  'aria-describedby'?: string;
}

/**
 * Keyboard event types
 */
export interface KeyboardEventData {
  key: string;
  code: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/**
 * Mouse event types
 */
export interface MouseEventData {
  clientX: number;
  clientY: number;
  button: number;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/**
 * Touch event types
 */
export interface TouchEventData {
  touches: TouchList;
  changedTouches: TouchList;
  targetTouches: TouchList;
}

/**
 * File operation types
 */
export interface FileData {
  name: string;
  content: string;
  size: number;
  type: string;
  lastModified: number;
}

/**
 * Image data types
 */
export interface ImageData {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  title?: string;
}

/**
 * Template data types
 */
export interface TemplateData {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  preview?: string;
}

/**
 * Export options types
 */
export interface ExportOptions {
  format: 'html' | 'pdf' | 'docx' | 'md';
  includeCSS: boolean;
  includeImages: boolean;
  theme: string;
  customCSS?: string;
}

/**
 * Search options types
 */
export interface SearchOptions {
  query: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  replaceWith?: string;
}

/**
 * Performance metrics types
 */
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  loadTime: number;
}

/**
 * Error boundary types
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Loading state types
 */
export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

/**
 * Validation types
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuration types
 */
export interface AppConfig {
  version: string;
  environment: 'development' | 'production' | 'test';
  features: Record<string, boolean>;
  limits: {
    maxFileSize: number;
    maxHistorySize: number;
    maxUndoSteps: number;
  };
}

/**
 * Analytics types
 */
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

/**
 * Accessibility types
 */
export interface AccessibilityConfig {
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  enableHighContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
}

/**
 * Internationalization types
 */
export interface I18nConfig {
  locale: string;
  fallbackLocale: string;
  messages: Record<string, string>;
  dateFormat: string;
  numberFormat: string;
}

/**
 * Plugin configuration type
 */
export interface PluginConfig {
  [key: string]: string | number | boolean | PluginConfig;
}

/**
 * Theme configuration type
 */
export interface ThemeConfig {
  name: string;
  colors: Record<string, string>;
  fonts?: Record<string, string>;
  spacing?: Record<string, string>;
}

/**
 * Plugin types
 */
export interface Plugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  config: PluginConfig;
  hooks: {
    onInit?: () => void;
    onDestroy?: () => void;
    onMarkdownChange?: (markdown: string) => string;
    onThemeChange?: (theme: ThemeConfig) => void;
  };
}

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API error type
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string | number>;
}

/**
 * API types
 */
export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: number;
}

export interface ApiRequest<T = Record<string, unknown>> {
  method: HttpMethod;
  url: string;
  data?: T;
  headers?: Record<string, string>;
  timeout?: number;
}

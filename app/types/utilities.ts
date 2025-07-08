/**
 * @fileoverview Advanced Utility Types
 * @author Axel Modra
 */

/**
 * Strict event handler types
 */
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

/**
 * Keyboard event handler types
 */
export type KeyboardEventHandler = EventHandler<KeyboardEvent>;
export type MouseEventHandler = EventHandler<MouseEvent>;
export type ChangeEventHandler<T = HTMLInputElement> = EventHandler<React.ChangeEvent<T>>;
export type SubmitEventHandler<T = HTMLFormElement> = EventHandler<React.FormEvent<T>>;

/**
 * Strict function types
 */
export type VoidFunction = () => void;
export type AsyncVoidFunction = () => Promise<void>;
export type Predicate<T> = (value: T) => boolean;
export type AsyncPredicate<T> = (value: T) => Promise<boolean>;
export type Transformer<T, U> = (value: T) => U;
export type AsyncTransformer<T, U> = (value: T) => Promise<U>;

/**
 * API response types with strict error handling
 */
export interface StrictApiResponse<TData = unknown> {
  readonly success: true;
  readonly data: TData;
  readonly timestamp: number;
}

export interface StrictApiError {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, string | number>;
  };
  readonly timestamp: number;
}

export type ApiResult<TData = unknown> = StrictApiResponse<TData> | StrictApiError;

/**
 * Form validation types
 */
export interface ValidationRule<T> {
  readonly validate: Predicate<T>;
  readonly message: string;
}

export interface AsyncValidationRule<T> {
  readonly validate: AsyncPredicate<T>;
  readonly message: string;
}

export interface FieldValidation<T> {
  readonly rules: readonly ValidationRule<T>[];
  readonly asyncRules?: readonly AsyncValidationRule<T>[];
}

export interface FormValidationResult {
  readonly isValid: boolean;
  readonly errors: Record<string, string[]>;
  readonly warnings: Record<string, string[]>;
}

/**
 * State management types
 */
export interface StrictState<T> {
  readonly data: T;
  readonly loading: boolean;
  readonly error: string | null;
  readonly lastUpdated: number;
}

export type StateAction<T> =
  | { readonly type: 'LOADING' }
  | { readonly type: 'SUCCESS'; readonly payload: T }
  | { readonly type: 'ERROR'; readonly payload: string }
  | { readonly type: 'RESET' };

/**
 * Component prop types with strict variants
 */
export interface StrictComponentProps {
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly testId?: string;
}

export interface StrictButtonProps extends StrictComponentProps {
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onClick?: MouseEventHandler;
}

export interface StrictInputProps extends StrictComponentProps {
  readonly type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  readonly value?: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly onChange?: ChangeEventHandler<HTMLInputElement>;
  readonly onBlur?: EventHandler<React.FocusEvent<HTMLInputElement>>;
}

/**
 * Theme types with strict color definitions
 */
export interface StrictColorPalette {
  readonly primary: string;
  readonly secondary: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly border: string;
  readonly accent: string;
  readonly success: string;
  readonly warning: string;
  readonly error: string;
}

export interface StrictTheme {
  readonly id: string;
  readonly name: string;
  readonly colors: StrictColorPalette;
  readonly fonts: {
    readonly primary: string;
    readonly secondary: string;
    readonly mono: string;
  };
  readonly spacing: {
    readonly xs: string;
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly xl: string;
  };
}

/**
 * File handling types
 */
export interface StrictFileData {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly fileSize: number;
  readonly tags: readonly string[];
  readonly metadata: Record<string, string | number | boolean>;
}

export interface StrictFileOperation {
  readonly type: 'create' | 'update' | 'delete' | 'rename';
  readonly fileId: string;
  readonly timestamp: number;
  readonly data?: Partial<StrictFileData>;
}

/**
 * Performance monitoring types
 */
export interface StrictPerformanceMetrics {
  readonly fcp: number; // First Contentful Paint
  readonly lcp: number; // Largest Contentful Paint
  readonly fid: number; // First Input Delay
  readonly cls: number; // Cumulative Layout Shift
  readonly ttfb: number; // Time to First Byte
  readonly timestamp: number;
}

export interface StrictPerformanceEntry {
  readonly name: string;
  readonly startTime: number;
  readonly duration: number;
  readonly entryType: string;
}

/**
 * Storage types
 */
export interface StrictStorageInfo {
  readonly used: number;
  readonly available: number;
  readonly total: number;
  readonly usedPercentage: number;
  readonly isNearCapacity: boolean;
  readonly isCritical: boolean;
}

/**
 * Navigation types
 */
export interface StrictNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly href?: string;
  readonly icon?: React.ComponentType;
  readonly children?: readonly StrictNavigationItem[];
  readonly isActive?: boolean;
  readonly isDisabled?: boolean;
}

/**
 * Search types
 */
export interface StrictSearchResult<T> {
  readonly item: T;
  readonly score: number;
  readonly matches: readonly {
    readonly field: keyof T;
    readonly indices: readonly [number, number][];
  }[];
}

export interface StrictSearchOptions {
  readonly threshold: number;
  readonly includeScore: boolean;
  readonly includeMatches: boolean;
  readonly keys: readonly string[];
}

/**
 * Accessibility types
 */
export interface StrictAccessibilityConfig {
  readonly enableScreenReader: boolean;
  readonly enableKeyboardNavigation: boolean;
  readonly enableHighContrast: boolean;
  readonly fontSize: 'small' | 'medium' | 'large';
  readonly reducedMotion: boolean;
  readonly announcements: boolean;
}

/**
 * Configuration types
 */
export interface StrictAppConfig {
  readonly version: string;
  readonly environment: 'development' | 'production' | 'test';
  readonly features: Record<string, boolean>;
  readonly limits: {
    readonly maxFileSize: number;
    readonly maxHistorySize: number;
    readonly maxUndoSteps: number;
  };
  readonly accessibility: StrictAccessibilityConfig;
}

/**
 * Error types
 */
export interface StrictErrorInfo {
  readonly code: string;
  readonly message: string;
  readonly stack?: string;
  readonly timestamp: number;
  readonly context?: Record<string, unknown>;
}

export interface StrictErrorBoundaryState {
  readonly hasError: boolean;
  readonly error?: StrictErrorInfo;
  readonly errorId?: string;
}

/**
 * Utility type for creating branded types
 */
export type Brand<T, B> = T & { readonly __brand: B };

/**
 * Branded primitive types for type safety
 */
export type UserId = Brand<string, 'UserId'>;
export type FileId = Brand<string, 'FileId'>;
export type ThemeId = Brand<string, 'ThemeId'>;
export type Timestamp = Brand<number, 'Timestamp'>;
export type EmailAddress = Brand<string, 'EmailAddress'>;
export type HexColor = Brand<string, 'HexColor'>;

/**
 * Type-safe ID creation functions
 */
export const createUserId = (id: string): UserId => id as UserId;
export const createFileId = (id: string): FileId => id as FileId;
export const createThemeId = (id: string): ThemeId => id as ThemeId;
export const createTimestamp = (time: number): Timestamp => time as Timestamp;
export const createEmailAddress = (email: string): EmailAddress => email as EmailAddress;
export const createHexColor = (color: string): HexColor => color as HexColor;

/**
 * File operation error codes
 */
export enum FileOperationErrorCode {
  // Storage errors
  STORAGE_NOT_INITIALIZED = 'STORAGE_NOT_INITIALIZED',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_PERMISSION_DENIED = 'STORAGE_PERMISSION_DENIED',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',

  // Authentication errors
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_PERMISSION_DENIED = 'AUTH_PERMISSION_DENIED',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',

  // File operation errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_INVALID_FORMAT = 'FILE_INVALID_FORMAT',
  FILE_ALREADY_EXISTS = 'FILE_ALREADY_EXISTS',

  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * File operation result interface
 */
export interface FileOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: FileOperationError;
}

/**
 * Standardized file operation error
 */
export interface FileOperationError {
  code: FileOperationErrorCode;
  message: string;
  details?: unknown;
  retryable: boolean;
  userMessage: string;
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Create a standardized file operation error
 */
export const createFileOperationError = (
  code: FileOperationErrorCode,
  message: string,
  details?: unknown,
  retryable = false
): FileOperationError => {
  return {
    code,
    message,
    details,
    retryable,
    userMessage: getUserFriendlyMessage(code, message),
  };
};

/**
 * Get user-friendly error messages
 */
const getUserFriendlyMessage = (code: FileOperationErrorCode, fallback: string): string => {
  const messages: Record<FileOperationErrorCode, string> = {
    [FileOperationErrorCode.STORAGE_NOT_INITIALIZED]:
      'Storage service is still initializing. Please wait a moment and try again.',
    [FileOperationErrorCode.STORAGE_QUOTA_EXCEEDED]:
      'Storage quota exceeded. Please delete some files or upgrade your plan.',
    [FileOperationErrorCode.STORAGE_PERMISSION_DENIED]:
      'Permission denied. Please check your account permissions.',

    [FileOperationErrorCode.NETWORK_ERROR]:
      'Network error occurred. Please check your connection and try again.',
    [FileOperationErrorCode.NETWORK_TIMEOUT]: 'Request timed out. Please try again.',
    [FileOperationErrorCode.NETWORK_OFFLINE]:
      'You appear to be offline. Please check your internet connection.',

    [FileOperationErrorCode.AUTH_TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
    [FileOperationErrorCode.AUTH_PERMISSION_DENIED]:
      'You do not have permission to perform this action.',
    [FileOperationErrorCode.AUTH_USER_NOT_FOUND]: 'User account not found. Please sign in again.',

    [FileOperationErrorCode.FILE_NOT_FOUND]: 'File not found. It may have been deleted or moved.',
    [FileOperationErrorCode.FILE_TOO_LARGE]:
      'File is too large. Please reduce the file size and try again.',
    [FileOperationErrorCode.FILE_INVALID_FORMAT]:
      'Invalid file format. Please check the file and try again.',
    [FileOperationErrorCode.FILE_ALREADY_EXISTS]:
      'A file with this name already exists. Please choose a different name.',

    [FileOperationErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
    [FileOperationErrorCode.VALIDATION_ERROR]:
      'Invalid input. Please check your data and try again.',
  };

  return messages[code] || fallback || 'An error occurred. Please try again.';
};

/**
 * Parse error from various sources into standardized format
 */
export const parseFileOperationError = (error: unknown): FileOperationError => {
  // Handle already formatted errors
  if (error && typeof error === 'object' && 'code' in error && 'userMessage' in error) {
    return error as FileOperationError;
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return createFileOperationError(
        FileOperationErrorCode.NETWORK_ERROR,
        error.message,
        error,
        true
      );
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('token')) {
      return createFileOperationError(
        FileOperationErrorCode.AUTH_TOKEN_EXPIRED,
        error.message,
        error,
        false
      );
    }

    // Storage errors
    if (message.includes('quota') || message.includes('storage')) {
      return createFileOperationError(
        FileOperationErrorCode.STORAGE_QUOTA_EXCEEDED,
        error.message,
        error,
        false
      );
    }

    // File size errors
    if (message.includes('size') || message.includes('large')) {
      return createFileOperationError(
        FileOperationErrorCode.FILE_TOO_LARGE,
        error.message,
        error,
        false
      );
    }

    // Default to unknown error
    return createFileOperationError(
      FileOperationErrorCode.UNKNOWN_ERROR,
      error.message,
      error,
      true
    );
  }

  // Handle string errors
  if (typeof error === 'string') {
    return createFileOperationError(FileOperationErrorCode.UNKNOWN_ERROR, error, undefined, true);
  }

  // Handle unknown error types
  return createFileOperationError(
    FileOperationErrorCode.UNKNOWN_ERROR,
    'An unexpected error occurred',
    error,
    true
  );
};

/**
 * Create success result
 */
export const createSuccessResult = <T>(data: T): FileOperationResult<T> => ({
  success: true,
  data,
});

/**
 * Create error result
 */
export const createErrorResult = <T = unknown>(
  error: FileOperationError
): FileOperationResult<T> => ({
  success: false,
  error,
});

/**
 * Wrap async operation with standardized error handling
 */
export const wrapFileOperation = async <T>(
  operation: () => Promise<T>,
  operationName = 'file operation'
): Promise<FileOperationResult<T>> => {
  try {
    const result = await operation();
    return createSuccessResult(result);
  } catch (error) {
    const fileError = parseFileOperationError(error);
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.error(`${operationName} failed:`, fileError);
    });
    return createErrorResult(fileError);
  }
};

/**
 * Get error severity based on error code
 */
export const getErrorSeverity = (code: FileOperationErrorCode): ErrorSeverity => {
  const severityMap: Record<FileOperationErrorCode, ErrorSeverity> = {
    [FileOperationErrorCode.STORAGE_NOT_INITIALIZED]: ErrorSeverity.MEDIUM,
    [FileOperationErrorCode.STORAGE_QUOTA_EXCEEDED]: ErrorSeverity.HIGH,
    [FileOperationErrorCode.STORAGE_PERMISSION_DENIED]: ErrorSeverity.HIGH,

    [FileOperationErrorCode.NETWORK_ERROR]: ErrorSeverity.MEDIUM,
    [FileOperationErrorCode.NETWORK_TIMEOUT]: ErrorSeverity.MEDIUM,
    [FileOperationErrorCode.NETWORK_OFFLINE]: ErrorSeverity.HIGH,

    [FileOperationErrorCode.AUTH_TOKEN_EXPIRED]: ErrorSeverity.HIGH,
    [FileOperationErrorCode.AUTH_PERMISSION_DENIED]: ErrorSeverity.HIGH,
    [FileOperationErrorCode.AUTH_USER_NOT_FOUND]: ErrorSeverity.CRITICAL,

    [FileOperationErrorCode.FILE_NOT_FOUND]: ErrorSeverity.MEDIUM,
    [FileOperationErrorCode.FILE_TOO_LARGE]: ErrorSeverity.MEDIUM,
    [FileOperationErrorCode.FILE_INVALID_FORMAT]: ErrorSeverity.LOW,
    [FileOperationErrorCode.FILE_ALREADY_EXISTS]: ErrorSeverity.LOW,

    [FileOperationErrorCode.UNKNOWN_ERROR]: ErrorSeverity.MEDIUM,
    [FileOperationErrorCode.VALIDATION_ERROR]: ErrorSeverity.LOW,
  };

  return severityMap[code] || ErrorSeverity.MEDIUM;
};

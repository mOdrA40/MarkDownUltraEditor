/**
 * @fileoverview Error tracking hooks for automatic user interaction monitoring
 * @author Security Team
 * @version 1.0.0
 */

import { useCallback } from "react";
import {
  ErrorCategory,
  ErrorSeverity,
  SentryUtils,
  secureSentry,
} from "@/utils/sentry";

/**
 * Hook for tracking user interaction errors
 */
export function useErrorTracking() {
  /**
   * Track button click errors
   */
  const trackButtonError = useCallback(
    (buttonName: string, error: Error, context?: Record<string, unknown>) => {
      return SentryUtils.logUserActionError(
        `button_click_${buttonName}`,
        error,
        {
          buttonName,
          interactionType: "click",
          ...context,
        }
      );
    },
    []
  );

  /**
   * Track form submission errors
   */
  const trackFormError = useCallback(
    (formName: string, error: Error, formData?: Record<string, unknown>) => {
      return secureSentry.logError(
        error,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        {
          formName,
          interactionType: "form_submit",
          formData: formData ? Object.keys(formData) : undefined, // Only log field names, not values
        }
      );
    },
    []
  );

  /**
   * Track file operation errors
   */
  const trackFileError = useCallback(
    (
      operation: "upload" | "download" | "delete" | "save" | "load",
      error: Error,
      fileName?: string,
      fileSize?: number
    ) => {
      return secureSentry.logError(
        error,
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        {
          operation,
          fileName: fileName ? fileName.substring(0, 100) : undefined, // Limit filename length
          fileSize,
          interactionType: "file_operation",
        }
      );
    },
    []
  );

  /**
   * Track network request errors
   */
  const trackNetworkError = useCallback(
    (url: string, method: string, error: Error, statusCode?: number) => {
      return SentryUtils.logNetworkError(error, {
        url: url.substring(0, 200), // Limit URL length
        method,
        statusCode,
        interactionType: "network_request",
      });
    },
    []
  );

  /**
   * Track authentication errors
   */
  const trackAuthError = useCallback(
    (
      action: "login" | "logout" | "signup" | "token_refresh",
      error: Error,
      userId?: string
    ) => {
      return SentryUtils.logAuthError(error, {
        action,
        userId: userId ? `user_${userId.substring(0, 8)}` : undefined, // Partial user ID for privacy
        interactionType: "authentication",
      });
    },
    []
  );

  /**
   * Track validation errors
   */
  const trackValidationError = useCallback(
    (field: string, message: string, value?: unknown) => {
      return SentryUtils.logValidationError(message, {
        field,
        valueType: typeof value,
        interactionType: "validation",
      });
    },
    []
  );

  /**
   * Track performance issues
   */
  const trackPerformanceIssue = useCallback(
    (
      metric: string,
      value: number,
      threshold: number,
      context?: Record<string, unknown>
    ) => {
      return secureSentry.logPerformanceIssue(metric, value, threshold, {
        interactionType: "performance",
        ...context,
      });
    },
    []
  );

  /**
   * Track custom user actions
   */
  const trackCustomAction = useCallback(
    (
      action: string,
      error: Error | string,
      category: ErrorCategory = ErrorCategory.USER_ACTION,
      severity: ErrorSeverity = ErrorSeverity.LOW,
      context?: Record<string, unknown>
    ) => {
      return secureSentry.logError(
        typeof error === "string" ? new Error(error) : error,
        category,
        severity,
        {
          action,
          interactionType: "custom_action",
          ...context,
        }
      );
    },
    []
  );

  return {
    trackButtonError,
    trackFormError,
    trackFileError,
    trackNetworkError,
    trackAuthError,
    trackValidationError,
    trackPerformanceIssue,
    trackCustomAction,
  };
}

/**
 * Hook for safe async operations with error tracking
 */
export function useSafeAsync() {
  const { trackCustomAction } = useErrorTracking();

  /**
   * Execute async operation with automatic error tracking
   */
  const safeAsync = useCallback(
    async <T>(
      operation: () => Promise<T>,
      operationName: string,
      context?: Record<string, unknown>
    ): Promise<T | null> => {
      try {
        return await operation();
      } catch (error) {
        trackCustomAction(
          operationName,
          error instanceof Error ? error : new Error(String(error)),
          ErrorCategory.SYSTEM,
          ErrorSeverity.MEDIUM,
          context
        );
        return null;
      }
    },
    [trackCustomAction]
  );

  /**
   * Execute sync operation with automatic error tracking
   */
  const safeSync = useCallback(
    <T>(
      operation: () => T,
      operationName: string,
      fallback: T,
      context?: Record<string, unknown>
    ): T => {
      try {
        return operation();
      } catch (error) {
        trackCustomAction(
          operationName,
          error instanceof Error ? error : new Error(String(error)),
          ErrorCategory.SYSTEM,
          ErrorSeverity.LOW,
          context
        );
        return fallback;
      }
    },
    [trackCustomAction]
  );

  return {
    safeAsync,
    safeSync,
  };
}

/**
 * Hook for tracking component lifecycle errors
 */
export function useComponentErrorTracking(componentName: string) {
  const { trackCustomAction } = useErrorTracking();

  /**
   * Track component mount errors
   */
  const trackMountError = useCallback(
    (error: Error) => {
      return trackCustomAction(
        "component_mount",
        error,
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        {
          componentName,
          lifecycle: "mount",
        }
      );
    },
    [componentName, trackCustomAction]
  );

  /**
   * Track component update errors
   */
  const trackUpdateError = useCallback(
    (error: Error, props?: Record<string, unknown>) => {
      return trackCustomAction(
        "component_update",
        error,
        ErrorCategory.SYSTEM,
        ErrorSeverity.MEDIUM,
        {
          componentName,
          lifecycle: "update",
          propsKeys: props ? Object.keys(props) : undefined,
        }
      );
    },
    [componentName, trackCustomAction]
  );

  /**
   * Track component unmount errors
   */
  const trackUnmountError = useCallback(
    (error: Error) => {
      return trackCustomAction(
        "component_unmount",
        error,
        ErrorCategory.SYSTEM,
        ErrorSeverity.LOW,
        { componentName, lifecycle: "unmount" }
      );
    },
    [componentName, trackCustomAction]
  );

  return {
    trackMountError,
    trackUpdateError,
    trackUnmountError,
  };
}

/**
 * Default export
 */
export default {
  useErrorTracking,
  useSafeAsync,
  useComponentErrorTracking,
};

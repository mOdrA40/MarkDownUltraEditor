/**
 * @fileoverview Simplified error tracking hooks
 * @author Axel Modra
 * @version 2.0.0
 */

import { useCallback } from 'react';
import { SentryUtils } from '@/utils/sentry';

/**
 * Simplified error tracking hook
 */
export function useErrorTracking() {
  /**
   * Track button click errors
   */
  const trackButtonError = useCallback(
    (buttonName: string, error: Error, context?: Record<string, unknown>) => {
      return SentryUtils.logError(error, {
        buttonName,
        interactionType: 'click',
        ...context,
      });
    },
    []
  );

  /**
   * Track form submission errors
   */
  const trackFormError = useCallback(
    (formName: string, error: Error, formData?: Record<string, unknown>) => {
      return SentryUtils.logError(error, {
        formName,
        interactionType: 'form_submit',
        formData: formData ? Object.keys(formData) : undefined,
      });
    },
    []
  );

  /**
   * Track file operation errors
   */
  const trackFileError = useCallback((operation: string, error: Error, fileName?: string) => {
    return SentryUtils.logError(error, {
      operation,
      fileName: fileName?.substring(0, 50),
      interactionType: 'file_operation',
    });
  }, []);

  /**
   * Track authentication errors
   */
  const trackAuthError = useCallback(
    (action: string, error: Error, context?: Record<string, unknown>) => {
      return SentryUtils.logAuthError(error, {
        action,
        interactionType: 'authentication',
        ...context,
      });
    },
    []
  );

  /**
   * Track validation errors
   */
  const trackValidationError = useCallback(
    (message: string, field?: string, context?: Record<string, unknown>) => {
      return SentryUtils.logValidationError(message, {
        field,
        interactionType: 'validation',
        ...context,
      });
    },
    []
  );

  /**
   * Track network errors
   */
  const trackNetworkError = useCallback((url: string, error: Error, method?: string) => {
    return SentryUtils.logNetworkError(error, {
      url: url.substring(0, 100),
      method,
      interactionType: 'network',
    });
  }, []);

  return {
    trackButtonError,
    trackFormError,
    trackFileError,
    trackAuthError,
    trackValidationError,
    trackNetworkError,
  };
}

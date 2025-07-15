/**
 * @fileoverview Secure Error Boundary with Sentry integration and request ID tracking
 * @author Security Team
 * @version 1.0.0
 */

import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorCategory, ErrorSeverity, secureSentry } from '@/utils/sentry';

/**
 * Error boundary props
 */
interface SecureErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, requestId: string | null) => void;
  showRequestId?: boolean;
  enableRetry?: boolean;
  category?: ErrorCategory;
}

/**
 * Error boundary state
 */
interface SecureErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  requestId: string | null;
  retryCount: number;
}

/**
 * Secure Error Boundary Component with Sentry integration
 */
export class SecureErrorBoundary extends Component<
  SecureErrorBoundaryProps,
  SecureErrorBoundaryState
> {
  private maxRetries = 3;

  constructor(props: SecureErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      requestId: null,
      retryCount: 0,
    };
  }

  /**
   * Static method to derive state from error
   */
  static getDerivedStateFromError(error: Error): Partial<SecureErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Component did catch error - log to Sentry with security context
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Generate request ID for this error
    const requestId = secureSentry.setRequestContext(window.location.pathname, {
      componentStack: errorInfo.componentStack?.substring(0, 1000), // Limit size
      errorBoundary: true,
      retryCount: this.state.retryCount,
    });

    // Log to Sentry with security context
    secureSentry.logError(error, this.props.category || ErrorCategory.SYSTEM, ErrorSeverity.HIGH, {
      componentStack: errorInfo.componentStack?.substring(0, 1000),
      errorBoundary: 'SecureErrorBoundary',
      retryCount: this.state.retryCount,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // Update state with error info and request ID
    this.setState({
      errorInfo,
      requestId,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, requestId);
    }

    // Log to console in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error Boundary caught an error:', error);
      console.error('📍 Component Stack:', errorInfo.componentStack);
      console.error('🆔 Request ID:', requestId);
    }
  }

  /**
   * Handle retry action
   */
  private handleRetry = (): void => {
    if (this.state.retryCount >= this.maxRetries) {
      // Log max retries reached
      secureSentry.logError(
        'Max retries reached for error boundary',
        ErrorCategory.SYSTEM,
        ErrorSeverity.CRITICAL,
        {
          originalError: this.state.error?.message,
          retryCount: this.state.retryCount,
          maxRetries: this.maxRetries,
        }
      );
      return;
    }

    // Reset error state and increment retry count
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      requestId: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  /**
   * Handle page reload
   */
  private handleReload = (): void => {
    // Log reload action
    secureSentry.logError(
      'User initiated page reload from error boundary',
      ErrorCategory.USER_ACTION,
      ErrorSeverity.LOW,
      {
        originalError: this.state.error?.message,
        requestId: this.state.requestId,
      }
    );

    window.location.reload();
  };

  /**
   * Render error UI
   */
  private renderErrorUI(): ReactNode {
    const { error, requestId, retryCount } = this.state;
    const { showRequestId = true, enableRetry = true } = this.props;
    const canRetry = enableRetry && retryCount < this.maxRetries;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Something went wrong</CardTitle>
            <CardDescription>
              We encountered an unexpected error. Our team has been notified and is working on a
              fix.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error details (development only) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-medium text-gray-800 mb-1">Error Details:</p>
                <p className="text-xs text-gray-600 font-mono break-all">{error.message}</p>
              </div>
            )}

            {/* Request ID for support */}
            {showRequestId && requestId && (
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">Support Reference</p>
                </div>
                <p className="text-xs text-blue-600 font-mono break-all">ID: {requestId}</p>
                <p className="text-xs text-blue-500 mt-1">
                  Please include this ID when contacting support
                </p>
              </div>
            )}

            {/* Retry information */}
            {retryCount > 0 && (
              <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  Retry attempt: {retryCount} of {this.maxRetries}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              {canRetry && (
                <Button onClick={this.handleRetry} variant="default" className="flex-1" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}

              <Button
                onClick={this.handleReload}
                variant={canRetry ? 'outline' : 'default'}
                className="flex-1"
                size="sm"
              >
                Reload Page
              </Button>
            </div>

            {/* Additional help */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                If this problem persists, please contact support with the reference ID above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Render method
   */
  render(): ReactNode {
    if (this.state.hasError) {
      // Return custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Return default error UI
      return this.renderErrorUI();
    }

    // Render children normally
    return this.props.children;
  }
}

/**
 * HOC to wrap components with secure error boundary
 */
export function withSecureErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<SecureErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <SecureErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </SecureErrorBoundary>
  );

  WrappedComponent.displayName = `withSecureErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

/**
 * Hook for manual error reporting
 */
export function useSecureErrorReporting() {
  const reportError = React.useCallback(
    (
      error: Error | string,
      category: ErrorCategory = ErrorCategory.USER_ACTION,
      context?: Record<string, unknown>
    ) => {
      const requestId = secureSentry.setRequestContext(window.location.pathname, context);

      secureSentry.logError(
        typeof error === 'string' ? new Error(error) : error,
        category,
        ErrorSeverity.MEDIUM,
        {
          manualReport: true,
          ...context,
        }
      );

      return requestId;
    },
    []
  );

  return { reportError };
}

/**
 * Default export
 */
export default SecureErrorBoundary;

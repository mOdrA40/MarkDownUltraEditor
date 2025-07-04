/**
 * @fileoverview Error boundary component for the markdown editor
 * @author Axel Modra
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Bug, Copy } from 'lucide-react';
import type { ErrorBoundaryState } from '../../types';

/**
 * Props for EditorErrorBoundary component
 */
interface EditorErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableReporting?: boolean;
}

/**
 * Error boundary component that catches JavaScript errors in the editor
 */
export class EditorErrorBoundary extends Component<EditorErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Editor Error Boundary caught an error:', error, errorInfo);
    }

    // Report error to monitoring service if enabled
    if (this.props.enableReporting) {
      this.reportError(error, errorInfo);
    }
  }

  /**
   * Report error to monitoring service
   */
  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Here you would integrate with your error reporting service
      // e.g., Sentry, LogRocket, Bugsnag, etc.
      console.log('Reporting error to monitoring service:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  /**
   * Reset error boundary state
   */
  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  /**
   * Reload the page
   */
  private handleReload = () => {
    window.location.reload();
  };

  /**
   * Copy error details to clipboard
   */
  private handleCopyError = async () => {
    if (!this.state.error) return;

    const errorDetails = {
      message: this.state.error.message,
      stack: this.state.error.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      alert('Error details copied to clipboard');
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Something went wrong
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The editor encountered an unexpected error
                </p>
              </div>
            </div>

            {/* Error message */}
            {this.state.error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <p className="text-sm text-red-800 dark:text-red-200 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col space-y-2">
              <Button onClick={this.handleReset} className="w-full" variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>

              <Button onClick={this.handleReload} className="w-full" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>

              {/* Development/Debug actions */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <Button
                    onClick={this.handleCopyError}
                    className="w-full"
                    variant="ghost"
                    size="sm"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Error Details
                  </Button>

                  {/* Error details (development only) */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Bug className="h-4 w-4 mr-1" />
                      Error Details
                    </summary>
                    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono overflow-auto max-h-40">
                      <pre>{this.state.error?.stack}</pre>
                      {this.state.errorInfo?.componentStack && (
                        <pre className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                </>
              )}
            </div>

            {/* Help text */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                If this problem persists, please try refreshing the page or clearing your browser
                cache.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for error boundary functionality in functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  // Throw error to be caught by error boundary
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
};

/**
 * Higher-order component for adding error boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<EditorErrorBoundaryProps>
) => {
  const WrappedComponent = (props: P) => {
    return (
      <EditorErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </EditorErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

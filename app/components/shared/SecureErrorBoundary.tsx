/**
 * @fileoverview Simplified Error Boundary with basic error tracking
 * @author Axel Modra
 * @version 2.0.0
 */

import { AlertTriangle, RefreshCw } from 'lucide-react';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorCategory, simpleSentry } from '@/utils/sentry';

/**
 * Simplified error boundary props
 */
interface SecureErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  category?: ErrorCategory;
}

/**
 * Simplified error boundary state
 */
interface SecureErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

/**
 * Simplified Error Boundary Component
 */
export class SecureErrorBoundary extends Component<
  SecureErrorBoundaryProps,
  SecureErrorBoundaryState
> {
  private maxRetries = 2;

  constructor(props: SecureErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
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
   * Component did catch error - log to Sentry
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to Sentry with basic context
    simpleSentry.logError(error, this.props.category || ErrorCategory.SYSTEM, undefined, {
      componentStack: errorInfo.componentStack?.substring(0, 500),
      retryCount: this.state.retryCount,
      url: window.location.href,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Handle retry action
   */
  private handleRetry = (): void => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        retryCount: this.state.retryCount + 1,
      });
    }
  };

  /**
   * Handle page reload
   */
  private handleReload = (): void => {
    window.location.reload();
  };

  /**
   * Render error UI
   */
  private renderErrorUI(): ReactNode {
    const { error, retryCount } = this.state;
    const { enableRetry = true } = this.props;
    const canRetry = enableRetry && retryCount < this.maxRetries;

    return (
      <div className="flex min-h-[400px] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Oops! Terjadi Kesalahan</CardTitle>
            <CardDescription>
              Aplikasi mengalami masalah yang tidak terduga. Silakan coba lagi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && error && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Error Details (Development):
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {canRetry && (
                <Button onClick={this.handleRetry} variant="default" className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Coba Lagi ({this.maxRetries - retryCount} tersisa)
                </Button>
              )}

              <Button onClick={this.handleReload} variant="outline" className="w-full">
                Muat Ulang Halaman
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Jika masalah berlanjut, silakan hubungi support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Render component
   */
  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || this.renderErrorUI();
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<SecureErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <SecureErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </SecureErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Export default
 */
export default SecureErrorBoundary;

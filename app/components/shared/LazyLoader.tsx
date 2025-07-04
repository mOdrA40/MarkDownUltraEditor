/**
 * @fileoverview Lazy loading wrapper component with loading states
 * @author Axel Modra
 */

import React, { Suspense } from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Loading spinner component
 */
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}> = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <RefreshCw className={`${sizeClasses[size]} animate-spin text-blue-600 mb-2`} />
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
};

/**
 * Error boundary for lazy loaded components
 */
interface LazyErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<{ error?: Error; retry: () => void }> }>,
  LazyErrorBoundaryState
> {
  constructor(
    props: React.PropsWithChildren<{
      fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
    }>
  ) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): LazyErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <span className="text-red-600 text-xl">⚠</span>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load component</h3>
    <p className="text-sm text-gray-600 mb-4">
      {error?.message || 'Something went wrong while loading this component.'}
    </p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

/**
 * Lazy loader wrapper component
 */
export const LazyLoader: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
  className?: string;
}> = ({ children, fallback = <LoadingSpinner />, errorFallback, className = '' }) => {
  return (
    <div className={className}>
      <LazyErrorBoundary fallback={errorFallback}>
        <Suspense fallback={fallback}>{children}</Suspense>
      </LazyErrorBoundary>
    </div>
  );
};

/**
 * HOC for creating lazy loaded components
 */
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  loadingProps?: {
    fallback?: React.ReactNode;
    errorFallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
  }
) {
  const LazyComponent = React.forwardRef<any, P>((props, ref) => (
    <LazyLoader fallback={loadingProps?.fallback} errorFallback={loadingProps?.errorFallback}>
      <Component {...(props as any)} ref={ref} />
    </LazyLoader>
  ));

  LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;

  return LazyComponent;
}

/**
 * Hook for preloading components
 */
export const usePreloadComponent = () => {
  const preloadedComponents = React.useRef(new Set<string>());

  const preload = React.useCallback((componentLoader: () => Promise<any>, key: string) => {
    if (preloadedComponents.current.has(key)) {
      return;
    }

    preloadedComponents.current.add(key);

    // Preload on idle or after a delay
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        componentLoader().catch(console.error);
      });
    } else {
      setTimeout(() => {
        componentLoader().catch(console.error);
      }, 100);
    }
  }, []);

  return { preload };
};

/**
 * Intersection observer based lazy loading
 */
export const LazyOnVisible: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}> = ({
  children,
  fallback = <LoadingSpinner />,
  rootMargin = '50px',
  threshold = 0.1,
  className = '',
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
};

/**
 * Progressive image loading component
 */
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
  className = '',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = React.useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = React.useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm"
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export default LazyLoader;

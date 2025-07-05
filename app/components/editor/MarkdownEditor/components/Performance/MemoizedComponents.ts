/**
 * @fileoverview Memoized component wrappers for performance optimization
 * @author Axel Modra
 */

import React, { memo, useCallback, useMemo } from 'react';
import { useDeepMemo, useMemoizedObject } from '@/hooks/performance/useMemoization';
import { useTOCItems, VirtualizedTableOfContents } from '../../../VirtualizedTableOfContents';
import { EditorFooter, type EditorFooterProps } from '../Layout/EditorFooter';
import { EditorHeader, type EditorHeaderProps } from '../Layout/EditorHeader';
import { EditorMainContent, type EditorMainContentProps } from '../Layout/EditorMainContent';
import { EditorSidebar, type EditorSidebarProps } from '../Layout/EditorSidebar';

/**
 * Memoized editor header component
 */
export const MemoizedEditorHeader = memo<EditorHeaderProps>(
  (props) => {
    return React.createElement(EditorHeader, props);
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.fileName === nextProps.fileName &&
      prevProps.isModified === nextProps.isModified &&
      prevProps.currentTheme.id === nextProps.currentTheme.id &&
      prevProps.showPreview === nextProps.showPreview &&
      prevProps.settings.fontSize === nextProps.settings.fontSize &&
      prevProps.settings.lineHeight === nextProps.settings.lineHeight &&
      prevProps.settings.focusMode === nextProps.settings.focusMode &&
      prevProps.settings.typewriterMode === nextProps.settings.typewriterMode &&
      prevProps.settings.wordWrap === nextProps.settings.wordWrap &&
      prevProps.settings.vimMode === nextProps.settings.vimMode &&
      prevProps.settings.zenMode === nextProps.settings.zenMode &&
      prevProps.canUndo === nextProps.canUndo &&
      prevProps.canRedo === nextProps.canRedo &&
      prevProps.responsive.isMobile === nextProps.responsive.isMobile &&
      prevProps.responsive.isTablet === nextProps.responsive.isTablet &&
      prevProps.responsive.isSmallTablet === nextProps.responsive.isSmallTablet &&
      prevProps.zenMode === nextProps.zenMode
    );
  }
);

MemoizedEditorHeader.displayName = 'MemoizedEditorHeader';

/**
 * Memoized editor sidebar component
 */
export const MemoizedEditorSidebar = memo<EditorSidebarProps>(
  (props) => {
    return React.createElement(EditorSidebar, props);
  },
  (prevProps, nextProps) => {
    return (
      prevProps.markdown === nextProps.markdown &&
      prevProps.theme.id === nextProps.theme.id &&
      prevProps.uiState.showToc === nextProps.uiState.showToc &&
      prevProps.uiState.showOutline === nextProps.uiState.showOutline &&
      prevProps.uiState.sidebarCollapsed === nextProps.uiState.sidebarCollapsed &&
      prevProps.responsive.isMobile === nextProps.responsive.isMobile &&
      prevProps.responsive.isTablet === nextProps.responsive.isTablet &&
      prevProps.zenMode === nextProps.zenMode
    );
  }
);

MemoizedEditorSidebar.displayName = 'MemoizedEditorSidebar';

/**
 * Memoized editor main content component
 */
export const MemoizedEditorMainContent = memo<EditorMainContentProps>(
  (props) => {
    return React.createElement(EditorMainContent, props);
  },
  (prevProps, nextProps) => {
    return (
      prevProps.markdown === nextProps.markdown &&
      prevProps.theme.id === nextProps.theme.id &&
      prevProps.settings.fontSize === nextProps.settings.fontSize &&
      prevProps.settings.lineHeight === nextProps.settings.lineHeight &&
      prevProps.settings.focusMode === nextProps.settings.focusMode &&
      prevProps.settings.typewriterMode === nextProps.settings.typewriterMode &&
      prevProps.settings.wordWrap === nextProps.settings.wordWrap &&
      prevProps.settings.vimMode === nextProps.settings.vimMode &&
      prevProps.settings.zenMode === nextProps.settings.zenMode &&
      prevProps.showPreview === nextProps.showPreview &&
      prevProps.responsive.isMobile === nextProps.responsive.isMobile &&
      prevProps.responsive.isTablet === nextProps.responsive.isTablet &&
      prevProps.responsive.isSmallTablet === nextProps.responsive.isSmallTablet
      // Note: onInsertTextAtCursor is intentionally not compared as it's a function that may change
    );
  }
);

MemoizedEditorMainContent.displayName = 'MemoizedEditorMainContent';

/**
 * Memoized editor footer component
 */
export const MemoizedEditorFooter = memo<EditorFooterProps>(
  (props) => {
    return React.createElement(EditorFooter, props);
  },
  (prevProps, nextProps) => {
    return (
      prevProps.markdown === nextProps.markdown &&
      prevProps.responsive.isMobile === nextProps.responsive.isMobile &&
      prevProps.responsive.isTablet === nextProps.responsive.isTablet &&
      prevProps.zenMode === nextProps.zenMode
    );
  }
);

MemoizedEditorFooter.displayName = 'MemoizedEditorFooter';

/**
 * Performance optimization hooks
 */

/**
 * Memoized callback hook with dependency tracking
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T {
  // biome-ignore lint/correctness/useExhaustiveDependencies: Custom hook with explicit dependency control
  return useCallback(callback, deps) as T;
}

/**
 * Memoized value hook with deep comparison
 */
export function useStableValue<T>(factory: () => T, deps: React.DependencyList): T {
  // biome-ignore lint/correctness/useExhaustiveDependencies: Custom hook with explicit dependency control
  return useMemo(factory, deps);
}

/**
 * Memoized object hook to prevent unnecessary re-renders
 */
export function useStableObject<T extends Record<string, unknown>>(obj: T): T {
  // biome-ignore lint/correctness/useExhaustiveDependencies: Using Object.values for deep comparison
  return useMemo(() => obj, Object.values(obj));
}

/**
 * Memoized array hook to prevent unnecessary re-renders
 */
export function useStableArray<T>(arr: T[]): T[] {
  // biome-ignore lint/correctness/useExhaustiveDependencies: Using array itself as dependency for shallow comparison
  return useMemo(() => arr, arr);
}

/**
 * Hook for memoizing expensive computations
 */
export function useStableComputation<T>(
  computation: () => T,
  _deps: React.DependencyList,
  shouldCompute = true
): T | undefined {
  return useMemo(() => {
    if (!shouldCompute) return undefined;

    const start = typeof window !== 'undefined' ? performance.now() : Date.now();
    const result = computation();
    const duration = typeof window !== 'undefined' ? performance.now() - start : Date.now() - start;

    if (process.env.NODE_ENV === 'development' && duration > 16) {
      console.warn(`Expensive computation took ${duration.toFixed(2)}ms`);
    }

    return result;
  }, [computation, shouldCompute]);
}

/**
 * Hook for debounced values
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled values
 */
export function useThrottledValue<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef<number>(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current)
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Higher-order component for performance optimization
 */
export function withPerformanceOptimization<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  compareProps?: (prevProps: P, nextProps: P) => boolean
) {
  const OptimizedComponent = memo(Component, compareProps);

  const WrappedComponent: React.FC<P> = (props: P) => {
    // Track render count in development
    const renderCount = React.useRef(0);

    React.useEffect(() => {
      renderCount.current += 1;

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `${Component.displayName || Component.name} rendered ${renderCount.current} times`
        );
      }
    });

    // biome-ignore lint/suspicious/noExplicitAny: Required for generic component wrapping
    return React.createElement(OptimizedComponent as any, props);
  };

  WrappedComponent.displayName = `withPerformanceOptimization(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * VirtualizedEditorSidebar - Enhanced sidebar with virtualized TOC for large documents
 */
export const VirtualizedEditorSidebar = memo<
  EditorSidebarProps & { enableVirtualization?: boolean }
>(
  ({ markdown, enableVirtualization = false, ...props }) => {
    // Extract TOC items from markdown
    const tocItems = useTOCItems(markdown);

    // Use virtualization for large documents (>100 headings)
    const shouldVirtualize = enableVirtualization && tocItems.length > 100;

    // Memoized TOC component selection
    const TOCComponent = useDeepMemo(() => {
      return shouldVirtualize ? VirtualizedTableOfContents : null;
    }, [shouldVirtualize]);

    // Memoized props for performance
    const memoizedProps = useMemoizedObject({
      ...props,
      markdown,
      tocItems,
      shouldVirtualize,
    });

    if (shouldVirtualize && TOCComponent) {
      // Render with virtualized TOC using React.createElement
      return React.createElement(
        'div',
        { className: 'editor-sidebar-virtualized' },
        React.createElement(EditorSidebar, memoizedProps),
        React.createElement(TOCComponent, {
          items: tocItems,
          onItemClick: (item: { id: string; text: string; level: number; line: number }) => {
            // Scroll to heading logic would go here
            console.log('Navigate to:', item.text);
          },
          className: 'virtualized-toc',
        })
      );
    }

    // Render normal sidebar
    return React.createElement(EditorSidebar, memoizedProps);
  },
  (prevProps, nextProps) => {
    // Enhanced comparison including virtualization flag
    return (
      prevProps.markdown === nextProps.markdown &&
      prevProps.enableVirtualization === nextProps.enableVirtualization &&
      prevProps.theme?.id === nextProps.theme?.id &&
      prevProps.uiState?.showToc === nextProps.uiState?.showToc &&
      prevProps.uiState?.showOutline === nextProps.uiState?.showOutline &&
      prevProps.responsive?.isMobile === nextProps.responsive?.isMobile &&
      prevProps.responsive?.isTablet === nextProps.responsive?.isTablet &&
      prevProps.zenMode === nextProps.zenMode
    );
  }
);

VirtualizedEditorSidebar.displayName = 'VirtualizedEditorSidebar';

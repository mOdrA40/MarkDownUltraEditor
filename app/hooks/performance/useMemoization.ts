/**
 * @fileoverview Advanced memoization hooks for performance optimization
 * @author Axel Modra
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';
import { useMemoOne } from 'use-memo-one';

/**
 * Enhanced useMemo with deep comparison
 * Uses react-fast-compare for better performance than JSON.stringify
 */
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemoOne(factory, deps);
}

/**
 * Enhanced useCallback with deep comparison
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic function type requires any for flexibility
export function useDeepCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useMemoOne(() => callback, deps);
}

/**
 * Memoize expensive computations with cache
 */
export function useComputedValue<T, Args extends readonly unknown[]>(
  computeFn: (...args: Args) => T,
  args: Args,
  options: {
    maxCacheSize?: number;
    ttl?: number; // Time to live in milliseconds
  } = {}
): T {
  const { maxCacheSize = 10, ttl = 5 * 60 * 1000 } = options; // 5 minutes default TTL

  const cacheRef = useRef<Map<string, { value: T; timestamp: number }>>(new Map());

  return useMemo(() => {
    const key = JSON.stringify(args);
    const cache = cacheRef.current;
    const now = Date.now();

    // Check if we have a valid cached value
    const cached = cache.get(key);
    if (cached && now - cached.timestamp < ttl) {
      return cached.value;
    }

    // Compute new value
    const value = computeFn(...args);

    // Clean up expired entries
    for (const [cacheKey, cacheValue] of cache.entries()) {
      if (now - cacheValue.timestamp >= ttl) {
        cache.delete(cacheKey);
      }
    }

    // Limit cache size (LRU-like behavior)
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }

    // Cache the new value
    cache.set(key, { value, timestamp: now });

    return value;
  }, [computeFn, args, maxCacheSize, ttl]);
}

/**
 * Debounced value hook for performance optimization
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
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
 * Throttled callback hook
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic function type requires any for flexibility
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  const delayRef = useRef(delay);
  const callbackRef = useRef(callback);

  // Update refs
  delayRef.current = delay;
  callbackRef.current = callback;

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delayRef.current) {
        callbackRef.current(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [] // No dependencies needed since we use refs
  );
}

/**
 * Stable reference hook - prevents unnecessary re-renders
 */
export function useStableReference<T>(value: T): T {
  const ref = useRef<T>(value);

  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}

/**
 * Memoized object hook - prevents object recreation
 */
// biome-ignore lint/suspicious/noExplicitAny: Record type requires any for flexibility
export function useMemoizedObject<T extends Record<string, any>>(obj: T): T {
  return useDeepMemo(() => obj, [obj]);
}

/**
 * Memoized array hook - prevents array recreation
 */
export function useMemoizedArray<T>(arr: T[]): T[] {
  return useDeepMemo(() => arr, [arr]);
}

/**
 * Previous value hook - useful for comparisons
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useMemoOne(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Changed value hook - detects when value changes
 */
export function useChanged<T>(value: T): boolean {
  const previous = usePrevious(value);
  return !isEqual(previous, value);
}

/**
 * Expensive operation hook with automatic memoization
 */
// Removed complex useExpensiveOperation hook to avoid type issues

/**
 * Batch updates hook - reduces re-renders (simplified)
 */
export function useBatchedUpdates<T>(
  initialValue: T,
  batchDelay = 16 // One frame
): [T, (updater: (prev: T) => T) => void] {
  const [value, setValue] = useState(initialValue);
  const pendingUpdates = useRef<((prev: T) => T)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchedSetValue = useCallback(
    (updater: (prev: T) => T) => {
      pendingUpdates.current.push(updater);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setValue((prev) => {
          let newValue = prev;
          for (const update of pendingUpdates.current) {
            newValue = update(newValue);
          }
          pendingUpdates.current = [];
          return newValue;
        });
      }, batchDelay);
    },
    [batchDelay]
  );

  return [value, batchedSetValue];
}

/**
 * Intersection observer hook for virtualization
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([observedEntry]) => {
      if (observedEntry) {
        setEntry(observedEntry);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);

  return entry;
}

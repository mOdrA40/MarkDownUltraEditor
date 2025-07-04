/**
 * Main toast hook dengan refactored architecture
 * Menggunakan separated concerns dan reusable utilities
 */

import { useReducer, useCallback, useEffect } from 'react';
import type {
  ToasterToast,
  ToastInput,
  ToastReturn,
  UseToastOptions,
  UseToastReturn,
} from '@/types/toast';
import { toastReducer, initialToastState, toastActionCreators } from '../toast/toastReducer';
import {
  generateToastId,
  validateToastInput,
  sanitizeToastContent,
  clearAllToastTimeouts,
} from '@/utils/toastUtils';

/**
 * Global state management untuk toast system
 */
const listeners: Array<(state: typeof initialToastState) => void> = [];
let memoryState = initialToastState;

/**
 * Global dispatch function dengan enhanced error handling
 */
function dispatch(action: Parameters<typeof toastReducer>[1]) {
  try {
    memoryState = toastReducer(memoryState, action, dispatch);
    listeners.forEach((listener) => {
      listener(memoryState);
    });
  } catch (error) {
    console.error('Toast dispatch error:', error);
  }
}

/**
 * Create toast function dengan validation dan sanitization
 */
function toast(props: ToastInput): ToastReturn {
  // Validate input
  if (!validateToastInput(props)) {
    throw new Error('Invalid toast props');
  }

  const id = generateToastId();

  // Sanitize content
  const sanitizedProps = {
    ...props,
    title: sanitizeToastContent(props.title),
    description: sanitizeToastContent(props.description),
  };

  const update = (updateProps: ToasterToast) =>
    dispatch(toastActionCreators.updateToast({ ...updateProps, id }));

  const dismiss = () => dispatch(toastActionCreators.dismissToast(id));

  dispatch(
    toastActionCreators.addToast({
      ...sanitizedProps,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    })
  );

  return {
    id,
    dismiss,
    update,
  };
}

/**
 * Main useToast hook dengan options support
 */
function useToast(): UseToastReturn {
  const [state, setState] = useReducer(toastReducer, memoryState);

  // Setup global state listener
  useEffect(() => {
    const listener = (newState: typeof initialToastState) => {
      setState({ type: 'SYNC_STATE', payload: newState } as never);
    };

    listeners.push(listener);

    // Sync with current memory state
    if (memoryState !== state) {
      setState({ type: 'SYNC_STATE', payload: memoryState } as never);
    }

    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllToastTimeouts();
    };
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    dispatch(toastActionCreators.dismissToast(toastId));
  }, []);

  const clear = useCallback(() => {
    dispatch(toastActionCreators.removeToast());
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss,
    clear,
  };
}

export { useToast, toast };

// Re-export types untuk convenience
export type { ToasterToast, ToastInput, ToastReturn, UseToastOptions, UseToastReturn };

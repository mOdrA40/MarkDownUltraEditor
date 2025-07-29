/**
 * Toast reducer untuk state management
 * Pure reducer functions dengan immutable state updates
 */

import {
  TOAST_ACTION_TYPES,
  TOAST_CONFIG,
  type ToastAction,
  type ToasterToast,
  type ToastState,
} from '@/types/toast';
import { addToRemoveQueue } from '@/utils/toastUtils';

/**
 * Initial state untuk toast reducer
 */
export const initialToastState: ToastState = {
  toasts: [],
};

/**
 * Toast reducer dengan comprehensive action handling
 */
export const toastReducer = (
  state: ToastState,
  action: ToastAction,
  dispatch?: (action: ToastAction) => void
): ToastState => {
  switch (action.type) {
    case TOAST_ACTION_TYPES.ADD_TOAST: {
      const newToasts = [action.toast, ...state.toasts].slice(0, TOAST_CONFIG.LIMIT);

      return {
        ...state,
        toasts: newToasts,
      };
    }

    case TOAST_ACTION_TYPES.UPDATE_TOAST: {
      if (!action.toast.id) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.warn('Toast update requires an ID');
        });
        return state;
      }

      const updatedToasts = state.toasts.map((toast) =>
        toast.id === action.toast.id ? { ...toast, ...action.toast } : toast
      );

      return {
        ...state,
        toasts: updatedToasts,
      };
    }

    case TOAST_ACTION_TYPES.SYNC_STATE: {
      // Handle state synchronization for global toast management
      return {
        ...state,
        toasts: action.payload.toasts || [],
      };
    }

    case TOAST_ACTION_TYPES.DISMISS_TOAST: {
      const { toastId } = action;

      // Side effect: Add to remove queue
      if (dispatch) {
        if (toastId) {
          addToRemoveQueue(toastId, dispatch);
        } else {
          // Dismiss all toasts
          state.toasts.forEach((toast) => {
            addToRemoveQueue(toast.id, dispatch);
          });
        }
      }

      // Update state to mark toasts as closed
      const dismissedToasts = state.toasts.map((toast) =>
        toast.id === toastId || toastId === undefined ? { ...toast, open: false } : toast
      );

      return {
        ...state,
        toasts: dismissedToasts,
      };
    }

    case TOAST_ACTION_TYPES.REMOVE_TOAST: {
      const { toastId } = action;

      if (!toastId) {
        // Remove all toasts
        return {
          ...state,
          toasts: [],
        };
      }

      const filteredToasts = state.toasts.filter((toast) => toast.id !== toastId);

      return {
        ...state,
        toasts: filteredToasts,
      };
    }

    default: {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.warn(`Unknown toast action type: ${(action as { type: string }).type}`);
      });
      return state;
    }
  }
};

/**
 * Action creators untuk toast reducer
 */
export const toastActionCreators = {
  /**
   * Add new toast
   */
  addToast: (toast: ToasterToast): ToastAction => ({
    type: TOAST_ACTION_TYPES.ADD_TOAST,
    toast,
  }),

  /**
   * Update existing toast
   */
  updateToast: (toast: Partial<ToasterToast>): ToastAction => ({
    type: TOAST_ACTION_TYPES.UPDATE_TOAST,
    toast,
  }),

  /**
   * Dismiss toast(s)
   */
  dismissToast: (toastId?: string): ToastAction => ({
    type: TOAST_ACTION_TYPES.DISMISS_TOAST,
    toastId,
  }),

  /**
   * Remove toast(s)
   */
  removeToast: (toastId?: string): ToastAction => ({
    type: TOAST_ACTION_TYPES.REMOVE_TOAST,
    toastId,
  }),
};

import { useCallback, useRef, useState } from 'react';

interface HistoryState {
  value: string;
  timestamp: number;
}

interface UseUndoRedoOptions {
  maxHistorySize?: number;
  debounceMs?: number;
}

interface UseUndoRedoReturn {
  value: string;
  setValue: (newValue: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: (newValue?: string) => void;
}

export const useUndoRedo = (
  initialValue = '',
  options: UseUndoRedoOptions = {}
): UseUndoRedoReturn => {
  const { maxHistorySize = 50, debounceMs = 200 } = options; // Increased for better stability

  // Optimized state management - single source of truth
  const [state, setState] = useState(() => ({
    history: [{ value: initialValue, timestamp: Date.now() }] as HistoryState[],
    currentIndex: 0,
    currentValue: initialValue,
  }));

  // Control flags
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isUndoRedoOperation = useRef(false);
  const lastHistoryValue = useRef(initialValue);

  // Add new state to history - atomic operation
  const addToHistory = useCallback(
    (value: string) => {
      if (isUndoRedoOperation.current || value === lastHistoryValue.current) {
        return; // Skip if undo/redo operation or value hasn't changed
      }

      setState((prevState) => {
        // Remove any future history if we're not at the end
        const newHistory = prevState.history.slice(0, prevState.currentIndex + 1);

        // Add new state
        newHistory.push({
          value,
          timestamp: Date.now(),
        });

        // Limit history size
        const limitedHistory =
          newHistory.length > maxHistorySize ? newHistory.slice(-maxHistorySize) : newHistory;

        const newIndex = limitedHistory.length - 1;
        lastHistoryValue.current = value;

        return {
          history: limitedHistory,
          currentIndex: newIndex,
          currentValue: value,
        };
      });
    },
    [maxHistorySize]
  );

  // Set value with immediate UI update and debounced history
  const setValue = useCallback(
    (newValue: string) => {
      if (isUndoRedoOperation.current) {
        return; // Ignore setValue during undo/redo operations
      }

      // Skip if value hasn't actually changed
      if (newValue === state.currentValue) {
        return;
      }

      // Update current value immediately for instant UI response
      setState((prevState) => ({
        ...prevState,
        currentValue: newValue,
      }));

      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Debounce adding to history to prevent excessive history entries
      debounceTimer.current = setTimeout(() => {
        if (!isUndoRedoOperation.current) {
          addToHistory(newValue);
        }
      }, debounceMs);
    },
    [state.currentValue, addToHistory, debounceMs]
  );

  // Undo function - atomic operation
  const undo = useCallback(() => {
    if (state.currentIndex <= 0) return;

    // Clear any pending debounced changes
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    isUndoRedoOperation.current = true;
    const newIndex = state.currentIndex - 1;
    const newValue = state.history[newIndex]?.value || '';

    setState((prevState) => ({
      ...prevState,
      currentIndex: newIndex,
      currentValue: newValue,
    }));

    lastHistoryValue.current = newValue;

    // Reset flag immediately - no delay needed
    setTimeout(() => {
      isUndoRedoOperation.current = false;
    }, 0);
  }, [state.currentIndex, state.history]);

  // Redo function - atomic operation
  const redo = useCallback(() => {
    if (state.currentIndex >= state.history.length - 1) return;

    // Clear any pending debounced changes
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    isUndoRedoOperation.current = true;
    const newIndex = state.currentIndex + 1;
    const newValue = state.history[newIndex]?.value || '';

    setState((prevState) => ({
      ...prevState,
      currentIndex: newIndex,
      currentValue: newValue,
    }));

    lastHistoryValue.current = newValue;

    // Reset flag immediately - no delay needed
    setTimeout(() => {
      isUndoRedoOperation.current = false;
    }, 0);
  }, [state.currentIndex, state.history]);

  // Clear history - atomic operation
  const clearHistory = useCallback(
    (newValue?: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }

      const valueToUse = newValue !== undefined ? newValue : state.currentValue;

      setState({
        history: [{ value: valueToUse, timestamp: Date.now() }],
        currentIndex: 0,
        currentValue: valueToUse,
      });

      lastHistoryValue.current = valueToUse;
    },
    [state.currentValue]
  );

  // Can undo/redo flags - derived from state
  const canUndo = state.currentIndex > 0;
  const canRedo = state.currentIndex < state.history.length - 1;

  return {
    value: state.currentValue,
    setValue,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
  };
};

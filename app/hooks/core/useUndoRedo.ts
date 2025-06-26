import { useState, useCallback, useRef, useMemo } from 'react';

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
  clearHistory: () => void;
}

export const useUndoRedo = (
  initialValue: string = '',
  options: UseUndoRedoOptions = {}
): UseUndoRedoReturn => {
  const { maxHistorySize = 50, debounceMs = 500 } = options;

  // Single state object to avoid circular dependencies
  const [state, setState] = useState({
    history: [{ value: initialValue, timestamp: Date.now() }] as HistoryState[],
    currentIndex: 0
  });

  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const pendingValue = useRef<string | null>(null);

  // Current value - memoized to avoid recalculation
  const currentValue = useMemo(() => {
    return state.history[state.currentIndex]?.value || initialValue;
  }, [state.history, state.currentIndex, initialValue]);
  
  // Add new state to history - simplified and stable
  const addToHistory = useCallback((value: string) => {
    setState(prevState => {
      const newState: HistoryState = {
        value,
        timestamp: Date.now()
      };

      // Remove any future history if we're not at the end
      const newHistory = prevState.history.slice(0, prevState.currentIndex + 1);

      // Add new state
      newHistory.push(newState);

      // Limit history size
      const limitedHistory = newHistory.length > maxHistorySize
        ? newHistory.slice(-maxHistorySize)
        : newHistory;

      return {
        history: limitedHistory,
        currentIndex: limitedHistory.length - 1
      };
    });
  }, [maxHistorySize]);
  
  // Set value with debouncing - simplified and stable
  const setValue = useCallback((newValue: string) => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Store pending value
    pendingValue.current = newValue;

    // Update current state immediately for UI responsiveness
    setState(prevState => {
      const newHistory = [...prevState.history];
      if (newHistory[prevState.currentIndex]) {
        newHistory[prevState.currentIndex] = {
          ...newHistory[prevState.currentIndex],
          value: newValue
        };
      }
      return {
        ...prevState,
        history: newHistory
      };
    });

    // Debounce adding to history
    debounceTimer.current = setTimeout(() => {
      if (pendingValue.current !== null) {
        setState(currentState => {
          const currentVal = currentState.history[currentState.currentIndex]?.value;
          if (pendingValue.current !== null && pendingValue.current !== currentVal) {
            addToHistory(pendingValue.current);
          }
          pendingValue.current = null;
          return currentState; // No change to state here
        });
      }
    }, debounceMs);
  }, [addToHistory, debounceMs]);
  
  // Undo function - simplified and stable
  const undo = useCallback(() => {
    // Clear any pending debounced changes
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
      pendingValue.current = null;
    }

    setState(prevState => ({
      ...prevState,
      currentIndex: prevState.currentIndex > 0 ? prevState.currentIndex - 1 : prevState.currentIndex
    }));
  }, []);

  // Redo function - simplified and stable
  const redo = useCallback(() => {
    // Clear any pending debounced changes
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
      pendingValue.current = null;
    }

    setState(prevState => ({
      ...prevState,
      currentIndex: prevState.currentIndex < prevState.history.length - 1
        ? prevState.currentIndex + 1
        : prevState.currentIndex
    }));
  }, []);
  
  // Clear history - simplified and stable
  const clearHistory = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    setState(prevState => {
      const currentVal = prevState.history[prevState.currentIndex]?.value || initialValue;
      pendingValue.current = null;
      return {
        history: [{ value: currentVal, timestamp: Date.now() }],
        currentIndex: 0
      };
    });
  }, [initialValue]);
  
  // Can undo/redo flags - stable calculations
  const canUndo = state.currentIndex > 0;
  const canRedo = state.currentIndex < state.history.length - 1;
  
  return {
    value: currentValue,
    setValue,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  };
};

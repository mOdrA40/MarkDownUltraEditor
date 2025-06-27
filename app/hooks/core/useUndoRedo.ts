import { useState, useCallback, useRef, useMemo, useEffect } from 'react';

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
  const { maxHistorySize = 50, debounceMs = 1000 } = options; // Increased debounce time

  // Simplified state management
  const [history, setHistory] = useState<HistoryState[]>([
    { value: initialValue, timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentValue, setCurrentValue] = useState(initialValue);

  // Debounce timer and pending value
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isUndoRedoOperation = useRef(false);

  // Add new state to history - simplified and stable
  const addToHistory = useCallback((value: string) => {
    if (isUndoRedoOperation.current) {
      return; // Skip adding to history during undo/redo operations
    }

    const newState: HistoryState = {
      value,
      timestamp: Date.now()
    };

    setHistory(prevHistory => {
      // Remove any future history if we're not at the end
      const newHistory = prevHistory.slice(0, currentIndex + 1);

      // Add new state
      newHistory.push(newState);

      // Limit history size
      const limitedHistory = newHistory.length > maxHistorySize
        ? newHistory.slice(-maxHistorySize)
        : newHistory;

      return limitedHistory;
    });

    setCurrentIndex(prevIndex => {
      const newIndex = Math.min(prevIndex + 1, maxHistorySize - 1);
      return newIndex;
    });
  }, [currentIndex, maxHistorySize]);

  // Set value with debouncing - simplified and stable
  const setValue = useCallback((newValue: string) => {
    if (isUndoRedoOperation.current) {
      // During undo/redo, just update current value without adding to history
      setCurrentValue(newValue);
      return;
    }

    // Update current value immediately for UI responsiveness
    setCurrentValue(newValue);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce adding to history
    debounceTimer.current = setTimeout(() => {
      const currentHistoryValue = history[currentIndex]?.value;
      if (newValue !== currentHistoryValue && newValue.trim() !== '') {
        addToHistory(newValue);
      }
    }, debounceMs);
  }, [addToHistory, debounceMs, history, currentIndex]);

  // Undo function - simplified and stable
  const undo = useCallback(() => {
    if (currentIndex <= 0) return;

    // Clear any pending debounced changes
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    isUndoRedoOperation.current = true;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    setCurrentValue(history[newIndex]?.value || '');

    // Reset flag after a short delay
    setTimeout(() => {
      isUndoRedoOperation.current = false;
    }, 100);
  }, [currentIndex, history]);

  // Redo function - simplified and stable
  const redo = useCallback(() => {
    if (currentIndex >= history.length - 1) return;

    // Clear any pending debounced changes
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    isUndoRedoOperation.current = true;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    setCurrentValue(history[newIndex]?.value || '');

    // Reset flag after a short delay
    setTimeout(() => {
      isUndoRedoOperation.current = false;
    }, 100);
  }, [currentIndex, history]);

  // Clear history - simplified and stable
  const clearHistory = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    const newHistory = [{ value: currentValue, timestamp: Date.now() }];
    setHistory(newHistory);
    setCurrentIndex(0);
  }, [currentValue]);

  // Can undo/redo flags - stable calculations
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Effect to sync current value with history when index changes
  useEffect(() => {
    if (!isUndoRedoOperation.current) {
      const historyValue = history[currentIndex]?.value;
      if (historyValue !== undefined && historyValue !== currentValue) {
        setCurrentValue(historyValue);
      }
    }
  }, [currentIndex, history]);

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

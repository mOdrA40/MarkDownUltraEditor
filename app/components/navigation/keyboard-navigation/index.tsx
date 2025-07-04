/**
 * Keyboard navigation components export
 * Re-export semua keyboard navigation-related components dan hooks
 */

// Re-export types
export type {
  KeyboardNavigationOptions,
  UseKeyboardNavigationReturn,
} from '@/hooks/navigation';
// Re-export main hooks
export { useFocusManagement, useKeyboardNavigation } from '@/hooks/navigation';

export type {
  UseFocusManagementOptions,
  UseFocusManagementReturn,
} from '@/hooks/navigation/useFocusManagement';

// Re-export utilities
export {
  calculateTargetIndex,
  debounceKeyboard,
  focusElement,
  getElementByDataAttribute,
  getFocusableElements,
  isElementInViewport,
  isFocusable,
  isKeyMatch,
  type NavigationDirection,
  type ScrollOptions,
  scrollElementIntoView,
  throttleKeyboard,
} from '@/utils/keyboardNavigationUtils';

/**
 * Keyboard navigation provider component
 */
import React, { createContext, type ReactNode, useCallback, useContext } from 'react';
import type { KeyboardNavigationOptions, UseKeyboardNavigationReturn } from '@/hooks/navigation';
import { useKeyboardNavigation } from '@/hooks/navigation';

const KeyboardNavigationContext = createContext<UseKeyboardNavigationReturn | null>(null);

interface KeyboardNavigationProviderProps {
  children: ReactNode;
  options: KeyboardNavigationOptions;
}

export const KeyboardNavigationProvider: React.FC<KeyboardNavigationProviderProps> = ({
  children,
  options,
}) => {
  const navigationApi = useKeyboardNavigation(options);

  return (
    <KeyboardNavigationContext.Provider value={navigationApi}>
      {children}
    </KeyboardNavigationContext.Provider>
  );
};

/**
 * Hook untuk menggunakan keyboard navigation context
 */
export const useKeyboardNavigationContext = (): UseKeyboardNavigationReturn => {
  const context = useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error(
      'useKeyboardNavigationContext must be used within a KeyboardNavigationProvider'
    );
  }
  return context;
};

/**
 * Navigable list component
 */
interface NavigableListProps {
  items: Array<{
    id: string;
    label: string;
    content?: React.ReactNode;
  }>;
  activeId?: string;
  onActiveChange?: (id: string) => void;
  onItemClick?: (id: string) => void;
  className?: string;
  itemClassName?: string;
}

export const NavigableList: React.FC<NavigableListProps> = ({
  items,
  activeId,
  onActiveChange,
  onItemClick,
  className = '',
  itemClassName = '',
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { handleKeyDown } = useKeyboardNavigation({
    headingIds: items.map((item) => item.id),
    activeId: activeId || '',
    onActiveChange,
    enabled: true,
    container: containerRef.current,
  });

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDownEvent = (e: KeyboardEvent) => {
      handleKeyDown(e);
    };

    container.addEventListener('keydown', handleKeyDownEvent);
    return () => container.removeEventListener('keydown', handleKeyDownEvent);
  }, [handleKeyDown]);

  return (
    <div
      ref={containerRef}
      className={`navigable-list ${className}`}
      data-toc-container
      role="list"
    >
      {items.map((item) => (
        <button
          key={item.id}
          data-heading-id={item.id}
          className={`
            navigable-item cursor-pointer p-2 rounded w-full text-left
            ${activeId === item.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
            ${itemClassName}
          `}
          onClick={() => onItemClick?.(item.id)}
          onFocus={() => onActiveChange?.(item.id)}
          aria-label={`Navigate to ${item.label}`}
        >
          <div className="font-medium">{item.label}</div>
          {item.content && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.content}</div>
          )}
        </button>
      ))}
    </div>
  );
};

/**
 * Keyboard shortcuts help component
 */
interface KeyboardShortcutsHelpProps {
  shortcuts?: Array<{
    keys: string[];
    description: string;
  }>;
  className?: string;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  shortcuts = [
    { keys: ['↑', '↓'], description: 'Navigate up/down' },
    { keys: ['Home'], description: 'Go to first item' },
    { keys: ['End'], description: 'Go to last item' },
    { keys: ['Enter', 'Space'], description: 'Activate item' },
    { keys: ['Escape'], description: 'Exit navigation' },
  ],
  className = '',
}) => {
  return (
    <div className={`keyboard-shortcuts-help ${className}`}>
      <h3 className="text-sm font-semibold mb-2">Keyboard Shortcuts</h3>
      <div className="space-y-1">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex space-x-1">
              {shortcut.keys.map((key, keyIndex) => (
                <kbd
                  key={keyIndex}
                  className="
                    px-1 py-0.5 bg-gray-200 dark:bg-gray-700 
                    rounded text-xs font-mono
                  "
                >
                  {key}
                </kbd>
              ))}
            </div>
            <span className="text-gray-600 dark:text-gray-400">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Focus trap component
 */
interface FocusTrapProps {
  children: ReactNode;
  enabled?: boolean;
  restoreFocus?: boolean;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  enabled = true,
  className = '',
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Simple focus management without external dependency
  const focusNext = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      '[tabindex]:not([tabindex="-1"]), button, input, select, textarea, a[href]'
    );
    const currentIndex = Array.from(focusableElements).findIndex(
      (el) => el === document.activeElement
    );
    const nextIndex = (currentIndex + 1) % focusableElements.length;

    if (focusableElements[nextIndex] instanceof HTMLElement) {
      focusableElements[nextIndex].focus();
    }
  }, []);

  const focusPrevious = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      '[tabindex]:not([tabindex="-1"]), button, input, select, textarea, a[href]'
    );
    const currentIndex = Array.from(focusableElements).findIndex(
      (el) => el === document.activeElement
    );
    const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;

    if (focusableElements[prevIndex] instanceof HTMLElement) {
      focusableElements[prevIndex].focus();
    }
  }, []);

  React.useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          focusPrevious();
        } else {
          focusNext();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [enabled, focusNext, focusPrevious]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

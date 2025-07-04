/**
 * Outline navigation components export
 * Re-export semua outline navigation-related components dan hooks
 */

// Re-export main hook
export { useOutlineNavigation } from '@/hooks/navigation';

// Re-export types (assuming they exist in types/outline)
export type {
  HeadingItem,
  UseOutlineNavigationOptions,
  UseOutlineNavigationReturn,
} from '@/types/outline';

/**
 * Outline navigation provider component
 */
import type React from 'react';
import { createContext, type ReactNode, useContext } from 'react';
import { useOutlineNavigation } from '@/hooks/navigation';
import type {
  HeadingItem,
  UseOutlineNavigationOptions,
  UseOutlineNavigationReturn,
} from '@/types/outline';

const OutlineNavigationContext = createContext<UseOutlineNavigationReturn | null>(null);

interface OutlineNavigationProviderProps {
  children: ReactNode;
  outline: HeadingItem[];
  options: UseOutlineNavigationOptions;
}

export const OutlineNavigationProvider: React.FC<OutlineNavigationProviderProps> = ({
  children,
  outline,
  options,
}) => {
  const navigationApi = useOutlineNavigation(outline, options);

  return (
    <OutlineNavigationContext.Provider value={navigationApi}>
      {children}
    </OutlineNavigationContext.Provider>
  );
};

/**
 * Hook untuk menggunakan outline navigation context
 */
export const useOutlineNavigationContext = (): UseOutlineNavigationReturn => {
  const context = useContext(OutlineNavigationContext);
  if (!context) {
    throw new Error('useOutlineNavigationContext must be used within a OutlineNavigationProvider');
  }
  return context;
};

/**
 * Outline item component
 */
interface OutlineItemProps {
  item: HeadingItem;
  isActive?: boolean;
  onClick?: (headingId: string) => void;
  className?: string;
}

export const OutlineItem: React.FC<OutlineItemProps> = ({
  item,
  isActive = false,
  onClick,
  className = '',
}) => {
  const { handleHeadingClick } = useOutlineNavigationContext();

  const handleClick = () => {
    handleHeadingClick(item.id);
    onClick?.(item.id);
  };

  return (
    <button
      className={`
        outline-item w-full text-left cursor-pointer p-2 rounded
        ${isActive ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
        ${className}
      `}
      style={{ paddingLeft: `${(item.level - 1) * 16 + 8}px` }}
      onClick={handleClick}
      data-heading-id={item.id}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500 font-mono">H{item.level}</span>
        <span className="truncate">{item.text}</span>
      </div>
    </button>
  );
};

/**
 * Outline list component
 */
interface OutlineListProps {
  outline: HeadingItem[];
  activeId?: string;
  onItemClick?: (headingId: string) => void;
  className?: string;
}

export const OutlineList: React.FC<OutlineListProps> = ({
  outline,
  activeId,
  onItemClick,
  className = '',
}) => {
  if (outline.length === 0) {
    return (
      <div className={`outline-list-empty text-center py-8 text-gray-500 ${className}`}>
        <p>No headings found</p>
        <p className="text-sm mt-1">Add some headings to see the outline</p>
      </div>
    );
  }

  return (
    <div className={`outline-list space-y-1 ${className}`} data-outline-container>
      {outline.map((item) => (
        <OutlineItem
          key={item.id}
          item={item}
          isActive={activeId === item.id}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};

/**
 * Outline navigation panel component
 */
interface OutlineNavigationPanelProps {
  outline: HeadingItem[];
  activeId?: string;
  onActiveChange?: (headingId: string) => void;
  enabled?: boolean;
  offset?: number;
  className?: string;
}

export const OutlineNavigationPanel: React.FC<OutlineNavigationPanelProps> = ({
  outline,
  activeId,
  onActiveChange,
  enabled = true,
  offset = 100,
  className = '',
}) => {
  return (
    <OutlineNavigationProvider
      outline={outline}
      options={{
        headingIds: outline.map((item) => item.id),
        activeId: activeId || null,
        enabled,
        offset,
        onActiveChange: onActiveChange || (() => {}),
      }}
    >
      <div className={`outline-navigation-panel ${className}`}>
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Document Outline</h3>
          <p className="text-xs text-gray-500 mt-1">
            {outline.length} heading{outline.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <OutlineList outline={outline} activeId={activeId} onItemClick={onActiveChange} />
      </div>
    </OutlineNavigationProvider>
  );
};

/**
 * Outline breadcrumb component
 */
interface OutlineBreadcrumbProps {
  outline: HeadingItem[];
  activeId?: string;
  onItemClick?: (headingId: string) => void;
  maxItems?: number;
  className?: string;
}

export const OutlineBreadcrumb: React.FC<OutlineBreadcrumbProps> = ({
  outline,
  activeId,
  onItemClick,
  maxItems = 3,
  className = '',
}) => {
  const activeItem = outline.find((item) => item.id === activeId);
  if (!activeItem) return null;

  // Build breadcrumb path
  const breadcrumbPath: HeadingItem[] = [];
  let currentLevel = activeItem.level;

  // Add current item
  breadcrumbPath.unshift(activeItem);

  // Find parent items
  for (let i = outline.indexOf(activeItem) - 1; i >= 0; i--) {
    const item = outline[i];
    if (item.level < currentLevel) {
      breadcrumbPath.unshift(item);
      currentLevel = item.level;
      if (breadcrumbPath.length >= maxItems) break;
    }
  }

  return (
    <nav className={`outline-breadcrumb ${className}`}>
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbPath.map((item, index) => (
          <li key={item.id} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            <button
              onClick={() => onItemClick?.(item.id)}
              className={`
                truncate max-w-32 hover:underline
                ${item.id === activeId ? 'font-semibold' : 'text-gray-600 dark:text-gray-400'}
              `}
              title={item.text}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

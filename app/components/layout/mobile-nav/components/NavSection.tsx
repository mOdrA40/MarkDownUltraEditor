/**
 * Komponen reusable untuk section dalam navigation sidebar
 * Menangani collapsible sections dengan header dan content
 */

import { ChevronDown, ChevronRight } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import type { NavSectionProps } from '../types/navTypes';

export const NavSection: React.FC<NavSectionProps> = ({
  title,
  icon: Icon,
  children,
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  /**
   * Toggle collapsed state
   */
  const toggleCollapsed = () => {
    if (collapsible) {
      setIsCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      {collapsible ? (
        <button
          type="button"
          className="flex items-center justify-between w-full text-left cursor-pointer"
          onClick={toggleCollapsed}
          aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${title} section`}
          aria-expanded={!isCollapsed}
        >
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">{title}</h3>
          </div>
          <div>
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </div>
        </button>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">{title}</h3>
          </div>
        </div>
      )}

      {/* Section Content */}
      {(!collapsible || !isCollapsed) && <div className="space-y-2">{children}</div>}
    </div>
  );
};

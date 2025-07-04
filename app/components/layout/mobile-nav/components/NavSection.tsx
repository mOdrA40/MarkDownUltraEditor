/**
 * Komponen reusable untuk section dalam navigation sidebar
 * Menangani collapsible sections dengan header dan content
 */

import { ChevronDown, ChevronRight } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
      <div
        className={`
          flex items-center justify-between
          ${collapsible ? 'cursor-pointer' : ''}
        `}
        onClick={collapsible ? toggleCollapsed : undefined}
        onKeyDown={
          collapsible
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleCollapsed();
                }
              }
            : undefined
        }
        tabIndex={collapsible ? 0 : undefined}
        role={collapsible ? 'button' : undefined}
        aria-label={
          collapsible ? `${isCollapsed ? 'Expand' : 'Collapse'} ${title} section` : undefined
        }
        aria-expanded={collapsible ? !isCollapsed : undefined}
      >
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">{title}</h3>
        </div>

        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapsed();
            }}
            aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>

      {/* Section Content */}
      {(!collapsible || !isCollapsed) && <div className="space-y-2">{children}</div>}
    </div>
  );
};

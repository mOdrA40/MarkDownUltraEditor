/**
 * StatBadge Component - Komponen Badge untuk Status/Info
 * Komponen untuk menampilkan badge dengan informasi status
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import React, { memo } from 'react';
import { Badge } from "@/components/ui/badge";
import type { StatBadgeProps } from '../types/stats.types';

/**
 * Komponen StatBadge untuk menampilkan badge informasi
 */
export const StatBadge: React.FC<StatBadgeProps> = memo(({
  variant,
  icon,
  children,
  className = '',
  clickable = false,
  onClick
}) => {
  // CSS classes
  const badgeClasses = `
    h-5 text-xs flex items-center gap-1 whitespace-nowrap py-0 px-2
    ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    ${className}
  `.trim();

  // Accessibility props
  const accessibilityProps = {
    role: clickable ? 'button' : undefined,
    tabIndex: clickable ? 0 : undefined,
    onKeyDown: clickable ? (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    } : undefined
  };

  return (
    <Badge
      variant={variant}
      className={badgeClasses}
      onClick={clickable ? onClick : undefined}
      {...accessibilityProps}
      data-badge
    >
      {/* Icon */}
      {icon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      
      {/* Content */}
      <span className="whitespace-nowrap">
        {children}
      </span>
    </Badge>
  );
});

StatBadge.displayName = 'StatBadge';

export default StatBadge;

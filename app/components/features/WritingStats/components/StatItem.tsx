/**
 * StatItem Component - Component for Displaying Statistical Items
 * Reusable component for displaying individual statistical items
 *
 * @author Axel Modra
 */

import React, { memo } from 'react';
import { Type, Hash, AlignLeft, BarChart3, FileText, Clock } from 'lucide-react';
import { STAT_TYPES, ICON_SIZES, A11Y } from '../constants/stats.constants';
import { formatStatValue } from '../utils/stats.utils';
import type { StatItemProps } from '../types/stats.types';

// Icon mapping
const ICON_MAP = {
  Type,
  Hash,
  AlignLeft,
  BarChart3,
  FileText,
  Clock,
};

/**
 * StatItem component for displaying individual statistical items
 */
export const StatItem: React.FC<StatItemProps> = memo(
  ({
    type,
    value,
    label,
    icon,
    iconSize = 'md',
    format = 'long',
    formatter,
    className = '',
    clickable = false,
    onClick,
  }) => {
    const statConfig = STAT_TYPES[type];

    // Determine which icon to use
    const IconComponent = icon || ICON_MAP[statConfig.iconName as keyof typeof ICON_MAP];

    // Determine which label to display
    const displayLabel =
      label || (format === 'short' ? statConfig.shortLabel : statConfig.longLabel);

    // Format value for display
    const formattedValue = formatter
      ? formatter(value)
      : formatStatValue(type, value, format === 'short' ? 'mobile' : 'desktop');

    // CSS classes
    const iconClasses = ICON_SIZES[iconSize];
    const containerClasses = `
    stat-item flex items-center gap-1 
    ${clickable ? 'cursor-pointer hover:bg-muted/50 transition-colors rounded px-1' : ''}
    ${className}
  `.trim();

    // Accessibility props
    const accessibilityProps = {
      role: clickable ? 'button' : 'status',
      'aria-label': `${A11Y.labels[type as keyof typeof A11Y.labels] || displayLabel}: ${formattedValue}`,
      'aria-live': 'polite' as const,
      tabIndex: clickable ? 0 : undefined,
    };

    const Element = clickable ? 'button' : 'div';

    return (
      <Element
        className={containerClasses}
        onClick={clickable ? onClick : undefined}
        onKeyDown={
          clickable
            ? (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        {...accessibilityProps}
      >
        {/* Icon */}
        {IconComponent && React.isValidElement(IconComponent) ? (
          IconComponent
        ) : IconComponent && typeof IconComponent === 'function' ? (
          <IconComponent className={`${iconClasses} flex-shrink-0`} aria-hidden="true" />
        ) : null}

        {/* Value dan Label */}
        <span className="text-current whitespace-nowrap">{formattedValue}</span>
      </Element>
    );
  }
);

StatItem.displayName = 'StatItem';

export default StatItem;

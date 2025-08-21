/**
 * Header component for DocumentOutline
 */

import { List } from 'lucide-react';
import type React from 'react';
import { useId } from 'react';
import { Badge } from '@/components/ui/badge';
import type { OutlineHeaderProps } from '@/types/outline';
import { formatHeadingCount, getBadgeStyles, getHeaderStyles } from '@/utils/outlineUtils';

/**
 * Header with title and badge count for outline
 */
export const OutlineHeader: React.FC<OutlineHeaderProps> = ({ theme, headingCount }) => {
  const headingId = useId();
  const headerStyles = getHeaderStyles(theme);
  const badgeStyles = getBadgeStyles(theme);

  return (
    <div
      className="px-4 py-2 border-b backdrop-blur-md"
      style={{
        backgroundColor: headerStyles.backgroundColor,
        borderColor: headerStyles.borderColor,
      }}
    >
      <h3
        className="text-sm font-medium flex items-center"
        style={{ color: headerStyles.color }}
        id={headingId}
      >
        <List className="h-4 w-4 mr-2" />
        🗺️ Outline
        <Badge variant="secondary" className="ml-2 h-5 text-xs" style={badgeStyles}>
          {formatHeadingCount(headingCount)}
        </Badge>
      </h3>
    </div>
  );
};

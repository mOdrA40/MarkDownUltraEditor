/**
 * Grid/List container untuk templates
 */

import { FileText } from 'lucide-react';
import type React from 'react';
import type { TemplateGridProps } from '@/types/templates';
import {
  getGridClasses,
  getResponsiveIconSize,
  getResponsivePadding,
  getResponsiveTextSize,
} from '@/utils/templateUtils';
import { TemplateCard } from './TemplateCard';

/**
 * Container untuk menampilkan templates dalam grid atau list view
 */
export const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  viewMode,
  isMobile,
  isTablet,
  onPreview,
  onSelect,
}) => {
  const gridClasses = getGridClasses(viewMode, isMobile);
  const paddingClasses = getResponsivePadding(isMobile);

  // Empty state
  if (templates.length === 0) {
    return (
      <div className={`flex-1 overflow-auto ${paddingClasses}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText
              className={`mx-auto text-muted-foreground mb-4 ${getResponsiveIconSize(
                isMobile,
                'base'
              )}`}
            />
            <h3 className={`font-medium mb-2 ${getResponsiveTextSize(isMobile, 'lg')}`}>
              No templates found
            </h3>
            <p className={`text-muted-foreground ${getResponsiveTextSize(isMobile, 'base')}`}>
              Try adjusting your search or filter criteria.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-auto ${paddingClasses}`}>
      <div className={gridClasses}>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            viewMode={viewMode}
            isMobile={isMobile}
            isTablet={isTablet}
            onPreview={onPreview}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

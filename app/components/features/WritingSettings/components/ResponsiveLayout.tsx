/**
 * ResponsiveLayout Component - Layout Wrapper untuk Responsive Design
 * Komponen wrapper yang menangani layout berbeda untuk setiap breakpoint
 * 
 * @author Axel Modra
 */

import React, { memo } from 'react';
import { Separator } from "@/components/ui/separator";
import { RESPONSIVE_CLASSES } from '../constants/settings.constants';
import type { ResponsiveLayoutProps } from '../types/settings.types';

/**
 * Komponen ResponsiveLayout untuk menangani layout responsif
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = memo(({
  children,
  breakpoint,
  className = '',
  breakpointStyles = {}
}) => {
  // Mendapatkan classes berdasarkan breakpoint
  const getLayoutClasses = () => {
    const responsiveClasses = RESPONSIVE_CLASSES[breakpoint];
    const customStyles = breakpointStyles[breakpoint] || '';
    
    return `${responsiveClasses.container} ${customStyles} ${className}`;
  };

  // Render separator untuk layout horizontal
  const renderSeparator = () => {
    if (breakpoint === 'mobile') return null;
    
    const separatorClass = RESPONSIVE_CLASSES[breakpoint].separator;
    return <Separator orientation="vertical" className={separatorClass} />;
  };

  // Mobile Layout - Vertical Stack
  if (breakpoint === 'mobile') {
    return (
      <div className={getLayoutClasses()}>
        {children}
      </div>
    );
  }

  // Tablet dan Desktop Layout - Horizontal dengan separators
  return (
    <div className={getLayoutClasses()}>
      {React.Children.map(children, (child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < React.Children.count(children) - 1 && renderSeparator()}
        </React.Fragment>
      ))}
    </div>
  );
});

ResponsiveLayout.displayName = 'ResponsiveLayout';

export default ResponsiveLayout;

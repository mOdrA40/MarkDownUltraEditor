/**
 * @fileoverview Hook for smart dropdown positioning based on screen size
 * @author Axel Modra
 */

import { useEffect, useState } from 'react';

/**
 * Dropdown positioning configuration
 */
export interface DropdownPositioning {
  side: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
  sideOffset: number;
  alignOffset: number;
}

/**
 * Hook for responsive dropdown positioning
 * Returns optimal positioning based on screen size to prevent cutoff
 */
export const useDropdownPositioning = (): DropdownPositioning => {
  const [positioning, setPositioning] = useState<DropdownPositioning>({
    side: 'left',
    align: 'end',
    sideOffset: 20,
    alignOffset: 0,
  });

  useEffect(() => {
    const updatePositioning = () => {
      const width = window.innerWidth;
      
      if (width <= 768) {
        // Mobile: Use bottom positioning to avoid covering card info
        setPositioning({
          side: 'bottom',
          align: 'end',
          sideOffset: 4,
          alignOffset: -120,
        });
      } else {
        // Desktop/Tablet: Use left positioning
        setPositioning({
          side: 'left',
          align: 'end',
          sideOffset: 20,
          alignOffset: 0,
        });
      }
    };

    // Initial positioning
    updatePositioning();

    // Listen for resize events
    window.addEventListener('resize', updatePositioning);
    
    return () => {
      window.removeEventListener('resize', updatePositioning);
    };
  }, []);

  return positioning;
};

/**
 * Hook for checking if current screen is mobile
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
};

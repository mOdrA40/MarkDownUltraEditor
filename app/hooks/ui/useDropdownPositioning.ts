import { useEffect, useState } from 'react';

export interface DropdownPositioning {
  side: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
  sideOffset: number;
  alignOffset: number;
}

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
        setPositioning({
          side: 'bottom',
          align: 'end',
          sideOffset: 4,
          alignOffset: -120,
        });
      } else {
        setPositioning({
          side: 'left',
          align: 'end',
          sideOffset: 20,
          alignOffset: 0,
        });
      }
    };

    updatePositioning();

    window.addEventListener('resize', updatePositioning);

    return () => {
      window.removeEventListener('resize', updatePositioning);
    };
  }, []);

  return positioning;
};

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
};

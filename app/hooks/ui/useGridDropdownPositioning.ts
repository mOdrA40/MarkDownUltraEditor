import { useCallback, useEffect, useRef, useState } from 'react';

export interface GridDropdownPositioning {
  side: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
  sideOffset: number;
  alignOffset: number;
}

interface GridPositionInfo {
  isRightColumn: boolean;
  isLastColumn: boolean;
  columnIndex: number;
  totalColumns: number;
  screenWidth: number;
}

export const useGridDropdownPositioning = () => {
  const elementRef = useRef<HTMLButtonElement>(null);
  const [positioning, setPositioning] = useState<GridDropdownPositioning>({
    side: 'bottom',
    align: 'end',
    sideOffset: 4,
    alignOffset: 0,
  });

  const getGridPositionInfo = useCallback((): GridPositionInfo => {
    if (!elementRef.current) {
      return {
        isRightColumn: false,
        isLastColumn: false,
        columnIndex: 0,
        totalColumns: 1,
        screenWidth: window.innerWidth,
      };
    }

    const element = elementRef.current;
    const screenWidth = window.innerWidth;

    let gridContainer = element?.closest('[class*="grid"]') as HTMLElement;
    if (!gridContainer) {
      let parent = element?.parentElement;
      while (parent && !parent.className.includes('grid')) {
        parent = parent.parentElement;
      }
      gridContainer = parent as HTMLElement;
    }

    if (!gridContainer) {
      return {
        isRightColumn: false,
        isLastColumn: false,
        columnIndex: 0,
        totalColumns: 1,
        screenWidth,
      };
    }

    const gridItems = Array.from(gridContainer.children) as HTMLElement[];

    let currentIndex = -1;
    for (let i = 0; i < gridItems.length; i++) {
      if (gridItems[i].contains(element)) {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex === -1) {
      currentIndex = 0;
    }

    let totalColumns = 1;
    if (screenWidth >= 1536)
      totalColumns = 6;
    else if (screenWidth >= 1280)
      totalColumns = 5;
    else if (screenWidth >= 1024)
      totalColumns = 4;
    else if (screenWidth >= 768)
      totalColumns = 3;
    else if (screenWidth >= 640)
      totalColumns = 2;
    else if (screenWidth >= 475)
      totalColumns = 2;
    else totalColumns = 1;

    const columnIndex = currentIndex % totalColumns;
    const isRightColumn = columnIndex === totalColumns - 1;
    const isLastColumn = columnIndex >= totalColumns - 1;

    return {
      isRightColumn,
      isLastColumn,
      columnIndex,
      totalColumns,
      screenWidth,
    };
  }, []);

  const updatePositioning = useCallback(() => {
    const gridInfo = getGridPositionInfo();
    const { isRightColumn, screenWidth, totalColumns, columnIndex } = gridInfo;
    if (screenWidth <= 768) {
      if (totalColumns === 1) {
        setPositioning({
          side: 'bottom',
          align: 'end',
          sideOffset: 4,
          alignOffset: -8,
        });
      } else if (totalColumns === 2) {
        if (isRightColumn) {
          setPositioning({
            side: 'bottom',
            align: 'end',
            sideOffset: 4,
            alignOffset: -120,
          });
        } else {
          setPositioning({
            side: 'bottom',
            align: 'end',
            sideOffset: 4,
            alignOffset: -8,
          });
        }
      } else {
        if (columnIndex === 2) {
          setPositioning({
            side: 'bottom',
            align: 'end',
            sideOffset: 4,
            alignOffset: -140,
          });
        } else if (columnIndex === 1) {
          setPositioning({
            side: 'bottom',
            align: 'center',
            sideOffset: 4,
            alignOffset: 0,
          });
        } else {
          setPositioning({
            side: 'bottom',
            align: 'start',
            sideOffset: 4,
            alignOffset: 8,
          });
        }
      }
    } else {
      setPositioning({
        side: 'left',
        align: 'end',
        sideOffset: 8,
        alignOffset: 0,
      });
    }
  }, [getGridPositionInfo]);

  useEffect(() => {
    updatePositioning();

    const handleResize = () => {
      updatePositioning();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updatePositioning]);

  return {
    elementRef,
    positioning,
    updatePositioning,
  };
};

export const useIsRightColumn = () => {
  const elementRef = useRef<HTMLElement>(null);
  const [isRightColumn, setIsRightColumn] = useState(false);

  const checkPosition = useCallback(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const parent = element.parentElement;
    const screenWidth = window.innerWidth;

    if (!parent) return;

    const gridItems = Array.from(parent.children) as HTMLElement[];
    const currentIndex = gridItems.indexOf(element);

    let totalColumns = 1;
    if (screenWidth >= 1536) totalColumns = 6;
    else if (screenWidth >= 1280) totalColumns = 5;
    else if (screenWidth >= 1024) totalColumns = 4;
    else if (screenWidth >= 768) totalColumns = 3;
    else if (screenWidth >= 640) totalColumns = 2;
    else if (screenWidth >= 475) totalColumns = 2;
    else totalColumns = 1;

    const columnIndex = currentIndex % totalColumns;
    setIsRightColumn(columnIndex === totalColumns - 1);
  }, []);

  useEffect(() => {
    checkPosition();
    window.addEventListener('resize', checkPosition);
    return () => window.removeEventListener('resize', checkPosition);
  }, [checkPosition]);

  return { elementRef, isRightColumn };
};

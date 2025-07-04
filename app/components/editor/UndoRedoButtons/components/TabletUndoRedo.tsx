/**
 * TabletUndoRedo Component
 * Layout undo/redo khusus untuk tablet devices (500px-1023px)
 *
 * @author Axel Modra
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TabletUndoRedoProps } from '../types/undoRedo.types';
import {
  getButtonClasses,
  getIconClasses,
  getContainerClasses,
  getAriaLabel,
} from '../utils/undoRedo.utils';

/**
 * Komponen TabletUndoRedo
 * Menampilkan undo/redo buttons dalam layout yang optimal untuk tablet
 * Compact tapi tetap visible dengan touch-friendly interactions
 *
 * @param props - Props untuk komponen
 * @returns JSX Element
 */
export const TabletUndoRedo: React.FC<TabletUndoRedoProps> = React.memo(
  ({ onUndo, onRedo, canUndo, canRedo, className }) => {
    // CSS classes untuk container
    const containerClasses = getContainerClasses('tablet', className);

    // CSS classes untuk buttons
    const undoButtonClasses = getButtonClasses(canUndo, 'tablet');
    const redoButtonClasses = getButtonClasses(canRedo, 'tablet');

    // CSS classes untuk icons
    const iconClasses = getIconClasses('tablet');

    return (
      <div className={containerClasses}>
        {/* Undo Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(undoButtonClasses)}
          aria-label={getAriaLabel('undo', false)}
          title="Undo"
          data-testid="tablet-undo-button"
        >
          <RotateCcw className={iconClasses} />
        </Button>

        {/* Redo Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className={cn(redoButtonClasses)}
          aria-label={getAriaLabel('redo', false)}
          title="Redo"
          data-testid="tablet-redo-button"
        >
          <RotateCw className={iconClasses} />
        </Button>
      </div>
    );
  }
);

// Set display name untuk debugging
TabletUndoRedo.displayName = 'TabletUndoRedo';

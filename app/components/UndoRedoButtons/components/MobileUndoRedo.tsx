/**
 * MobileUndoRedo Component
 * Layout undo/redo khusus untuk mobile devices (≤499px)
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MobileUndoRedoProps } from '../types/undoRedo.types';
import { 
  getButtonClasses, 
  getIconClasses, 
  getContainerClasses,
  getAriaLabel
} from '../utils/undoRedo.utils';

/**
 * Komponen MobileUndoRedo
 * Menampilkan undo/redo buttons dalam layout yang optimal untuk mobile
 * Menggunakan touch-friendly sizing dan feedback
 * 
 * @param props - Props untuk komponen
 * @returns JSX Element
 */
export const MobileUndoRedo: React.FC<MobileUndoRedoProps> = React.memo(({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  className
}) => {
  // CSS classes untuk container
  const containerClasses = getContainerClasses('mobile', className);

  // CSS classes untuk buttons
  const undoButtonClasses = getButtonClasses(canUndo, 'mobile');
  const redoButtonClasses = getButtonClasses(canRedo, 'mobile');

  // CSS classes untuk icons
  const iconClasses = getIconClasses('mobile');

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
        data-testid="mobile-undo-button"
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
        data-testid="mobile-redo-button"
      >
        <RotateCw className={iconClasses} />
      </Button>
    </div>
  );
});

// Set display name untuk debugging
MobileUndoRedo.displayName = 'MobileUndoRedo';

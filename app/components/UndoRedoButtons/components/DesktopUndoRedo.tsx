/**
 * DesktopUndoRedo Component
 * Layout undo/redo khusus untuk desktop devices (≥1024px)
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { RotateCcw, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DesktopUndoRedoProps } from '../types/undoRedo.types';
import {
  getButtonClasses,
  getIconClasses,
  getContainerClasses,
  getAriaLabel
} from '../utils/undoRedo.utils';

/**
 * Komponen DesktopUndoRedo
 * Menampilkan undo/redo buttons dalam layout yang optimal untuk desktop
 * Dilengkapi dengan tooltips dan keyboard shortcuts information
 * 
 * @param props - Props untuk komponen
 * @returns JSX Element
 */
export const DesktopUndoRedo: React.FC<DesktopUndoRedoProps> = React.memo(({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  className
}) => {
  // CSS classes untuk container
  const containerClasses = getContainerClasses('desktop', className);

  // CSS classes untuk buttons
  const undoButtonClasses = getButtonClasses(canUndo, 'desktop');
  const redoButtonClasses = getButtonClasses(canRedo, 'desktop');

  // CSS classes untuk icons
  const iconClasses = getIconClasses('desktop');

  return (
    <TooltipProvider>
      <div className={containerClasses}>
        {/* Undo Button dengan Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className={cn(undoButtonClasses)}
              aria-label={getAriaLabel('undo', true)}
              data-testid="desktop-undo-button"
            >
              <RotateCcw className={iconClasses} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            <div className="text-center">
              <div className="font-medium">Undo</div>
              <div className="text-xs text-muted-foreground">Ctrl+Z</div>
            </div>
          </TooltipContent>
        </Tooltip>
        
        {/* Redo Button dengan Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className={cn(redoButtonClasses)}
              aria-label={getAriaLabel('redo', true)}
              data-testid="desktop-redo-button"
            >
              <RotateCw className={iconClasses} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            <div className="text-center">
              <div className="font-medium">Redo</div>
              <div className="text-xs text-muted-foreground">Ctrl+Y / Ctrl+Shift+Z</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
});

// Set display name untuk debugging
DesktopUndoRedo.displayName = 'DesktopUndoRedo';

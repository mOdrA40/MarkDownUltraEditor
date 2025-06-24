/**
 * Komponen quick actions untuk mobile navigation header
 * Menangani undo/redo, search, dan preview toggle
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, Eye, EyeOff } from "lucide-react";
import { UndoRedoButtons } from "../../UndoRedoButtons";
import { QuickActionsProps } from '../types/navTypes';

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSearch,
  showPreview,
  onTogglePreview,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  return (
    <div className="flex items-center space-x-1 flex-shrink-0">
      {/* Undo/Redo Buttons */}
      <UndoRedoButtons
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        isMobile={true}
        isTablet={false}
      />

      {/* Search Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSearch}
        className="h-8 w-8 p-0"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Preview Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onTogglePreview}
        className="h-8 w-8 p-0"
        aria-label={showPreview ? "Hide preview" : "Show preview"}
      >
        {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
};

/**
 * @fileoverview Action buttons component for save, download, and cancel
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, X, Save, Undo, Redo } from "lucide-react";
import { ImageEditorActions } from "../types/imageEditor.types";

interface ActionButtonsProps extends ImageEditorActions {
  /** Download image callback */
  downloadImage: () => void;
  /** Undo operation callback */
  undo: () => void;
  /** Redo operation callback */
  redo: () => void;
  /** Can undo flag */
  canUndo: boolean;
  /** Can redo flag */
  canRedo: boolean;
}

/**
 * Action buttons component for save, download, and cancel operations
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  saveImage,
  downloadImage,
  onClose,
  undo,
  redo,
  canUndo,
  canRedo
}) => {
  return (
    <div className="p-4 border-t bg-muted/20 flex justify-between">
      {/* Left side - Download and History */}
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={downloadImage}
          title="Download edited image"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          title="Undo last action"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          title="Redo last action"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Right side - Save and Cancel */}
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onClose}
          title="Cancel editing"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        <Button 
          onClick={saveImage} 
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          title="Save changes"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

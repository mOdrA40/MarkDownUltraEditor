/**
 * @fileoverview Drawing tools component for brush, color, and size controls
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Brush, Type } from "lucide-react";
import { AnnotationTool } from "../../types/imageEditor.types";

interface DrawingToolsProps {
  /** Current tool configuration */
  currentTool: AnnotationTool;
  /** Tool change callback */
  onToolChange: (tool: AnnotationTool) => void;
}

/**
 * Drawing tools component for brush, color, and size controls
 */
export const DrawingTools: React.FC<DrawingToolsProps> = ({
  currentTool,
  onToolChange
}) => {
  /**
   * Handle tool type change
   */
  const handleToolTypeChange = (type: AnnotationTool['type']): void => {
    onToolChange({ ...currentTool, type });
  };

  /**
   * Handle color change
   */
  const handleColorChange = (color: string): void => {
    onToolChange({ ...currentTool, color });
  };

  /**
   * Handle size change
   */
  const handleSizeChange = (size: number): void => {
    onToolChange({ ...currentTool, size });
  };

  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">Drawing Tools</Label>
      
      {/* Tool Type Selection */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button
          variant={currentTool.type === 'brush' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolTypeChange('brush')}
        >
          <Brush className="h-4 w-4 mr-1" />
          Brush
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleToolTypeChange('text')}
        >
          <Type className="h-4 w-4 mr-1" />
          Select
        </Button>
      </div>
      
      {/* Tool Settings */}
      <div className="space-y-3">
        {/* Brush Size */}
        <div>
          <Label className="text-xs">Brush Size</Label>
          <Slider
            value={[currentTool.size]}
            onValueChange={(value) => handleSizeChange(value[0])}
            max={50}
            min={1}
            step={1}
            className="mt-1"
          />
          <span className="text-xs text-muted-foreground">{currentTool.size}px</span>
        </div>
        
        {/* Color Picker */}
        <div>
          <Label className="text-xs">Color</Label>
          <input
            type="color"
            value={currentTool.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full h-8 rounded border mt-1"
            aria-label="Select drawing color"
          />
        </div>
      </div>
    </div>
  );
};

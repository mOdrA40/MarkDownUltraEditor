/**
 * @fileoverview Transform tools component for rotate and flip operations
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";

interface TransformToolsProps {
  /** Rotate image callback */
  onRotate: (degrees: number) => void;
  /** Flip image callback */
  onFlip: (horizontal: boolean) => void;
}

/**
 * Transform tools component for rotate and flip operations
 */
export const TransformTools: React.FC<TransformToolsProps> = ({
  onRotate,
  onFlip
}) => {
  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">Transform</Label>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onRotate(90)}
          title="Rotate 90 degrees clockwise"
        >
          <RotateCw className="h-4 w-4 mr-1" />
          Rotate
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onFlip(true)}
          title="Flip horizontally"
        >
          <FlipHorizontal className="h-4 w-4 mr-1" />
          Flip H
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onFlip(false)}
          title="Flip vertically"
        >
          <FlipVertical className="h-4 w-4 mr-1" />
          Flip V
        </Button>
      </div>
    </div>
  );
};

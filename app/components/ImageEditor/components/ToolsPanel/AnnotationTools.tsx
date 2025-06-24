/**
 * @fileoverview Annotation tools component for text, shapes, and arrows
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Type, Square, Circle, ArrowRight } from "lucide-react";

interface AnnotationToolsProps {
  /** Add text annotation callback */
  onAddText: () => void;
  /** Add shape annotation callback */
  onAddShape: (shapeType: 'rectangle' | 'circle') => void;
  /** Add arrow annotation callback */
  onAddArrow: () => void;
}

/**
 * Annotation tools component for text, shapes, and arrows
 */
export const AnnotationTools: React.FC<AnnotationToolsProps> = ({
  onAddText,
  onAddShape,
  onAddArrow
}) => {
  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">Annotations</Label>
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddText}
          title="Add text annotation"
        >
          <Type className="h-4 w-4 mr-1" />
          Text
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onAddShape('rectangle')}
          title="Add rectangle annotation"
        >
          <Square className="h-4 w-4 mr-1" />
          Rectangle
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onAddShape('circle')}
          title="Add circle annotation"
        >
          <Circle className="h-4 w-4 mr-1" />
          Circle
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddArrow}
          title="Add arrow annotation"
        >
          <ArrowRight className="h-4 w-4 mr-1" />
          Arrow
        </Button>
      </div>
    </div>
  );
};

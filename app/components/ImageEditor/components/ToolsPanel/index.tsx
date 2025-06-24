/**
 * @fileoverview Main tools panel component container
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { Separator } from "@/components/ui/separator";
import { DrawingTools } from "./DrawingTools";
import { AnnotationTools } from "./AnnotationTools";
import { TransformTools } from "./TransformTools";
import { FilterControls } from "./FilterControls";
import { ToolPanelConfig } from "../../types/imageEditor.types";

type ToolsPanelProps = ToolPanelConfig;

/**
 * Main tools panel component that contains all editing tools
 */
export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  drawingTool,
  filterControl,
  transformControl,
  canvasOperations
}) => {
  return (
    <div className="w-80 border-r bg-muted/20 p-4 overflow-auto space-y-6">
      {/* Drawing Tools */}
      <DrawingTools
        currentTool={drawingTool.currentTool}
        onToolChange={drawingTool.onToolChange}
      />

      <Separator />

      {/* Annotation Tools */}
      <AnnotationTools
        onAddText={() => {
          // This will be handled by the drawing tools hook
          console.log('Add text annotation');
        }}
        onAddShape={(shapeType) => {
          // This will be handled by the drawing tools hook
          console.log('Add shape annotation:', shapeType);
        }}
        onAddArrow={() => {
          // This will be handled by the drawing tools hook
          console.log('Add arrow annotation');
        }}
      />

      <Separator />

      {/* Transform Tools */}
      <TransformTools
        onRotate={(degrees) => {
          const newTransform = {
            ...transformControl.transform,
            rotation: transformControl.transform.rotation + degrees
          };
          transformControl.onTransformChange(newTransform);
          canvasOperations.applyFilters();
          canvasOperations.saveToHistory();
        }}
        onFlip={(horizontal) => {
          const newTransform = horizontal
            ? { ...transformControl.transform, flipH: !transformControl.transform.flipH }
            : { ...transformControl.transform, flipV: !transformControl.transform.flipV };
          
          transformControl.onTransformChange(newTransform);
          canvasOperations.applyFilters();
          canvasOperations.saveToHistory();
        }}
      />

      <Separator />

      {/* Filter Controls */}
      <FilterControls
        filters={filterControl.filters}
        onFilterChange={filterControl.onFilterChange}
      />
    </div>
  );
};

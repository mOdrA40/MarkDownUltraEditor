/**
 * @fileoverview Canvas area container component
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { ImageCanvas } from "./ImageCanvas";
import { CanvasAreaConfig } from "../../types/imageEditor.types";

type CanvasAreaProps = CanvasAreaConfig;

/**
 * Canvas area container component
 */
export const CanvasArea: React.FC<CanvasAreaProps> = (props) => {
  return (
    <div className="flex-1 flex flex-col">
      <ImageCanvas {...props} />
    </div>
  );
};

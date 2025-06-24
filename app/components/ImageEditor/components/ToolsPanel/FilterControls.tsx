/**
 * @fileoverview Filter controls component for brightness, contrast, and saturation
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ImageFilters } from "../../types/imageEditor.types";

interface FilterControlsProps {
  /** Current filter values */
  filters: ImageFilters;
  /** Filter change callback */
  onFilterChange: (filters: ImageFilters) => void;
}

/**
 * Filter controls component for brightness, contrast, and saturation
 */
export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange
}) => {
  /**
   * Handle brightness change
   */
  const handleBrightnessChange = (value: number): void => {
    onFilterChange({ ...filters, brightness: value });
  };

  /**
   * Handle contrast change
   */
  const handleContrastChange = (value: number): void => {
    onFilterChange({ ...filters, contrast: value });
  };

  /**
   * Handle saturation change
   */
  const handleSaturationChange = (value: number): void => {
    onFilterChange({ ...filters, saturation: value });
  };

  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">Filters</Label>
      
      <div className="space-y-4">
        {/* Brightness Control */}
        <div>
          <Label className="text-xs">Brightness</Label>
          <Slider
            value={[filters.brightness]}
            onValueChange={(value) => handleBrightnessChange(value[0])}
            max={200}
            min={0}
            step={1}
            className="mt-1"
          />
          <span className="text-xs text-muted-foreground">{filters.brightness}%</span>
        </div>
        
        {/* Contrast Control */}
        <div>
          <Label className="text-xs">Contrast</Label>
          <Slider
            value={[filters.contrast]}
            onValueChange={(value) => handleContrastChange(value[0])}
            max={200}
            min={0}
            step={1}
            className="mt-1"
          />
          <span className="text-xs text-muted-foreground">{filters.contrast}%</span>
        </div>
        
        {/* Saturation Control */}
        <div>
          <Label className="text-xs">Saturation</Label>
          <Slider
            value={[filters.saturation]}
            onValueChange={(value) => handleSaturationChange(value[0])}
            max={200}
            min={0}
            step={1}
            className="mt-1"
          />
          <span className="text-xs text-muted-foreground">{filters.saturation}%</span>
        </div>
      </div>
    </div>
  );
};

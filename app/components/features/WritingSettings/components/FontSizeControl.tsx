/**
 * FontSizeControl Component - Kontrol untuk Font Size
 * Komponen untuk mengatur font size dengan increment/decrement buttons
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Type, Plus, Minus } from "lucide-react";
import { useWritingSettings } from '../hooks/useWritingSettings';
import { 
  getNextFontSize, 
  getPreviousFontSize, 
  isMinFontSize, 
  isMaxFontSize 
} from '../utils/settings.utils';
import { CONTROL_SIZES, A11Y } from '../constants/settings.constants';
import type { FontSizeControlProps } from '../types/settings.types';

/**
 * Komponen FontSizeControl untuk mengatur ukuran font
 */
export const FontSizeControl: React.FC<FontSizeControlProps> = memo(({
  fontSize,
  onFontSizeChange,
  size = 'md',
  disabled = false,
  className = '',
  config = {}
}) => {
  const { config: settingsConfig, formatFontSize } = useWritingSettings(config);
  
  // Memoized handlers untuk performance
  const handleIncrease = useCallback(() => {
    if (disabled) return;
    const nextSize = getNextFontSize(fontSize, settingsConfig);
    if (nextSize !== fontSize) {
      onFontSizeChange(nextSize);
    }
  }, [fontSize, onFontSizeChange, disabled, settingsConfig]);

  const handleDecrease = useCallback(() => {
    if (disabled) return;
    const prevSize = getPreviousFontSize(fontSize, settingsConfig);
    if (prevSize !== fontSize) {
      onFontSizeChange(prevSize);
    }
  }, [fontSize, onFontSizeChange, disabled, settingsConfig]);

  // Check apakah sudah di batas min/max
  const isAtMin = isMinFontSize(fontSize, settingsConfig);
  const isAtMax = isMaxFontSize(fontSize, settingsConfig);

  // Get control size styles
  const sizeStyles = CONTROL_SIZES[size];
  const formattedSize = formatFontSize(fontSize);

  return (
    <div className={`flex items-center ${sizeStyles.spacing} ${className}`}>
      {/* Icon */}
      <Type className={sizeStyles.icon} />
      
      {/* Decrease Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDecrease}
        disabled={disabled || isAtMin}
        className={sizeStyles.button}
        aria-label={A11Y.labels.fontSizeDecrease}
        title={`${A11Y.labels.fontSizeDecrease} (${settingsConfig.minFontSize}px min)`}
      >
        <Minus className={sizeStyles.icon} />
      </Button>
      
      {/* Display Value */}
      <span 
        className={`${sizeStyles.text} font-mono min-w-[2rem] text-center select-none`}
        role="status"
        aria-live="polite"
        aria-label={`Current font size: ${formattedSize}`}
      >
        {formattedSize}
      </span>
      
      {/* Increase Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleIncrease}
        disabled={disabled || isAtMax}
        className={sizeStyles.button}
        aria-label={A11Y.labels.fontSizeIncrease}
        title={`${A11Y.labels.fontSizeIncrease} (${settingsConfig.maxFontSize}px max)`}
      >
        <Plus className={sizeStyles.icon} />
      </Button>
    </div>
  );
});

FontSizeControl.displayName = 'FontSizeControl';

export default FontSizeControl;

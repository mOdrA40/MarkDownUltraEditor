/**
 * LineHeightControl Component - Kontrol untuk Line Height
 * Komponen untuk mengatur line height dengan increment/decrement buttons
 *
 * @author Axel Modra
 */

import { AlignLeft, Minus, Plus } from 'lucide-react';
import type React from 'react';
import { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { A11Y, CONTROL_SIZES } from '../constants/settings.constants';
import { useWritingSettings } from '../hooks/useWritingSettings';
import type { LineHeightControlProps } from '../types/settings.types';
import {
  getNextLineHeight,
  getPreviousLineHeight,
  isMaxLineHeight,
  isMinLineHeight,
} from '../utils/settings.utils';

/**
 * Komponen LineHeightControl untuk mengatur line height
 */
export const LineHeightControl: React.FC<LineHeightControlProps> = memo(
  ({
    lineHeight,
    onLineHeightChange,
    size = 'md',
    disabled = false,
    className = '',
    config = {},
  }) => {
    const { config: settingsConfig, formatLineHeight } = useWritingSettings(config);

    // Memoized handlers untuk performance
    const handleIncrease = useCallback(() => {
      if (disabled) return;
      const nextHeight = getNextLineHeight(lineHeight, settingsConfig);
      if (nextHeight !== lineHeight) {
        onLineHeightChange(nextHeight);
      }
    }, [lineHeight, onLineHeightChange, disabled, settingsConfig]);

    const handleDecrease = useCallback(() => {
      if (disabled) return;
      const prevHeight = getPreviousLineHeight(lineHeight, settingsConfig);
      if (prevHeight !== lineHeight) {
        onLineHeightChange(prevHeight);
      }
    }, [lineHeight, onLineHeightChange, disabled, settingsConfig]);

    // Check apakah sudah di batas min/max
    const isAtMin = isMinLineHeight(lineHeight, settingsConfig);
    const isAtMax = isMaxLineHeight(lineHeight, settingsConfig);

    // Get control size styles
    const sizeStyles = CONTROL_SIZES[size];
    const formattedHeight = formatLineHeight(lineHeight);

    return (
      <div className={`flex items-center ${sizeStyles.spacing} ${className}`}>
        {/* Icon */}
        <AlignLeft className={sizeStyles.icon} />

        {/* Decrease Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDecrease}
          disabled={disabled || isAtMin}
          className={sizeStyles.button}
          aria-label={A11Y.labels.lineHeightDecrease}
          title={`${A11Y.labels.lineHeightDecrease} (${settingsConfig.minLineHeight} min)`}
        >
          <Minus className={sizeStyles.icon} />
        </Button>

        {/* Display Value */}
        <span
          className={`${sizeStyles.text} font-mono min-w-[2rem] text-center select-none`}
          role="status"
          aria-live="polite"
          aria-label={`Current line height: ${formattedHeight}`}
        >
          {formattedHeight}
        </span>

        {/* Increase Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleIncrease}
          disabled={disabled || isAtMax}
          className={sizeStyles.button}
          aria-label={A11Y.labels.lineHeightIncrease}
          title={`${A11Y.labels.lineHeightIncrease} (${settingsConfig.maxLineHeight} max)`}
        >
          <Plus className={sizeStyles.icon} />
        </Button>
      </div>
    );
  }
);

LineHeightControl.displayName = 'LineHeightControl';

export default LineHeightControl;

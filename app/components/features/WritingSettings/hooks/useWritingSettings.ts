/**
 * WritingSettings Hooks - Custom React Hooks
 * Custom hooks untuk WritingSettings functionality
 *
 * @author Axel Modra
 */

import { useCallback, useMemo } from 'react';
import type { SettingsConfig, UseWritingSettingsReturn } from '../types/settings.types';
import {
  formatFontSize,
  formatLineHeight,
  getSettingsConfig,
  validateFontSize,
  validateLineHeight,
} from '../utils/settings.utils';

/**
 * Hook untuk mengelola writing settings logic
 * @param config - Partial configuration untuk override defaults
 * @returns Object dengan utilities dan functions
 */
export const useWritingSettings = (
  config: Partial<SettingsConfig> = {}
): UseWritingSettingsReturn => {
  // Merge config dengan defaults
  const settingsConfig = useMemo(() => getSettingsConfig(config), [config]);

  // Memoized validation functions
  const validateFontSizeMemo = useCallback(
    (size: number) => validateFontSize(size, settingsConfig),
    [settingsConfig]
  );

  const validateLineHeightMemo = useCallback(
    (height: number) => validateLineHeight(height, settingsConfig),
    [settingsConfig]
  );

  // Memoized formatting functions
  const formatFontSizeMemo = useCallback((size: number) => formatFontSize(size, true), []);

  const formatLineHeightMemo = useCallback((height: number) => formatLineHeight(height, 1), []);

  return {
    config: settingsConfig,
    validateFontSize: validateFontSizeMemo,
    validateLineHeight: validateLineHeightMemo,
    formatFontSize: formatFontSizeMemo,
    formatLineHeight: formatLineHeightMemo,
  };
};

// Re-export useMediaQuery dari shared hook
export { useMediaQuery } from '~/hooks/useMediaQuery';
// Re-export hooks dari useResponsiveLayout untuk convenience
export {
  useIsDesktop,
  useIsMobile,
  useIsTablet,
  useResponsiveLayout,
  useWindowDimensions,
} from './useResponsiveLayout';

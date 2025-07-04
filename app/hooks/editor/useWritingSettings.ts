/**
 * WritingSettings Hooks - Custom React Hooks
 * Custom hooks untuk WritingSettings functionality
 *
 * @author Axel Modra
 */

import { useCallback, useMemo } from 'react';

// Temporary types dan functions untuk menghindari error
interface SettingsConfig {
  fontSize: { min: number; max: number; default: number };
  lineHeight: { min: number; max: number; default: number };
}

interface UseWritingSettingsReturn {
  config: SettingsConfig;
  validateFontSize: (size: number) => boolean;
  validateLineHeight: (height: number) => boolean;
  formatFontSize: (size: number) => string;
  formatLineHeight: (height: number) => string;
}

// Utility functions
const validateFontSize = (size: number, config: SettingsConfig): boolean => {
  return size >= config.fontSize.min && size <= config.fontSize.max;
};

const validateLineHeight = (height: number, config: SettingsConfig): boolean => {
  return height >= config.lineHeight.min && height <= config.lineHeight.max;
};

const formatFontSize = (size: number, withUnit = true): string => {
  return withUnit ? `${size}px` : size.toString();
};

const formatLineHeight = (height: number, precision = 1): string => {
  return height.toFixed(precision);
};

const getSettingsConfig = (config: Partial<SettingsConfig> = {}): SettingsConfig => {
  return {
    fontSize: { min: 12, max: 24, default: 16, ...config.fontSize },
    lineHeight: { min: 1.0, max: 2.5, default: 1.5, ...config.lineHeight },
  };
};

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

// Re-export hooks dari UI untuk convenience
export {
  useDeviceType,
  useIsDesktop,
  useIsMobile,
  useIsTablet,
  useResponsiveDetection as useResponsiveLayout,
} from '../ui';

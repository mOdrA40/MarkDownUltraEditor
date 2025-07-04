/**
 * @fileoverview Custom hook for responsive editor configuration
 * @author Axel Modra
 */

import { useMemo } from 'react';
import type { ResponsiveConfig } from '../types/editorPane.types';
import { calculateResponsiveConfig } from '../utils/editorStyles';

/**
 * Custom hook for calculating responsive editor configuration
 */
export const useResponsiveEditor = (
  fontSize: number,
  lineHeight: number,
  isMobile: boolean,
  isTablet: boolean
): ResponsiveConfig => {
  return useMemo(() => {
    return calculateResponsiveConfig(fontSize, lineHeight, isMobile, isTablet);
  }, [fontSize, lineHeight, isMobile, isTablet]);
};

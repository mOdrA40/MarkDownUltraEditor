/**
 * useResponsiveOptimization Hook
 * 
 * Custom hook untuk responsive design optimization dengan
 * media query management dan device detection.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useCallback, useRef, useEffect } from 'react';
import { UseResponsiveOptimizationReturn, MediaQueryBreakpoints } from '../types';
import { 
  createMediaQueryBreakpoints, 
  detectDeviceType, 
  checkReducedMotionPreference, 
  checkDarkModePreference 
} from '../utils/mediaQueryUtils';

/**
 * Hook untuk responsive optimization dengan media query management
 * 
 * @returns Object dengan functions untuk device detection dan preference checking
 */
export const useResponsiveOptimization = (): UseResponsiveOptimizationReturn => {
  const mediaQueries = useRef<MediaQueryBreakpoints | null>(null);
  const isInitialized = useRef<boolean>(false);

  /**
   * Initialize media queries dengan error handling
   * Hanya dijalankan sekali untuk performance
   */
  const initializeMediaQueries = useCallback(() => {
    if (isInitialized.current) return;
    
    try {
      mediaQueries.current = createMediaQueryBreakpoints();
      isInitialized.current = true;
      
      // Log initialization untuk debugging
      if (process.env.NODE_ENV === 'development') {
        console.info('Media queries initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize media queries:', error);
      // Set fallback state
      mediaQueries.current = null;
      isInitialized.current = true;
    }
  }, []);

  /**
   * Mendapatkan current device type berdasarkan viewport
   * 
   * @returns Device type (mobile, tablet, desktop)
   */
  const getDeviceType = useCallback(() => {
    if (!isInitialized.current) {
      initializeMediaQueries();
    }

    return detectDeviceType(mediaQueries.current);
  }, [initializeMediaQueries]);

  /**
   * Check apakah user prefers reduced motion
   * Penting untuk accessibility dan user experience
   * 
   * @returns Boolean indicating reduced motion preference
   */
  const shouldReduceMotion = useCallback(() => {
    if (!isInitialized.current) {
      initializeMediaQueries();
    }

    return checkReducedMotionPreference(mediaQueries.current);
  }, [initializeMediaQueries]);

  /**
   * Check apakah user prefers dark mode
   * Berguna untuk automatic theme switching
   * 
   * @returns Boolean indicating dark mode preference
   */
  const prefersDarkMode = useCallback(() => {
    if (!isInitialized.current) {
      initializeMediaQueries();
    }

    return checkDarkModePreference(mediaQueries.current);
  }, [initializeMediaQueries]);

  /**
   * Initialize media queries saat component mount
   */
  useEffect(() => {
    initializeMediaQueries();
  }, [initializeMediaQueries]);

  /**
   * Cleanup effect - tidak ada cleanup yang diperlukan untuk media queries
   * karena browser mengelola MediaQueryList objects secara otomatis
   */
  useEffect(() => {
    return () => {
      // Media queries akan di-cleanup otomatis oleh browser
      // Kita hanya perlu reset references
      isInitialized.current = false;
    };
  }, []);

  return {
    getDeviceType,
    shouldReduceMotion,
    prefersDarkMode
  };
};

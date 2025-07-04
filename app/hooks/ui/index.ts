/**
 * @fileoverview UI-related hooks exports
 * @author Axel Modra
 */

// Re-export responsive utilities
export {
  BREAKPOINTS,
  type DeviceType,
  getDeviceType,
  isDesktopWidth,
  isMobileWidth,
  isTabletWidth,
  MEDIA_QUERIES,
  type ResponsiveState,
} from '@/utils/responsive';
// Re-export responsive hooks dengan nama yang konsisten
// Legacy aliases untuk backward compatibility
export {
  useDeviceType,
  useIsDesktop,
  useIsMobile,
  useIsTablet,
  useResponsiveDetection,
  useResponsiveDetection as useMobile,
  useResponsiveDetection as useResponsiveBreakpoint,
} from './useResponsive';

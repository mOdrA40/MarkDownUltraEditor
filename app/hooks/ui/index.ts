/**
 * @fileoverview UI-related hooks exports
 * @author Senior Developer
 * @version 1.0.0
 */

// Re-export responsive hooks dengan nama yang konsisten
export {
  useResponsiveDetection,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useDeviceType
} from './useResponsive';

// Re-export responsive utilities
export {
  BREAKPOINTS,
  MEDIA_QUERIES,
  getDeviceType,
  isMobileWidth,
  isTabletWidth,
  isDesktopWidth,
  type DeviceType,
  type ResponsiveState
} from '@/utils/responsive';

// Legacy aliases untuk backward compatibility
export { useResponsiveDetection as useMobile } from './useResponsive';
export { useResponsiveDetection as useResponsiveBreakpoint } from './useResponsive';

/**
 * Mobile detection hooks dengan standardized breakpoints
 * Re-export dari responsive detection utilities untuk backward compatibility
 */

// Import untuk internal usage
import { useResponsiveDetection } from './responsive/useResponsiveDetection';

// Re-export standardized responsive hooks
export {
  useResponsiveDetection,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useDeviceType
} from './responsive/useResponsiveDetection';

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

/**
 * Legacy hook untuk backward compatibility
 * @deprecated Gunakan useResponsiveDetection() untuk functionality yang lebih lengkap
 */
export function useResponsiveBreakpoint() {
  const responsiveState = useResponsiveDetection();

  return {
    breakpoint: responsiveState.deviceType,
    isMobile: responsiveState.isMobile,
    isTablet: responsiveState.isTablet,
    isDesktop: responsiveState.isDesktop,
    width: responsiveState.windowWidth
  };
}

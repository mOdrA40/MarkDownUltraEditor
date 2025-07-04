/**
 * Responsive components export
 * Re-export semua responsive-related components dan hooks
 */

// Re-export hooks
export {
  useResponsiveDetection,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useDeviceType,
} from '@/hooks/ui';

// Re-export utilities
export {
  BREAKPOINTS,
  MEDIA_QUERIES,
  getDeviceType,
  isMobileWidth,
  isTabletWidth,
  isDesktopWidth,
  type DeviceType,
  type ResponsiveState,
} from '@/utils/responsive';

// Re-export legacy hooks untuk backward compatibility
export {
  useIsMobile as useMobile,
  useResponsiveBreakpoint,
} from '@/hooks/ui';

/**
 * Responsive wrapper component
 */
import type React from 'react';
import { useResponsiveDetection } from '@/hooks/ui';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  showOn?: 'mobile' | 'tablet' | 'desktop' | 'mobile-tablet' | 'tablet-desktop';
  className?: string;
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  showOn = 'desktop',
  className = '',
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsiveDetection();

  const shouldShow = () => {
    switch (showOn) {
      case 'mobile':
        return isMobile;
      case 'tablet':
        return isTablet;
      case 'desktop':
        return isDesktop;
      case 'mobile-tablet':
        return isMobile || isTablet;
      case 'tablet-desktop':
        return isTablet || isDesktop;
      default:
        return true;
    }
  };

  if (!shouldShow()) return null;

  return <div className={className}>{children}</div>;
};

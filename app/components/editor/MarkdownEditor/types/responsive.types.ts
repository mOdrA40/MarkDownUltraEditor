/*
ResponsiveTypes
@author Axel Modra
 */

import {
  BREAKPOINTS as RESPONSIVE_BREAKPOINTS,
  MEDIA_QUERIES as RESPONSIVE_MEDIA_QUERIES,
} from '@/utils/responsive';

/**
 * Device type enumeration
 */
export enum DeviceType {
  MOBILE = 'mobile',
  SMALL_TABLET = 'small_tablet',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  LARGE_DESKTOP = 'large_desktop',
}

/**
 * Breakpoint configuration
 */
export interface Breakpoints {
  /** Mobile breakpoint */
  mobile: number;
  /** Small tablet breakpoint */
  smallTablet: number;
  /** Tablet breakpoint */
  tablet: number;
  /** Desktop breakpoint */
  desktop: number;
  /** Large desktop breakpoint */
  largeDesktop: number;
}

/**
 * Responsive configuration for components
 */
export interface ResponsiveConfig {
  /** Current device type */
  deviceType: DeviceType;
  /** Current screen width */
  screenWidth: number;
  /** Current screen height */
  screenHeight: number;
  /** Is touch device */
  isTouchDevice: boolean;
  /** Orientation */
  orientation: 'portrait' | 'landscape';
}

/**
 * Layout configuration based on device
 */
export interface LayoutConfig {
  /** Show sidebar */
  showSidebar: boolean;
  /** Sidebar width */
  sidebarWidth: number;
  /** Auto-collapse sidebar */
  autoCollapseSidebar: boolean;
  /** Stack layout (vertical) */
  stackLayout: boolean;
  /** Compact mode */
  compactMode: boolean;
  /** Touch-friendly sizing */
  touchFriendly: boolean;
}

/**
 * Component sizing configuration
 */
export interface ComponentSizing {
  /** Button size */
  buttonSize: 'sm' | 'md' | 'lg';
  /** Icon size */
  iconSize: number;
  /** Font size multiplier */
  fontSizeMultiplier: number;
  /** Spacing multiplier */
  spacingMultiplier: number;
  /** Minimum touch target size */
  minTouchTarget: number;
}

/**
 * Responsive behavior configuration
 */
export interface ResponsiveBehavior {
  /** Auto-hide elements on small screens */
  autoHideElements: string[];
  /** Auto-collapse panels */
  autoCollapsePanels: string[];
  /** Priority order for hiding elements */
  hidePriority: string[];
  /** Sticky elements */
  stickyElements: string[];
}

/**
 * Media query configuration
 */
export interface MediaQueries {
  mobile: string;
  smallTablet: string;
  tablet: string;
  desktop: string;
  largeDesktop: string;
  touchDevice: string;
  hoverDevice: string;
  highDensity: string;
}

/**
 * Responsive hook return type
 */
export interface UseResponsiveReturn {
  /** Current responsive configuration */
  config: ResponsiveConfig;
  /** Layout configuration */
  layout: LayoutConfig;
  /** Component sizing */
  sizing: ComponentSizing;
  /** Responsive behavior */
  behavior: ResponsiveBehavior;
  /** Media queries */
  mediaQueries: MediaQueries;
  /** Utility functions */
  utils: {
    /** Check if current device matches type */
    isDevice: (type: DeviceType) => boolean;
    /** Check if screen width is at least breakpoint */
    isAtLeast: (breakpoint: keyof Breakpoints) => boolean;
    /** Check if screen width is at most breakpoint */
    isAtMost: (breakpoint: keyof Breakpoints) => boolean;
    /** Get optimal layout for current device */
    getOptimalLayout: () => LayoutConfig;
    /** Get component sizing for current device */
    getComponentSizing: () => ComponentSizing;
  };
}

/**
 * Responsive event types
 */
export interface ResponsiveEvents {
  onBreakpointChange: (deviceType: DeviceType) => void;
  onOrientationChange: (orientation: 'portrait' | 'landscape') => void;
  onLayoutChange: (layout: LayoutConfig) => void;
}

/**
 * Responsive CSS classes
 */
export interface ResponsiveClasses {
  container: string;
  mobile: string;
  smallTablet: string;
  tablet: string;
  desktop: string;
  largeDesktop: string;
  touchDevice: string;
  compactMode: string;
  stackLayout: string;
}

/**
 * Default responsive configuration
 */
export const DEFAULT_BREAKPOINTS: Breakpoints = {
  mobile: RESPONSIVE_BREAKPOINTS.mobile.max,
  smallTablet: RESPONSIVE_BREAKPOINTS.tabletSmall.max,
  tablet: RESPONSIVE_BREAKPOINTS.tabletLarge.max,
  desktop: RESPONSIVE_BREAKPOINTS.desktopSmall.max,
  largeDesktop: RESPONSIVE_BREAKPOINTS.desktopLarge.min,
};

export const DEFAULT_MEDIA_QUERIES: MediaQueries = {
  mobile: RESPONSIVE_MEDIA_QUERIES.allMobile,
  smallTablet: RESPONSIVE_MEDIA_QUERIES.tabletSmall,
  tablet: RESPONSIVE_MEDIA_QUERIES.allTablet,
  desktop: RESPONSIVE_MEDIA_QUERIES.desktopSmall,
  largeDesktop: RESPONSIVE_MEDIA_QUERIES.desktopLarge,
  touchDevice: '(pointer: coarse)',
  hoverDevice: '(hover: hover)',
  highDensity: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
};

/**
 * Responsive utility types
 */
export type ResponsiveValue<T> =
  | T
  | {
      mobile?: T;
      smallTablet?: T;
      tablet?: T;
      desktop?: T;
      largeDesktop?: T;
    };

export type ResponsiveProperty<T> = {
  [K in keyof Breakpoints]?: T;
} & { default?: T };

/**
 * Component responsive props
 */
export interface ResponsiveComponentProps {
  /** Responsive configuration override */
  responsive?: Partial<ResponsiveConfig>;
  /** Custom breakpoints */
  breakpoints?: Partial<Breakpoints>;
  /** Custom layout configuration */
  layout?: Partial<LayoutConfig>;
  /** Responsive event handlers */
  onResponsiveChange?: ResponsiveEvents;
}

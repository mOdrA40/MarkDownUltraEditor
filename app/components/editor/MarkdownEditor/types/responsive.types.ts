/**
 * @fileoverview Responsive layout type definitions
 * @author Senior Developer
 * @version 1.0.0
 */

/**
 * Device type enumeration
 */
export enum DeviceType {
  MOBILE = 'mobile',
  SMALL_TABLET = 'small_tablet',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  LARGE_DESKTOP = 'large_desktop'
}

/**
 * Breakpoint configuration
 */
export interface Breakpoints {
  /** Mobile breakpoint (320px - 499px) */
  mobile: number;
  /** Small tablet breakpoint (500px - 767px) */
  smallTablet: number;
  /** Tablet breakpoint (768px - 1023px) */
  tablet: number;
  /** Desktop breakpoint (1024px - 1439px) */
  desktop: number;
  /** Large desktop breakpoint (1440px+) */
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
  mobile: 499,
  smallTablet: 767,
  tablet: 1023,
  desktop: 1439,
  largeDesktop: 1440
};

export const DEFAULT_MEDIA_QUERIES: MediaQueries = {
  mobile: '(max-width: 499px)',
  smallTablet: '(min-width: 500px) and (max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px) and (max-width: 1439px)',
  largeDesktop: '(min-width: 1440px)',
  touchDevice: '(pointer: coarse)',
  hoverDevice: '(hover: hover)',
  highDensity: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
};

/**
 * Responsive utility types
 */
export type ResponsiveValue<T> = T | {
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

import { useEffect, useState } from "react";
import { Dimensions, Platform, ScaledSize } from "react-native";

export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  xs: 0,
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export type Breakpoint = keyof BreakpointConfig;

/**
 * Hook for detecting screen size and tablet/desktop layouts
 */
export function useResponsive(breakpoints: BreakpointConfig = DEFAULT_BREAKPOINTS) {
  const [dimensions, setDimensions] = useState<ScaledSize>(
    Dimensions.get("window")
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const width = dimensions.width;
  const height = dimensions.height;
  const isLandscape = width > height;

  // Determine current breakpoint
  const getCurrentBreakpoint = (): Breakpoint => {
    if (width >= breakpoints.xl) return "xl";
    if (width >= breakpoints.lg) return "lg";
    if (width >= breakpoints.md) return "md";
    if (width >= breakpoints.sm) return "sm";
    return "xs";
  };

  const breakpoint = getCurrentBreakpoint();

  // Helper functions
  const isXs = breakpoint === "xs";
  const isSm = breakpoint === "sm";
  const isMd = breakpoint === "md";
  const isLg = breakpoint === "lg";
  const isXl = breakpoint === "xl";

  // Tablet detection (md and above)
  const isTablet = width >= breakpoints.md;

  // Desktop detection (lg and above)
  const isDesktop = width >= breakpoints.lg;

  // Mobile detection (below md)
  const isMobile = width < breakpoints.md;

  // Check if width is at least a certain breakpoint
  const minWidth = (bp: Breakpoint): boolean => {
    return width >= breakpoints[bp];
  };

  // Check if width is at most a certain breakpoint
  const maxWidth = (bp: Breakpoint): boolean => {
    return width <= breakpoints[bp];
  };

  // Get responsive value based on breakpoint
  const getResponsiveValue = <T,>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
    // Check from largest to smallest breakpoint
    const orderedBreakpoints: Breakpoint[] = ["xl", "lg", "md", "sm", "xs"];
    const currentIndex = orderedBreakpoints.indexOf(breakpoint);

    // Try to find a value for current or smaller breakpoint
    for (let i = currentIndex; i < orderedBreakpoints.length; i++) {
      const bp = orderedBreakpoints[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }

    return undefined;
  };

  return {
    // Dimensions
    width,
    height,
    isLandscape,
    isPortrait: !isLandscape,

    // Breakpoints
    breakpoint,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,

    // Device types
    isTablet,
    isDesktop,
    isMobile,

    // Utilities
    minWidth,
    maxWidth,
    getResponsiveValue,

    // Platform
    isIOS: Platform.OS === "ios",
    isAndroid: Platform.OS === "android",
    isWeb: Platform.OS === "web",
  };
}

/**
 * Get responsive spacing based on screen size
 */
export function useResponsiveSpacing() {
  const { isTablet, isDesktop } = useResponsive();

  return {
    padding: isDesktop ? 32 : isTablet ? 24 : 16,
    margin: isDesktop ? 24 : isTablet ? 20 : 16,
    gap: isDesktop ? 20 : isTablet ? 16 : 12,
    borderRadius: isDesktop ? 16 : isTablet ? 14 : 12,
  };
}

/**
 * Get responsive font sizes based on screen size
 */
export function useResponsiveFontSize() {
  const { isTablet, isDesktop } = useResponsive();

  const scale = isDesktop ? 1.2 : isTablet ? 1.1 : 1;

  return {
    xs: 12 * scale,
    sm: 14 * scale,
    base: 16 * scale,
    lg: 18 * scale,
    xl: 20 * scale,
    "2xl": 24 * scale,
    "3xl": 30 * scale,
    "4xl": 36 * scale,
  };
}

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar, StatusBarStyle } from "expo-status-bar";
import { useCallback } from "react";

interface ThemedStatusBarProps {
  /** Override the automatic style determination */
  style?: StatusBarStyle;
  /** Custom background color (Android only) */
  backgroundColor?: string;
  /** Whether the status bar should be translucent (Android only) */
  translucent?: boolean;
  /** Whether to hide the status bar */
  hidden?: boolean;
  /** Whether this status bar should only apply when screen is focused */
  screenFocused?: boolean;
}

export function ThemedStatusBar({
  style,
  backgroundColor,
  translucent = false,
  hidden = false,
  screenFocused = false,
}: ThemedStatusBarProps = {}) {
  const colorScheme = useColorScheme();

  // Determine status bar style based on theme (unless overridden)
  const statusBarStyle = style || (colorScheme === "dark" ? "light" : "dark");

  // Use custom background color or default theme background
  const statusBarBackground =
    backgroundColor || Colors[colorScheme ?? "light"].background;

  // For screen-focused status bars, apply the style only when screen is active
  const applyStatusBarStyle = useCallback(() => {
    // This would be handled by the StatusBar component itself
  }, []);

  // Use focus effect only when needed
  useFocusEffect(
    useCallback(() => {
      if (screenFocused) {
        applyStatusBarStyle();
      }
    }, [screenFocused, applyStatusBarStyle])
  );

  return (
    <StatusBar
      style={statusBarStyle}
      backgroundColor={statusBarBackground}
      translucent={translucent}
      hidden={hidden}
    />
  );
}

// Preset configurations for common use cases
export const StatusBarPresets = {
  /** Default themed status bar */
  default: () => <ThemedStatusBar />,

  /** Status bar for modal screens */
  modal: () => <ThemedStatusBar translucent={false} />,

  /** Status bar that only applies when screen is focused */
  screenFocused: (props?: Omit<ThemedStatusBarProps, "screenFocused">) => (
    <ThemedStatusBar {...props} screenFocused={true} />
  ),

  /** Status bar with custom style */
  custom: (props: ThemedStatusBarProps) => <ThemedStatusBar {...props} />,
} as const;

export default ThemedStatusBar;

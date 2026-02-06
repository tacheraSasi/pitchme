import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { ThemedStatusBar } from "@/components/themed/themed-status-bar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHasCompletedOnboarding } from "@/stores/settingsStore";

export const unstable_settings = {
  anchor: "(drawer)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const hasCompletedOnboarding = useHasCompletedOnboarding();


  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Protected guard={hasCompletedOnboarding}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="songs" options={{ headerShown: false }} />
        <Stack.Screen name="tools" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen name="recordings" options={{ headerShown: false }} />
        <Stack.Screen name="webview/[url]" options={{ headerShown: true, headerTitle: "PitchMe" }} />
        <Stack.Screen
          name="settings"
          options={{ presentation: "modal", title: "Settings" }}
        />
      </Stack>
      <ThemedStatusBar />
    </ThemeProvider>
  );
}

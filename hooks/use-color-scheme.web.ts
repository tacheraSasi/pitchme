import { useThemeMode } from "@/stores/settingsStore";
import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const systemColorScheme = useRNColorScheme();
  const userThemeMode = useThemeMode();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // If not hydrated yet, return light for SSR
  if (!hasHydrated) {
    return "light";
  }

  // If user selected 'system', use system preference
  // Otherwise, use user's explicit choice
  if (userThemeMode === "system") {
    return systemColorScheme;
  }

  return userThemeMode;
}

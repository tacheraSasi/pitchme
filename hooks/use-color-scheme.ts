import { useThemeMode } from "@/stores/settingsStore";
import { useColorScheme as useRNColorScheme } from "react-native";

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const userThemeMode = useThemeMode();

  // If user selected 'system', we use system preference
  // Otherwise, we use user's explicit choice
  if (userThemeMode === "system") {
    return systemColorScheme;
  }

  return userThemeMode;
}

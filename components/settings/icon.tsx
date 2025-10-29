import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet } from "react-native";

interface SettingsIconProps {
  backgroundColor?: string;
}
export default function SettingsIcon({ backgroundColor }: SettingsIconProps) {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");
  return (
    <ThemedView>
      <MaterialIcons
        name="settings"
        size={26}
        style={[styles.icon, { backgroundColor }]}
      />
    </ThemedView>
  );
}
const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    icon: {
      color: colorScheme === "dark" ? Colors.dark.text : Colors.light.text,
    },
  });

import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, useColorScheme } from "react-native";

export default function SettingsIcon() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");
  return (
    <ThemedView>
      <MaterialIcons name="settings" size={26} style={styles.icon} />
    </ThemedView>
  );
}
const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    icon: {
      color: "white",
      padding: 6,
      borderRadius: 20,
      backgroundColor:
        colorScheme === "dark" ? "#6B59C3" : Colors[colorScheme].tint,
    },
  });

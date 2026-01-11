import { Tool } from "@/utils/tools";
import { ThemedText } from "../themed/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export interface ToolsListItemProps extends Tool {
  size?: number;
}

const getIconName = (iconKey: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    metronome: "timer-outline",
    "circle-of-fifths": "ellipse-outline",
    tuner: "radio-outline",
    recorder: "mic-outline",
    scales: "musical-notes-outline",
    "chord-finder": "musical-note-outline",
    "ear-training": "ear-outline",
  };
  return iconMap[iconKey] || "apps-outline";
};

export function ToolsListItem({
  id,
  title,
  icon,
  size = 100,
}: ToolsListItemProps) {
  const [pressed, setPressed] = useState(false);
  const colorScheme = useColorScheme() as "light" | "dark";
  const styles = getStyles(colorScheme ?? "light");

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log(`Pressed tool: ${id}`);
    // TODO: Navigate to tool screen when implemented
    // router.push(`/tools/${id}` as any);
  };

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={handlePress}
      style={[
        styles.card,
        { width: size, height: size },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.innerCard}>
        <View
          style={[styles.iconContainer, pressed && styles.iconContainerPressed]}
        >
          <Ionicons
            name={getIconName(icon)}
            size={32}
            color={
              pressed
                ? Colors[colorScheme].background
                : Colors[colorScheme].tint
            }
          />
        </View>
        <ThemedText
          style={[styles.title, pressed && styles.titlePressed]}
          numberOfLines={2}
        >
          {title}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    card: {
      borderRadius: 18,
      backgroundColor:
        colorScheme === "dark"
          ? Colors.dark.background
          : Colors.light.background,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#444" : "#e0e0e0",
      padding: 12,
    },
    cardPressed: {
      backgroundColor: Colors[colorScheme].tint,
      transform: [{ scale: 0.96 }],
    },
    innerCard: {
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      alignItems: "center",
      justifyContent: "center",
    },
    iconContainerPressed: {
      backgroundColor: Colors[colorScheme].buttonOverlay,
    },
    title: {
      fontWeight: "600",
      fontSize: 14,
      textAlign: "center",
      color: colorScheme === "dark" ? Colors.dark.text : Colors.light.text,
    },
    titlePressed: {
      color: Colors[colorScheme].background,
    },
  });

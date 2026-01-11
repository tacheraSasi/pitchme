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
        { width: size, height: size * 1.1 },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.innerCard}>
        <View
          style={[styles.iconContainer, pressed && styles.iconContainerPressed]}
        >
          <Ionicons
            name={getIconName(icon)}
            size={36}
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
      borderRadius: 20,
      width:'100%',
      backgroundColor:
        colorScheme === "dark"
          ? Colors.dark.background
          : Colors.light.background,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#444" : "#e0e0e0",
      padding: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 0.2,
    },
    cardPressed: {
      backgroundColor: Colors[colorScheme].tint,
      shadowOpacity: 0.15,
      elevation: 0.2,
    },
    innerCard: {
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      flex: 1,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#3a3a3a" : "#e8e8e8",
    },
    iconContainerPressed: {
      backgroundColor: Colors[colorScheme].buttonOverlay,
      borderColor: Colors[colorScheme].buttonOverlay,
    },
    title: {
      fontWeight: "600",
      fontSize: 15,
      textAlign: "center",
      color: colorScheme === "dark" ? Colors.dark.text : Colors.light.text,
      lineHeight: 20,
    },
    titlePressed: {
      color: Colors[colorScheme].background,
    },
  });

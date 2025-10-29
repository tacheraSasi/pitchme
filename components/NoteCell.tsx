import { ThemedText } from "@/components/themed-text";
import { Note } from "@/constants/notes";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export interface NoteCellProps {
  note: Note;
  size?: number;
  onPress?: (note: Note) => void;
}

export const NoteCell = ({ note, onPress, size = 100 }: NoteCellProps) => {
  const [pressed, setPressed] = useState(false);
  const colorScheme = useColorScheme() as "light" | "dark";
  const styles = getStyles(colorScheme ?? "light");
  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => {
        console.log(`Pressed note: ${note}`);
        onPress?.(note);
      }}
      style={[
        styles.pad,
        { width: size, height: size },
        pressed && styles.padPressed,
      ]}
    >
      <View style={styles.innerPad}>
        <ThemedText style={styles.text}>{note}</ThemedText>
      </View>
    </Pressable>
  );
};

const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    pad: {
      borderRadius: 18,
      backgroundColor:
        colorScheme === "dark"
          ? Colors.dark.background
          : Colors.light.background,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#444" : "#e0e0e0",
    },
    padPressed: {
      color: Colors[colorScheme].background,
      backgroundColor: Colors[colorScheme].tint,
      transform: [{ scale: 0.96 }],
    },
    innerPad: {
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      fontWeight: "600",
      fontSize: 18,
      color: colorScheme === "dark" ? Colors.dark.text : Colors.light.text,
    },
  });

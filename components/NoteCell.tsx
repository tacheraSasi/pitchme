import { ThemedText } from "@/components/themed-text";
import { Note } from "@/constants/notes";
import { Pressable, StyleSheet, View } from "react-native";
import { useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { Colors } from "@/constants/theme";

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
      backgroundColor: "#f4f4f4",
      alignItems: "center",
      justifyContent: "center",
    },
    padPressed: {
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
      color: "#1a1a1a",
    },
  });

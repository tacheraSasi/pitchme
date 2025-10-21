import { ThemedText } from "@/components/themed-text";
import { Note } from "@/constants/notes";
import { Pressable, StyleSheet, View } from "react-native";
import { useState } from "react";

export interface NoteCellProps {
  note: Note;
  size?: number;
  onPress?: (note: Note) => void;
}

export const NoteCell = ({ note, onPress, size = 100 }: NoteCellProps) => {
  const [pressed, setPressed] = useState(false);

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

const styles = StyleSheet.create({
  pad: {
    borderRadius: 18,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
  },
  padPressed: {
    backgroundColor: "#d1e8ff",
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

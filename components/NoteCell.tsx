import { ThemedText } from "@/components/themed-text";
import { Note } from "@/constants/notes";
import { Pressable, StyleSheet, View } from "react-native";
import { useState } from "react";

export interface NoteCellProps {
  note: Note;
  onPress?: (note: Note) => void;
}

export const NoteCell = ({ note, onPress }: NoteCellProps) => {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => {
        console.log(`Pressed note: ${note}`);
        onPress?.(note);
      }}
      style={[styles.pad, pressed && styles.padPressed]}
    >
      <View style={styles.innerPad}>
        <ThemedText style={styles.text}>{note}</ThemedText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pad: {
    width: 90,
    height: 90,
    margin: 10,
    borderRadius: 20,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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

import { ThemedText } from "@/components/themed-text";
import { Note } from "@/constants/notes";
import { Pressable, StyleSheet } from "react-native";

export interface NoteCellProps {
  note: Note;
}

export const NoteCell = ({ note }: NoteCellProps) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
      onPress={() => {}}
    >
      <ThemedText style={styles.text}>{note}</ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    margin: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chipPressed: {
    backgroundColor: "#bdbdbd",
  },
  text: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
});

import { NoteCell } from "@/components/NoteCell";
import { ThemedView } from "@/components/themed-view";
import { NOTES } from "@/constants/notes";
import { StyleSheet } from "react-native";

export const NotesList = () => {
  return (
    <ThemedView style={styles.container}>
      {NOTES.map((note) => (
        <NoteCell key={note} note={note} />
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    padding: 12,
  },
});

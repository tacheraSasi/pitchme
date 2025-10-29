import { NoteCell } from "@/components/NoteCell";
import { ThemedView } from "@/components/themed-view";
import { NOTES } from "@/constants/notes";
import { StyleSheet, useWindowDimensions } from "react-native";

export const NotesList = () => {
  const { width } = useWindowDimensions();

  const columns = width < 400 ? 2 : 3;
  const itemSize = (width - (columns + 1) * 12) / columns;

  return (
    <ThemedView style={[styles.container, { gap: 12 }]}>
      {NOTES.map((note) => (
        <NoteCell key={note} note={note} size={itemSize} />
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
});

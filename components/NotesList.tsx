import { NoteCell } from "@/components/NoteCell";
import { ThemedView } from "@/components/themed-view";
import { NOTES, Note, noteAssets } from "@/constants/notes";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useAudioPlayer } from "expo-audio";
import { useRef } from "react";

export const NotesList = () => {
  const { width } = useWindowDimensions();
  const currentPlayerRef = useRef<ReturnType<typeof useAudioPlayer> | null>(
    null
  );

  const columns = width < 400 ? 2 : 3;
  const itemSize = (width - (columns + 1) * 12) / columns;

  const handleNotePress = (note: Note) => {
    // Stop the currently playing audio if any
    if (currentPlayerRef.current) {
      currentPlayerRef.current.pause();
      currentPlayerRef.current.seekTo(0);
    }
    // Create and play new player for this note
    const player = useAudioPlayer(noteAssets[note]);
    currentPlayerRef.current = player;
    player.play();
  };

  return (
    <ThemedView style={[styles.container, { gap: 12 }]}>
      {NOTES.map((note) => (
        <NoteCell
          key={note}
          note={note}
          size={itemSize}
          onPress={handleNotePress}
        />
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

import { NoteCell } from "@/components/NoteCell";
import { ThemedView } from "@/components/themed-view";
import { NOTES, Note, noteAssets } from "@/constants/notes";
import { useAudioPlayer } from "expo-audio";
import { useCallback, useRef } from "react";
import { ScrollView, StyleSheet, useWindowDimensions } from "react-native";

export const NotesList = () => {
  const { width } = useWindowDimensions();

  const playerC = useAudioPlayer(noteAssets[Note.C]);
  const playerCSharp = useAudioPlayer(noteAssets[Note.CSharp]);
  const playerD = useAudioPlayer(noteAssets[Note.D]);
  const playerDSharp = useAudioPlayer(noteAssets[Note.DSharp]);
  const playerE = useAudioPlayer(noteAssets[Note.E]);
  const playerF = useAudioPlayer(noteAssets[Note.F]);
  const playerFSharp = useAudioPlayer(noteAssets[Note.FSharp]);
  const playerG = useAudioPlayer(noteAssets[Note.G]);
  const playerGSharp = useAudioPlayer(noteAssets[Note.GSharp]);
  const playerA = useAudioPlayer(noteAssets[Note.A]);
  const playerASharp = useAudioPlayer(noteAssets[Note.ASharp]);
  const playerB = useAudioPlayer(noteAssets[Note.B]);

  const currentPlayerRef = useRef<ReturnType<typeof useAudioPlayer> | null>(
    null
  );

  const columns = width < 400 ? 2 : 3;
  const itemSize = (width - (columns + 1) * 12) / columns;

  const handleNotePress = useCallback(
    (note: Note) => {
      try {
        console.log("Playing note:", note);

        if (currentPlayerRef.current) {
          currentPlayerRef.current.pause();
          currentPlayerRef.current.seekTo(0);
        }

        const audioPlayers = {
          [Note.C]: playerC,
          [Note.CSharp]: playerCSharp,
          [Note.D]: playerD,
          [Note.DSharp]: playerDSharp,
          [Note.E]: playerE,
          [Note.F]: playerF,
          [Note.FSharp]: playerFSharp,
          [Note.G]: playerG,
          [Note.GSharp]: playerGSharp,
          [Note.A]: playerA,
          [Note.ASharp]: playerASharp,
          [Note.B]: playerB,
        };

        const player = audioPlayers[note];
        if (player) {
          console.log("Player found for note:", note);
          currentPlayerRef.current = player;

          // Check player status
          console.log("Player status:", player.currentStatus);

          player.seekTo(0);
          const playResult = player.play();
          console.log("Play result:", playResult);
        } else {
          console.log("No player found for note:", note);
        }
      } catch (error) {
        console.error("Error playing note:", note, error);
      }
    },
    [
      playerC,
      playerCSharp,
      playerD,
      playerDSharp,
      playerE,
      playerF,
      playerFSharp,
      playerG,
      playerGSharp,
      playerA,
      playerASharp,
      playerB,
    ]
  );

  return (
    <ThemedView style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={[styles.container, { gap: 12 }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {NOTES.map((note) => (
          <NoteCell
            key={note}
            note={note}
            size={itemSize}
            onPress={handleNotePress}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    maxHeight: 400, // Limit height to make it scrollable
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    paddingBottom: 20, // Extra padding at bottom
  },
});

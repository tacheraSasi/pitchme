import { ThemedText } from "@/components/themed/themed-text";
import { Colors } from "@/constants/theme";
import { useGlobalAudioPlayer } from "@/hooks/use-global-audioi-player";
import { RecordingItem, useRecordingsStore } from "@/stores/recordingsStore";
import Entypo from "@expo/vector-icons/Entypo";
import { useAudioPlayerStatus } from "expo-audio";
import * as FileSystem from "expo-file-system";
import { Alert, Pressable, View } from "react-native";

export function RecordingListItem({
  recording,
  formatTime,
  formatDate,
  colorScheme,
  styles,
}: {
  recording: RecordingItem;
  formatTime: (millis: number) => string;
  formatDate: (dateString: string) => string;
  colorScheme: "light" | "dark";
  styles: any;
}) {
  const { player, playExclusive, pause } = useGlobalAudioPlayer(recording.uri);
  const playerStatus = useAudioPlayerStatus(player);
  const { removeRecording } = useRecordingsStore();

  const togglePlayback = async () => {
    if (playerStatus.playing) {
      await pause();
    } else {
      // restart if ended
      if (playerStatus.currentTime >= playerStatus.duration) {
        player.seekTo(0);
      }
      await playExclusive();
    }
  };

  const handleDeleteRecording = (recording: RecordingItem) => {
    Alert.alert(
      "Delete Recording",
      "Are you sure you want to delete this recording?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete the file using the File class
              const file = new FileSystem.File(recording.uri);
              file.delete();

              // Remove from store
              await removeRecording(recording.id);
            } catch (error) {
              console.error("Error deleting recording:", error);
              Alert.alert("Error", "Failed to delete recording.");
            }
          },
        },
      ]
    );
  };

  return (
    <Pressable style={styles.ideaItem}>
      <View style={styles.ideaIconContainer}>
        <Entypo name="sound-mix" size={20} color={styles.ideaIcon.color} />
      </View>
      <View style={styles.ideaContent}>
        <ThemedText style={styles.ideaTitle} numberOfLines={1}>
          {recording.title}
        </ThemedText>
        <View style={styles.ideaMetadata}>
          <ThemedText style={styles.ideaDuration}>
            {formatTime(recording.durationMillis)}
          </ThemedText>
          <ThemedText style={styles.ideaDate}>
            {formatDate(recording.date)}
          </ThemedText>
        </View>
      </View>
      <Pressable style={styles.playButton} onPress={togglePlayback}>
        <Entypo
          name={playerStatus.playing ? "controller-paus" : "controller-play"}
          size={16}
          color={Colors[colorScheme].tint}
        />
      </Pressable>
    </Pressable>
  );
}

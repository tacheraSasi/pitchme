import { ThemedText } from "@/components/themed/themed-text";
import { Colors } from "@/constants/theme";
import { RecordingItem } from "@/stores/recordingsStore";
import Entypo from "@expo/vector-icons/Entypo";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Pressable, View } from "react-native";

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
  const audioPlayer = useAudioPlayer({ uri: recording.uri });
  const playerStatus = useAudioPlayerStatus(audioPlayer);

  const togglePlayback = () => {
    if (playerStatus.playing) {
      audioPlayer.pause();
    } else {
      // If we're at the end, restart
      if (playerStatus.currentTime >= playerStatus.duration) {
        audioPlayer.seekTo(0);
      }
      audioPlayer.play();
    }
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

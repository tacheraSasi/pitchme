import { View, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRecordingsStore, RecordingItem } from "@/stores/recordingsStore";
import Entypo from "@expo/vector-icons/Entypo";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";

export default function RecordingsScreen() {
  const colorScheme = useColorScheme();
  const { recordings, addRecording, removeRecording } = useRecordingsStore();
  const [isRecording, setIsRecording] = useState(false);

  const styles = getStyles(colorScheme ?? "light");

  // Initialize audio recorder
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  // Setup audio permissions and mode
  useEffect(() => {
    const setupAudio = async () => {
      try {
        // Request recording permissions
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          Alert.alert(
            "Permission required",
            "Microphone access is required to record audio."
          );
          return;
        }

        // Configure audio mode
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        });
      } catch (error) {
        console.error("Error setting up audio:", error);
        Alert.alert("Error", "Failed to setup audio recording.");
      }
    };

    setupAudio();
  }, []);

  const startRecording = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert("Error", "Failed to start recording.");
    }
  };

const stopRecording = async () => {
  try {
    await audioRecorder.stop();
    setIsRecording(false);

    if (audioRecorder.uri) {
      // Generate unique name
      const timestamp = Date.now();
      const fileName = `pitchme_recording_${timestamp}.m4a`;

      // Create or reference the "recordings" folder in the document directory
      const recordingsDir = new FileSystem.Directory(FileSystem.Paths.document, "pitchme/ideas");
      if (!recordingsDir.exists) {
        recordingsDir.create();
      }

      // File instance for the destination
      const destFile = new FileSystem.File(recordingsDir, fileName);

      // Move the recorded file to the new location
      const tempFile = new FileSystem.File(audioRecorder.uri);
      tempFile.move(destFile);

      const info = destFile.info();
      console.log("Saved recording:", info);

      await addRecording({
        title: `Recording ${new Date().toLocaleString()}`,
        uri: destFile.uri,
        durationMillis: recorderState?.durationMillis ?? 0,
      });

      Alert.alert("Success", "Recording saved successfully!");
    }
  } catch (error) {
    console.error("Error saving recording:", error);
    Alert.alert("Error", "Failed to save recording.");
  }
};

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Recorded Ideas
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Record and manage your musical ideas
        </ThemedText>
      </ThemedView>

      {/* Recording Button */}
      <Pressable
        style={[styles.recordButton, isRecording && styles.recordingButton]}
        onPress={handleRecordPress}
      >
        <Entypo
          name={isRecording ? "controller-stop" : "mic"}
          size={28}
          color="white"
        />
        <ThemedText style={styles.recordButtonText}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </ThemedText>
        {isRecording && (
          <ThemedText style={styles.recordingTime}>
            {Math.floor(recorderState.durationMillis / 1000)}s
          </ThemedText>
        )}
      </Pressable>

      {/* Recording Status */}
      {isRecording && (
        <ThemedView style={styles.recordingStatus}>
          <View style={styles.recordingIndicator} />
          <ThemedText style={styles.recordingStatusText}>
            Recording in progress...
          </ThemedText>
        </ThemedView>
      )}

      {/* Recordings List */}
      <ScrollView style={styles.recordingsList}>
        {recordings.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Entypo
              name="sound-mix"
              size={48}
              color={Colors[colorScheme ?? "light"].text}
              style={styles.emptyIcon}
            />
            <ThemedText style={styles.emptyText}>No recordings yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Tap the record button to capture your first idea
            </ThemedText>
          </ThemedView>
        ) : (
          recordings.map((recording) => (
            <RecordingListItem
              key={recording.id}
              recording={recording}
              onDelete={() => handleDeleteRecording(recording)}
            />
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

// Recording List Item Component
function RecordingListItem({
  recording,
  onDelete,
}: {
  recording: RecordingItem;
  onDelete: () => void;
}) {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");

  // Create audio player for this recording
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

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ThemedView style={styles.recordingItem}>
      <Pressable style={styles.playButton} onPress={togglePlayback}>
        <Entypo
          name={playerStatus.playing ? "controller-paus" : "controller-play"}
          size={24}
          color={Colors[colorScheme ?? "light"].tint}
        />
      </Pressable>

      <View style={styles.recordingInfo}>
        <ThemedText style={styles.recordingTitle} numberOfLines={1}>
          {recording.title}
        </ThemedText>
        <ThemedText style={styles.recordingMeta}>
          {formatTime(recording.durationMillis)} • {formatDate(recording.date)}
        </ThemedText>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width:
                  playerStatus.duration > 0
                    ? `${
                        (playerStatus.currentTime / playerStatus.duration) * 100
                      }%`
                    : "0%",
              },
            ]}
          />
        </View>
      </View>

      <Pressable style={styles.deleteButton} onPress={onDelete}>
        <Entypo
          name="trash"
          size={20}
          color="red"
        />
      </Pressable>
    </ThemedView>
  );
}

const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      opacity: 0.7,
    },
    recordButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 12,
      marginBottom: 16,
    },
    recordingButton: {
      backgroundColor: "#FF4444",
    },
    recordButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
    },
    recordingTime: {
      color: "white",
      fontSize: 14,
      opacity: 0.9,
    },
    recordingStatus: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      gap: 12,
      marginBottom: 16,
    },
    recordingIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: "#FF4444",
    },
    recordingStatusText: {
      fontSize: 14,
      fontWeight: "500",
      color: "#FF4444",
    },
    recordingsList: {
      flex: 1,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyIcon: {
      opacity: 0.5,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 8,
      opacity: 0.7,
    },
    emptySubtext: {
      fontSize: 14,
      opacity: 0.5,
      textAlign: "center",
    },
    recordingItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 12,
      backgroundColor:
        colorScheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
      marginBottom: 12,
    },
    playButton: {
      padding: 8,
      marginRight: 12,
    },
    recordingInfo: {
      flex: 1,
    },
    recordingTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    recordingMeta: {
      fontSize: 12,
      opacity: 0.6,
      marginBottom: 8,
    },
    progressBar: {
      height: 3,
      backgroundColor:
        colorScheme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
      borderRadius: 1.5,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: Colors[colorScheme].tint,
      borderRadius: 1.5,
    },
    deleteButton: {
      padding: 8,
      marginLeft: 12,
    },
  });

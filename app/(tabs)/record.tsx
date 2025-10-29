import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Entypo from "@expo/vector-icons/Entypo";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecordScreen() {
  const colorScheme = useColorScheme();
  const [isRecordingNote, setIsRecordingNote] = useState(false);
  const [isRecordingIdea, setIsRecordingIdea] = useState(false);

  const styles = getStyles(colorScheme ?? "light");

  const handleRecordNote = () => {
    if (isRecordingNote) {
      setIsRecordingNote(false);
      Alert.alert("Recording Stopped", "Your custom note has been saved!");
    } else {
      setIsRecordingNote(true);
      Alert.alert("Recording Started", "Recording your custom note...");
    }
  };

  const handleRecordIdea = () => {
    if (isRecordingIdea) {
      setIsRecordingIdea(false);
      Alert.alert("Recording Stopped", "Your music idea has been saved!");
    } else {
      setIsRecordingIdea(true);
      Alert.alert("Recording Started", "Recording your music idea...");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Record Studio
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Create custom notes and capture your musical ideas
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.content}>
          {/* Custom Note Recording Section */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Custom Audio Note
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Record a custom musical note or sound to add to your collection
            </ThemedText>

            <Pressable
              style={[
                styles.recordButton,
                styles.noteButton,
                isRecordingNote && styles.recordingButton,
              ]}
              onPress={handleRecordNote}
            >
              <Entypo
                name={isRecordingNote ? "controller-stop" : "mic"}
                size={32}
                color="white"
              />
              <ThemedText style={styles.buttonText}>
                {isRecordingNote ? "Stop Recording" : "Record Note"}
              </ThemedText>
            </Pressable>
          </ThemedView>

          {/* Voice Memo Section */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Music Ideas & Memories
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Capture melodies, lyrics, or musical thoughts for later
              inspiration
            </ThemedText>

            <Pressable
              style={[
                styles.recordButton,
                styles.ideaButton,
                isRecordingIdea && styles.recordingButton,
              ]}
              onPress={handleRecordIdea}
            >
              <Entypo
                name={isRecordingIdea ? "controller-stop" : "sound"}
                size={32}
                color="white"
              />
              <ThemedText style={styles.buttonText}>
                {isRecordingIdea ? "Stop Recording" : "Record Idea"}
              </ThemedText>
            </Pressable>
          </ThemedView>

          {/* Recording Status */}
          {(isRecordingNote || isRecordingIdea) && (
            <ThemedView style={styles.statusContainer}>
              <View style={styles.recordingIndicator} />
              <ThemedText style={styles.recordingText}>
                Recording in progress...
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      alignItems: "center",
      paddingVertical: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      opacity: 0.7,
      textAlign: "center",
      marginBottom: 20,
    },
    content: {
      flex: 1,
      gap: 30,
    },
    section: {
      alignItems: "center",
      paddingVertical: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 8,
      textAlign: "center",
    },
    sectionDescription: {
      fontSize: 14,
      opacity: 0.7,
      textAlign: "center",
      marginBottom: 20,
      paddingHorizontal: 20,
      lineHeight: 20,
    },
    recordButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 50,
      gap: 12,
      minWidth: 200,
    },
    noteButton: {
      backgroundColor: Colors[colorScheme].tint,
    },
    ideaButton: {
      backgroundColor: "#FF6B6B",
    },
    recordingButton: {
      backgroundColor: "#FF4444",
    },
    buttonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      gap: 12,
    },
    recordingIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: "#FF4444",
    },
    recordingText: {
      fontSize: 14,
      fontWeight: "500",
      color: "#FF4444",
    },
  });

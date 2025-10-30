import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  AudioModule,
  createAudioPlayer,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function NoteDetector() {
  const [saved, setSaved] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY); //TODO: Will GET this from settings store
  const recorderState = useAudioRecorderState(recorder);
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        alert("Permission to access microphone was denied");
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const startRecording = async () => {
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stopRecording = async () => {
    await recorder.stop();
    setSaved(true);
  };

  const playPreview = async () => {
    const previewPlayer = createAudioPlayer(recorder.uri);
    console.log("recorder path", recorder.uri);
    console.log("playing the review", previewPlayer);
    previewPlayer.seekTo(0);
    previewPlayer.play();
    previewPlayer.release();
  };

  const getPlayedNote = () => {
    return "A";
  };

  return (
    <ThemedView style={styles.container}>
      <Pressable
        style={[styles.iconContainer]}
        onPress={recorderState.isRecording ? stopRecording : startRecording}
      >
        {recorderState.isRecording ? (
          <MaterialIcons
            name="stop"
            size={100}
            color={Colors[colorScheme ?? "light"].isRecording}
          />
        ) : (
          <Entypo
            name="mic"
            size={100}
            color={Colors[colorScheme ?? "light"].tint}
          />
        )}
      </Pressable>

      {saved && <ThemedText>NOTE PLAYED IS {getPlayedNote()}</ThemedText>}

      {/* Preview player section */}
      {saved && (
        <Pressable style={styles.ideaItem} onPress={() => playPreview()}>
          <View style={styles.ideaIconContainer}>
            <Entypo name="music" size={20} color={styles.ideaIcon.color} />
          </View>
          <View style={styles.ideaContent}>
            <ThemedText style={styles.ideaTitle}>Preview</ThemedText>
            <View style={styles.ideaMetadata}>
              <ThemedText style={styles.ideaDuration}>0</ThemedText>
            </View>
          </View>
          <Pressable style={styles.playButton}>
            <Entypo
              name="controller-play"
              size={16}
              color={Colors[colorScheme ?? "light"].tint}
            />
          </Pressable>
        </Pressable>
      )}
    </ThemedView>
  );
}

const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 10,
    },
    iconContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      width: 300,
      height: 300,
      borderRadius: 150,
      borderWidth: 3,
      borderColor: "rgba(91, 69, 99, 0.98)",
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      margin: 20,
    },
    micIcon: {},
    titleContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 16,
      alignItems: "center",
    },
    recordingSection: {
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    ideaItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f8f9fa",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#333333" : "#e9ecef",
    },
    ideaIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        colorScheme === "dark" ? "#6B59C3" : Colors[colorScheme].tint,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    ideaIcon: {
      color: "white",
    },
    ideaContent: {
      flex: 1,
      marginRight: 12,
    },
    ideaTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
      color: Colors[colorScheme].text,
    },
    ideaMetadata: {
      flexDirection: "row",
      gap: 12,
    },
    ideaDuration: {
      fontSize: 12,
      opacity: 0.7,
      fontWeight: "500",
      color: Colors[colorScheme].text,
    },
    ideaDate: {
      fontSize: 12,
      opacity: 0.6,
      color: Colors[colorScheme].text,
    },
    playButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f0f0f0",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#444444" : "#e0e0e0",
    },
  });

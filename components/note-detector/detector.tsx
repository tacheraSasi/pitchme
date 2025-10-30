import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Entypo from "@expo/vector-icons/Entypo";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import React, { useEffect } from "react";
import { Button, Pressable, StyleSheet } from "react-native";

export default function NoteDetector() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const colorScheme = useColorScheme();

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
    alert(`Recording saved at: ${recorder.uri}`);
  };

  return (
    <ThemedView style={styles.container}>
      <Button
        title={recorderState.isRecording ? "Stop Recording" : "Start Recording"}
        onPress={recorderState.isRecording ? stopRecording : startRecording}
      />
      <Pressable style={[styles.iconContainer]}>
        <Entypo
          name="mic"
          size={60}
          color={Colors[colorScheme ?? "light"].tint}
        />
      </Pressable>
      <ThemedText>
        {recorder.uri ? `File path: ${recorder.uri}` : ""}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems:"center",
    padding: 10,
  },
  iconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth:2,
    borderColor: "rgba(91, 69, 99, 0.98)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    margin: 20,
  },
  micIcon: {},
});

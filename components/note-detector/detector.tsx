import React, { useEffect } from "react";
import { Button, StyleSheet, Pressable } from "react-native";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
  AudioModule,
} from "expo-audio";
import { ThemedView } from "@/components/themed/themed-view";
import { ThemedText } from "@/components/themed/themed-text";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function NoteDetector() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

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
      <Pressable style={styles.iconContainer}>
        <MaterialIcons name="mic" style={styles.micIcon}/>
      </Pressable>
      <ThemedText>{recorder.uri ? `File path: ${recorder.uri}` : ""}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  micIcon: {},
});

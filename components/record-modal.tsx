import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRecordingsStore } from "@/stores/recordingsStore";
import Entypo from "@expo/vector-icons/Entypo";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as FileSystem from "expo-file-system";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { toast } from "sonner-native";

interface RecordModalProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
}

const RecordModal = ({ bottomSheetRef }: RecordModalProps) => {
  const colorScheme = useColorScheme();
  const [isRecording, setIsRecording] = useState(false);
  const [waveformAnimations] = useState(() =>
    Array.from({ length: 20 }, () => new Animated.Value(0.3))
  );

  const { addRecording } = useRecordingsStore();
  const styles = getStyles(colorScheme ?? "light");

  // Initialize audio recorder
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  // variables
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  // Setup audio permissions and mode
  useEffect(() => {
    const setupAudio = async () => {
      try {
        // Request recording permissions
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          toast.error("Microphone access is required to record audio.");
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
        toast.error("Failed to setup audio recording.");
      }
    };

    setupAudio();
  }, []);

  // Waveform animation
  useEffect(() => {
    if (isRecording) {
      const animations = waveformAnimations.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 50),
            Animated.timing(anim, {
              toValue: 0.8 + Math.random() * 0.2,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3 + Math.random() * 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        )
      );

      animations.forEach((anim) => anim.start());

      return () => {
        animations.forEach((anim) => anim.stop());
      };
    } else {
      waveformAnimations.forEach((anim) => anim.setValue(0.3));
    }
  }, [isRecording, waveformAnimations]);

  const startRecording = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording.");
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);

      if (audioRecorder.uri) {
        const timestamp = Date.now();
        const fileName = `pitchme_recording_${timestamp}.m4a`;

        const recordingsDir = new FileSystem.Directory(
          FileSystem.Paths.document,
          "pitchme"
        );
        if (!recordingsDir.exists) {
          recordingsDir.create();
        }

        // File instance for the destination
        const destFile = new FileSystem.File(recordingsDir, fileName);

        // Move the recorded file to the new location
        const tempFile = new FileSystem.File(audioRecorder.uri);
        tempFile.move(destFile);

        await addRecording({
          title: `Musical Idea ${new Date().toLocaleString()}`,
          uri: destFile.uri,
          durationMillis: recorderState?.durationMillis ?? 0,
        });
        toast.success("Your musical idea has been captured!");
      }
    } catch (error) {
      console.error("Error saving recording:", error);
      toast.error("Failed to save recording.");
    }
  };

  const handleRecordIdea = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const closeModal = () => {
    bottomSheetRef.current?.close();
  };

  // renders
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Musical Idea
          </ThemedText>
          <Pressable onPress={closeModal} style={styles.closeButton}>
            <Entypo
              name="cross"
              size={24}
              color={Colors[colorScheme ?? "light"].text}
            />
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.recordingSection}>
          <ThemedText style={styles.sectionDescription}>
            Capture your musical inspiration - melodies, rhythms, or harmonies
          </ThemedText>

          {/* Waveform Visualization */}
          <View style={styles.waveformContainer}>
            {waveformAnimations.map((animation, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    backgroundColor: isRecording
                      ? Colors[colorScheme ?? "light"].waveformActive
                      : Colors[colorScheme ?? "light"].waveformInactive,
                    transform: [
                      {
                        scaleY: isRecording ? animation : 0.3,
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>

          {/* Recording Button */}
          <Pressable
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={handleRecordIdea}
          >
            <View style={styles.buttonContent}>
              {isRecording ? (
                <View style={styles.stopIcon}>
                  <View style={styles.stopSquare} />
                </View>
              ) : (
                <View style={styles.micIcon}>
                  <Entypo name="mic" size={32} color="white" />
                </View>
              )}
              <ThemedText style={styles.buttonText}>
                {isRecording ? "Stop Recording" : "Start Recording"}
              </ThemedText>
              <ThemedText style={styles.buttonSubtext}>
                {isRecording
                  ? "Tap to save your idea"
                  : "Tap to capture musical inspiration"}
              </ThemedText>
            </View>
          </Pressable>

          {/* Recording Status */}
          {isRecording && (
            <View style={styles.statusContainer}>
              <View style={styles.recordingIndicator} />
              <ThemedText style={styles.recordingText}>
                Recording...{" "}
                {Math.floor((recorderState?.durationMillis ?? 0) / 1000)}s
              </ThemedText>
            </View>
          )}
        </ThemedView>

        <ThemedView style={styles.tipsSection}>
          <ThemedText style={styles.tipsTitle}>🎵 Musical Tips</ThemedText>
          <ThemedText style={styles.tipsText}>
            • Hum or sing your melody clearly{"\n"}• Use instruments for better
            quality{"\n"}• Record in a quiet space for clean audio{"\n"}• Keep
            ideas under 30 seconds for quick capture
          </ThemedText>
        </ThemedView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    bottomSheetBackground: {
      backgroundColor: Colors[colorScheme].bottomSheetBackground,
    },
    handleIndicator: {
      backgroundColor: Colors[colorScheme].handleIndicator,
    },
    contentContainer: {
      flex: 1,
      padding: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: Colors[colorScheme].text,
    },
    closeButton: {
      padding: 4,
    },
    recordingSection: {
      marginBottom: 32,
      alignItems: "center",
    },
    sectionDescription: {
      fontSize: 16,
      opacity: 0.7,
      textAlign: "center",
      marginBottom: 32,
      color: Colors[colorScheme].text,
    },
    waveformContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 80,
      marginBottom: 32,
      gap: 3,
    },
    waveformBar: {
      width: 4,
      height: 40,
      borderRadius: 2,
      marginHorizontal: 1,
    },
    recordButton: {
      width: "100%",
      maxWidth: 280,
      backgroundColor: Colors[colorScheme].tint,
      borderRadius: 20,
      paddingVertical: 24,
      paddingHorizontal: 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    recordingButton: {
      backgroundColor: Colors[colorScheme].isRecording,
      transform: [{ scale: 0.98 }],
    },
    buttonContent: {
      alignItems: "center",
      gap: 12,
    },
    micIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor:
        colorScheme === "light"
          ? Colors[colorScheme].buttonOverlay
          : Colors.light.tint,
      alignItems: "center",
      justifyContent: "center",
    },
    stopIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: Colors[colorScheme].buttonOverlay,
      alignItems: "center",
      justifyContent: "center",
    },
    stopSquare: {
      width: 24,
      height: 24,
      backgroundColor: "white",
      borderRadius: 4,
    },
    buttonText: {
      color: colorScheme === "dark" ? "#000" : "#fff",
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },
    buttonSubtext: {
      color: Colors[colorScheme].buttonSubtext,
      fontSize: 14,
      textAlign: "center",
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      gap: 12,
      marginTop: 16,
    },
    recordingIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: Colors[colorScheme].isRecording,
    },
    recordingText: {
      fontSize: 14,
      fontWeight: "500",
      color: Colors[colorScheme].isRecording,
    },
    tipsSection: {
      marginTop: "auto",
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colorScheme === "dark" ? "#333333" : "#e0e0e0",
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
      color: Colors[colorScheme].text,
    },
    tipsText: {
      fontSize: 14,
      opacity: 0.7,
      lineHeight: 20,
      color: Colors[colorScheme].text,
    },
  });

export default RecordModal;

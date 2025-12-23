import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSongsStore } from "@/stores/songsStore";
import { Entypo } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
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

interface SongRecordModalProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  songId: string;
  songTitle: string;
}

const SongRecordModal = ({
  bottomSheetRef,
  songId,
  songTitle,
}: SongRecordModalProps) => {
  const colorScheme = useColorScheme();
  const [isRecording, setIsRecording] = useState(false);
  const [waveformAnimations] = useState(() =>
    Array.from({ length: 20 }, () => new Animated.Value(0.3))
  );

  const { addRecordingToSong } = useSongsStore();
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

  useEffect(() => {
    const setupAudio = async () => {
      try {
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          console.error("Microphone access is required to record audio.");
          return;
        }

        // audio mode
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        });
      } catch (error) {
        console.error("Error setting up audio:", error);
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
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);

      if (audioRecorder.uri) {
        const timestamp = Date.now();
        const fileName = `${songTitle.replace(
          /[^a-zA-Z0-9]/g,
          "_"
        )}_take_${timestamp}.m4a`;

        const recordingsDir = new FileSystem.Directory(
          FileSystem.Paths.document,
          "pitchme/songs"
        );
        if (!recordingsDir.exists) {
          recordingsDir.create();
        }

        // File instance for the destination
        const destFile = new FileSystem.File(recordingsDir, fileName);

        // Move the recorded file to the new location
        const tempFile = new FileSystem.File(audioRecorder.uri);
        tempFile.move(destFile);

        await addRecordingToSong(songId, {
          title: `Take ${new Date().toLocaleTimeString()}`,
          uri: destFile.uri,
          durationMillis: recorderState?.durationMillis ?? 0,
        });

        console.log("Recording saved to song!");
        closeModal();
      }
    } catch (error) {
      console.error("Error saving recording:", error);
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
      backdropComponent={BottomSheetBackdrop}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Record for {songTitle}
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
            Capture a new take for this song - try different interpretations,
            layers, or ideas
          </ThemedText>

          <View style={styles.waveformContainer}>
            {waveformAnimations.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    backgroundColor: isRecording
                      ? Colors[colorScheme ?? "light"].waveformActive
                      : Colors[colorScheme ?? "light"].waveformInactive,
                    transform: [{ scaleY: anim }],
                  },
                ]}
              />
            ))}
          </View>

          <Pressable
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={handleRecordIdea}
          >
            <View style={styles.buttonContent}>
              <View style={isRecording ? styles.stopIcon : styles.micIcon}>
                {isRecording ? (
                  <View style={styles.stopSquare} />
                ) : (
                  <Entypo
                    name="mic"
                    size={32}
                    color={colorScheme === "dark" ? "#000" : "#fff"}
                  />
                )}
              </View>
              <ThemedText style={styles.buttonText}>
                {isRecording ? "Stop Recording" : "Record Take"}
              </ThemedText>
              <ThemedText style={styles.buttonSubtext}>
                {isRecording
                  ? "Tap to finish this take"
                  : "Capture your musical idea for this song"}
              </ThemedText>
            </View>
          </Pressable>

          {isRecording && (
            <View style={styles.statusContainer}>
              <View style={styles.recordingIndicator} />
              <ThemedText style={styles.recordingText}>Recording...</ThemedText>
            </View>
          )}
        </ThemedView>

        <ThemedView style={styles.tipsSection}>
          <ThemedText style={styles.tipsTitle}>🎵 Recording Tips</ThemedText>
          <ThemedText style={styles.tipsText}>
            • Record multiple takes to compare different ideas{"\n"}• Try
            different instruments or vocal styles{"\n"}• Record harmonies or
            counter-melodies{"\n"}• Capture spontaneous musical moments
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
      flex: 1,
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
      color: Colors.light.buttonSubtext,
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

export default SongRecordModal;

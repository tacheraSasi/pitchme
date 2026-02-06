import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRecordingsStore } from "@/stores/recordingsStore";
import {
  RecordingQuality,
  useRecordingQuality,
  useSetRecordingQuality,
} from "@/stores/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as FileSystem from "expo-file-system";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { toast } from "yooo-native";

// Map quality settings to expo-audio presets
// Custom high quality preset with higher bitrate
const HIGH_QUALITY_CUSTOM = {
  ...RecordingPresets.HIGH_QUALITY,
  bitRate: 256000, // Higher bitrate for better quality
  sampleRate: 48000, // 48kHz sample rate
};

const QUALITY_PRESETS = {
  low: RecordingPresets.LOW_QUALITY,
  medium: RecordingPresets.HIGH_QUALITY,
  high: HIGH_QUALITY_CUSTOM,
};

const QUALITY_LABELS: Record<RecordingQuality, string> = {
  low: "Low (smaller file)",
  medium: "Medium (balanced)",
  high: "High (best quality)",
};

interface RecordModalProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
}

const RecordModal = ({ bottomSheetRef }: RecordModalProps) => {
  const colorScheme = useColorScheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [waveformAnimations] = useState(() =>
    Array.from({ length: 20 }, () => new Animated.Value(0.3))
  );

  const { addRecording } = useRecordingsStore();
  const recordingQuality = useRecordingQuality();
  const setRecordingQuality = useSetRecordingQuality();
  const styles = getStyles(colorScheme ?? "light");

  // Initialize audio recorder with quality from settings
  const audioRecorder = useAudioRecorder(QUALITY_PRESETS[recordingQuality]);
  const recorderState = useAudioRecorderState(audioRecorder);

  // Get metering level for visualization (normalized 0-1)
  const meteringLevel = useMemo(() => {
    if (!recorderState?.metering) return 0;
    // Metering is typically in dB, normalize to 0-1 range
    // -160 dB is silence, 0 dB is max
    const db = recorderState.metering;
    const normalized = Math.max(0, Math.min(1, (db + 60) / 60));
    return normalized;
  }, [recorderState?.metering]);

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
          toast.error("Microphone access is required to record audio.");
          return;
        }

        // audio mode with background support
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
          shouldPlayInBackground: true,
        });
      } catch (error) {
        console.error("Error setting up audio:", error);
        toast.error("Failed to setup audio recording.");
      }
    };

    setupAudio();
  }, []);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Waveform animation based on metering
  useEffect(() => {
    if (isRecording && !isPaused) {
      const animations = waveformAnimations.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 50),
            Animated.timing(anim, {
              toValue: 0.3 + meteringLevel * 0.7 + Math.random() * 0.2,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.2 + meteringLevel * 0.4,
              duration: 150,
              useNativeDriver: true,
            }),
          ])
        )
      );

      animations.forEach((anim) => anim.start());

      return () => {
        animations.forEach((anim) => anim.stop());
      };
    } else if (isPaused) {
      // When paused, show static waveform
      waveformAnimations.forEach((anim) => anim.setValue(0.5));
    } else {
      waveformAnimations.forEach((anim) => anim.setValue(0.3));
    }
  }, [isRecording, isPaused, meteringLevel, waveformAnimations]);

  // Start countdown before recording
  const startCountdown = () => {
    setCountdown(3);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          // Start actual recording when countdown ends
          actuallyStartRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const actuallyStartRecording = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording.");
    }
  };

  const startRecording = async () => {
    startCountdown();
  };

  const pauseRecording = async () => {
    try {
      audioRecorder.pause();
      setIsPaused(true);
    } catch (error) {
      console.error("Error pausing recording:", error);
      toast.error("Failed to pause recording.");
    }
  };

  const resumeRecording = async () => {
    try {
      audioRecorder.record();
      setIsPaused(false);
    } catch (error) {
      console.error("Error resuming recording:", error);
      toast.error("Failed to resume recording.");
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);

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
    if (countdown !== null) {
      // Cancel countdown
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setCountdown(null);
    } else if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  const handleQualityChange = (quality: RecordingQuality) => {
    setRecordingQuality(quality);
    setShowQualitySelector(false);
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

          {/* Recording Quality Selector */}
          {!isRecording && countdown === null && (
            <View style={styles.qualitySection}>
              <Pressable
                style={styles.qualityButton}
                onPress={() => setShowQualitySelector(!showQualitySelector)}
              >
                <Ionicons
                  name="settings-outline"
                  size={16}
                  color={Colors[colorScheme ?? "light"].text}
                />
                <ThemedText style={styles.qualityButtonText}>
                  Quality: {recordingQuality.charAt(0).toUpperCase() + recordingQuality.slice(1)}
                </ThemedText>
                <Ionicons
                  name={showQualitySelector ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={Colors[colorScheme ?? "light"].text}
                />
              </Pressable>

              {showQualitySelector && (
                <View style={styles.qualityOptions}>
                  {(Object.keys(QUALITY_LABELS) as RecordingQuality[]).map((quality) => (
                    <Pressable
                      key={quality}
                      style={[
                        styles.qualityOption,
                        recordingQuality === quality && styles.qualityOptionSelected,
                      ]}
                      onPress={() => handleQualityChange(quality)}
                    >
                      <ThemedText
                        style={[
                          styles.qualityOptionText,
                          recordingQuality === quality && styles.qualityOptionTextSelected,
                        ]}
                      >
                        {QUALITY_LABELS[quality]}
                      </ThemedText>
                      {recordingQuality === quality && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={Colors[colorScheme ?? "light"].tint}
                        />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Countdown Display */}
          {countdown !== null && (
            <View style={styles.countdownContainer}>
              <ThemedText style={styles.countdownText}>{countdown}</ThemedText>
              <ThemedText style={styles.countdownLabel}>Get Ready!</ThemedText>
            </View>
          )}

          {/* Level Meter */}
          {isRecording && (
            <View style={styles.levelMeterContainer}>
              <ThemedText style={styles.levelMeterLabel}>Level</ThemedText>
              <View style={styles.levelMeterTrack}>
                <Animated.View
                  style={[
                    styles.levelMeterFill,
                    {
                      width: `${meteringLevel * 100}%`,
                      backgroundColor:
                        meteringLevel > 0.8
                          ? "#FF4444"
                          : meteringLevel > 0.6
                            ? "#FFA500"
                            : Colors[colorScheme ?? "light"].tint,
                    },
                  ]}
                />
              </View>
              <ThemedText style={styles.levelMeterDb}>
                {recorderState?.metering?.toFixed(0) ?? "-∞"} dB
              </ThemedText>
            </View>
          )}

          {/* Waveform Visualization */}
          {countdown === null && (
            <View style={styles.waveformContainer}>
              {waveformAnimations.map((animation, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.waveformBar,
                    {
                      backgroundColor: isRecording
                        ? isPaused
                          ? Colors[colorScheme ?? "light"].icon
                          : Colors[colorScheme ?? "light"].waveformActive
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
          )}

          {/* Recording Controls */}
          <View style={styles.controlsContainer}>
            {/* Pause/Resume Button (only visible when recording) */}
            {isRecording && (
              <Pressable style={styles.pauseButton} onPress={handlePauseResume}>
                <Ionicons
                  name={isPaused ? "play" : "pause"}
                  size={28}
                  color={Colors[colorScheme ?? "light"].text}
                />
              </Pressable>
            )}

            {/* Recording Button */}
            <Pressable
              style={[
                styles.recordButton,
                isRecording && styles.recordingButton,
                countdown !== null && styles.countdownButton,
              ]}
              onPress={handleRecordIdea}
            >
              <View style={styles.buttonContent}>
                {countdown !== null ? (
                  <View style={styles.cancelIcon}>
                    <Ionicons name="close" size={32} color="white" />
                  </View>
                ) : isRecording ? (
                  <View style={styles.stopIcon}>
                    <View style={styles.stopSquare} />
                  </View>
                ) : (
                  <View style={styles.micIcon}>
                    <Entypo name="mic" size={32} color="white" />
                  </View>
                )}
                <ThemedText style={styles.buttonText}>
                  {countdown !== null
                    ? "Cancel"
                    : isRecording
                      ? "Stop Recording"
                      : "Start Recording"}
                </ThemedText>
                <ThemedText style={styles.buttonSubtext}>
                  {countdown !== null
                    ? "Tap to cancel countdown"
                    : isRecording
                      ? isPaused
                        ? "Paused - tap to save"
                        : "Tap to save your idea"
                      : "Tap to capture musical inspiration"}
                </ThemedText>
              </View>
            </Pressable>
          </View>

          {/* Recording Status */}
          {isRecording && (
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.recordingIndicator,
                  isPaused && styles.pausedIndicator,
                ]}
              />
              <ThemedText
                style={[
                  styles.recordingText,
                  isPaused && styles.pausedText,
                ]}
              >
                {isPaused ? "Paused" : "Recording..."}{" "}
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
      marginBottom: 16,
      color: Colors[colorScheme].text,
    },
    // Quality Selector Styles
    qualitySection: {
      width: "100%",
      marginBottom: 16,
      alignItems: "center",
    },
    qualityButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f0f0f0",
    },
    qualityButtonText: {
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    qualityOptions: {
      marginTop: 8,
      width: "100%",
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderRadius: 12,
      padding: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
    },
    qualityOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    qualityOptionSelected: {
      backgroundColor: colorScheme === "dark" ? "#3a3a3a" : "#e8e8e8",
    },
    qualityOptionText: {
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    qualityOptionTextSelected: {
      fontWeight: "600",
      color: Colors[colorScheme].tint,
    },
    // Countdown Styles
    countdownContainer: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 180,
      marginBottom: 24,
      paddingVertical: 20,
    },
    countdownText: {
      fontSize: 96,
      lineHeight: 110,
      fontWeight: "bold",
      color: Colors[colorScheme].tint,
      textAlign: "center",
      includeFontPadding: false,
    },
    countdownLabel: {
      fontSize: 20,
      color: Colors[colorScheme].text,
      opacity: 0.7,
      marginTop: 16,
    },
    // Level Meter Styles
    levelMeterContainer: {
      width: "100%",
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    levelMeterLabel: {
      fontSize: 12,
      color: Colors[colorScheme].text,
      opacity: 0.6,
      marginBottom: 4,
    },
    levelMeterTrack: {
      height: 8,
      backgroundColor: colorScheme === "dark" ? "#333" : "#e0e0e0",
      borderRadius: 4,
      overflow: "hidden",
    },
    levelMeterFill: {
      height: "100%",
      borderRadius: 4,
    },
    levelMeterDb: {
      fontSize: 10,
      color: Colors[colorScheme].text,
      opacity: 0.5,
      marginTop: 2,
      textAlign: "right",
    },
    waveformContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 80,
      marginBottom: 24,
      gap: 3,
    },
    waveformBar: {
      width: 4,
      height: 40,
      borderRadius: 2,
      marginHorizontal: 1,
    },
    // Controls Container
    controlsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    },
    pauseButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f0f0f0",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: Colors[colorScheme].borderColor,
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
    countdownButton: {
      backgroundColor: Colors[colorScheme].icon,
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
    cancelIcon: {
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
    pausedIndicator: {
      backgroundColor: Colors[colorScheme].icon,
    },
    recordingText: {
      fontSize: 14,
      fontWeight: "500",
      color: Colors[colorScheme].isRecording,
    },
    pausedText: {
      color: Colors[colorScheme].text,
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

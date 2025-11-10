import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MetronomeOptions, useMetronome } from "@/hooks/use-metronome";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface MetronomeControlsProps {
  bpm: number;
  timeSignature?: string;
  onBpmChange?: (bpm: number) => void;
  accentFirstBeat?: boolean;
  showBpmControls?: boolean;
}

export default function MetronomeControls({
  bpm,
  timeSignature = "4/4",
  onBpmChange,
  accentFirstBeat = true,
  showBpmControls = true,
}: MetronomeControlsProps) {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");

  const metronomeOptions: MetronomeOptions = {
    bpm,
    timeSignature,
    accentFirstBeat,
  };

  const { isPlaying, currentBeat, toggle, beatsPerBar } =
    useMetronome(metronomeOptions);

  const handleBpmDecrease = () => {
    if (onBpmChange && bpm > 40) {
      onBpmChange(bpm - 5);
    }
  };

  const handleBpmIncrease = () => {
    if (onBpmChange && bpm < 200) {
      onBpmChange(bpm + 5);
    }
  };

  const renderBeatIndicators = () => {
    const indicators = [];
    for (let i = 1; i <= beatsPerBar; i++) {
      const isActive = isPlaying && i === currentBeat;
      const isFirstBeat = i === 1 && accentFirstBeat;

      indicators.push(
        <View
          key={i}
          style={[
            styles.beatIndicator,
            isActive && styles.beatIndicatorActive,
            isFirstBeat && isActive && styles.beatIndicatorAccent,
          ]}
        >
          <ThemedText
            style={[
              styles.beatNumber,
              isActive && styles.beatNumberActive,
              isFirstBeat && isActive && styles.beatNumberAccent,
            ]}
          >
            {i}
          </ThemedText>
        </View>
      );
    }
    return indicators;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Metronome</ThemedText>

      {/* BPM Display and Controls */}
      <View style={styles.bpmSection}>
        <ThemedText style={styles.bpmLabel}>Tempo</ThemedText>
        <View style={styles.bpmControls}>
          {showBpmControls && (
            <Pressable
              onPress={handleBpmDecrease}
              style={[styles.bpmButton, bpm <= 40 && styles.bpmButtonDisabled]}
              disabled={bpm <= 40}
            >
              <Ionicons
                name="remove"
                size={20}
                color={
                  bpm <= 40
                    ? Colors[colorScheme ?? "light"].icon
                    : Colors[colorScheme ?? "light"].background
                }
              />
            </Pressable>
          )}

          <View style={styles.bpmDisplay}>
            <ThemedText style={styles.bpmNumber}>{bpm}</ThemedText>
            <ThemedText style={styles.bpmText}>BPM</ThemedText>
          </View>

          {showBpmControls && (
            <Pressable
              onPress={handleBpmIncrease}
              style={[styles.bpmButton, bpm >= 200 && styles.bpmButtonDisabled]}
              disabled={bpm >= 200}
            >
              <Ionicons
                name="add"
                size={20}
                color={
                  bpm >= 200
                    ? Colors[colorScheme ?? "light"].text
                    : Colors[colorScheme ?? "light"].background
                }
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Beat Indicators */}
      <View style={styles.beatSection}>
        <ThemedText style={styles.timeSignature}>{timeSignature}</ThemedText>
        <View style={styles.beatIndicators}>{renderBeatIndicators()}</View>
      </View>

      {/* Play/Stop Button */}
      <Pressable
        onPress={toggle}
        style={[styles.playButton, isPlaying && styles.playButtonActive]}
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={32}
          color={colorScheme === "dark" ? "#000" : "#fff"}
        />
        <ThemedText style={styles.playButtonText}>
          {isPlaying ? "Stop" : "Start"}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const getStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 16,
      textAlign: "center",
      color: Colors[colorScheme].text,
    },
    bpmSection: {
      marginBottom: 20,
    },
    bpmLabel: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 8,
      textAlign: "center",
      color: Colors[colorScheme].text,
    },
    bpmControls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    bpmButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors[colorScheme].tint,
      alignItems: "center",
      justifyContent: "center",
    },
    bpmButtonDisabled: {
      backgroundColor: Colors[colorScheme].icon,
      opacity: 0.3,
    },
    bpmDisplay: {
      alignItems: "center",
      minWidth: 80,
    },
    bpmNumber: {
      fontSize: 32,
      fontWeight: "bold",
      color: Colors[colorScheme].text,
    },
    bpmText: {
      fontSize: 12,
      opacity: 0.7,
      color: Colors[colorScheme].text,
    },
    beatSection: {
      alignItems: "center",
      marginBottom: 20,
    },
    timeSignature: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
      color: Colors[colorScheme].text,
    },
    beatIndicators: {
      flexDirection: "row",
      gap: 8,
    },
    beatIndicator: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colorScheme === "dark" ? "#333333" : "#e0e0e0",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },
    beatIndicatorActive: {
      backgroundColor: Colors[colorScheme].tint,
      borderColor: Colors[colorScheme].tint,
    },
    beatIndicatorAccent: {
      backgroundColor: Colors[colorScheme].isRecording || "#ff6b6b",
      borderColor: Colors[colorScheme].isRecording || "#ff6b6b",
    },
    beatNumber: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    beatNumberActive: {
      color: colorScheme === "dark" ? "#000" : "#fff",
    },
    beatNumberAccent: {
      color: "#fff",
    },
    playButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      gap: 8,
    },
    playButtonActive: {
      backgroundColor: Colors[colorScheme].isRecording || "#ff6b6b",
    },
    playButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#000" : "#fff",
    },
  });

import { ThemedText } from "@/components/themed/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import { useTapTempo } from "@/hooks/useTapTempo";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface TapTempoProps {
  onBpmChange: (bpm: number) => void;
  currentBpm: number;
}

export function TapTempo({ onBpmChange, currentBpm }: TapTempoProps) {
  const colorScheme = useColorScheme();
  const haptics = useHaptics();
  const { bpm, tapCount, tap, reset } = useTapTempo();
  const styles = getStyles(colorScheme ?? "light");

  const handleTap = () => {
    haptics.light();
    tap();
  };

  const handleUseBpm = () => {
    if (bpm) {
      onBpmChange(bpm);
      haptics.success();
      reset();
    }
  };

  const handleReset = () => {
    reset();
    haptics.light();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.label}>Tap Tempo</ThemedText>
        <ThemedText style={styles.subtitle}>
          Tap the button to detect BPM
        </ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.tapSection}>
          <Pressable
            style={[styles.tapButton, tapCount > 0 && styles.tapButtonActive]}
            onPress={handleTap}
          >
            <Ionicons
              name="radio-button-on"
              size={32}
              color={
                tapCount > 0 ? "#fff" : Colors[colorScheme ?? "light"].tint
              }
            />
            <ThemedText
              style={[
                styles.tapButtonText,
                tapCount > 0 && styles.tapButtonTextActive,
              ]}
            >
              Tap
            </ThemedText>
          </Pressable>

          {tapCount > 0 && (
            <View style={styles.statusContainer}>
              <ThemedText style={styles.tapCount}>Taps: {tapCount}</ThemedText>
              {bpm && (
                <ThemedText style={styles.detectedBpm}>
                  Detected: {bpm} BPM
                </ThemedText>
              )}
            </View>
          )}
        </View>

        {bpm && bpm !== currentBpm && (
          <View style={styles.actions}>
            <Pressable style={styles.useButton} onPress={handleUseBpm}>
              <ThemedText style={styles.useButtonText}>
                Use {bpm} BPM
              </ThemedText>
            </Pressable>
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
            </Pressable>
          </View>
        )}

        {tapCount > 0 && !bpm && (
          <View style={styles.actions}>
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const getStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
    },
    header: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
    },
    content: {
      alignItems: "center",
    },
    tapSection: {
      alignItems: "center",
      marginBottom: 16,
    },
    tapButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: Colors[colorScheme].tint,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    tapButtonActive: {
      backgroundColor: Colors[colorScheme].tint,
    },
    tapButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].tint,
      marginTop: 4,
    },
    tapButtonTextActive: {
      color: "#fff",
    },
    statusContainer: {
      alignItems: "center",
    },
    tapCount: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
      marginBottom: 4,
    },
    detectedBpm: {
      fontSize: 18,
      fontWeight: "700",
      color: Colors[colorScheme].tint,
    },
    actions: {
      flexDirection: "row",
      gap: 12,
    },
    useButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    useButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },
    resetButton: {
      backgroundColor: "transparent",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
    },
    resetButtonText: {
      color: Colors[colorScheme].text,
      fontSize: 14,
      fontWeight: "600",
    },
  });

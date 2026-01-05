import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import {
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { alert } from "yooo-native";

export default function Step3() {
  const router = useRouter();
  const { trigger: haptics } = useHaptics();
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");
  const [isRequesting, setIsRequesting] = useState(false);

  const handleLetsRecord = async () => {
    if (isRequesting) return;

    setIsRequesting(true);
    haptics("medium");

    try {
      const { granted } = await requestRecordingPermissionsAsync();

      if (!granted) {
        alert.error(
          "Microphone access is required to record audio. Please enable it in your device settings."
        );
        setIsRequesting(false);
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });

      haptics("success");

      setTimeout(() => {
    router.replace("/(tabs)");
      }, 300);
    } catch (error) {
      console.error("Error requesting permissions:", error);
      alert.error("Failed to request microphone permission.");
      setIsRequesting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.textContainer}>
          <ThemedText style={styles.rewardText}>
            Your ears work.
          </ThemedText>
          <ThemedText style={styles.rewardTextAccent}>
            Now let's train your voice.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.bottomSection}>
          <Pressable
            style={({ pressed }) => [
              styles.recordButton,
              pressed && styles.recordButtonPressed,
              isRequesting && styles.recordButtonDisabled,
            ]}
            onPress={handleLetsRecord}
            disabled={isRequesting}
          >
            <ThemedText style={styles.recordButtonText}>
              {isRequesting ? "Setting up..." : "Enable Microphone"}
            </ThemedText>
          </Pressable>

          <ThemedView style={styles.stepIndicator}>
            <ThemedView style={styles.inactiveStep} />
            <ThemedView style={styles.inactiveStep} />
            <ThemedView style={styles.activeStep} />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const getStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
  container: {
    flex: 1,
      backgroundColor: Colors[colorScheme].background,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
      paddingHorizontal: 32,
      paddingTop: 120,
      paddingBottom: 60,
  },
    textContainer: {
    alignItems: "center",
      flex: 1,
      justifyContent: "center",
  },
    rewardText: {
      fontSize: 36,
      fontWeight: "400",
    textAlign: "center",
      color: Colors[colorScheme].text,
      marginBottom: 8,
    letterSpacing: -0.5,
      lineHeight: 44,
  },
    rewardTextAccent: {
      fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
      color: Colors[colorScheme].tint,
      letterSpacing: -0.5,
      lineHeight: 44,
    },
    bottomSection: {
      width: "100%",
      alignItems: "center",
    },
    recordButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 18,
      paddingHorizontal: 48,
    borderRadius: 16,
      width: "100%",
    alignItems: "center",
      marginBottom: 24,
    },
    recordButtonPressed: {
      opacity: 0.7,
  },
    recordButtonDisabled: {
      opacity: 0.5,
  },
    recordButtonText: {
      fontSize: 17,
    fontWeight: "600",
      color: colorScheme === "dark" ? "#000000" : "#ffffff",
    },
    stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
      gap: 8,
  },
    activeStep: {
      width: 24,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors[colorScheme].tint,
  },
    inactiveStep: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors[colorScheme].text + "20",
  },
});
